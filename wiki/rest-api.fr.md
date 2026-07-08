# API REST

Tous les helpers retournent des promesses et lèvent une erreur sur les codes HTTP d'échec (y compris 404 quand aucun contexte n'existe encore — prévoyez un catch). URL de base : `http://127.0.0.1:12345`. La référence interactive complète est le **Swagger UI** d'APIExpose : `http://127.0.0.1:12345/swagger`.

| Helper | Endpoint | Retourne |
|---|---|---|
| `getHealth()` | `GET /api/v1/health` | `{ status, version }` |
| `getState()` | `GET /api/v1/context/state` | `{ state, selectedSystem, selectedGame, runningGame }` |
| `getCurrentGame()` | `GET /api/v1/context/current-game` | jeu sélectionné/en cours avec `details` (image, vidéo, développeur, genre…) et infos `launch` |
| `getCurrentSystem()` | `GET /api/v1/context/current-system` | système sélectionné |
| `getHiscores(params)` | `GET /api/v1/hiscores` | table de hiscores (400 sans jeu supporté) |
| `getRetroAchievementsStatus()` | `GET /api/retroachievements/status` | statut du compte |
| `getRetroAchievementsSession()` | `GET /api/retroachievements/session` | session live (jeu, succès, hardcore…) |
| `getCurrentPanel()` | `GET /api/v1/panels/current` | layout du panel résolu (404 sans jeu) |
| `getMameOutputs()` | `GET /api/v1/outputs/mame` | dernières sorties MAME |

## Cycle de vie du contexte

`state` vaut `browsing` pendant la navigation dans EmulationStation et `playing` pendant qu'un jeu tourne. Juste après le démarrage d'APIExpose, le contexte peut être **vide** (`selectedGame: null`, `current-game` → 404) jusqu'à la prochaine sélection dans ES. Motif robuste :

```js
async function currentGameOrNull(client) {
  try {
    const game = await client.getCurrentGame();
    if (game && !game.message) return game;
  } catch { /* 404 : pas encore de contexte */ }
  const state = await client.getState();
  return state?.runningGame ?? state?.selectedGame ?? null;
}
```

## URLs de médias — `mediaUrl(path)`

**APIExpose est la source média unique.** Son media store canonique consolide et enrichit tout (artwork, wheels, marquees, mixes, manuels, vidéos…), et `details.*` / `details.extras.*` exposent des URLs `/api/v1/media/...` prêtes à l'emploi :

```json
{
  "image":   "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/artwork/screentitle.png",
  "marquee": "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/ui/wheels/wheel.png",
  "extras":  { "cartridge": "/api/v1/media/systems/megadrive/games/sonic_the_hedgehog/artwork/cartridge.png" }
}
```

`mediaUrl()` transforme n'importe laquelle (ou tout chemin relatif au media store) en URL absolue ; les entrées `http(s)://` absolues passent inchangées :

```js
const game = await client.getCurrentGame();
img.src = client.mediaUrl(game.details.marquee);
```

## Commandes

Lancer un jeu (utilisé pour valider ce SDK en live) :

```js
await fetch('http://127.0.0.1:12345/api/v1/commands/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ romPath: 'E:/RetroBat/roms/megadrive/Sonic The Hedgehog (USA, Europe).zip' })
}); // → 202 { status: "launching" }
```

!!! warning "Endpoints de contrôle ES"
    Les endpoints tap/combo de `EsController` fonctionnent, mais les endpoints de navigation `goto-system` / `goto-game` sont actuellement peu fiables. Préférez `commands/launch` pour l'automatisation.

!!! note "CORS"
    Les pages navigateur appellent cette API en cross-origin. APIExpose envoie `Access-Control-Allow-Origin: *` à partir de la mise à jour qui suit la 1.1.1 ; sur une 1.1.1 brute, les appels REST depuis un navigateur sont bloqués (le WebSocket n'est pas concerné).
