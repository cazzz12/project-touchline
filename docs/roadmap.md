# Concept en huidige stand

De aangeleverde concepttekst en `docs/concept.md` zijn inhoudelijk gelijk. Het oorspronkelijke document blijft intact. De latere keuzes van de gebruiker zijn leidend: in de gewone competitie alleen echte clubs en echte spelersnamen; eigen clubs pas in een toekomstige privéruimte met vrienden. Geen fictieve regens in de gewone competitie.

## Uitgewerkt in de lokale versie 0.16.0

| Conceptonderdelen | Huidige invulling |
| --- | --- |
| 5, 69, 96: manager, achievements, historie | Managernaam, XP, mijlpalen, trofeeën en carrièreoverzicht |
| 7–8: competitie en seizoenen | Zes echte clubs, tien fictieve speeldagen, blijvende eindstanden |
| 9, 20–22: spelers en selectie | Bronselecties, clublogo's, spelersprofielen, basiself, zeven reserves, aanvoerder en tien formaties |
| 14: keepers | Drie keepervaardigheden, invloed op schoten stoppen, training, keepervergelijking, reddingen en keepercarrières |
| 23, 44–52: tactiek en wedstrijden | Drie tactiekschuiven, vier presets, xG, minutenklok, pauze, rust, wissels, hervatten, kaarten, ondertal, schorsingen en verslag |
| 27–30: ontwikkeling, conditie en blessures | Teamtraining, individuele training, persoonlijke groeidoelen, groei per 180 werkelijke speelminuten, ontwikkelhistorie, herstel tussen speeldagen, korte spelblessures, medisch niveau en een voorstel voor een fit elftal |
| 32–35: contracten, transfers, scouting | Salaris en looptijd, verlengen, kopen, verkopen, bieden op spelers bij andere clubs, tegenbiedingen, ontvangen biedingen, eigen transferbudgetten voor tegenstanders, gericht scouten met een zoekprofiel, twintig spelers op een shortlist en vergelijken met eigen spelers; onderlinge transfers tussen computerclubs met eigen budgetten en transferjournaal |
| 6, 39–43: reputatie, staf, analyse, stadion, financiën, sponsors | Verdiende clubreputatie met historie en mijlpalen, vijf sponsorcontracten waarvan twee via reputatie, stafniveaus, voorbeschouwing, faciliteiten, stadioncapaciteit, ticketkeuzes, bezoekers op basis van reputatie en vorm, kaartverkoophistorie en boekhouding |
| 50: vooraf coachen | Optionele automatische instructies zolang de lokale wedstrijd loopt |
| 117: meldingen | Lokaal postvak met actuele aandachtspunten, filters, leesstatus en links naar beslisschermen; nog geen pushmeldingen |
| 76–79: korte en lange speelloop | Voorbereiden, spelen, inkomsten/kosten, ontwikkelen, nieuw seizoen en blijvende historie |

Dit zijn compacte spelmechanieken. Ze vormen nog geen volledige uitvoering van ieder detail uit de visie.

## Vastgelegde productrichting — bevestigd op 26 september 2026

- **Online is het einddoel.** De huidige browsergame is het speelbare prototype. Accounts, voortgang, economie, wedstrijden en transfers moeten uiteindelijk door de server beheerd worden.
- **Aanmelden via e-mail of een verbonden wallet.** Beide routes horen bij dezelfde accountarchitectuur, met later veilig koppelen en herstel. Een wallet is niet verplicht om de game te leren kennen. De game bewaart geen private keys.
- **Solana dApp Store is een gepland distributiekanaal.** Een mobiele app en de benodigde Solana-integratie en publicatieroute horen bij de roadmap. De precieze SDK's en publicatievereisten worden bij implementatie opnieuw gecontroleerd.
- **Het spel moet inkomsten verdienen.** Koopbare packs zijn expliciet onderdeel van het geplande verdienmodel, naast mogelijke cosmetische items en andere premiumproducten. Inhoud, prijs, eventuele kansen, betaalroute en verdeling van inkomsten worden vóór implementatie uitgewerkt. Er zijn nu nog geen aankopen.
- **Eerlijke competitie blijft het uitgangspunt uit het concept.** Zeldzaamheid is niet hetzelfde als voetbalsterkte; betalen mag niet automatisch wedstrijden winnen. Packinhoud moet ook passen bij echte clubs en spelers in de gewone competitie. Eigen clubs horen bij latere privéruimtes.

Voor die online fase scheiden we spelregels van schermbediening. Wallets en e-mail koppelen aan een account, niet rechtstreeks aan losse browser-saves. Aankopen krijgen servercontrole, eenmalige verwerking en herstel; een lokaal bericht dat een pack is gekocht mag nooit voldoende zijn. Dit beschrijft de toekomstige architectuur en is nog niet gebouwd.

## Nog uit te werken

1. **Spelkwaliteit en data:** spelbalans over veel carrières, fijnere posities en betrouwbare leeftijdsdata, uitgebreidere keeperacties, blessures tijdens wedstrijden, een langetermijnmodel voor leeftijd en potentieel, karaktertrekken, teamchemie en meer tactische instructies. Jeugdontwikkeling moet passen bij de keuze voor echte spelersnamen.
2. **Dieper clubbeheer:** uitgebreidere onderhandelingen met spelers, uitgebreidere transferstrategieën en langetermijnplanning voor de computerclubs, stafspecialisaties, verdere supportersinteractie en invloed van reputatie op scouting en transfers. Stadioncapaciteit, ticketprijzen en reputatiegestuurde bezoekers zijn vanaf 0.15.0 aanwezig.
3. **Online basis:** accounts met e-mail- en walletaanmelding, centrale database, servergestuurde wedstrijden en transfers, saveconflicten, herstel, beveiliging en bescherming tegen manipulatie. Browseropslag is hiervoor geen autoriteit.
4. **Samen spelen:** vrienden, privéruimtes en eigen clubs binnen die ruimtes, online competities en optionele pushmeldingen. Het lokale postvak is vanaf 0.16.0 aanwezig. De gewone competitie behoudt de echte clubs.
5. **Latere productfases:** media/events, uitgebreide prestaties, audio, mobiele app en distributie via de Solana dApp Store, en het overige sociale spel.
6. **Solana en verdienmodel:** koopbare packs, andere premiumproducten, walletbetalingen, SOL, reward points, treasury, assets en marketplace. Eerst volgen de online basis en uitgewerkte product- en economische regels; betalingen worden vóór productie in een testomgeving beproefd. Er is nu geen betaling, walletverbinding, NFT of rewardclaim.

Packs zijn een bevestigde toekomstige productkeuze; hun precieze inhoud en werking staan nog open. Jeugdregens, een managerpass en verkoopbare spelersvoordelen worden niet automatisch uit het oorspronkelijke concept overgenomen. Eerst moet duidelijk zijn hoe ze passen bij echte namen en eerlijke competitie. Er zijn nu geen pay-to-win aankopen.

## Bestaande carrières

De eigen save blijft behouden. Selecties worden alleen op expliciet verzoek vervangen, met een herstelkopie. Andere nieuwe systemen vullen ontbrekende gegevens aan zonder oude credits of uitslagen te herschrijven. Statistieken worden alleen bijgehouden wanneer daarvoor werkelijk opgeslagen gegevens bestaan.
