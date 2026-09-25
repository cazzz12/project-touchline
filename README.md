# Project Touchline

Versie **0.7.0** — een speelbaar **offline voetbalmanager-prototype** op basis van het concept in `docs/concept.md`. Kies een bestaande club, beheer je selectie en clubkas, coach wedstrijden per minuut en bouw een carrière over meerdere seizoenen. Resultaten en voortgang worden lokaal in je browser opgeslagen.

```sh
npm start
```

Open http://127.0.0.1:3000. Op Windows PowerShell gebruik je `npm.cmd start` als `npm.ps1` wordt geblokkeerd. Run `npm test` voor controles van de simulatie en seizoensvoortgang. Node.js 20+ is vereist; externe pakketten zijn niet nodig.

Dit is een lokale singleplayer game. Browseropslag bevat je club en seizoen; er zijn geen accounts, online multiplayer, echte transacties, wallet of SOL rewards. Training, scouting en transfers gebruiken spelcredits. Verwijderde browsergegevens wissen je voortgang. Een eigen club maken is bedoeld voor een toekomstige privéruimte met vrienden; die bestaat nog niet.

## Nieuw: keepers die schoten stoppen

Keepers beïnvloeden nu of een schot op doel een goal wordt. Reflexen, balvastheid, positionering, conditie en moraal tellen mee. Bekijk de keeperkwaliteiten in het spelersprofiel, vergelijk de basiskeepers bij **Voorbeschouwing** en train een keeper via **Training**. Keepertraining gebruikt dezelfde individuele sessie als andere spelertraining.

Het liveverslag noemt de keeper bij reddingen; het eindverslag en **Carrière** tonen reddingen, tegengoals en de nul gehouden. Keeperwissels verdelen de statistieken over de juiste spelers. De vaardigheden zijn gegenereerde spelwaarden; algemene ratings, prijzen en bestaande contracten blijven behouden. Een lopende oude wedstrijd behoudt zijn oorspronkelijke regels. Lees [de keeperregels](docs/keepers.md).

## Blessures, herstel en fitte opstellingen

Onder **Selectie** zie je wie inzetbaar is en wie een spelblessure heeft. **Stel fit elftal voor** toont een voorstel voor elf starters, zeven reserves en een aanvoerder. Annuleren behoudt je keuzes; **Pas voorstel toe** slaat de nieuwe opstelling op. Geblesseerde spelers kunnen niet deelnemen of individueel trainen.

Alle zes clubs hebben nu conditieherstel tussen speeldagen en blessures van één tot drie gemiste wedstrijden. Het herstelcentrum verkleint het risico, verbetert conditieherstel en verkort vanaf niveau 3 nieuwe blessures. Na de seizoensrust is iedereen weer fit. Dit zijn fictieve gebeurtenissen in jouw spel, geen gezondheidsinformatie over de echte spelers. Lees [de regels voor fitheid](docs/fitness.md).

Bestaande carrières krijgen geen blessures achteraf. Een al lopende wedstrijd uit een oudere versie behoudt zijn oorspronkelijke selectie en conditieregels tot het eindsignaal. De nieuwe regels beginnen bij een nieuwe aftrap.

## Clubbeheer en carrière

- **Clubzaken:** inkomsten en uitgaven, salarissen, contracten verlengen, spelers verkopen aan een andere club, faciliteiten, trainers, scouts en drie sponsorcontracten.
- **Training:** een individuele ontwikkelsessie naast de bestaande teamtraining; faciliteiten en trainers verbeteren het effect.
- **Voorbeschouwing:** tegenstander, vorm, eerdere ontmoetingen, vergelijking van de basiself en vooraf instelbare automatische wedstrijdinstructies.
- **Tactiek:** tien formaties en vier snelle speelstijlen. Automatisch een voorsprong bewaken, aanvallen bij een achterstand of vermoeide spelers wisselen is optioneel.
- **Carrière:** managernaam, XP, mijlpalen, trofeeënkast, blijvende seizoenshistorie en goals/speelminuten per speler.

Alle bedragen, contracten, sponsorvoorwaarden, niveaus en spelerwaarderingen zijn spelregels, geen echte financiële of contractgegevens. Automatische instructies werken alleen terwijl de wedstrijd in de geopende browser loopt. Lees [de spelregels van clubbeheer](docs/management.md) voor de bedragen en effecten.

Bestaande saves houden hun clubkas, uitslagen, spelers en eventuele lopende wedstrijd. Nieuwe onderdelen worden met beginwaarden toegevoegd; er worden geen kosten achteraf afgeschreven. Opgeslagen uitslagen tellen mee in je carrière. Spelersstatistieken beginnen bij de eerste wedstrijd die je met deze versie afrondt; eerder verdwenen seizoenen kunnen niet worden teruggehaald.

## Voortgang en backups

Open **Voortgang** in het menu om je carrière als JSON-bestand te downloaden. Via **Backup kiezen** controleer je een bestand voordat je het terugzet. Je ziet de club, het seizoen, de clubkas en een eventuele lopende wedstrijd. Pas na bevestiging wordt de carrière vervangen. Met **Vorige save terugzetten** kun je de laatste vervanging ongedaan maken; er wordt één vorige carrière bewaard.

Backups zijn lokaal en bevatten geen account of wallet. Een wedstrijd wordt na import gepauzeerd hervat, inclusief gespeelde minuten en wissels. Oudere saves (versie 2–5) worden via de bestaande migratie geopend. Onleesbare of niet-ondersteunde bestanden overschrijven geen carrière. Een onleesbare browser-save blijft beschikbaar als download in het herstelscherm.

Als browseropslag vol of geblokkeerd is, toont Touchline een melding en pauzeert de wedstrijd. Je kunt de voortgang uit het huidige scherm downloaden of opnieuw proberen op te slaan. Sluit het scherm pas nadat een van beide gelukt is. De gewone save-sleutel en het interne saveformaat blijven hetzelfde.

## Simulation model

Zes bestaande Nederlandse clubs spelen een **niet-officiële fictieve minicompetitie** met heen- en terugwedstrijden. Nieuwe carrières gebruiken 167 spelers uit de officiële selectiepagina’s van Ajax, Feyenoord, PSV, AZ, FC Utrecht en FC Twente, gecontroleerd op **25 september 2026**. Namen, rugnummers en brede posities komen uit die bronnen. Ratings, conditie, prestaties en transferprijzen blijven gegenereerde spelwaarden. De gegevens zijn een momentopname en worden niet live bijgewerkt. Leeftijd wordt alleen getoond als die beschikbaar is; bij de nieuwe selecties ontbreekt die nog. De scoutingspool gebruikt de oudere CC0-namenlijst en fictieve transferbeschikbaarheid.

Het menu **Clubs** toont alle zes clubs met hun logo, selectie, zoekfunctie en positiefilter. Open een speler voor zijn spelwaarden. Bestaande carrières houden hun spelers totdat je via **Voortgang → Selecties bijwerken** kiest voor vervanging. Je oude carrière wordt dan als vorige save bewaard; credits, uitslagen en seizoen blijven behouden. Dat kan alleen buiten een lopende wedstrijd. Lees [de databronnen en updatewerking](docs/club-data.md) voor de herkomst, beperkingen en gevolgen voor opstellingen en transfers.

Je kiest handmatig elf basisspelers, zeven wisselspelers en een aanvoerder. De aanvoerdersband is zichtbaar maar geeft nog geen statistiekbonus. Tijdens de wedstrijd kun je op elk moment pauzeren, maximaal drie spelers wisselen en formatie, mentaliteit, pressing of tempo aanpassen. Een gewisselde speler kan niet terugkeren. De nieuwe instructies gelden vanaf de volgende minuut; de wedstrijd wordt niet vooraf volledig berekend. Conditie daalt op basis van werkelijk gespeelde minuten en uithoudingsvermogen.

Bij rust stopt de klok automatisch. Je kiest tussen 1×, 2× en 4× snelheid. Iedere gespeelde minuut wordt lokaal opgeslagen; na het vernieuwen van de pagina hervat je gepauzeerd vanaf die minuut. De uitslag en credits worden pas bij het laatste fluitsignaal verwerkt. Het laatste wedstrijdverslag blijft beschikbaar op het overzicht. Oudere saves krijgen automatisch een wisselbank en aanvoerder; club, credits en uitslagen blijven behouden.

De engine gebruikt attributen, conditie, moraal, tactiek en een reproduceerbare seed. Schoten krijgen xG. Het model is illustratief en niet gekalibreerd op echte voetbaldata. De geautomatiseerde tests omvatten simulatielogica, save-migratie, wisselregels, hervatten en de bediening via een lichte DOM-adapter. Dit vervangt geen visuele browsertest.

## Interfacecontrole

De interface is handmatig gecontroleerd in een Chromium-browser op desktop- en mobiel formaat. De veldweergaven volgen de gekozen formatie; op mobiel blijft horizontaal scrollen beperkt tot de navigatie en brede tabellen. Tactiekschuiven hebben toegankelijke namen. De 73 automatische tests controleren onder andere savebehoud, geldstromen, contracten, transfers, blessures, herstel, selectievoorstellen, keeperkwaliteit, keeperwissels, automatische instructies en 52 opeenvolgende seizoenen.

Zie [het controleverslag](docs/browser-check.md) voor de geteste flows en beperkingen. Gebruik voor bestaande saves dezelfde browser en hetzelfde adres als voorheen: `localhost` en `127.0.0.1` hebben elk hun eigen browseropslag.

## Next milestones

De oorspronkelijke visie is behouden in `docs/concept.md`. [De actuele roadmap](docs/roadmap.md) onderscheidt wat al werkt, wat nog een prototype is en wat later volgt: verdere spelerontwikkeling en spelbalans, accounts en serveropslag, multiplayer en privéruimtes met vrienden. Wallets en rewards zijn een aparte latere fase.
