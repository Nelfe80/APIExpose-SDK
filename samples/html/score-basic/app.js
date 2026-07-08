// Score HUD (basic) — live score and timer from the APIExpose streams.
// The score/timer streams only carry data for games instrumented by APIExpose
// (arcade with .MEM definitions, wrapper-supported systems…).
import { APIExposeClient } from '../../../packages/js/src/apiexpose-sdk.js';

async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    return await response.json();
  } catch {
    return { apiExpose: { host: '127.0.0.1', port: 12345, autoReconnect: true } };
  }
}

function pick(obj, ...names) {
  for (const n of names) {
    if (obj && obj[n] !== undefined && obj[n] !== null) return obj[n];
  }
  return undefined;
}

const el = {
  hud: document.getElementById('hud'),
  score: document.getElementById('score'),
  timer: document.getElementById('timer'),
  timerBlock: document.getElementById('timerBlock')
};

function formatTimer(value, unit) {
  const v = Number(value);
  if (!Number.isFinite(v)) return String(value);
  if (String(unit ?? '').toLowerCase().startsWith('sec')) {
    const m = Math.floor(v / 60);
    const s = Math.floor(v % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return String(v);
}

const config = await loadConfig();
const client = new APIExposeClient({ ...config.apiExpose, streams: ['score', 'timer', 'frontend'] });

client.on('score.changed', (event) => {
  const score = pick(event.payload ?? {}, 'Score', 'score', 'Value', 'value');
  if (score === undefined) return;
  el.score.textContent = Number(score).toLocaleString();
  el.hud.classList.remove('hidden');
});

client.on('timer.changed', (event) => {
  const payload = event.payload ?? {};
  const value = pick(payload, 'Remaining', 'remaining', 'Value', 'value');
  if (value === undefined) return;
  el.timer.textContent = formatTimer(value, pick(payload, 'Unit', 'unit'));
  el.timerBlock.classList.remove('hidden');
  el.hud.classList.remove('hidden');
});

// New game: reset the HUD until fresh data arrives.
client.on('game.changed', () => {
  el.score.textContent = '—';
  el.timer.textContent = '—';
});

client.connect();
