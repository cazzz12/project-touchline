# Project Touchline

Een speelbaar **offline voetbalmanager-prototype** op basis van het concept in `docs/concept.md`. Kies een bestaande club, stel je eigen basiself op, pas tijdens de rust tactiek en spelers aan, train en scout, en speel een fictieve minicompetitie van tien speeldagen. Resultaten, clubkas en voortgang worden lokaal in je browser opgeslagen.

```sh
npm start
```

Open http://127.0.0.1:3000. Op Windows PowerShell gebruik je `npm.cmd start` als `npm.ps1` wordt geblokkeerd. Run `npm test` voor controles van de simulatie en seizoensvoortgang. Node.js 20+ is vereist; externe pakketten zijn niet nodig.

Dit is een lokale singleplayer game. Browseropslag bevat je club en seizoen; er zijn geen accounts, online multiplayer, echte transacties, wallet of SOL rewards. Training, scouting en transfers zijn compacte prototypes met credits. Verwijderde browsergegevens wissen je voortgang. Een eigen club maken is bedoeld voor een toekomstige privéruimte met vrienden; die bestaat nog niet.

## Simulation model

Zes bestaande Nederlandse clubs spelen een **niet-officiële fictieve minicompetitie** met heen- en terugwedstrijden. Spelersnamen en globale posities komen uit [openfootball/players](https://github.com/openfootball/players) (CC0 1.0). Clubnamen zijn ook opgenomen in [openfootball/clubs](https://github.com/openfootball/clubs) (CC0 1.0). De selecties zijn voor het spel samengesteld: zij vertegenwoordigen **niet** de echte huidige clubselecties. Leeftijd is afgeleid van geboortejaar voor 2026; ratings, conditie, prestaties, transferprijzen en overige attributen zijn gegenereerde spelwaarden. Er zijn geen officiële foto's, clublogo's of kits gebruikt. Het bronbestand `public/real-players.js` is een momentopname; gegevens kunnen verouderen.

Je kiest handmatig elf basisspelers, zeven wisselspelers en een aanvoerder. De aanvoerdersband is zichtbaar maar geeft nog geen statistiekbonus. Tijdens de wedstrijd kun je op elk moment pauzeren, maximaal drie spelers wisselen en formatie, mentaliteit, pressing of tempo aanpassen. Een gewisselde speler kan niet terugkeren. De nieuwe instructies gelden vanaf de volgende minuut; de wedstrijd wordt niet vooraf volledig berekend. Conditie daalt op basis van werkelijk gespeelde minuten en uithoudingsvermogen.

Bij rust stopt de klok automatisch. Je kiest tussen 1×, 2× en 4× snelheid. Iedere gespeelde minuut wordt lokaal opgeslagen; na het vernieuwen van de pagina hervat je gepauzeerd vanaf die minuut. De uitslag en credits worden pas bij het laatste fluitsignaal verwerkt. Het laatste wedstrijdverslag blijft beschikbaar op het overzicht. Oudere saves krijgen automatisch een wisselbank en aanvoerder; club, credits en uitslagen blijven behouden.

De engine gebruikt attributen, conditie, moraal, tactiek en een reproduceerbare seed. Schoten krijgen xG. Het model is illustratief en niet gekalibreerd op echte voetbaldata. De geautomatiseerde tests omvatten simulatielogica, save-migratie, wisselregels, hervatten en de bediening via een lichte DOM-adapter. Dit vervangt geen visuele browsertest.

## Interfacecontrole (0.2.1)

De interface is handmatig gecontroleerd in een Chromium-browser op desktop- en mobiel formaat. De veldweergaven volgen nu de gekozen formatie; op mobiel blijft horizontaal scrollen beperkt tot de navigatie en brede tabellen. Tactiekschuiven hebben toegankelijke namen. Het saveformaat en de simulatie zijn ongewijzigd.

Zie [het controleverslag](docs/browser-check.md) voor de geteste flows en beperkingen. Gebruik voor bestaande saves dezelfde browser en hetzelfde adres als voorheen: `localhost` en `127.0.0.1` hebben elk hun eigen browseropslag.

## Next milestones

Volgende stappen: geverifieerde huidige clubselecties via een geschikte databron, betrouwbaardere serveropslag en accounts, een privéruimte voor eigen clubs met vrienden, spelerloopbanen, multiplayer en anti misbruik. Wallets en rewards vereisen daarna een duurzame economie en juridische toetsing.
