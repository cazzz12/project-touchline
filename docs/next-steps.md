# Wat blijft er te doen?

Stand: **0.19.0, 26 september 2026**. De lokale manager blijft beschikbaar. Daarnaast is de eerste servergestuurde multiplayerproef gebouwd en met afzonderlijke accounts getest. De proef draait lokaal; er is nog geen publieke online release.

## Tot en met multiplayer bereikt

| Stap | Nu gebouwd | Wat staat nog open? |
| --- | --- | --- |
| Server en database | SQLite, schema-migratie, transacties, eenmalige opdrachten, versienummers, backup, herstartbehoud en servercontrole over credits, spelers, transfers en wedstrijden. | Productiehosting, automatische/offsite-backups, monitoring, databeheer en schaaltests. De uitgebreide lokale carrière is nog niet volledig naar de server overgezet. |
| Accounts | E-mailcodes met sessies, uitloggen op alle apparaten, managernaam, cryptografische Phantom-aanmelding en koppelen van wallet/e-mail aan hetzelfde account. | Een echte maildienst en geverifieerde afzender activeren en beproeven; echte Phantom-bediening en accountbeheer/privacy afronden. Lokale testcodes bewijzen geen mailboxeigendom. |
| Eerste multiplayer | Lobbycode, twee tot zes managers met unieke echte clubs, computerclubs op vrije plaatsen, handmatige basiself/tactiek/training, menselijke transferbiedingen, gezamenlijke speeldagen, ranglijst en volgende seizoenen. | Externe bereikbaarheid, meerdere apparaten, regels voor afwezigheid, verlaten/vervangen van deelnemers, openbare competities en verdere spelpariteit. |

Start via **Samen spelen**, of lees de [eenvoudige testinstructies](online.md). De oude browsercarrière blijft apart en wordt niet omgezet in online credits. Geen packs, aankopen of verhandelbare waarde zijn geactiveerd.

## Eerstvolgende prioriteit: multiplayer bruikbaar maken voor een kleine vriendengroep

1. **Afwezigheid en lobbybeheer:** verlaten vóór start, organisator overdragen, gereedmeldingen en een afgesproken deadline of automatische voorbereiding. Niemand mag door een verdwenen manager permanent vastlopen. Deze productkeuze moet expliciet worden gemaakt.
2. **Een besloten externe testomgeving:** hosting en duurzaam databasepad, HTTPS, maildienst en een geverifieerde afzender kiezen. De lokale testmodus blijft ontoegankelijk vanaf het netwerk. Pas na een concrete kostenraming worden betaalde diensten geactiveerd.
3. **Twee echte apparaten:** aanmelden en herstel, een wallet koppelen, samen een seizoen, onderlinge transfers, netwerkverlies en serverherstart testen. Dezelfde accountgegevens en competitie moeten overal terugkomen.
4. **Beheer voor de test:** privacy-informatie, accountgegevens exporteren/verwijderen, automatische backups en herstelproef, monitoring en foutafhandeling. De huidige veiligheidscontroles vervangen geen onafhankelijke audit.
5. **Spelomvang uitbreiden:** de gekozen lokale systemen naar multiplayer overzetten, waaronder reserves, live coaching of vooraf ingestelde wissels, blessures, schorsingen, scouting, contracten, sponsors en stadion. Nu is multiplayer een kleinere aparte variant.

Deze stappen zijn nodig voordat we de proef een bruikbare publieke online voetbalmanager kunnen noemen. Een uitnodiging op localhost is alleen op dezelfde computer bruikbaar.

## Daarna: packs, Solana en lancering

| Fase | Nog te doen |
| --- | --- |
| Packs en inkomsten | Inhoud, prijzen, gratis verdienroutes, eventuele kansen en eerlijke competitie bepalen. Daarna betaalroute, serverbewijzen, eenmalige levering, aankoopoverzicht en herstel testen. Betalen mag geen automatische wedstrijdwinst geven. |
| Mobiele app en Solana dApp Store | Android-app, mobiele walletintegratie, echte toesteltests, netwerkonderbrekingen, eventuele Solana-testbetalingen en actuele storevereisten. De huidige desktop-walletaanmelding is geen volledige Solana-integratie. |
| Sociale uitbreiding | Vriendenlijsten, privéruimtes en eigen clubs uitsluitend binnen die ruimtes, plus optionele pushmeldingen. De gewone competitie behoudt echte clubs en echte spelersnamen. |
| Lancering | Besloten spelerstests, balans, beveiliging, belasting, support, onboarding en productiebeheer. Commercieel gebruik van clubdata/logo's en eventuele beelden laten beoordelen. |

Een marketplace, verhandelbare assets, SOL-beloningen en treasury zijn mogelijke latere productkeuzes; ze zijn niet nodig voor de eerste multiplayerrelease. Packinhoud en prijzen staan nog open. Lokale saves mogen geen oncontroleerbare online waarde opleveren.

## Verder spelwerk

De lokale versie bevat al scouting, shortlist, vergelijken, contracten, clubtransfers, training en groeidoelen, reputatie, sponsors, faciliteiten, stadion en bezoekers, postvak, keepers, kaarten, blessures en computerwissels. Backups en oudere saves blijven ondersteund.

Nog mogelijke verdieping: preciezere posities en leeftijdsdata, leeftijd/potentieel, teamchemie, karaktertrekken, extra tactische instructies, computercoaching op score/vermoeidheid, zware wedstrijdblessures, diepere onderhandelingen, stafspecialisaties, supporters, audio en media/events. Deze onderwerpen staan naast de online prioriteiten. Geen fictieve jeugdregens in de gewone competitie.

De [roadmap](roadmap.md) koppelt de huidige systemen aan het [oorspronkelijke concept](concept.md). De 247 automatische tests controleren verwerking en behoud, niet een volledige economische balans of productiegeschiktheid.
