// Event Debug Monitor — every APIExpose event, live, with a doctor summary.
// The diagnostics companion for overlay/integration development.
import { APIExposeClient } from '../../../packages/js/src/apiexpose-sdk.js';

async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    return await response.json();
  } catch {
    return { apiExpose: { host: '127.0.0.1', port: 12345, autoReconnect: true }, maxRows: 200 };
  }
}

const el = {
  dot: document.getElementById('dot'),
  status: document.getElementById('status'),
  doctor: document.getElementById('doctor'),
  rows: document.getElementById('rows'),
  pause: document.getElementById('pause'),
  clear: document.getElementById('clear')
};

const config = await loadConfig();
const maxRows = config.maxRows ?? 200;
const client = new APIExposeClient(config.apiExpose);
let paused = false;

el.pause.addEventListener('click', () => {
  paused = !paused;
  el.pause.textContent = paused ? 'Resume' : 'Pause';
});

el.clear.addEventListener('click', () => { el.rows.textContent = ''; });

client.on('*', (event) => {
  if (paused || event.type.startsWith('connection.')) return;
  const row = document.createElement('tr');
  const time = new Date(event.timestamp);
  const stamp = Number.isNaN(time.getTime())
    ? '—'
    : time.toLocaleTimeString(undefined, { hour12: false }) + '.' + String(time.getMilliseconds()).padStart(3, '0');
  let preview;
  try {
    preview = JSON.stringify(event.payload);
  } catch {
    preview = String(event.payload);
  }
  if (preview && preview.length > 600) preview = preview.slice(0, 600) + '…';
  row.innerHTML = `<td class="time">${stamp}</td><td class="type"></td><td class="payload"></td>`;
  row.children[1].textContent = event.rawType;
  row.children[2].textContent = preview ?? '';
  el.rows.prepend(row);
  while (el.rows.children.length > maxRows) el.rows.lastElementChild.remove();
});

function setStatus(connected) {
  el.dot.className = `dot ${connected ? 'on' : 'off'}`;
  el.status.textContent = connected
    ? `connected — ${client.baseUrl}`
    : `waiting for APIExpose on ${client.baseUrl}…`;
}

client.on('connection.restored', async () => {
  setStatus(true);
  const report = await client.doctor();
  const endpoints = Object.entries(report.endpoints)
    .map(([name, ok]) => `${name}:${ok ? 'yes' : 'no'}`)
    .join(' ');
  el.doctor.textContent =
    `apiexpose=${report.apiExposeVersion ?? '?'} sdk=${report.sdkVersion} | ${endpoints}`;
});

client.on('connection.lost', () => setStatus(false));

setStatus(false);
client.connect();
