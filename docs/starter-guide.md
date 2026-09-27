# De eerste stappen — 0.25.0

De app krijgt eerst meer spelgemak en een volledige instap. Publieke hosting en samenvoegen met de uitgebreidere online game wachten tot de spelervaring voldoende klaar is. Dit is de door de gebruiker gekozen volgorde.

## Van manager naar club

Na de lokale proefaanmelding begint de begeleide start. Kies een managernaam, één van zes originele voetbalbadges en eventueel een motto. Daarna kies je een league, speelregio/spelregels, een bestaande wachtkamer of automatisch zoeken, en een vrije echte club. Clubkaarten tonen de bestaande logo's. Er wordt niets geclaimd totdat je **Bevestig mijn club** kiest. Bezetting blijft door de server gecontroleerd.

De vijf stappen hebben een voortgangsbalk. **Vorige stap** wijzigt alleen de keuze; **Later verdergaan** opent het gewone clubhuis. De knop **Tutorial** hervat de instap of de lessen. De gekozen league, regio en spelregel blijven in de pagina-URL staan. De geopende eigen wereld wordt via de parameter play hervat; eerst wordt gecontroleerd dat het account nog deelneemt. Als een oude wereld niet meer beschikbaar is, verschijnt opnieuw de wereldkeuze.

Een speelwereld is een aparte competitie op de bestaande lokale server. Deze release zet niets publiek online en voegt geen datacenters toe. De gewone publieke-wachtkamerregels blijven gelden: minimaal twee managers en start vanaf dertig minuten. Tijdens het wachten kun je de tutorial al volgen. Met alleen jouw account in een lokale wachtkamer kun je ook **Speel nu tegen de computer** kiezen. Dit maakt een eigen oefenwereld; andere managers sluiten daar niet meer aan. Zie [de regels](local-practice.md).

## Leren zonder je clubkas te veranderen

Assistent Noa begeleidt zes korte lessen: basiself/tactiek, individuele training, verkopen, kopen, packs en wedstrijdvoorbereiding. De lessen gebruiken de regels van de speelwerelden. De trainings- en verkoopoefening gebruiken expliciete oefenvoorbeelden. Ze sturen geen wedstrijd-, trainings-, transfer- of packopdracht en veranderen geen spelers, credits of trainingslimieten.

Een goed antwoord bewaart de les als geleerd. Opnieuw oefenen levert niets extra op. Je kunt lessen afzonderlijk openen, pauzeren en na herladen verdergaan. Na zes lessen verschijnt de cosmetische **Touchline Starter**-badge op je profiel; de badge geeft geen geld, rating of spelvoordeel. Vanuit een actief seizoen kun je het bijbehorende echte spelscherm openen. Daar voer je eventuele echte handelingen zelf uit.

## Eigen managerprofiel

**Mijn profiel** toont naam, motto, voetbalbadge, het aantal eigen speelwerelden en de lesvoortgang. Alle keuzes zijn later aanpasbaar. De voetbaliconen zijn eigen SVG-tekeningen; ook de zes profielbadges gebruiken eigen SVG-iconen. Het trainingscomplex is een origineel gegenereerd beeld. Herkomst en exacte prompts staan in [artwork.md](artwork.md).

De nieuwe endpoints `/api/account/profile` en `/api/account/guide` gebruiken de bestaande sessie, CSRF- en Origin-controles. Alleen toegestane velden en vaste badge-/lescodes (oude emotiecodes blijven compatibel) worden geaccepteerd. Naam en profiel worden samen opgeslagen. Opgeslagen profieltekst wordt als tekst ge-escaped.

Profielen staan per account onder de sleutel `manager-profile:<account-id>` in de bestaande SQLite-instellingentabel. Dit is uitsluitend cosmetische profiel- en tutorialdata. Databaseschema 3, spelwerelden, identities, auth-secret en lokale saveformaat blijven behouden. De browsercarrière blijft apart; het carrièremenu verwijst naar **Tutorial & profiel**.

## Controles

De automatische suite bevat 281 geslaagde tests, inclusief herstartbehoud, accountisolatie, ongeldige invoer, CSRF, dubbele lesafronding en de volledige profiel/league/club/oefenflow. De tutorialtest controleert expliciet dat oefenen geen gameplay-opdrachten verstuurt.

Browsercontrole is uitgevoerd op een afzonderlijke localhost-testdatabase: profiel en motto bewaren, Eredivisie kiezen, automatische wereldkeuze, Ajax via een clubkaart bevestigen, alle zes lessen afronden, fout antwoord herstellen, herladen na twee lessen, badge op het profiel en terugkeer naar de wachtkamer. De testclub hield 120.000 credits. Profiel, wereldkeuze, clubkeuze en lessen passen op 320/390 pixels; ook de desktopindeling is bekeken. Na de laatste oefenkaartwijziging slagen de 29 gerichte profiel-/UI-/HTTP-tests opnieuw.

De gewone preview is herstart en de startersroute staat klaar. De bestaande Ajax-browsercarrière houdt 84.666 credits, 27 spelers en negen gespeelde wedstrijden. Een telefoonformaat in de browser vervangt nog geen proef op echte apparaten.
