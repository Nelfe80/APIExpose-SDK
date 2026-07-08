# Changelog

All notable changes to the APIExpose SDK are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [0.1.0] - 2026-07-08

First public release — JavaScript SDK MVP.

### Added
- `@apiexpose/sdk` zero-build ES module (`packages/js`): `APIExposeClient` with
  REST helpers (health, context/state, current game/system, hiscores,
  RetroAchievements, panels, MAME outputs), WebSocket event bus with normalized
  aliases (`game.changed`, `score.changed`, `timer.changed`,
  `achievement.unlocked`, `arcade.output.changed`…), prefix wildcards
  (`retroachievements.*`, `*`), automatic reconnection with exponential backoff
  and jitter, `connection.lost` / `connection.restored` lifecycle events.
- `mediaUrl()` resolves both media families: EmulationStation gamelist URLs
  (`/systems/<sys>/games/<id>/media/<type>`, served on port 1234) and
  APIExpose media paths (`/api/v1/media/<path>`).
- Diagnostics: `getCapabilities()` endpoint probe and `doctor()` report.
- TypeScript definitions (`apiexpose-sdk.d.ts`).
- Samples (validated live against APIExpose 1.1.1): `now-playing-basic`,
  `score-basic`, `event-debug-monitor`.
- JSON Schemas: event envelope (with stream routing table) and capabilities report.
- Bilingual wiki (EN/FR) deployed to GitHub Pages.

### Requires
- APIExpose ≥ 1.1.1 (CORS support for browser REST calls landed after the
  1.1.1 release; rebuild from `main` or use the next release for browser use).
