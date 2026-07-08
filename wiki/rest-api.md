# REST API

All helpers return promises and throw on HTTP errors (including 404 when no context exists yet — catch accordingly). Base URL: `http://127.0.0.1:12345`. The full interactive reference is APIExpose's own **Swagger UI** at `http://127.0.0.1:12345/swagger`.

| Helper | Endpoint | Returns |
|---|---|---|
| `getHealth()` | `GET /api/v1/health` | `{ status, version }` |
| `getState()` | `GET /api/v1/context/state` | `{ state, selectedSystem, selectedGame, runningGame }` |
| `getCurrentGame()` | `GET /api/v1/context/current-game` | current selected/running game with `details` (image, video, developer, genre…) and `launch` info |
| `getCurrentSystem()` | `GET /api/v1/context/current-system` | selected system |
| `getHiscores(params)` | `GET /api/v1/hiscores` | hiscore table (400 without a supported game) |
| `getRetroAchievementsStatus()` | `GET /api/retroachievements/status` | account/link status |
| `getRetroAchievementsSession()` | `GET /api/retroachievements/session` | live session (game, unlocks, hardcore…) |
| `getCurrentPanel()` | `GET /api/v1/panels/current` | resolved control-panel layout (404 without a game) |
| `getMameOutputs()` | `GET /api/v1/outputs/mame` | latest MAME output signals |

## Context lifecycle

`state` is `browsing` while navigating EmulationStation and `playing` while a game runs. Right after APIExpose starts, the context can be **empty** (`selectedGame: null`, `current-game` → 404) until ES emits its next selection. Robust pattern:

```js
async function currentGameOrNull(client) {
  try {
    const game = await client.getCurrentGame();
    if (game && !game.message) return game;
  } catch { /* 404: no context yet */ }
  const state = await client.getState();
  return state?.runningGame ?? state?.selectedGame ?? null;
}
```

## Media URLs — `mediaUrl(path)`

**APIExpose is the single media source.** Its canonical media store consolidates and enriches everything (artwork, wheels, marquees, mixes, manuals, videos…), and `details.*` / `details.extras.*` expose ready-to-use `/api/v1/media/...` URLs:

```json
{
  "image":   "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/artwork/screentitle.png",
  "marquee": "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/ui/wheels/wheel.png",
  "extras":  { "cartridge": "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/artwork/cartridge.png" }
}
```

`mediaUrl()` turns any of them (or any media-store-relative path) into an absolute URL; absolute `http(s)://` inputs pass through unchanged:

```js
const game = await client.getCurrentGame();
img.src = client.mediaUrl(game.details.marquee);
```

## Commands

Launching a game (used to validate this SDK live):

```js
await fetch('http://127.0.0.1:12345/api/v1/commands/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ romPath: 'E:/RetroBat/roms/megadrive/Sonic The Hedgehog (USA, Europe).zip' })
}); // → 202 { status: "launching" }
```

!!! warning "ES control endpoints"
    The `EsController` tap/combo endpoints work, but the `goto-system` / `goto-game` navigation endpoints are currently unreliable. Prefer `commands/launch` for automation.

!!! note "CORS"
    Browser pages call this API cross-origin. APIExpose sends `Access-Control-Allow-Origin: *` starting with the update that follows 1.1.1; on plain 1.1.1 REST calls from a browser are blocked (WebSocket is unaffected).
