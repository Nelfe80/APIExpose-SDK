# APIExpose SDK

Public **Data & Event SDK** for [RetroBat APIExpose](https://github.com/Nelfe80/RetroBat-APIExpose).

APIExpose runs next to RetroBat/EmulationStation and exposes what is happening on the cabinet — the selected game, the running emulator, live scores and timers, RetroAchievements, arcade outputs, panel states — over a local REST API and WebSocket streams. This SDK is the supported way to consume that data from your own pages and tools.

## What you get

- **Zero-build JavaScript client** — one ES module, no bundler, no npm. Import it from a plain HTML file.
- **Event bus** — subscribe to raw APIExpose events, normalized aliases (`game.changed`, `score.changed`, `achievement.unlocked`…), prefix wildcards (`retroachievements.*`) or everything (`*`).
- **REST helpers** — current game, frontend state, hiscores, RetroAchievements session, control-panel layout, media URLs.
- **Resilience** — automatic reconnection with exponential backoff; your page can start before RetroBat does.
- **Diagnostics** — `getCapabilities()`, `doctor()` and a ready-made [Event Debug Monitor](diagnostics.md) sample.

## Requirements

| Component | Version |
|---|---|
| APIExpose | ≥ 1.1.2 |
| Browser | any modern engine (ES modules) |

APIExpose listens on `http://127.0.0.1:12345` (REST + WebSocket) on the RetroBat machine.

## Where to go next

- [Quick start](quickstart.md) — first integration in five minutes.
- [Events](events.md) — event types, aliases and payloads.
- [Streams](streams.md) — the WebSocket endpoints and their routing.
- [REST API](rest-api.md) — the helpers and the endpoints behind them.
- [Diagnostics](diagnostics.md) — capabilities, doctor and troubleshooting.
- [Scope](boundaries.md) — what this SDK is.
