# Project Touchline

Versie **0.19.0** — een speelbaar **voetbalmanager-prototype met lokale carrière en een eerste multiplayerproef** op basis van het concept in `docs/concept.md`. Kies een bestaande club, beheer je selectie en clubkas, coach wedstrijden per minuut en bouw een carrière over meerdere seizoenen. Resultaten en voortgang worden lokaal in je browser opgeslagen.

```sh
npm start
```

Open http://127.0.0.1:3000. Op Windows PowerShell gebruik je `npm.cmd start` als `npm.ps1` wordt geblokkeerd. Run `npm test` voor controles van de simulatie en seizoensvoortgang. Node.js 24.4+ is vereist; externe pakketten zijn niet nodig.

De bestaande carrièremodus blijft lokale singleplayer. Browseropslag bevat je club en seizoen. Daarnaast is er nu een aparte servergestuurde multiplayerproef met accounts en een database; er zijn geen echte transacties of SOL rewards. Training, scouting en transfers gebruiken spelcredits. Verwijderde browsergegevens wissen je lokale carrière; servercompetities blijven bewaard. Een eigen club maken is bedoeld voor een toekomstige privéruimte met vrienden; die bestaat nog niet.

## Nieuw: accounts en samen spelen

Open **Samen spelen** in het menu of `http://127.0.0.1:3000/online`. Maak een competitie, laat een tweede manager via de competitiecode deelnemen en speel samen tien speeldagen. De server bewaart accounts, unieke clubkeuzes, opstellingen, tactiek, training, onderlinge biedingen, credits en uitslagen in SQLite. Zodra alle managers klaar zijn, rekent hij de speeldag één keer af. Herladen en een serverherstart behouden de voortgang.

Standaard draait dit **uitsluitend als lokale test**. Gebruik een `.test`-adres, bijvoorbeeld `manager@touchline.test`; de testcode verschijnt in het scherm. Er worden geen echte e-mails verstuurd. De walletflow controleert een ondertekend Phantom-bericht en ondersteunt koppelen aan een account; echte walletbediening moet nog worden beproefd. Voor aanmelden via echte e-mail en spelen met vrienden via internet moeten hosting, HTTPS en de maildienst nog worden ingesteld.

De multiplayerproef heeft een beperktere spelomvang dan de lokale carrière: volledige serverwedstrijden, voorbereiding, training en transfers. Live coaching en de uitgebreide clubsystemen blijven voorlopig in de lokale variant. **Bestaande lokale saves blijven behouden en worden niet naar online credits omgezet.** Lees [startinstructies, regels en beperkingen](docs/online.md), of maak een serverbackup met `npm.cmd run backup:db`.

## Lokale carrière

De onderstaande systemen horen bij de uitgebreide lokale spelvariant.

## Blessurewissels door de computercoach

Je tegenstander krijgt bij de aftrap maximaal zeven reserves en kan bij een lichte tik zelf wisselen. De klok loopt door. Een passende, fittere reserve neemt het vanaf de volgende minuut over; zonder geschikte reserve blijft de speler staan. De limiet van drie wissels geldt ook voor de computer. Keeperwissels, gespeelde minuten en hersteltijd blijven na herladen en in het eindverslag correct. Lees [de computercoachregels](docs/opponent-coach.md).

Bekijk [wat er nog te doen is en in welke volgorde](docs/next-steps.md). De server- en databasebasis is nu aanwezig voor de aparte multiplayerproef. Externe bereikbaarheid en uitbreiding naar de volledige game volgen daarna.

## Lichte blessures tijdens wedstrijden

Bij een lichte tik aan een eigen speler pauzeert de wedstrijd automatisch. De medische melding toont wie klachten heeft en biedt **Kies wissel**. Die knop selecteert de geblesseerde speler en brengt je naar de reserves; pas **Wissel** voert de wissel uit. Je kunt ook hervatten: de speler speelt dan door met 15 punten minder effectieve conditie, tot minimaal 10%. De gewone limiet van drie wissels blijft gelden.

De speler mist de volgende speeldag, ook als je hem wisselt. Moment, leesbare melding, speelminuten en hersteltijd blijven na herladen bewaard. Tegenstanders kunnen dezelfde lichte tik krijgen. De computercoach kiest dan een passende reserve als die beschikbaar is. Langere spelblessures kunnen zoals voorheen na afloop worden vastgesteld. Een reeds lopende wedstrijd uit een oudere save behoudt zijn oude regels. Lees [de blessure- en herstelregels](docs/fitness.md).

## Postvak voor de manager

Open **Postvak** voor ontvangen biedingen, geaccepteerde aankoopbiedingen en tegenbiedingen, aflopende contracten, blessures, schorsingen en bereikte trainingsdoelen. Ook een negatieve clubkas, ontbrekende sponsor, open wedstrijd en voltooid seizoen krijgen een melding wanneer dat van toepassing is. De teller in het menu toont ongelezen berichten.

Filter op onderwerp of leesstatus en markeer de zichtbare berichten als gelezen. Een melding opent het bijbehorende scherm; verkopen, aankopen, verlengen en verder spelen blijven afzonderlijke keuzes. Leesmarkeringen blijven na herladen en in backups bewaard. Berichten volgen de huidige situatie en verdwijnen zodra deze is opgelost. Bestaande saves krijgen geen verzonnen berichtengeschiedenis. Lees [de postvakregels](docs/inbox.md).

## Stadion en supporters

Open **Clubzaken → Stadion**. Vergelijk ticketprijzen van 1 tot 4 spelcredits, bekijk de verwachte bezetting en breid je tribunes uit. Reputatie en de laatste vijf uitslagen bepalen samen met de prijs hoeveel supporters komen. De capaciteit is een spelwaarde, geen echte stadioninformatie.

Prijs en bezoekersaantal liggen vanaf de aftrap vast. Het eindverslag toont de opbrengst; die wordt één keer geboekt. Je ziet de laatste twintig thuisduels en blijvende totalen. Bestaande credits en upgrades blijven behouden; al lopende oude wedstrijden houden hun vaste inkomsten. Lees [de stadionregels](docs/stadium.md).

## Transfers tussen computerclubs

Open **Scouting & transfers → Transferjournaal**. Na iedere speeldag kunnen computerclubs onderling een reserve overnemen, maximaal één transfer per speeldag en binnen hun bestaande budgetten. Het journaal toont de betrokken clubs, speler, prijs en reden, met filters en links naar de actuele selecties.

Over jouw spelers blijf je zelf beslissen. Bestaande carrières krijgen geen transfers achteraf en een al lopende wedstrijd behoudt de oude regels. Je shortlist volgt verhuisde spelers op hun vaste ID. De laatste vijftig onderlinge transfers blijven zichtbaar; totalen en budgetten blijven volledig bewaard. Lees [de transferregels voor computerclubs](docs/league-market.md).

## Gericht scouten, shortlist en vergelijken

Open **Scouting & transfers → Gericht zoeken**. Bewaar een gewenste positiegroep, maximale transferprijs en vaardigheid. Zoeken bij andere clubs en in je huidige rapport is gratis. Hetzelfde profiel stuurt je volgende betaalde scoutingopdracht; bij nul passende spelers betaal je niets.

Bewaar maximaal twintig kandidaten op je **Shortlist** en vergelijk hun vaardigheden, conditie, prijs en salaris met een eigen speler uit dezelfde positiegroep. Je ziet de berekening van de rolscore; die voorspelt geen wedstrijdwinst. Vergelijken wijzigt je opstelling niet en doet geen aankoop. Je shortlist en zoekprofiel blijven na herladen en over seizoenen bewaard. Oudere saves en bestaande rapporten blijven bruikbaar. Lees [de scoutingregels](docs/scouting.md).

De [roadmap](docs/roadmap.md) legt ook de bevestigde productrichting vast: online spelen met e-mail- of walletaanmelding, distributie via de Solana dApp Store en koopbare packs als onderdeel van het verdienmodel. De eerste account- en multiplayerbasis is aanwezig. Solana dApp Store, packinhoud, prijzen en economische regels worden later uitgewerkt.

## Clubreputatie en nieuwe sponsors

Open **Clubzaken → Reputatie**. Nieuwe zeges leveren 12 punten op, een gelijkspel 5 en verlies 1. Eigen reglementair verlies geeft niets. Na tien volledig bijgehouden wedstrijden krijg je bij de seizoensafsluiting ook een bonus voor de eindpositie. Je ziet de volgende mijlpaal, punten per bron en de laatste 40 prestaties.

Bij 100 punten komt **Regionale partner** beschikbaar bij Sponsors; bij 300 punten **Landelijke partner**. Je kiest zelf of je het contract afsluit. Bestaande sponsorafspraken blijven gelden tot het einde van het seizoen. Reputatie kan niet gekocht worden en beïnvloedt geen spelersvaardigheden.

Oudere carrières beginnen met nul reputatie, vanaf hun huidige speeldag. Bestaande uitslagen, clubkas en sponsors blijven behouden; er worden geen punten achteraf uitgedeeld. Dit zijn spelregels voor jouw carrière, geen waarderingen van de echte clubs. Lees [de reputatieregels](docs/reputation.md).

## Persoonlijke trainingsplannen en zichtbare groei

Open **Training → Spelerontwikkeling**. Kies een speler, een vaardigheid en een hogere doelwaarde tot 99. Bewaren traint nog niet. Je ziet hoeveel individuele sessies of speelminuten naar verwachting nodig zijn. **Train volgens plan** gebruikt dezelfde individuele sessie als de bestaande speler- en keepertraining, met dezelfde conditiekosten.

Met een actief plan telt het spel na elke nieuwe wedstrijd alleen de werkelijk gespeelde minuten. Iedere 180 minuten leveren één punt op in de gekozen vaardigheid, tot je doel bereikt is. Wissels en rode kaarten beperken die minuten; een ongebruikte reserve krijgt niets. Een doel of andere focus wijzigen kan buiten wedstrijden. Een hoger doel binnen dezelfde vaardigheid behoudt opgebouwde minuten; stoppen of een andere focus wist de nog niet verzilverde minuten, maar behoudt verdiende vaardigheden.

Het scherm toont beginwaarden, huidige vaardigheden, groei door teamtraining, individuele training en speeltijd, plus de laatste zestien verbeteringen. Je kunt het ook vanuit een spelersprofiel openen. Groei, doelen en minuten blijven na herladen en over seizoenen bewaard. Bij verkoop blijft de ontwikkelhistorie bij de speler; zijn plan stopt.

Bestaande spelers, ratings, credits en lopende wedstrijden blijven behouden. Meten begint bij deze update; oude trainingen worden niet achteraf verzonnen. Dit zijn speldoelen en rekenkundige verwachtingen, geen officiële potentieelratings of voorspellingen over de echte speler. Lees [de ontwikkelregels](docs/development.md).

## Andere clubs bieden op jouw spelers

Open **Scouting & transfers → Ontvangen biedingen**. Na een gespeelde wedstrijd kunnen maximaal drie clubs op verschillende spelers uit jouw selectie bieden, op basis van hun bezetting, spelerskwaliteit en beschikbare transferbudget. Je ziet nieuwe belangstelling ook op Overzicht. Kies **Bekijk verkoop** voor het bedrag, de salarisbesparing en gevolgen voor je selectie. **Annuleren** behoudt het bod; **Wijs bod af** sluit het zonder transfer. Alleen **Bevestig verkoop** laat de speler verhuizen en verwerkt de betaling.

De vijf tegenstanders hebben ieder een eigen transferbudget: 120.000 spelcredits bij de start van dit systeem, plus 8.000 per daarna afgeronde speeldag. Aankopen gaan eraf, verkoopopbrengsten komen erbij. Ook bestaande directe verkopen via Clubzaken en jouw aankopen via Clubtransfers gebruiken deze budgetten. De budgetten en recente mutaties staan onder de ontvangen biedingen. Dit zijn spelregels, geen echte clubfinanciën.

Bestaande saves krijgen een lege inbox en startbudgetten voor de tegenstanders; jouw credits, selecties, tactiek en resultaten blijven behouden. Er worden geen oude biedingen of betalingen achteraf toegevoegd. Herladen verandert een open bod niet. Bij de volgende aftrap, een nieuw seizoen of expliciete selectie-update vervalt het. Lees [de transferregels](docs/transfers.md).

## Bieden op spelers van andere clubs

Onder **Scouting & transfers → Clubtransfers** kun je spelers uit de andere vijf clubs zoeken en een bod doen. De club accepteert, wijst af of doet een tegenbod. Een bod schrijft niets af: bekijk eerst het transferbedrag, salaris en contract, en kies daarna **Bevestig aankoop**. Intrekken kost niets. Openstaande aanbiedingen blijven na herladen bewaard en vervallen bij het starten van een wedstrijd of nieuw seizoen.

De speler verhuist met zijn bestaande spelwaarden, blessures, schorsingen en carrièrestatistieken. Je kiest zelf zijn plaats in de opstelling. Verkopende clubs houden voldoende spelers en keepers over. Dit is een lokaal spelmodel met maximaal vijf open aanbiedingen; er worden geen echte biedingen verstuurd. Lees [de transferregels](docs/transfers.md).

## Kaarten, ondertal en schorsingen

Overtredingen kunnen geel of rood opleveren. Bij rood pauzeert de wedstrijd automatisch: de speler verlaat het veld en mag niet worden vervangen. Op het liveveld zie je de lege plek en kun je tijdens een pauze spelers naar een andere positie schuiven. Ondertal beïnvloedt balbezit, passing en kansen; speelminuten stoppen bij de rode kaart.

Onder **Selectie** en **Voorbeschouwing** zie je schorsingen en spelers die op scherp staan. Drie losse gele kaarten betekenen één gemiste wedstrijd, twee keer geel in hetzelfde duel één, direct rood twee. Het selectievoorstel slaat geschorsten over. De straf neemt pas af na een afgeronde speeldag. Dit zijn spelregels voor deze minicompetitie, geen officiële competitieregels. Lees [de kaartenregels](docs/discipline.md), inclusief spelen met minder dan elf en reglementair verlies onder zeven spelers.

Bestaande saves blijven werken. Een al lopende wedstrijd behoudt de oude regels tot het eindsignaal; kaarten beginnen bij de volgende aftrap. Oude uitslagen krijgen geen kaarten achteraf.

## Keepers die schoten stoppen

Keepers beïnvloeden nu of een schot op doel een goal wordt. Reflexen, balvastheid, positionering, conditie en moraal tellen mee. Bekijk de keeperkwaliteiten in het spelersprofiel, vergelijk de basiskeepers bij **Voorbeschouwing** en train een keeper via **Training**. Keepertraining gebruikt dezelfde individuele sessie als andere spelertraining.

Het liveverslag noemt de keeper bij reddingen; het eindverslag en **Carrière** tonen reddingen, tegengoals en de nul gehouden. Keeperwissels verdelen de statistieken over de juiste spelers. De vaardigheden zijn gegenereerde spelwaarden; algemene ratings, prijzen en bestaande contracten blijven behouden. Een lopende oude wedstrijd behoudt zijn oorspronkelijke regels. Lees [de keeperregels](docs/keepers.md).

## Blessures, herstel en fitte opstellingen

Onder **Selectie** zie je wie inzetbaar is en wie een spelblessure heeft. **Stel fit elftal voor** toont een voorstel voor maximaal elf starters, zeven reserves en een aanvoerder, afhankelijk van de beschikbare spelers. Annuleren behoudt je keuzes; **Pas voorstel toe** slaat de nieuwe opstelling op. Geblesseerde spelers kunnen niet deelnemen of individueel trainen.

Alle zes clubs hebben nu conditieherstel tussen speeldagen en blessures van één tot drie gemiste wedstrijden. Het herstelcentrum verkleint het risico, verbetert conditieherstel en verkort vanaf niveau 3 nieuwe blessures. Na de seizoensrust is iedereen weer fit. Dit zijn fictieve gebeurtenissen in jouw spel, geen gezondheidsinformatie over de echte spelers. Lees [de regels voor fitheid](docs/fitness.md).

Bestaande carrières krijgen geen blessures achteraf. Een al lopende wedstrijd uit een oudere versie behoudt zijn oorspronkelijke selectie en conditieregels tot het eindsignaal. De nieuwe regels beginnen bij een nieuwe aftrap.

## Clubbeheer en carrière

- **Clubzaken:** inkomsten en uitgaven, salarissen, contracten verlengen, spelers verkopen aan een andere club, faciliteiten, trainers, scouts en vijf sponsorcontracten.
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

Je kiest handmatig elf basisspelers, maximaal zeven wisselspelers en een aanvoerder. Bij onvoldoende inzetbare spelers zijn lege plaatsen mogelijk. De aanvoerdersband is zichtbaar maar geeft nog geen statistiekbonus. Tijdens de wedstrijd kun je op elk moment pauzeren, maximaal drie spelers wisselen en formatie, mentaliteit, pressing of tempo aanpassen. Een gewisselde of weggestuurde speler kan niet terugkeren. De nieuwe instructies gelden vanaf de volgende minuut; de wedstrijd wordt niet vooraf volledig berekend. Conditie daalt op basis van werkelijk gespeelde minuten en uithoudingsvermogen.

Bij rust stopt de klok automatisch. Je kiest tussen 1×, 2× en 4× snelheid. Iedere gespeelde minuut wordt lokaal opgeslagen; na het vernieuwen van de pagina hervat je gepauzeerd vanaf die minuut. De uitslag en credits worden pas bij het laatste fluitsignaal verwerkt. Het laatste wedstrijdverslag blijft beschikbaar op het overzicht. Oudere saves krijgen automatisch een wisselbank en aanvoerder; club, credits en uitslagen blijven behouden.

De engine gebruikt attributen, conditie, moraal, tactiek en een reproduceerbare seed. Schoten krijgen xG. Het model is illustratief en niet gekalibreerd op echte voetbaldata. De geautomatiseerde tests omvatten simulatielogica, save-migratie, wisselregels, hervatten en de bediening via een lichte DOM-adapter. Dit vervangt geen visuele browsertest.

## Interfacecontrole

De interface is handmatig gecontroleerd in een Chromium-browser op desktop- en mobiel formaat. De veldweergaven volgen de gekozen formatie; op mobiel blijft horizontaal scrollen beperkt tot de navigatie en brede tabellen. Tactiekschuiven hebben toegankelijke namen. De 247 automatische tests controleren onder andere savebehoud, geldstromen, contracten, transfers, blessures, medische coachpauzes, blessurewissels door de computercoach, hervatten en wisselen bij lichte klachten, herstel, selectievoorstellen, keeperkwaliteit, keeperwissels, kaarten, ondertal, schorsingen, reglementaire uitslagen, biedingen, tegenbiedingen, eenmalige transferbetalingen, ontvangen biedingen en tegenstanderbudgetten, persoonlijke trainingsplannen, groei door werkelijke speelminuten, automatische instructies, clubreputatie, sponsorvoorwaarden, gerichte scouting, shortlist, spelersvergelijking, onderlinge clubtransfers, postvakfilters, leesstatus, veilige doorklikroutes, stadionprijzen, bezoekersaantallen, ticketafrekening en 52 opeenvolgende seizoenen.

Zie [het controleverslag](docs/browser-check.md) voor de geteste flows en beperkingen. Gebruik voor bestaande saves dezelfde browser en hetzelfde adres als voorheen: `localhost` en `127.0.0.1` hebben elk hun eigen browseropslag.

## Next milestones

De oorspronkelijke visie is behouden in `docs/concept.md`. [De actuele roadmap](docs/roadmap.md) onderscheidt wat al werkt, wat nog een prototype is en wat later volgt: verdere spelerontwikkeling en spelbalans, accounts en serveropslag, multiplayer en privéruimtes met vrienden. Wallets en rewards zijn een aparte latere fase.
