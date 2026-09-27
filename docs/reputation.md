# Clubreputatie — 0.12.0

**Clubzaken → Reputatie** toont verdiende punten, de volgende mijlpaal, totalen per bron en de laatste 40 resultaten en seizoensafsluitingen. Deze reputatie hoort bij de beheerde club in jouw carrière. Ze zegt niets over de werkelijke reputatie van Ajax, Feyenoord of een andere club en geeft geen voordeel in de wedstrijdsimulatie.

## Punten verdienen

| Nieuwe prestatie | Reputatiepunten |
| --- | --- |
| Overwinning | 12 |
| Gelijkspel | 5 |
| Nederlaag | 1 |
| Eigen reglementaire nederlaag, ook bij dubbele reglementaire nederlaag | 0 |

Een zege door reglementair verlies van de tegenstander telt als winst. Punten worden één keer toegekend na het eindsignaal of de reglementaire afbreking. Een pauze, herladen, het verslag openen of importeren geeft geen extra punten. Training, aankopen, verkopen en faciliteiten kopen geen reputatie. Er is geen dagelijkse klok, verval of straf voor afwezigheid.

Als **alle tien wedstrijden van een seizoen onder de nieuwe reputatieregels** zijn afgerond, volgt bij **Start nieuw seizoen** een extra bonus:

| Eindpositie | Bonus |
| --- | --- |
| 1 | 50 |
| 2 | 30 |
| 3 | 20 |
| 4 | 10 |
| 5 | 5 |
| 6 | 0 |

Een gedeeltelijk bijgehouden seizoen krijgt geen eindbonus. Dat geldt ook wanneer een al lopende oude wedstrijd nog zonder reputatieregels is afgerond. De punten van de overige nieuwe wedstrijden blijven wel verdiend. De afsluiting wordt eenmaal verwerkt; daarna begint de teller voor het nieuwe seizoen op nul. Het totaal en de historie blijven behouden.

## Sponsorcontracten

Reputatiepunten worden niet uitgegeven. Nieuwe niveaus openen extra keuzes; afsluiten blijft een handmatige keuze bij **Clubzaken → Sponsors**.

| Niveau | Vanaf | Extra contract |
| --- | --- | --- |
| In opbouw | 0 | Bestaande drie contracten blijven beschikbaar |
| Gevestigd | 100 | Regionale partner |
| Toonaangevend | 300 | Landelijke partner |

| Nieuw contract | Per speeldag | Extra per zege | Eindbonus |
| --- | --- | --- | --- |
| Regionale partner | 7.500 | 0 | 0 |
| Landelijke partner | 3.500 | 6.500 | 45.000 bij top 3 |

Bedragen zijn spelcredits. Een eindbonus blijft naar rato: `bonus × resterende speeldagen bij afsluiten / 10`, naar beneden afgerond. De betaling volgt op dezelfde manier als bij bestaande sponsors in de boekhouding. Bij ondertekenen wordt nog niets betaald. Eén contract per seizoen; je kunt een actief contract niet vervangen wanneer je tijdens dat seizoen een nieuw niveau haalt. Tijdens een wedstrijd en na de tiende speeldag kun je geen contract afsluiten. Na de seizoensafsluiting kies je opnieuw.

De bestaande contracten Zekerheid, Overwinningen en Titelambitie veranderen niet. Een hogere reputatie verhoogt hun afgesproken bedragen niet automatisch. Alle contracten zijn fictieve categorieën zonder echte bedrijven, echte betalingen of externe transacties.

## Savebehoud en opslag

- Een oudere carrière krijgt nul reputatiepunten, een lege historie en een startmoment op de huidige speeldag. Clubkas, resultaten, spelers, manager-XP en bestaande sponsors blijven behouden. Er worden geen oude prestaties achteraf toegekend.
- Een al lopende oude wedstrijd krijgt geen reputatieregels toegevoegd. De eerstvolgende nieuwe aftrap gebruikt ze wel.
- De opslagsleutel, interne saveversie en bestaande backup- en herstelprocedure blijven hetzelfde. Reputatie gaat mee in de backup.
- Historie bewaart maximaal 40 regels. Verwijderde oude regels blijven in het beginsaldo en alle totalen meetellen. Een transfer of expliciete selectie-update wist de clubreputatie niet.
- Importcontrole bewaakt onder meer tijdstippen, puntentotalen, de volgorde van historische regels, de actuele seizoensteller, geldige reputatieregels en de vereiste punten voor nieuwe sponsorcontracten.

Dit is een lokaal progressiesysteem. Het is geen beveiligde online ranglijst, commercieel reputatiemodel of bewijs van realistische spelbalans. Sinds 0.15.0 verhoogt reputatie de verwachte bezetting bij nieuwe thuiswedstrijden: +1 procentpunt per 25 punten, maximaal +20. Zie [stadion en kaartverkoop](stadium.md). Invloed op scouting en transferbereidheid volgt later.
