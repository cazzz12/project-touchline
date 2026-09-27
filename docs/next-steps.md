# Wat blijft er te doen?

Stand: **0.25.0, 27 september 2026**. Openbare speelwerelden, de stadionlogin en proefpacks zijn lokaal gebouwd en getest. Er is nog geen publieke release of betaling met echt geld.

## Nu gebouwd

- Een gekozen club direct lokaal starten tegen computerclubs, handmatige speeldagen en nieuwe seizoenen, herstel van de geopende wereld na herladen. Zie [oefenwerelden](local-practice.md).

- E-mailcodes, Phantom en Solflare; koppelen van wallet/e-mail, serveropslag en herstartbehoud.
- Twintig competities, 351 clubs, 9.636 huidige spelers; zestien speelbare leagues. FC 26-ratings met gemarkeerde FC 27-aanvullingen.
- Openbare werelden per league/regio/spelregels, vrije echte clubs, automatisch aansluiten, vertrekken vóór start en iedere 24 uur een speeldag.
- Elftal, tactiek, training, transfers, ranglijst, verslagen en volgende seizoenen onder servercontrole.
- Scout- en Spotlight-packs met spelcredits, zichtbare kansen en elf echte oud-spelers. Eenmalige afschrijving/levering; geen dubbele speler in één selectie. Klassieke werelden zonder packs.
- Mobiele login, wereldkeuze, elftal en packs; grote knoppen, vast ondermenu en originele stadionachtergrond.
- Behoud van lokale saves en oude competities, database-upgrade en backup. **281 automatische tests slagen.**

De [wedstrijdstijl](matchday-design.md) brengt beide clublogo’s, een lokale voorbereidingstakenlijst, blauwe trainingskaarten en kleurrijke packs samen. Profielen gebruiken voetbalbadges; AI-portretten en de emotiekeuze zijn verwijderd. Helderblauwe vlakken, gele acties en lichte club-/profielpanelen maken het verschil duidelijker.

Directe lokale toegang zonder handmatig ingevulde code is beschikbaar via de login. De hele app gebruikt de [stadionstijl](stadium-design.md).

Zie [arenaregels](arena.md) en [online-inrichting](online.md).

## Eerst de app afwerken

De gebruiker wil eerst een betere en complete spelervaring, en pas daarna publieke online integratie. De [startersroute en managerprofielen](starter-guide.md) zijn toegevoegd: profiel → league → speelwereld → club → zes oefenlessen. Volgende appwerk: gebruikerstest van de hele dagelijkse spelronde, lokale en toekomstige online spelregels duidelijk houden, kleine schermen en alle vervolgschermen afwerken, ontbrekende voetbaldata aanvullen. De onderstaande internetroute begint pas daarna.

## Online stappen na de appfase

| Stap | Wat ontbreekt | Gereed wanneer |
| --- | --- | --- |
| 1. Besloten internettest | Hosting met blijvende schijf, HTTPS, echte maildienst/afzender, backups en monitoring. | Twee mensen op verschillende apparaten kunnen samen spelen en na herstart doorgaan. Kosten en publieke toegang worden vooraf concreet gemaakt. |
| 2. Wallets en telefoon | Phantom/Solflare op echte toestellen, Android Mobile Wallet Adapter/Seed Vault waar passend, herstel en toegankelijkheid. | E-mail en wallet werken op de gekozen Android/iOS-browsers. Formaatproeven zijn geen toesteltests. |
| 3. USDC én SOL | Ontvangende wallet, netwerk/RPC, echte prijzen, serveroffertes, walletgoedkeuring, on-chain verificatie en orderherstel. | Testbetalingen leveren exact eenmaal; een fout bedrag, mint, ontvanger of hergebruikte transactie levert niets. Daarna afzonderlijke productiebeoordeling. |
| 4. Beheer en economie | Packbalans, verdienroutes, aankoopgrenzen, voorwaarden/rechten, accountexport/verwijdering, antifraude en beveiligings-/belastingtests. | Een spelerstest en herstelproef slagen; kosten en inkomsten zijn beheersbaar. |
| 5. Meer online spel | Reserves, coachen, blessures, schorsingen, scouting, contracten, sponsors, stadion; vervanging van afwezige managers en archivering. | De gekozen lokale systemen werken met servercontrole zonder oude werelden te beschadigen. |
| 6. Solana dApp Store | Android-app, distributie, actuele store-eisen, toesteltests, support en releaseproces. | Een geteste build voldoet aan de gekozen publicatieroute. |

De servers in het spel zijn afzonderlijke speelwerelden op één proces. Regio's verdelen spelersgroepen; ze zijn nog geen fysieke hosting in Europa/Azië/Amerika. Meerdere fysieke servers vragen een gedeelde database en verdeelde, exclusieve wedstrijdverwerking.

## Voetbaldata

EA is een momentopname, geen garantie op alle huidige officiële selecties. Nog nodig: controle tegen officiële clubbronnen, ontbrekende spelers aanvullen, Portugal/Turkije/China/A-League speelbaar maken en Japan/Brazilië/Qatar/VAE aansluiten. De uitgebreide lokale carrière heeft nog zes clubs. Zie [dekking](world-data.md).

## Later

Vriendenlijsten, privéruimtes en eigen clubs uitsluitend binnen die ruimtes, meldingen, media/events en dieper clubbeheer. Marketplace, verhandelbare assets, SOL-beloningen en treasury vragen afzonderlijke keuzes. Lokale saves worden nooit omgezet in ongecontroleerde online waarde.

De [roadmap](roadmap.md) verbindt dit met het [oorspronkelijke concept](concept.md). Tests bewijzen verwerking en behoud, niet productiegeschiktheid of volledige economische balans.
