# Événements

Chaque événement APIExpose est une enveloppe JSON poussée en WebSocket :

```json
{
  "Type": "ui.game.started",
  "Ts": "2026-07-08T13:05:12.412Z",
  "NodeId": "cab-01",
  "CorrelationId": "6f0c…",
  "Payload": { }
}
```

Le SDK la normalise avant vos handlers :

```js
client.on('game.changed', (event) => {
  event.type;      // nom normalisé qui a matché votre abonnement
  event.rawType;   // Type APIExpose d'origine, ex. "ui.game.started"
  event.timestamp; // chaîne ISO
  event.nodeId;    // "cab-01"
  event.payload;   // Payload, camelCase et PascalCase acceptés
});
```

Le type brut est **toujours réémis tel quel** en plus de tout alias — rien n'est masqué. Le JSON Schema de l'enveloppe : [`schemas/event.schema.json`](https://github.com/Nelfe80/APIExpose-SDK/blob/main/schemas/event.schema.json).

## Alias normalisés

| Alias | Préfixe / type brut | Se déclenche quand |
|---|---|---|
| `game.changed` | `ui.game.selected*` (dédupliqué par système+rom) | un jeu différent est sélectionné ou lancé |
| `game.selected` | `ui.game.selected*` | chaque événement de sélection |
| `system.changed` | `ui.system.selected*` | le système ES change |
| `score.changed` | `score.live.*` | le score live change en jeu |
| `timer.changed` | `timer.live.*` | le timer live avance |
| `hiscore.changed` | `hiscore.*` | les hiscores sont rafraîchis |
| `achievement.unlocked` | `retroachievements.achievement.unlock*` | un succès RetroAchievements tombe |
| `arcade.output.changed` | `mame.output.changed`, `arcade.output*` | lampes & sorties MAME/FBNeo |
| `media.changed` | `media.*` | activité médias/scraping |
| `panel.changed` | `panel.state` | le layout du panel change |
| `connection.lost` / `connection.restored` | *(interne SDK)* | connectivité WebSocket |

## Jokers

```js
client.on('retroachievements.*', handler); // tout type brut avec ce préfixe
client.on('*', handler);                   // tout (utilisé par le debug monitor)
```

## Types réels, observés en live

Capturés sur APIExpose 1.1.1 au lancement de *Sonic The Hedgehog* (Megadrive, RetroArch) :

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

Pendant le jeu (y compris le mode démo d'ES), `score.live.changed` et `timer.live.changed` circulent pour les systèmes avec support de score.

!!! note "Les payloads varient"
    Les payloads sont propres à chaque événement et peuvent évoluer avec APIExpose. Traitez les champs inconnus comme optionnels — le [Event Debug Monitor](diagnostics.md) est le moyen le plus rapide d'inspecter les payloads exacts de votre installation.
