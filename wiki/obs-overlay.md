# OBS overlays

The samples are designed to drop into **OBS Studio** as Browser Sources.

## Adding a sample to OBS

1. Copy the repository (or just `samples/` + `packages/`, keeping their relative layout) onto the RetroBat machine.
2. In OBS: **Sources → + → Browser**.
3. Tick **Local file** and pick e.g. `samples/html/now-playing-basic/index.html`.
4. Set the source size (the now-playing card fits comfortably in 800×220; the score HUD in 400×160).
5. Backgrounds are transparent — the card floats over your scene.

The overlay renders the current REST state immediately and then follows EmulationStation live: select a game, it updates; launch it, scores and timers flow.

## Configuration

Each sample reads an optional `config.json` next to its `index.html`:

```json
{
  "apiExpose": { "host": "127.0.0.1", "port": 12345, "autoReconnect": true }
}
```

Point `host` at the cabinet's LAN IP if OBS runs on a different machine than RetroBat — note APIExpose binds to `127.0.0.1` by default, so remote setups need a proxy or an APIExpose binding change.

## Writing your own overlay

Keep the pattern used by the samples:

```js
import { APIExposeClient } from './apiexpose-sdk.js';
const client = new APIExposeClient();

client.on('game.changed', refresh);        // event-driven updates
client.on('connection.restored', refresh); // resync after RetroBat restarts
refresh();                                  // render REST state immediately
client.connect();                           // never blocks, always retries
```

- **Don't await `connect()`** before your first render — REST already has the answer.
- **Handle empty context** — right after APIExpose starts, `current-game` is 404 until ES selects something (see [REST API](rest-api.md)).
- **OBS never reloads on failure** — the SDK's auto-reconnect is what keeps a long-running overlay alive across RetroBat restarts.

!!! info "Sober by design"
    These samples show data plumbing, not production visuals. Themes, animated widgets and a visual designer belong to [Retro Creator](boundaries.md).
