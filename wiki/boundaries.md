# Scope & boundaries

APIExpose SDK is a **Data/Event SDK**. It gives you reliable, documented access to what APIExpose knows — data, events and diagnostics. Nothing more, on purpose.

## In scope (this SDK, MIT, free forever)

- REST helpers over the local APIExpose API.
- WebSocket event bus: raw events, normalized aliases, wildcards, reconnection.
- Media URL resolution.
- Diagnostics: capabilities, doctor, event debug monitor.
- Sober HTML samples proving the plumbing works.
- JSON Schemas for the event envelope and the capabilities report.

## Out of scope (Retro Creator)

The following belong to **Retro Creator**, a separate commercial product built *on top of* this SDK:

- visual overlay **Designer** (drag & drop, live preview),
- **premium widgets** (animated score counters, achievement toasts, attract-mode scenes…),
- **themes** and asset packs,
- widget **marketplace** and sharing.

The boundary is deliberate and stable: everything needed to *access data* stays free and open here; everything about *polished presentation and authoring comfort* is Retro Creator's value. If a contribution to this repo implements designer/widget/theme/marketplace features, it will be declined with a pointer to this page.

## Roadmap (SDK side)

Future phases stay within the data/event scope:

- OBS overlay templates (plumbing-level),
- C# SDK,
- Python SDK,
- bridges: Streamer.bot, Stream Deck, Touch Portal.

## License

The SDK, samples and schemas are [MIT-licensed](https://github.com/Nelfe80/APIExpose-SDK/blob/main/LICENSE.md) © 2026 NelfeTech.
