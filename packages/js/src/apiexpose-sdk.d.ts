/**
 * TypeScript definitions for the APIExpose SDK (JavaScript).
 * The runtime is plain ESM (apiexpose-sdk.js) — these types are hand-maintained.
 */

export declare const SDK_VERSION: string;
export declare const MIN_APIEXPOSE_VERSION: string;
export declare const STREAMS: readonly string[];

export interface APIExposeOptions {
  /** APIExpose host. Default `127.0.0.1`. */
  host?: string;
  /** APIExpose port. Default `12345`. */
  port?: number;
  /**
   * Streams to subscribe to (`ws://…/ws/<stream>`), or `null` (default) for a
   * single connection to the bare `/ws` firehose (every event except `esevent.*`).
   */
  streams?: string[] | null;
  /** Keep reconnecting when the socket drops or APIExpose is not started. Default `true`. */
  autoReconnect?: boolean;
  /** Initial reconnect delay in ms (exponential backoff + jitter). Default `1000`. */
  reconnectDelayMs?: number;
  /** Backoff ceiling in ms. Default `15000`. */
  maxReconnectDelayMs?: number;
  /**
   * EmulationStation HTTP API port, used by `mediaUrl()` for
   * `/systems/<sys>/games/<id>/media/<type>` URLs. Default `1234`.
   */
  esPort?: number;
  /** Diagnostic logger; the SDK is silent by default. */
  log?: ((level: 'info' | 'warn' | 'error', message: string) => void) | null;
}

/** Normalized event delivered to every handler. */
export interface APIExposeEvent<TPayload = unknown> {
  /** Raw APIExpose event type, e.g. `retroachievements.session.updated`. */
  type: string;
  /** Same as `type` (kept explicit for aliased emissions). */
  rawType: string;
  /** ISO timestamp from the envelope (`Ts`). */
  timestamp: string;
  nodeId: string | null;
  correlationId: string | null;
  payload: TPayload;
  /** The untouched envelope, if you need a field the SDK does not surface. */
  envelope: unknown;
}

export type APIExposeEventHandler<TPayload = unknown> = (event: APIExposeEvent<TPayload>) => void;

export interface APIExposeCapabilities {
  sdkVersion: string;
  minApiExposeVersion: string;
  apiExposeVersion: string | null;
  reachable: boolean;
  endpoints: Record<string, boolean>;
  webSocketConnected: boolean;
}

export interface APIExposeDoctorReport extends APIExposeCapabilities {
  stats: {
    eventsReceived: number;
    reconnects: number;
    lastEventAt: string | null;
    lastEventType: string | null;
  };
  baseUrl: string;
  streams: string[];
}

/**
 * Data/Event client for APIExpose.
 *
 * Normalized events (aliases of raw APIExpose types):
 *  - `game.selected`, `game.changed`, `system.changed`
 *  - `score.changed`, `timer.changed`, `hiscore.changed`
 *  - `achievement.unlocked`
 *  - `arcade.output.changed`, `panel.changed`, `media.changed`
 *  - `connection.lost`, `connection.restored`
 * Raw types are always emitted too, plus prefix wildcards
 * (`retroachievements.*`) and `*`.
 */
export declare class APIExposeClient {
  constructor(options?: APIExposeOptions);

  readonly options: Required<APIExposeOptions>;
  readonly baseUrl: string;
  readonly wsBaseUrl: string;
  readonly stats: APIExposeDoctorReport['stats'];

  /** Returns an unsubscribe function. */
  on<TPayload = unknown>(eventName: string, callback: APIExposeEventHandler<TPayload>): () => void;
  off(eventName: string, callback: APIExposeEventHandler): void;

  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;

  getHealth(): Promise<unknown>;
  getState(): Promise<unknown>;
  getCurrentGame(): Promise<unknown>;
  getCurrentSystem(): Promise<unknown>;
  getHiscores(): Promise<unknown>;
  getRetroAchievementsStatus(): Promise<unknown>;
  getRetroAchievementsSession(): Promise<unknown>;
  getCurrentPanel(): Promise<unknown>;
  getMameOutputs(): Promise<unknown>;

  /**
   * Absolute URL for a media path returned by the API.
   * `/systems/<sys>/games/<id>/media/<type>` paths are served by EmulationStation
   * (port `esPort`); anything else goes through APIExpose `/api/v1/media/<path>`.
   */
  mediaUrl(path: string | null | undefined): string | null;

  getCapabilities(): Promise<APIExposeCapabilities>;
  doctor(): Promise<APIExposeDoctorReport>;
}

export default APIExposeClient;
