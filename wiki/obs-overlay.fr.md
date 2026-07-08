# Overlays OBS

Les samples sont conçus pour s'intégrer dans **OBS Studio** en Browser Source.

## Ajouter un sample dans OBS

1. Copiez le dépôt (ou seulement `samples/` + `packages/`, en gardant leur arborescence relative) sur la machine RetroBat.
2. Dans OBS : **Sources → + → Navigateur**.
3. Cochez **Fichier local** et choisissez par ex. `samples/html/now-playing-basic/index.html`.
4. Réglez la taille de la source (la carte now-playing tient dans 800×220 ; le HUD score dans 400×160).
5. Les fonds sont transparents — la carte flotte sur votre scène.

L'overlay affiche immédiatement l'état REST courant puis suit EmulationStation en live : sélectionnez un jeu, il se met à jour ; lancez-le, scores et timers défilent.

## Configuration

Chaque sample lit un `config.json` optionnel à côté de son `index.html` :

```json
{
  "apiExpose": { "host": "127.0.0.1", "port": 12345, "autoReconnect": true }
}
```

Pointez `host` vers l'IP LAN de la borne si OBS tourne sur une autre machine que RetroBat — attention, APIExpose écoute sur `127.0.0.1` par défaut : un setup distant demande un proxy ou un changement de binding d'APIExpose.

## Écrire son propre overlay

Gardez le motif des samples :

```js
import { APIExposeClient } from './apiexpose-sdk.js';
const client = new APIExposeClient();

client.on('game.changed', refresh);        // mises à jour événementielles
client.on('connection.restored', refresh); // resynchro après redémarrage de RetroBat
refresh();                                  // afficher l'état REST tout de suite
client.connect();                           // ne bloque jamais, réessaie toujours
```

- **N'attendez pas `connect()`** avant le premier rendu — le REST a déjà la réponse.
- **Gérez le contexte vide** — juste après le démarrage d'APIExpose, `current-game` répond 404 jusqu'à la prochaine sélection ES (voir [API REST](rest-api.md)).
- **OBS ne recharge jamais en cas d'échec** — c'est l'auto-reconnexion du SDK qui maintient un overlay vivant à travers les redémarrages de RetroBat.

!!! info "Sobres par conception"
    Ces samples montrent la plomberie des données, pas des visuels de production. Thèmes, widgets animés et designer visuel relèvent de [Retro Creator](boundaries.md).
