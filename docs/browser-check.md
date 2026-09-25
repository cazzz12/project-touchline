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
