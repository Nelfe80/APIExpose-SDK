# Diagnostics

## Event Debug Monitor

[`samples/html/event-debug-monitor`](https://github.com/Nelfe80/APIExpose-SDK/tree/main/samples/html/event-debug-monitor) est le compagnon de diagnostic : ouvrez-le dans un navigateur (ou un dock OBS) et vous voyez

- l'état de connexion et l'URL de base de l'API,
- un rapport de capabilities sur une ligne (`apiexpose=<version> sdk=<version> | health:yes context:yes …`),
- chaque événement en live — horodatage, type brut, aperçu du payload — avec Pause/Clear.

Utilisez-le dès qu'un overlay « ne se met pas à jour » : si le monitor montre les événements, le problème est dans votre page ; sinon, il est entre APIExpose et l'émulateur.

## `getCapabilities()`

Sonde les endpoints optionnels et rapporte ce que cette installation répond **maintenant** :

```js
const caps = await client.getCapabilities();
// { apiExposeVersion: "1.1.1+…", sdkVersion: "0.1.0",
//   endpoints: { health: true, context: true, panels: true,
//                hiscores: true, retroachievements: true, mameOutputs: true } }
```

Les capabilities sont **dépendantes du contexte** : `panels` répond 404 sans jeu sélectionné, `hiscores` répond 400 sans jeu supporté, `retroachievements` dépend du compte configuré. Un `false` peut vouloir dire « pas maintenant », pas « jamais » — resondez après `game.changed`. Schéma : [`schemas/capabilities.schema.json`](https://github.com/Nelfe80/APIExpose-SDK/blob/main/schemas/capabilities.schema.json).

## `doctor()`

`getCapabilities()` plus la connectivité et les statistiques d'événements — conçu pour être collé dans un message de support :

```js
const report = await client.doctor();
// { sdkVersion, apiExposeVersion, connected, endpoints,
//   stats: { eventsReceived, reconnects, lastEventAt, lastEventType } }
```

## Dépannage

| Symptôme | Cause probable | Correctif |
|---|---|---|
| Les appels REST échouent dans le navigateur, `curl` fonctionne | APIExpose 1.1.1 sans CORS | mettre à jour APIExpose (post-1.1.1) |
| `connection.lost` immédiat, jamais de restore | APIExpose arrêté / mauvais port | vérifier `http://127.0.0.1:12345/api/v1/health` |
| `getCurrentGame()` lève un 404 | contexte vide juste après le démarrage d'APIExpose | replier sur `getState()` (voir [API REST](rest-api.md)) |
| Visuels en 404 | familles de chemins médias confondues | passez toujours par `mediaUrl()` ; les URLs gamelist sont servies par ES sur le port 1234 |
| Pas de `score.changed` / `timer.changed` | système sans support de score, ou rien ne tourne | vérifier `score.live.*` dans le debug monitor |
| Les événements s'arrêtent après un redémarrage de RetroBat | aucune — le SDK se reconnecte | attendre `connection.restored` (vérifiable dans le monitor) |
| La page ne fait rien en `file://` dans un profil navigateur strict | restrictions de chargement des modules ES | servir le dossier en `http://` ou utiliser le mode Fichier local d'OBS |
