# Périmètre du SDK

APIExpose SDK est un **SDK données/événements**. Il vous donne un accès fiable et documenté à ce que sait APIExpose — données, événements et diagnostics. Rien de plus, volontairement.

## Dans le périmètre (ce SDK, MIT, gratuit pour toujours)

- Helpers REST sur l'API locale APIExpose.
- Bus d'événements WebSocket : événements bruts, alias normalisés, jokers, reconnexion.
- Résolution des URLs de médias.
- Diagnostics : capabilities, doctor, event debug monitor.
- Samples HTML sobres prouvant que la plomberie fonctionne.
- JSON Schemas de l'enveloppe d'événement et du rapport de capabilities.

## Hors périmètre (Retro Creator)

Ce qui suit relève de **Retro Creator**, produit commercial séparé construit *au-dessus* de ce SDK :

- **Designer** visuel d'overlays (drag & drop, aperçu live),
- **widgets premium** (compteurs de score animés, toasts de succès, scènes attract-mode…),
- **thèmes** et packs d'assets,
- **marketplace** de widgets et partage.

La frontière est délibérée et stable : tout ce qui sert à *accéder aux données* reste libre et ouvert ici ; tout ce qui touche à *la présentation soignée et au confort d'édition* est la valeur de Retro Creator. Une contribution à ce dépôt qui implémenterait designer/widgets/thèmes/marketplace sera déclinée avec un renvoi vers cette page.

## Feuille de route (côté SDK)

Les phases futures restent dans le périmètre données/événements :

- templates d'overlays OBS (niveau plomberie),
- SDK C#,
- SDK Python,
- bridges : Streamer.bot, Stream Deck, Touch Portal.

## Licence

Le SDK, les samples et les schémas sont sous [licence MIT](https://github.com/Nelfe80/APIExpose-SDK/blob/main/LICENSE.md) © 2026 NelfeTech.
