# Openbare speelwerelden en packs — 0.21.0

Het beginscherm is nu aanmelden met e-mail, Phantom of Solflare. Na aanmelden kiest de manager een league, speelregio, spelregels en vrije echte club. `/career` opent de bestaande lokale carrière met dezelfde browseropslag; `/world` blijft de catalogus. De server draait voorlopig alleen op deze computer.

## Verschillende servers

Een **speelwereld** is een afzonderlijke competitie met eigen deelnemers, selecties, budgetten, standen, wedstrijden en seizoenen. Meerdere werelden kunnen op dezelfde fysieke server draaien. Europa, Azië en Amerika zijn nu gescheiden matchmakinggroepen, geen beloofde geografische datacenters of pingmetingen.

- Zestien speelbare leagues; maximaal het aantal clubs van de league aan menselijke managers.
- Een specifieke wereld toont de bezette clubs. Gelijktijdige claims worden in één database-transactie gecontroleerd.
- Automatisch aansluiten zoekt de oudste wachtkamer waar jouw club vrij is. Anders ontstaat een nieuwe wachtkamer, maximaal drie open wachtkamers per combinatie van league/regio/spelregels.
- Maximaal tien competities per account, waarvan één per combinatie van league/regio/spelregels. Voorlopige servergrens: tweehonderd openbare werelden; archiveren en capaciteitsbeheer volgen nog.
- Vertrekken kan vóór de start. Met minimaal twee managers begint het seizoen vanaf dertig minuten na het maken van de wereld; bij een volle wereld direct. Vrije clubs worden computerclubs. Eén manager alleen start niet.
- Elke 24 uur berekent de server een speeldag. Afwezige managers spelen met hun opgeslagen elftal. Gereedmelden vergrendelt hun voorbereiding, maar vervroegt de deadline niet.
- Na het seizoen opent na 24 uur een nieuw seizoen, met behoud van spelers, credits en historie. Een teruggekeerde server haalt hoogstens één achterstallige speeldag tegelijk in; daarna volgt weer 24 uur voorbereiding.
- Gestarte werelden accepteren nog geen vervangende managers. Verlaten, herverdeling bij langdurige afwezigheid en archivering blijven vervolgwerk.

Oude competities met uitnodigingscode behouden hun regels: de organisator start en de laatste gereedmelding speelt de speeldag. Deze werelden krijgen geen packs of automatische deadlines achteraf.

Voor een eerste internettest volstaat één altijd actieve Node-server met een duurzame SQLite-schijf, HTTPS en echte mailbezorging. Een vluchtige/serverless schijf is ongeschikt. Voor meerdere fysieke servers is vervolgens een gedeelde database, taakverdeling met exclusieve verwerking van deadlines, centrale sessies en capaciteitsbeheer nodig. De huidige server is niet horizontaal schaalbaar. Zie [online-inrichting](online.md).

## Packregels

Packs werken uitsluitend in **Open competitie · met packs**. **Klassiek · zonder packs** begint met dezelfde bronselecties en biedt geen packaankopen. Beide varianten houden hun eigen competitie.

| Pack | Spelcredits | Normaal | Zeldzaam | Legendarisch |
| --- | ---: | ---: | ---: | ---: |
| Scout | 12.000 | 80% | 19% | 1% |
| Spotlight | 30.000 | 60% | 35% | 5% |

Ieder pack levert één speler. Maximaal twee packs per club per speeldag; maximaal veertig spelers in de selectie. Normaal bevat huidige catalogusspelers met bronrating onder 80, zeldzaam vanaf 80. Legendarisch bevat de elf hieronder genoemde oud-spelers. Binnen de getrokken groep heeft iedere beschikbare speler dezelfde kans. Zeldzaamheid voegt geen punten aan attributen toe. Dit proefmodel is nog niet economisch uitgebalanceerd.

Een naam kan bij verschillende managers voorkomen, maar niet twee keer binnen dezelfde selectie. Ook het accepteren van een transfer bewaakt die beperking. Bij een volle selectie, onvoldoende credits, gereedmelding, bereikte daglimiet of uitgeputte spelersgroep wordt niets afgeschreven. Er worden dan geen kansen stilzwijgend gewijzigd. Er is geen gegarandeerd icoon na een aantal packs.

De server kiest met cryptografische willekeur. Trekking, speler, kosten, ontvangstbewijs en opdrachtcode worden samen opgeslagen. Na netwerkverlies kan dezelfde opdracht opnieuw worden gecontroleerd zonder tweede aankoop. De laatste vijftig packbewijzen blijven zichtbaar; spelers en saldo blijven in de wereld opgeslagen. De catalogusversie en bronrating van de geleverde speler worden vastgelegd.

## Echte historische spelers

Zlatan Ibrahimović, Ronaldo Nazário, Andrés Iniesta, Oliver Kahn, Thierry Henry, Toni Kroos, Francesco Totti, Marcelo, Giorgio Chiellini, Steven Gerrard en Cha Bum-kun. Dit zijn hun **FC 26 Debut ICON**-versies, met ratings 85–86, niet hun hoogste kaartversies.

Algemene rating, positie en de zes kaarttotalen zijn overgenomen uit [EA's officiële FC 26-launchartikel](https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-launch-update) en de daarin opgenomen [Debut ICON-afbeelding](https://drop-assets.ea.com/images/qKutWNBHskVSgvatCGlTO/8316328616003f3290ab1f2211b4f18f/fc26-Launch-Update-Icons.jpg), geraadpleegd op 27 september 2026. De spelengine leidt ontbrekende wedstrijdwaarden af uit deze totalen. Die afleidingen worden niet gepresenteerd als officiële EA-subattributen. EA-kaartafbeeldingen en portretten worden niet meegeleverd; Touchline tekent eigen kaarten.

## USDC én SOL

De bevestigde betaalrichting is **USDC en SOL op Solana**. Het scherm en `/api/commerce` benoemen beide. Betaling is uitgeschakeld: er bestaat nog geen checkout, afschrijving, NFT, cash-out, marketplace of beloning met echte waarde. De proef gebruikt verdiende spelcredits.

Voor activering volgen serveroffertes met valuta, netwerk, exact bedrag, vervaltijd, ontvanger, packregels en een unieke order; walletgoedkeuring; onafhankelijke controle van bevestigde on-chain transfers; bescherming tegen dubbele/transactiehergebruikte levering; aankoopherstel en administratie. USDC vereist controle van de juiste mint en ontvangende tokenrekening, SOL van het exacte aantal lamports. SOL-prijzen vereisen een expliciete koers-/prijsregel. Een cliëntmelding “betaald” is nooit bewijs. Eerst testen met testfondsen, daarna pas een afzonderlijk beoordeelde productieconfiguratie.

Nog nodig: ontvangende bedrijfswallet, netwerk/RPC, echte prijzen, productvoorwaarden, toepasselijke pack- en publicatieregels en rechten voor commercieel gebruik van namen/data/logo's. Er is geen walletadres of betaalbedrag verzonnen.

## Telefoon en verificatie

De nieuwe schermen hebben een smalle indeling, grote knoppen, normale invoervelden en een vast ondermenu in competities. De login bevat een originele stadionachtergrond zonder OSM-beelden of personages. Phantom en Solflare gebruiken een ondertekend inlogbericht, geen betaling.

Op een publiek HTTPS-adres biedt de login een [Phantom-browserlink](https://docs.phantom.com/phantom-deeplinks/other-methods/browse). Een lokaal adres op de computer is op een telefoon niet bereikbaar. Een eigen Android-app, Mobile Wallet Adapter/Seed Vault, echte toesteltests en Solana dApp Store-publicatie zijn nog niet gebouwd.

Geautomatiseerde controles dekken onder andere dubbele clubclaims, wereldenisolatie, deadlines, herhaalde opdrachten, packkansen, foutrollback, betalingen weigeren en databasebehoud. De browserproef gebruikt twee aparte testaccounts en een aparte database. Alleen de testserver krijgt een versnelde klok voor start/deadlines; de echte server houdt dertig minuten en 24 uur.
