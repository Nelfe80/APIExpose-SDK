# APIExpose SDK

SDK public **données & événements** pour [RetroBat APIExpose](https://github.com/Nelfe80/RetroBat-APIExpose).

APIExpose tourne à côté de RetroBat/EmulationStation et expose ce qui se passe sur la borne — jeu sélectionné, émulateur en cours, scores et timers live, RetroAchievements, sorties MAME, états de panel — via une API REST locale et des flux WebSocket. Ce SDK est la voie officielle pour consommer ces données depuis vos pages, overlays et outils.

## Ce que vous obtenez

- **Client JavaScript zéro build** — un module ES, pas de bundler, pas de npm. Importez-le depuis un simple fichier HTML ou une source navigateur OBS.
- **Bus d'événements** — abonnez-vous aux événements bruts, aux alias normalisés (`game.changed`, `score.changed`, `achievement.unlocked`…), aux jokers par préfixe (`retroachievements.*`) ou à tout (`*`).
- **Helpers REST** — jeu courant, état du frontend, hiscores, session RetroAchievements, layout du panel, sorties MAME, URLs de médias.
- **Résilience** — reconnexion automatique avec backoff exponentiel ; votre overlay peut démarrer avant RetroBat.
- **Diagnostics** — `getCapabilities()`, `doctor()` et le sample [Event Debug Monitor](diagnostics.md) prêt à l'emploi.

## Prérequis

| Composant | Version |
|---|---|
| APIExpose | ≥ 1.1.1 (les appels REST depuis un navigateur nécessitent en plus la mise à jour CORS postérieure à la 1.1.1) |
| Navigateur / OBS | tout moteur moderne (modules ES) |

APIExpose écoute sur `http://127.0.0.1:12345` (REST + WebSocket) sur la machine RetroBat.

## Par où continuer

- [Démarrage rapide](quickstart.md) — premier overlay en cinq minutes.
- [Événements](events.md) — types, alias et payloads.
- [Flux WebSocket](streams.md) — les endpoints et leur routage.
- [API REST](rest-api.md) — les helpers et les endpoints derrière.
- [Overlays OBS](obs-overlay.md) — utiliser les samples en Browser Source.
- [Diagnostics](diagnostics.md) — capabilities, doctor et dépannage.
- [Périmètre du SDK](boundaries.md) — ce que couvre ce SDK, et ce qui relève de Retro Creator.
