# Events

Every APIExpose event is a JSON envelope pushed over WebSocket:

```json
{
  "Type": "ui.game.started",
  "Ts": "2026-07-08T13:05:12.412Z",
  "NodeId": "cab-01",
  "CorrelationId": "6f0c…",
  "Payload": { }
}
```

The SDK normalizes it before your handlers run:

```js
client.on('game.changed', (event) => {
  event.type;      // normalized name that matched your subscription
  event.rawType;   // original APIExpose Type, e.g. "ui.game.started"
  event.timestamp; // ISO string
  event.nodeId;    // "cab-01"
  event.payload;   // Payload, camelCase and PascalCase both accepted
});
```

The raw type is **always re-emitted as-is** alongside any alias — nothing is hidden. The JSON Schema of the envelope lives in [`schemas/event.schema.json`](https://github.com/Nelfe80/APIExpose-SDK/blob/main/schemas/event.schema.json).

## Normalized aliases

| Alias | Raw prefix / type | Fires when |
|---|---|---|
| `game.changed` | `ui.game.selected*` (deduplicated per system+rom) | a different game is selected or started |
| `game.selected` | `ui.game.selected*` | every selection event |
| `system.changed` | `ui.system.selected*` | the ES system changes |
| `score.changed` | `score.live.*` | the live score changes in-game |
| `timer.changed` | `timer.live.*` | the live timer ticks |
| `hiscore.changed` | `hiscore.*` | hiscore data is refreshed |
| `achievement.unlocked` | `retroachievements.achievement.unlock*` | a RetroAchievements cheevo pops |
| `arcade.output.changed` | `mame.output.changed`, `arcade.output*` | MAME/FBNeo lamps & outputs |
| `media.changed` | `media.*` | media/scraping activity |
| `panel.changed` | `panel.state` | the control-panel layout changes |
| `connection.lost` / `connection.restored` | *(SDK-internal)* | WebSocket connectivity |

## Wildcards

```js
client.on('retroachievements.*', handler); // any raw type with that prefix
client.on('*', handler);                   // everything (used by the debug monitor)
```

## Real event types, observed live

Captured on APIExpose 1.1.1 while launching *Sonic The Hedgehog* (Megadrive, RetroArch):

```
ui.game.started.raw / ui.game.started
retroarch.wrapper.connected
retroarch.memory.changed
retroachievements.session.login.detected
retroachievements.session.started
retroachievements.session.updated
retroachievements.catalog.updated
retroachievements.achievementsets.loaded
retroachievements.proxy.requested / retroachievements.proxy.response
panel.state
cpo.panel.config.selected
marquee.snapshot / marquee.snapshot.updated
topper.snapshot
instruction-card.snapshot
screen.snapshot
```

During gameplay (including ES demo mode) `score.live.changed` and `timer.live.changed` flow for systems with score support.

!!! note "Payload shapes vary"
    Payloads are event-specific and may evolve with APIExpose. Treat unknown fields as optional — the [Event Debug Monitor](diagnostics.md) is the quickest way to inspect the exact payloads your installation produces.
