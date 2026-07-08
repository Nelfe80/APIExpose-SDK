# APIExpose SDK

Public **Data & Event SDK** for [RetroBat APIExpose](https://github.com/Nelfe80/RetroBat-APIExpose) — build dashboards and integrations on top of the live RetroBat/EmulationStation context: current game, scores, timers, RetroAchievements, arcade outputs, panel states and more.

- **Zero build**: one ES module, no bundler, no npm install required. Works in any modern browser.
- **REST + WebSocket**: typed helpers for the REST endpoints, an event bus with normalized aliases, prefix wildcards and automatic reconnection.
- **Diagnostics first**: `getCapabilities()` and `doctor()` tell you what this installation offers, and the Event Debug Monitor sample shows every event live.

📚 **Documentation / wiki**: https://nelfe80.github.io/APIExpose-SDK/

## Quick start

```html
<script type="module">
  import { APIExposeClient } from './apiexpose-sdk.js';

  const client = new APIExposeClient(); // 127.0.0.1:12345 by default

  client.on('game.changed', async () => {
    const game = await client.getCurrentGame();
    console.log('Now playing:', game.name);
  });

  client.on('score.changed', (event) => {
    console.log('Score:', event.payload);
  });

  client.connect(); // reconnects by itself, safe to call before APIExpose runs
</script>
```

Requires APIExpose **≥ 1.1.1** running on the same machine (its API listens on `http://127.0.0.1:12345`).

## Samples

| Sample | What it shows |
|---|---|
| [`samples/html/now-playing-basic`](samples/html/now-playing-basic) | Current game name, system and artwork |
| [`samples/html/score-basic`](samples/html/score-basic) | Live score and timer HUD |
| [`samples/html/event-debug-monitor`](samples/html/event-debug-monitor) | Every event in real time + capabilities report — your debugging companion |

Open them straight in a browser. Each sample reads an optional `config.json` next to it (host/port).

## Scope

APIExpose SDK is a **Data/Event SDK**: data access, events and diagnostics only. No visual designer, no widgets, no themes.

## License

[MIT](LICENSE.md) © 2026 NelfeTech.

---

## Français

SDK public **données & événements** pour APIExpose : construisez tableaux de bord et intégrations sur le contexte live de RetroBat (jeu courant, scores, timers, RetroAchievements, sorties arcade…). **Zéro build** : un module ES à importer, utilisable tel quel dans n'importe quel navigateur. La documentation complète (FR/EN) est sur le wiki : https://nelfe80.github.io/APIExpose-SDK/

Ce SDK se limite volontairement aux données, événements et diagnostics — pas de designer visuel, pas de widgets, pas de thèmes.
