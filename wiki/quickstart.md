# Quick start

## 1. Get the SDK

Clone or download this repository, then copy `packages/js/src/apiexpose-sdk.js` next to your page (keep `apiexpose-sdk.d.ts` too if you use TypeScript tooling). There is nothing to build.

## 2. Minimal page

```html
<!DOCTYPE html>
<html>
<body>
  <h1 id="game">—</h1>
  <script type="module">
    import { APIExposeClient } from './apiexpose-sdk.js';

    const client = new APIExposeClient(); // defaults to 127.0.0.1:12345

    async function refresh() {
      let game = null;
      try { game = await client.getCurrentGame(); } catch { /* nothing selected yet */ }
      document.getElementById('game').textContent = game?.name ?? 'no game';
    }

    client.on('game.changed', refresh);          // fires on ES selection and launch
    client.on('connection.restored', refresh);   // fires on (re)connect
    refresh();
    client.connect();
  </script>
</body>
</html>
```

Open the file in a browser on the RetroBat machine: the title follows the game selected in EmulationStation.

!!! tip "Render first, connect second"
    Call your first REST refresh **before** (or independently of) `connect()`. REST answers immediately; the WebSocket then keeps you updated. `connect()` never throws and keeps retrying in the background.

## 3. Options

```js
const client = new APIExposeClient({
  host: '127.0.0.1',
  port: 12345,          // APIExpose REST + WebSocket
  streams: null,        // null = single /ws firehose; or ['score','timer','frontend']
  autoReconnect: true,
  reconnectDelayMs: 1000,
  maxReconnectDelayMs: 15000,
  log: (level, msg) => console.log(level, msg) // silent by default
});
```

## 4. Subscribing to events

```js
// normalized aliases
client.on('game.changed', (e) => { /* selection or launch */ });
client.on('score.changed', (e) => console.log(e.payload));
client.on('achievement.unlocked', (e) => { /* 🏆 */ });

// raw types and wildcards
client.on('retroachievements.*', (e) => console.log(e.rawType));
const off = client.on('*', (e) => console.log(e.rawType, e.payload));
off(); // every on() returns its unsubscribe function
```

See [Events](events.md) for the full list.

## 5. Try the samples

The three samples in [`samples/html`](https://github.com/Nelfe80/APIExpose-SDK/tree/main/samples/html) run as plain files in any browser:

- **now-playing-basic** — game name, system and artwork card.
- **score-basic** — live score + timer HUD.
- **event-debug-monitor** — every event in real time, with a capabilities report.
