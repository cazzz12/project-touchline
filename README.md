# Project Touchline

An initial, playable **Phase A simulation prototype** based on the attached product brief. It has 100 fictional players across two clubs, tactical controls, a seeded possession based match engine, match statistics and a chronological event feed. It runs locally with Node.js 20+ and has no third party dependencies.

```sh
npm start
```

Open http://localhost:3000. Run `npm test` for deterministic replay and tactical behaviour checks. Match seeds and the full input configuration can be copied from the interface to reproduce a result.

This is an offline prototype. Accounts, multiplayer leagues, persistence, transfers, wallet connection, SOL purchases and rewards are **not implemented**. No real money or blockchain transactions occur. The original Dutch concept is preserved in `docs/concept.md`.

## Simulation model

Each team has a seeded 50 player pool and fields a best fit starting XI for a selected formation. Possessions pass through build up, progression, chance creation, and shooting. The model uses relevant player attributes, fitness, morale and tactical choices plus seeded randomness. The engine emits xG per shot and computes possession, shots, shots on target, passing and fouls. Tactical settings influence chance volume and risk; the model is illustrative rather than calibrated against real football data.

## Next milestones

Persistent clubs and manager accounts; scheduled leagues; training and player progression; scouting and transfers; server authoritative simulation and anti abuse. Wallets and rewards should follow a game economy and legal review, as the concept proposes.
