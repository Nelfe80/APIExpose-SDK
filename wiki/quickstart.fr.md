# Démarrage rapide

## 1. Récupérer le SDK

Clonez ou téléchargez ce dépôt, puis copiez `packages/js/src/apiexpose-sdk.js` à côté de votre page (gardez aussi `apiexpose-sdk.d.ts` si vous utilisez un outillage TypeScript). Il n'y a rien à builder.

## 2. Page minimale

```html
<!DOCTYPE html>
<html>
<body>
  <h1 id="game">—</h1>
  <script type="module">
    import { APIExposeClient } from './apiexpose-sdk.js';

    const client = new APIExposeClient(); // 127.0.0.1:12345 par défaut

    async function refresh() {
      let game = null;
      try { game = await client.getCurrentGame(); } catch { /* rien de sélectionné */ }
      document.getElementById('game').textContent = game?.name ?? 'aucun jeu';
    }

    client.on('game.changed', refresh);          // sélection ES et lancement
    client.on('connection.restored', refresh);   // (re)connexion
    refresh();
    client.connect();
  </script>
</body>
</html>
```

Ouvrez le fichier dans un navigateur sur la machine RetroBat : le titre suit le jeu sélectionné dans EmulationStation.

!!! tip "Afficher d'abord, connecter ensuite"
    Faites votre premier rafraîchissement REST **avant** (ou indépendamment de) `connect()`. Le REST répond immédiatement ; le WebSocket prend ensuite le relais. `connect()` ne lève jamais d'erreur et réessaie en arrière-plan.

## 3. Options

```js
const client = new APIExposeClient({
  host: '127.0.0.1',
  port: 12345,          // REST + WebSocket APIExpose
  streams: null,        // null = firehose /ws unique ; ou ['score','timer','frontend']
  autoReconnect: true,
  reconnectDelayMs: 1000,
  maxReconnectDelayMs: 15000,
  log: (level, msg) => console.log(level, msg) // silencieux par défaut
});
```

## 4. S'abonner aux événements

```js
// alias normalisés
client.on('game.changed', (e) => { /* sélection ou lancement */ });
client.on('score.changed', (e) => console.log(e.payload));
client.on('achievement.unlocked', (e) => { /* 🏆 */ });

// types bruts et jokers
client.on('retroachievements.*', (e) => console.log(e.rawType));
const off = client.on('*', (e) => console.log(e.rawType, e.payload));
off(); // chaque on() retourne sa fonction de désabonnement
```

Voir [Événements](events.md) pour la liste complète.

## 5. Essayer les samples

Les trois samples de [`samples/html`](https://github.com/Nelfe80/APIExpose-SDK/tree/main/samples/html) fonctionnent en fichier local ou en [source navigateur OBS](obs-overlay.md) :

- **now-playing-basic** — nom du jeu, système et visuel.
- **score-basic** — HUD score + timer live.
- **event-debug-monitor** — tous les événements en temps réel, avec rapport de capabilities.
