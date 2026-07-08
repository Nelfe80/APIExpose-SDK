# Diagnostics

## Event Debug Monitor

[`samples/html/event-debug-monitor`](https://github.com/Nelfe80/APIExpose-SDK/tree/main/samples/html/event-debug-monitor) is the diagnostics companion: open it in a browser (or an OBS dock) and you see

- the connection state and API base URL,
- a one-line capabilities report (`apiexpose=<version> sdk=<version> | health:yes context:yes …`),
- every event live — timestamp, raw type, payload preview — with Pause/Clear.

Use it whenever an overlay "doesn't update": if the monitor shows the events, the problem is in your page; if not, it's between APIExpose and the emulator.

## `getCapabilities()`

Probes the optional endpoints and reports what this installation answers **right now**:

```js
const caps = await client.getCapabilities();
// { apiExposeVersion: "1.1.1+…", sdkVersion: "0.1.0",
//   endpoints: { health: true, context: true, panels: true,
//                hiscores: true, retroachievements: true, mameOutputs: true } }
```

Capabilities are **context-dependent**: `panels` answers 404 with no game selected, `hiscores` answers 400 without a supported game, `retroachievements` depends on the configured account. A `false` can mean "not now", not "never" — re-probe after `game.changed`. Schema: [`schemas/capabilities.schema.json`](https://github.com/Nelfe80/APIExpose-SDK/blob/main/schemas/capabilities.schema.json).

## `doctor()`

`getCapabilities()` plus connectivity and event statistics — designed to be dumped into a support message:

```js
const report = await client.doctor();
// { sdkVersion, apiExposeVersion, connected, endpoints,
//   stats: { eventsReceived, reconnects, lastEventAt, lastEventType } }
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| REST calls fail in the browser, `curl` works | APIExpose 1.1.1 without CORS | update APIExpose (post-1.1.1) |
| `connection.lost` immediately, never restores | APIExpose not running / wrong port | check `http://127.0.0.1:12345/api/v1/health` |
| `getCurrentGame()` throws 404 | empty context right after APIExpose start | fall back to `getState()` (see [REST API](rest-api.md)) |
| Artwork 404 | media path family mixed up | always go through `mediaUrl()`; gamelist URLs are served by ES on port 1234 |
| No `score.changed` / `timer.changed` | system without score support, or nothing running | check the debug monitor for `score.live.*` |
| Events stop after RetroBat restart | none — the SDK reconnects | wait for `connection.restored` (verify in the monitor) |
| Page does nothing at all as `file://` in a strict browser profile | ES module loading restrictions | serve the folder over `http://` or use OBS's Local file mode |
