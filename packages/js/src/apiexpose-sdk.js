/**
 * APIExpose SDK for JavaScript — Data/Event client for APIExpose (RetroBat).
 *
 * Zero-build ES module: import it directly from a <script type="module"> in any
 * browser or OBS Browser Source, no npm, no bundler required.
 *
 *   import { APIExposeClient } from './apiexpose-sdk.js';
 *   const client = new APIExposeClient();
 *   client.on('game.changed', e => console.log(e.payload));
 *   await client.connect();
 *
 * Scope (by design): data + events + diagnostics. No designer, no premium
 * widgets, no theme engine — those belong to Retro Creator.
 *
 * License: MIT — https://github.com/Nelfe80/APIExpose-SDK
 */

export const SDK_VERSION = '0.1.0';

/** Minimum APIExpose version this SDK is tested against. */
export const MIN_APIEXPOSE_VERSION = '1.1.0';

/**
 * WebSocket streams exposed by APIExpose (`ws://host:port/ws/<stream>`).
 * The bare `/ws` endpoint carries every event except `esevent.*`.
 */
export const STREAMS = Object.freeze([
  'frontend', 'esevent', 'marquee', 'topper', 'instruction-card', 'screen',
  'panel', 'ingame', 'arcade', 'score', 'timer', 'retroachievements',
  'hiscore', 'media', 'roms', 'system', 'control'
]);

const DEFAULTS = Object.freeze({
  host: '127.0.0.1',
  port: 12345,
  /** null = single connection to the bare /ws firehose; or an array of stream names. */
  streams: null,
  autoReconnect: true,
  reconnectDelayMs: 1000,
  maxReconnectDelayMs: 15000,
  /** Called with (level, message) for internal diagnostics; default silent. */
  log: null
});

/**
 * Normalized SDK aliases: raw APIExpose event type prefix -> friendly event.
 * The raw type is always re-emitted as-is too, so nothing is ever hidden.
 */
const ALIASES = [
  ['ui.game.selected', 'game.selected'],
  ['ui.system.selected', 'system.changed'],
  ['score.live.', 'score.changed'],
  ['timer.live.', 'timer.changed'],
  ['hiscore.', 'hiscore.changed'],
  ['retroachievements.achievement.unlock', 'achievement.unlocked'],
  ['mame.output.changed', 'arcade.output.changed'],
  ['arcade.output', 'arcade.output.changed'],
  ['media.', 'media.changed'],
  ['panel.state', 'panel.changed']
];

export class APIExposeClient {
  /** @param {Partial<typeof DEFAULTS>} [options] */
  constructor(options = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.baseUrl = `http://${this.options.host}:${this.options.port}`;
    this.wsBaseUrl = `ws://${this.options.host}:${this.options.port}`;

    /** @type {Map<string, Set<Function>>} */
    this._handlers = new Map();
    /** @type {Map<string, WebSocket>} */
    this._sockets = new Map();
    this._connected = false;
    this._closing = false;
    this._reconnectAttempt = 0;
    this._reconnectTimer = null;
    this._lastGameKey = null;
    this.stats = { eventsReceived: 0, reconnects: 0, lastEventAt: null, lastEventType: null };
  }

  // ------------------------------------------------------------------ events

  /**
   * Subscribes to an event. Supports:
   *  - normalized names: 'game.changed', 'score.changed', 'connection.lost'…
   *  - raw APIExpose types: 'retroachievements.session.updated'…
   *  - prefix wildcards: 'retroachievements.*'
   *  - '*' for every event.
   * @returns {() => void} unsubscribe function
   */
  on(eventName, callback) {
    if (!this._handlers.has(eventName)) this._handlers.set(eventName, new Set());
    this._handlers.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    this._handlers.get(eventName)?.delete(callback);
  }

  /** @private */
  _emit(eventName, event) {
    const fire = (name) => {
      const set = this._handlers.get(name);
      if (!set) return;
      for (const cb of set) {
        try { cb(event); } catch (err) { this._log('error', `handler ${name}: ${err.message}`); }
      }
    };
    fire(eventName);
    fire('*');
    // prefix wildcards: 'a.b.c' also fires 'a.b.*' and 'a.*'
    const parts = eventName.split('.');
    for (let i = parts.length - 1; i >= 1; i--) {
      fire(parts.slice(0, i).join('.') + '.*');
    }
  }

  // -------------------------------------------------------------- connection

  /**
   * Opens the WebSocket connection(s) and resolves once at least one socket
   * is open. With autoReconnect (default), it keeps retrying in the
   * background even if APIExpose is not started yet — safe to call at
   * overlay load time.
   */
  async connect() {
    this._closing = false;
    const streams = this.options.streams === null ? [''] : this.options.streams;
    await Promise.race(streams.map((s) => this._openSocket(s)));
  }

  /** Closes every socket and stops reconnecting. */
  disconnect() {
    this._closing = true;
    clearTimeout(this._reconnectTimer);
    for (const socket of this._sockets.values()) {
      try { socket.close(); } catch { /* already closed */ }
    }
    this._sockets.clear();
    this._setConnected(false);
  }

  isConnected() {
    return this._connected;
  }

  /** @private */
  _openSocket(stream) {
    return new Promise((resolve) => {
      const url = stream ? `${this.wsBaseUrl}/ws/${stream}` : `${this.wsBaseUrl}/ws`;
      let socket;
      try {
        socket = new WebSocket(url);
      } catch (err) {
        this._log('warn', `WebSocket create failed: ${err.message}`);
        this._scheduleReconnect(stream);
        resolve(false);
        return;
      }

      this._sockets.set(stream, socket);

      socket.addEventListener('open', () => {
        this._log('info', `connected ${url}`);
        this._reconnectAttempt = 0;
        this._setConnected(true);
        resolve(true);
      });

      socket.addEventListener('message', (msg) => this._onMessage(msg.data));

      socket.addEventListener('close', () => {
        this._sockets.delete(stream);
        if (this._sockets.size === 0) this._setConnected(false);
        if (!this._closing && this.options.autoReconnect) this._scheduleReconnect(stream);
        resolve(false);
      });

      socket.addEventListener('error', () => {
        // 'close' follows and drives the reconnect; nothing else to do here
      });
    });
  }

  /** @private */
  _scheduleReconnect(stream) {
    if (this._closing || !this.options.autoReconnect) return;
    const delay = Math.min(
      this.options.reconnectDelayMs * Math.pow(2, this._reconnectAttempt++),
      this.options.maxReconnectDelayMs
    ) * (0.8 + Math.random() * 0.4); // jitter
    this._reconnectTimer = setTimeout(() => {
      if (!this._closing && !this._sockets.has(stream)) {
        this.stats.reconnects++;
        this._openSocket(stream);
      }
    }, delay);
  }

  /** @private */
  _setConnected(value) {
    if (this._connected === value) return;
    this._connected = value;
    const event = this._normalize({ Type: value ? 'connection.restored' : 'connection.lost', Payload: null });
    this._emit(event.type, event);
  }

  // ---------------------------------------------------------------- messages

  /** @private */
  _onMessage(raw) {
    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch {
      this._log('warn', 'non-JSON frame ignored');
      return;
    }

    const event = this._normalize(envelope);
    this.stats.eventsReceived++;
    this.stats.lastEventAt = event.timestamp;
    this.stats.lastEventType = event.rawType;

    // raw type first, then normalized aliases
    this._emit(event.rawType, event);
    for (const [prefix, alias] of ALIASES) {
      if (event.rawType.startsWith(prefix)) {
        this._emit(alias, event);
        // game.selected also becomes game.changed when the game really changed
        if (alias === 'game.selected') {
          const key = JSON.stringify(this._gameKeyOf(event.payload));
          if (key !== this._lastGameKey) {
            this._lastGameKey = key;
            this._emit('game.changed', event);
          }
        }
        break;
      }
    }
  }

  /**
   * Normalizes an APIExpose envelope (PascalCase or camelCase) into the SDK
   * event shape: { type, rawType, timestamp, nodeId, correlationId, payload }.
   * @private
   */
  _normalize(envelope) {
    const pick = (obj, ...names) => {
      for (const n of names) if (obj && obj[n] !== undefined) return obj[n];
      return undefined;
    };
    const rawType = String(pick(envelope, 'Type', 'type') ?? 'unknown').trim();
    return {
      type: rawType,
      rawType,
      timestamp: pick(envelope, 'Ts', 'ts', 'Timestamp', 'timestamp') ?? new Date().toISOString(),
      nodeId: pick(envelope, 'NodeId', 'nodeId') ?? null,
      correlationId: pick(envelope, 'CorrelationId', 'correlationId') ?? null,
      payload: pick(envelope, 'Payload', 'payload') ?? null,
      envelope
    };
  }

  /** @private */
  _gameKeyOf(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const grab = (...names) => {
      for (const n of names) {
        const found = this._deepFind(payload, n);
        if (found !== undefined) return found;
      }
      return undefined;
    };
    return { system: grab('system', 'SystemId', 'systemId'), rom: grab('rom', 'Rom', 'game', 'Game') };
  }

  /** @private */
  _deepFind(obj, name, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 3) return undefined;
    if (obj[name] !== undefined && typeof obj[name] !== 'object') return obj[name];
    for (const value of Object.values(obj)) {
      const found = this._deepFind(value, name, depth + 1);
      if (found !== undefined) return found;
    }
    return undefined;
  }

  // -------------------------------------------------------------------- REST

  /** @private */
  async _get(path) {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const error = new Error(`GET ${path} -> HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const text = await response.text();
    try { return JSON.parse(text); } catch { return text; }
  }

  /** APIExpose health/version info. */
  getHealth() { return this._get('/api/v1/health'); }

  /** Full frontend context (selected system/game, running state…). */
  getState() { return this._get('/api/v1/context/state'); }

  /** Currently selected/running game, with metadata and media paths. */
  getCurrentGame() { return this._get('/api/v1/context/current-game'); }

  /** Currently selected system. */
  getCurrentSystem() { return this._get('/api/v1/context/current-system'); }

  /** High scores of the current context. */
  getHiscores() { return this._get('/api/v1/hiscores'); }

  /** RetroAchievements connectivity status. */
  getRetroAchievementsStatus() { return this._get('/api/retroachievements/status'); }

  /** RetroAchievements session (game, unlocks, hardcore…). */
  getRetroAchievementsSession() { return this._get('/api/retroachievements/session'); }

  /** Resolved control-panel layout for the current game (buttons, colors). */
  getCurrentPanel() { return this._get('/api/v1/panels/current'); }

  /** Latest MAME output signals (lamps…). */
  getMameOutputs() { return this._get('/api/v1/outputs/mame'); }

  /**
   * Absolute URL for a media path returned by the API. APIExpose is the single
   * consolidated media source: `details.*` and `details.extras.*` paths are
   * `/api/v1/media/...` URLs served by its canonical media store; any other
   * relative path is resolved against the same endpoint.
   */
  mediaUrl(path) {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const clean = String(path).replace(/^[\\/]+/, '').replace(/\\/g, '/');
    if (/^api\/v1\/media\//i.test(clean)) return `${this.baseUrl}/${clean}`;
    return `${this.baseUrl}/api/v1/media/${clean}`;
  }

  /**
   * Probes the API and reports what this installation offers.
   * Never throws: absent endpoints are simply reported as unavailable.
   */
  async getCapabilities() {
    const probe = async (name, path) => {
      try { await this._get(path); return [name, true]; }
      catch { return [name, false]; }
    };
    const results = await Promise.all([
      probe('health', '/api/v1/health'),
      probe('context', '/api/v1/context/state'),
      probe('panels', '/api/v1/panels/current'),
      probe('hiscores', '/api/v1/hiscores'),
      probe('retroachievements', '/api/retroachievements/status'),
      probe('mameOutputs', '/api/v1/outputs/mame')
    ]);
    let version = null;
    try {
      const health = await this.getHealth();
      version = health?.version ?? health?.Version ?? null;
    } catch { /* unreachable */ }
    return {
      sdkVersion: SDK_VERSION,
      minApiExposeVersion: MIN_APIEXPOSE_VERSION,
      apiExposeVersion: version,
      reachable: results.some(([, ok]) => ok),
      endpoints: Object.fromEntries(results),
      webSocketConnected: this.isConnected()
    };
  }

  /**
   * One-call diagnostic summary ("doctor"), safe to render in a debug overlay.
   */
  async doctor() {
    const capabilities = await this.getCapabilities();
    return {
      ...capabilities,
      stats: { ...this.stats },
      baseUrl: this.baseUrl,
      streams: this.options.streams ?? ['(all: /ws)']
    };
  }

  /** @private */
  _log(level, message) {
    if (typeof this.options.log === 'function') this.options.log(level, `[apiexpose-sdk] ${message}`);
  }
}

export default APIExposeClient;
