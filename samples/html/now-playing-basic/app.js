// Now Playing (basic) — shows the current game name, system and artwork.
// SDK demo only: sober on purpose. Premium overlays belong to Retro Creator.
import { APIExposeClient } from '../../../packages/js/src/apiexpose-sdk.js';

async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    return await response.json();
  } catch {
    return { apiExpose: { host: '127.0.0.1', port: 12345, autoReconnect: true } };
  }
}

/** Depth-limited search for the first primitive value under any of the given keys. */
function findValue(obj, keys, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return undefined;
  for (const key of keys) {
    for (const [k, v] of Object.entries(obj)) {
      if (k.toLowerCase() === key.toLowerCase() && v != null && typeof v !== 'object') return v;
    }
  }
  for (const v of Object.values(obj)) {
    const found = findValue(v, keys, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}

const el = {
  card: document.getElementById('card'),
  art: document.getElementById('art'),
  game: document.getElementById('game'),
  system: document.getElementById('system')
};

function render(client, data) {
  const name = findValue(data, ['name', 'title', 'gameName', 'game']);
  const system = findValue(data, ['systemName', 'system', 'systemId']);
  const art = findValue(data, ['logo', 'wheel', 'marquee', 'image', 'thumbnail', 'boxart']);

  if (!name && !system) return;
  el.game.textContent = name ?? '—';
  el.system.textContent = system ?? '';
  const artUrl = client.mediaUrl(art);
  if (artUrl) {
    el.art.src = artUrl;
    el.art.classList.add('visible');
  } else {
    el.art.classList.remove('visible');
  }
  el.card.classList.remove('hidden');
}

const config = await loadConfig();
const client = new APIExposeClient(config.apiExpose);

async function refresh() {
  // current-game answers 404 (or { message: … }) until something is selected;
  // fall back to the frontend context (selected or running game) in that case.
  let game = null;
  try { game = await client.getCurrentGame(); } catch { /* no context yet */ }
  if (game && !game.message && (game.name || game.title || game.details)) {
    render(client, game);
    return;
  }
  try {
    const state = await client.getState();
    render(client, state?.selectedGame ?? state?.runningGame ?? state?.selectedSystem ?? {});
  } catch {
    // APIExpose not ready yet: the next event or reconnect will retry
  }
}

client.on('game.changed', () => refresh());
client.on('connection.restored', () => refresh());
client.on('connection.lost', () => {
  el.system.textContent = 'waiting for APIExpose…';
});

// Render the current REST state right away; the socket catches up in the background.
refresh();
client.connect();
