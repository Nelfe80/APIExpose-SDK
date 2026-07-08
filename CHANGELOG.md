# Changelog

All notable changes to the APIExpose SDK are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [0.1.0] - 2026-07-08

First public release — JavaScript SDK MVP.

### Added
- `@apiexpose/sdk` zero-build ES module (`packages/js`): `APIExposeClient` with
  REST helpers (health, context/state, current game/system, hiscores,
  RetroAchievements, panels), WebSocket event bus with normalized
  aliases (`game.changed`, `score.changed`, `timer.changed`,
  `achievement.unlocked`, `arcade.output.changed`…), prefix wildcards
  (`retroachievements.*`, `*`), automatic reconnection with exponential backoff
  and jitter, `connection.lost` / `connection.restored` lifecycle events.
- `mediaUrl()` resolves media paths against APIExpose's canonical media store
  (`/api/v1/media/<path>`) — APIExpose is the single consolidated media source;
  `details.*` and `details.extras.*` expose ready-to-use API URLs.
- Diagnostics: `getCapabilities()` endpoint probe and `doctor()` report.
- TypeScript definitions (`apiexpose-sdk.d.ts`).
- Samples (validated live against APIExpose 1.1.1): `now-playing-basic`,
  `score-basic`, `event-debug-monitor`.
- JSON Schemas: event envelope (with stream routing table) and capabilities report.
- Bilingual wiki (EN/FR) deployed to GitHub Pages.

### Requires
- APIExpose ≥ 1.1.1. Two improvements landed after the 1.1.1 release and ship
  with the next one (or rebuild from `main`): CORS for browser REST calls, and
  canonical `/api/v1/media/...` URLs in game `details`/`extras`.
