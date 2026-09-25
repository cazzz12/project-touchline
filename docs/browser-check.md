# Browsercontrole — 25 september 2026

Uitgangspunt: `main`, commit `0c433277984822fb7528c05b8086f0bc7fc9fe84`, versie 0.2.0. De correcties zijn voorbereid als 0.2.1.

README.md en docs/concept.md zijn vooraf gelezen. De latere keuzes blijven leidend: de gewone competitie gebruikt bestaande clubs en echte spelersnamen; selecties en ratings zijn fictief. Eigen clubs horen bij een toekomstige privéruimte. Multiplayer en Solana zijn niet gebouwd.

## Omgeving en resultaat

- Windows, Node.js 24.21.0; gestart met `npm.cmd start`.
- Ingebouwde Chromium-browser, desktop 1440 × 900 en mobiel formaat 390 × 844.
- Een nieuwe lokale testcarrière; geen bestaande gebruikerssave gewist of vervangen.
- `npm.cmd test`: alle 14 tests slagen voor en na de correcties.
- JavaScript-syntaxiscontrole van app.js en pitch.js geslaagd.
- Geen fouten of waarschuwingen in de opgevraagde browserconsole.

## Uitgevoerde controles

| Onderdeel | Controle en resultaat |
| --- | --- |
| Clubkeuze | Nieuw spel met Ajax aangemaakt; alleen de zes bestaande clubs beschikbaar. |
| Selectie | Basisspeler veranderd naar Juliën Mesbahi en hem aanvoerder gemaakt. Zeven bankkeuzes beschikbaar; ook een bankspeler gewijzigd. |
| Tactiek | Alle drie de formaties bekeken. Mentaliteit met de pijltoets aangepast; waarde bijgewerkt. |
| Training | Herstel uitgevoerd; een tweede sessie geblokkeerd. Na de wedstrijd weer beschikbaar. |
| Scouting | Vier spelers gevonden; clubkas van 120.000 naar 105.000 credits. |
| Transfer | Diogo Silva getekend voor 32.625 credits; selectie naar 51 spelers, clubkas 72.375. Te dure spelers niet te tekenen. |
| Livewedstrijd | Aftrap, pauze op minuut 7, Michael Chacón gewisseld voor Nassim Ahmed en formatie gewijzigd naar 4-4-2. |
| Herladen | Minuut 7, score 0–0, statistieken, wissel, aanvoerder en formatie bewaard; wedstrijd gepauzeerd hervatbaar. |
| Rust en eindsignaal | Op 4× snelheid automatische rust op 45 minuten; na hervatten Ajax–FC Twente 1–0. Pas op minuut 90 ronde 2 en 35.000 credits erbij: clubkas 107.375. |
| Competitie en verslag | Resultaat in ranglijst en overzicht zichtbaar; verslag op mobiel leesbaar. |
| Mobiele schermen | Overzicht, selectie, tactiek, training, scouting en competitie bekeken. Na correctie geen horizontale overloop van de pagina bij 390 px; brede tabellen en navigatie scrollen binnen hun eigen blok. |
| Compatibiliteit na correctie | De testcarrière uit 0.2.0 bleef bij herladen in de aangepaste versie bestaan, inclusief credits, uitslag, 51 spelers en aanvoerder. Oude save-migraties worden daarnaast door de bestaande tests gecontroleerd. |

## Hersteld

1. **Misleidende veldweergave:** spelers stonden in twee vaste rijen van vijf en een keeper. Beide veldjes gebruiken nu dezelfde coördinaten per formatieslot. De cirkel toont de gespeelde positie; de spelerkeuze toont daarnaast de eigen positie. Alleen de presentatie is aangepast: IDs, selectievolgorde en wedstrijdlogica blijven gelijk.
2. **Mobiele pagina te breed:** het navigatieblok drukte het volledige grid breder dan het scherm. Het grid en de zijbalk kunnen nu krimpen, zodat alleen het navigatieblok en brede tabellen horizontaal scrollen.
3. **Naamloze tactiekschuiven:** Mentaliteit, Pressing en Tempo hebben nu een expliciete toegankelijke naam.

## Grenzen van deze controle

Dit is een handmatige controle in één Chromium-browser, geen volledige browser- of toegankelijkheidsaudit. Echte Android/iOS-apparaten, Firefox en Safari zijn niet getest. Oudere gebruikerssaves zijn niet uit een persoonlijke browser opgehaald; migratiecompatibiliteit is met de bestaande automatische fixtures gecontroleerd. Browseropslag blijft gebonden aan browser en adres. De later toegevoegde exportfunctie staat hieronder beschreven.

De oorspronkelijke visie in docs/concept.md is behouden. Er zijn geen actuele officiële selecties toegevoegd.

## Vervolg: backups en herstel (0.3.0)

Het scherm **Voortgang** bevat export, import met een voorbeeld en expliciete bevestiging, en herstel van de vorige carrière. Opstarten schrijft niet meer meteen naar browseropslag. Een opslagfout laat de carrière in het geheugen staan en pauzeert de wedstrijd; een onleesbare save opent een herstelscherm in plaats van een nieuwe carrière aan te bieden.

Alle **28 automatische tests** slagen. De 14 extra tests controleren onder andere:

- Export/import van een lopende wedstrijd met wissel, met dezelfde uiteindelijke uitslag en credits.
- Migratie van saveversies 2–5, inclusief de oude rustweergave.
- Afwijzen van beschadigde JSON, onbekende versies, ongeldige spelgegevens en te grote bestanden.
- Behoud van de oorspronkelijke bytes bij leesproblemen of mislukte opslag.
- Bevestigen, annuleren, ongedaan maken en overlappende bestandskeuzes via de UI.
- Pauzeren bij een mislukte autosave, opnieuw opslaan en behoud van nog niet opgeslagen voortgang in de herstelkopie.

Browsercontrole uitgevoerd op een apart lokaal adres met een nieuwe testcarrière; de bestaande carrière op poort 3000 is niet gebruikt voor importtests:

1. Een echte JSON-download gemaakt en dat gedownloade bestand via de bestandskiezer weer geopend; annuleren behield Ajax.
2. Een beschadigd bestand afgewezen zonder wijziging van de carrière.
3. Een AZ-backup met een wedstrijd op minuut 32 en één uitgevoerde wissel bekeken en bevestigd.
4. Na herladen dezelfde minuut, score, wissel en aanvoerder teruggezien; hervat tot de automatische rust op minuut 45.
5. Via **Vorige save terugzetten** terug naar de eerdere Ajax-carrière; ook na herladen behouden.
6. Het voortgangsscherm en de bevestigingsknoppen op mobiel formaat (390 × 844) gecontroleerd: geen horizontale overloop. Geen consolefouten waargenomen.

Opslagquota en geblokkeerde opslag zijn met automatische foutsimulatie getest; de browserinstellingen van de gebruiker zijn daarvoor niet aangepast. Er is één herstelkopie, geen volledige versiegeschiedenis of serverbackup.
# Aanvulling 0.4.0 — clubselecties (25 september 2026)

- Alle zes clubs geopend: Ajax 27, Feyenoord 28, PSV 28, AZ 28, FC Utrecht 30 en FC Twente 26 spelers. Bronlinks, rugnummers en brede rollen gecontroleerd. Alle zes lokale logo's laden.
- Desktop 1440 × 900 en mobiel 390 × 844 visueel bekeken. Clubkaarten, spelerslijst en filters passen binnen het scherm; geen horizontale pagina-overloop. Zoeken naar Weghorst, profiel uitklappen, combineren met keeperfilter (geen resultaten) en zoekveld leegmaken (vier Twente-keepers) werken.
- Een bestaande carrière via de expliciete updateknop bijgewerkt. Uitslagen, seizoen en credits bleven staan; de oude selectie was zichtbaar in de herstelpreview. Annuleren van die preview hield de nieuwe selectie actief. Herladen behield de nieuwe selectie.
- Een aparte testcarrière gestart als PSV. PSV kreeg de juiste 28 spelers. PSV–FC Twente uitgespeeld: 1–1, 18.000 credits beloning. Rust op minuut 45, wissel Paul Wanner → Noah Fernandez en formatie 4-2-3-1 bleven na herladen bewaard. Het verslag bleef beschikbaar na minuut 90. Geen consolefouten in deze test.
- `npm.cmd test`: 34 tests geslaagd. Nieuwe controles omvatten alle clubkeuzes en formaties, zes volledige seizoenen, uitsluiten van dubbele scoutingnamen, een echte versie-5-testfixture, expliciete update, blokkade tijdens een wedstrijd, herstelkopie en opslagfouten.

Beperkingen: Chromium op desktop/mobiel formaat; geen apart fysiek iOS- of Androidtoestel getest. Clubdata is een vaste momentopname; ratings en transferbeschikbaarheid zijn geen officiële sportgegevens. Geautomatiseerde opslagtests gebruiken een geheugenadapter; de browsercontrole verifieert aanvullend het werkelijk opslaan en herladen.

# Aanvulling 0.5.0 — clubbeheer en carrière

Gecontroleerd in dezelfde ingebouwde Chromium-browser, desktop 1440 × 900 en mobiel 390 × 844. Alle financiële en seizoentests zijn uitgevoerd in een aparte testcarrière op poort 43129. De browser met de eigen carrière is alleen vernieuwd om compatibiliteit te controleren; de lopende wedstrijd bleef gepauzeerd en hervatbaar.

| Onderdeel | Uitgevoerde controle |
| --- | --- |
| Financiën | Nieuwe FC Utrecht-carrière met 120.000 credits. Trainer niveau 1 kostte 16.000, trainingscomplex niveau 2 kostte 28.000. Geldstromen en saldi klopten. |
| Sponsors | Zekerheid gekozen. Eén contract actief; bij de wedstrijd werd 6.000 bijgeschreven. |
| Ontwikkeling | Extra ontwikkelpunten door staf en faciliteit zichtbaar; individuele passingtraining gevolgd door teamtraining werkte. Tweede individuele sessie geblokkeerd. |
| Verkopen | Noah Ohio aangeboden aan AZ. Annuleren hield de clubkas gelijk; bevestigen leverde één betaling van 136.097 op. Speler uit eigen selectie, 29 spelers over. |
| Tactiek | 3-5-2 en preset Balbezit gekozen. Alle tien formaties beschikbaar. |
| Automatische instructies | Achterstand aanvallen en vermoeide spelers wisselen ingesteld. Instellingen na herladen behouden; aanvalsinstructie daadwerkelijk op minuut 70 uitgevoerd en in het verslag opgenomen. |
| Wedstrijd | FC Utrecht–FC Twente tot rust op minuut 45, herladen behield 0–0 en tactiek, hervat op 4×. Eindstand 1–1; netto +15.035 credits, saldo 227.132. Begroting, verslag en vijf boekingen kwamen overeen. |
| Carrière | Managernaam Testmanager bleef na herladen staan. Gelijkspel leverde 70 XP; speelminuten en goals verschenen bij de juiste spelers. |
| Seizoenen | Zelfgemaakte AZ-testcarrière na drie seizoenen geïmporteerd. Afsluiten bewaarde drie eindstanden; details waren op mobiel te openen. |
| Contracten | Seizoen 4 blokkeerde aftrap met verlopen contracten. Alle 28 contracten verlengd tot seizoen 6 met 8% salarisstijging. Na herladen kon de wedstrijd worden gestart. |
| Mobiel | Financiën, contracten, carrière, historie en voorbeschouwing visueel bekeken. Geen horizontale pagina-overloop; brede tabellen scrollen in hun eigen blok. |
| Console | Geen fouten of waarschuwingen in de opgevraagde console van de testcarrière. |

`npm.cmd test`: alle **50 tests** slagen. De uitbreiding controleert onder andere migratie zonder afschrijvingen, eenmalige afrekening, verkoop en aankoop, verlopen contracten zonder financiële blokkade, sponsorbonussen naar rato, trainingslimieten, automatische instructies, alle tien veldindelingen, ongeldige backups en 52 complete seizoenen. De langetermijntest bewaakt begrensde boekhouding/historie met behoud van totalen en een export kleiner dan 2 MB.

De oude versie-5-fixture is synthetisch gegenereerd uit de openbare code. Een onafhankelijke regeneratie vanaf commit `f2b1c858afb6252e50b0c4f17413ad2e39454a51` kwam veld voor veld overeen. Er is geen persoonlijke gebruikerssave in de repository opgenomen.

Beperkingen: geen fysieke mobiele apparaten, andere browserengines of online multiplayer getest. De economie is een prototype; de tests bewijzen correcte verwerking van de regels, geen evenwichtige spelbalans over alle speelstijlen. Automatisch wisselen is met logische tests afgedekt; de handmatige browserwedstrijd activeerde de tactische regel.

# Aanvulling 0.6.0 — fitheid en inzetbaarheid

Getest op een afzonderlijk lokaal adres (poort 43130) met nieuw aangemaakte testcarrières. De eigen gebruikerscarrière is niet gebruikt voor blessures, imports of wedstrijdsimulaties.

- Desktop 1440 × 900: inzetbaarheidsoverzicht en voorstel voor basiself, zeven reserves en aanvoerder bekeken. Annuleren behield de oorspronkelijke keeper; toepassen wijzigde de selectie. Herladen behield het toegepaste elftal.
- Een synthetische carrière met een automatisch ontstane spelblessure na vijf gesimuleerde rondes geïmporteerd. Aftrappen met de geblesseerde keeper werd geblokkeerd met een verwijzing naar Selectie.
- Mobiel 390 × 844: blessureoverzicht en voorstel bleven binnen de paginabreedte. De geblesseerde speler stond niet in het voorstel. Na toepassen en herladen kon de wedstrijd beginnen.
- De wedstrijd op 4× uitgespeeld, met automatische rust en herladen op minuut 45. Tijdens de rust bleef de blessure staan en was de voorstelknop geblokkeerd. Pas na het eindsignaal was de gemiste speeldag verwerkt; het herstelbericht stond in het verslag en clubnieuws.
- Opnieuw herladen behield het herstel: geen actieve blessure meer in het overzicht. Geen fouten of waarschuwingen in de opgevraagde browserconsole.
- Alle 62 automatische tests slagen. Nieuwe controles dekken oude lopende saves zonder nieuwe conditieregels, herstel volgens werkelijke speelminuten bij alle zes clubs, reproduceerbare blessures, trainingsblokkades, pure selectievoorstellen, herstelduur, transfers met blessure, inzetbare tegenstanders, seizoensrust, ongeldige backups en de UI-acties bekijken/annuleren/toepassen. De bestaande test met 52 seizoenen rouleert nu expliciet bij blessures.

Blessures zijn spelgebeurtenissen, geen medische informatie over echte spelers. De geteste flow stelt blessures vast na het eindsignaal; acute uitval tijdens een wedstrijd en schorsingen zijn nog niet gebouwd. De eerdere beperkingen voor browser- en balanstests blijven gelden.
