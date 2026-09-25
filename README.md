# Project Touchline

Een speelbare **offline voetbalmanager-prototype** op basis van het concept in `docs/concept.md`. Creëer je club, beheer je selectie, stel je tactiek in, train spelers, scout en koop talent, speel een seizoen van tien speeldagen en klim op de ranglijst. De clubs en spelers zijn fictief. Resultaten, clubkas en voortgang worden lokaal in je browser opgeslagen.

```sh
npm start
```

Open http://127.0.0.1:3000. Op Windows PowerShell gebruik je `npm.cmd start` als `npm.ps1` wordt geblokkeerd. Run `npm test` voor controles van de simulatie en seizoensvoortgang. Node.js 20+ is vereist; externe pakketten zijn niet nodig.

Dit is een lokale singleplayer game. Browseropslag bevat je club en seizoen; er zijn geen accounts, online multiplayer, echte transacties, wallet of SOL rewards. Training, scouting en transfers zijn compacte prototypes met credits. Verwijderde browsergegevens wissen je voortgang.

## Simulation model

Zes clubs spelen thuis en uit. Elke club heeft een spelerspool en stelt voor een gekozen formatie automatisch de beste elf op. Balbezit verloopt via opbouw, progressie, kans en schot. De engine gebruikt attributen, conditie, moraal, tactiek en een reproduceerbare seed. Schoten krijgen xG; de statistieken tonen onder meer balbezit en passnauwkeurigheid. Het model is illustratief en niet gekalibreerd op echte voetbaldata.

## Next milestones

Volgende stappen: betrouwbare serveropslag en accounts, handmatige opstellingen en wissels, een rijkere match feed, spelerloopbanen, competities met andere managers en anti misbruik. Wallets en rewards vereisen daarna een duurzame economie en juridische toetsing.
