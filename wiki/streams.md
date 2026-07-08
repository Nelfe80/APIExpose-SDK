# Streams

APIExpose exposes one **firehose** and 17 **filtered streams**:

| Endpoint | Content |
|---|---|
| `ws://127.0.0.1:12345/ws` | every event except `esevent.*` |
| `ws://127.0.0.1:12345/ws/<stream>` | only the events routed to that stream |

By default the SDK opens the single `/ws` firehose. To subscribe to specific streams instead:

```js
const client = new APIExposeClient({ streams: ['score', 'timer', 'frontend'] });
```

Each stream gets its own socket; the SDK reconnects each one independently and reports a single `connection.lost` / `connection.restored` state.

## Routing table

Events are routed to streams by their `Type` prefix:

| Stream | Type prefixes |
|---|---|
| `frontend` | `ui.` |
| `marquee` | `marquee.` |
| `topper` | `topper.` |
| `instruction-card` | `instruction-card.` |
| `screen` | `screen.` |
| `panel` | `panel.`, `theme.` |
| `ingame` | `ingame.`, `retroarch.`, `wrapper.` |
| `arcade` | `arcade.`, `mame.`, `fbneo.`, `outputs.` |
| `score` | `score.live.` |
| `timer` | `timer.live.` |
| `retroachievements` | `retroachievements.` |
| `hiscore` | `hiscore.` |
| `media` | `media.` |
| `roms` | `roms.`, `rom-pack.`, `romset.` |
| `system` | `startup.`, `health.`, `version.`, `hub.`, `config.`, `maintenance.`, `rules.`, `notifications.` |
| `control` | `commands.`, `intent.`, `es-control.` |
| `esevent` | `esevent.` — **only** available here, not on the firehose |

!!! tip "Firehose or streams?"
    For overlays the firehose is simplest and cheap (loopback traffic). Use filtered streams when you embed the SDK in constrained clients or want hard isolation per concern — e.g. a marquee display only opening `/ws/marquee`.
