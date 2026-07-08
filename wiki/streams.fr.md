# Flux WebSocket

APIExpose expose un **firehose** et 17 **flux filtrés** :

| Endpoint | Contenu |
|---|---|
| `ws://127.0.0.1:12345/ws` | tous les événements sauf `esevent.*` |
| `ws://127.0.0.1:12345/ws/<stream>` | uniquement les événements routés vers ce flux |

Par défaut le SDK ouvre le seul firehose `/ws`. Pour s'abonner à des flux spécifiques :

```js
const client = new APIExposeClient({ streams: ['score', 'timer', 'frontend'] });
```

Chaque flux a sa propre socket ; le SDK reconnecte chacune indépendamment et rapporte un état `connection.lost` / `connection.restored` unique.

## Table de routage

Les événements sont routés vers les flux selon le préfixe de leur `Type` :

| Flux | Préfixes de Type |
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
| `esevent` | `esevent.` — disponible **uniquement** ici, pas sur le firehose |

!!! tip "Firehose ou flux ?"
    Pour un overlay, le firehose est le plus simple et peu coûteux (trafic loopback). Utilisez les flux filtrés pour des clients contraints ou une isolation stricte par usage — ex. un écran marquee qui n'ouvre que `/ws/marquee`.
