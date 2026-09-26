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

# Aanvulling 0.7.0 — keepers

Getest met een nieuwe, door de agent aangemaakte PSV-testcarrière op een apart lokaal adres (poort 43131). Desktop 1440 × 900 en mobiel 390 × 844; geen persoonlijke save gebruikt voor training of wedstrijdtests.

- Keeperprofiel geopend via het keeperfilter. Nick Olij had 63 reflexen; één keepertraining maakte daarvan 64 en verlaagde conditie van 100 naar 97. Beide individuele trainingsknoppen werden geblokkeerd. Herladen behield de waarden en het saldo.
- De voorbeschouwing toonde beide basiskeepers en hun effectieve keeperkracht. Het liveverslag noemde de keeper bij reddingen, met een aparte regel voor reddingen per club.
- PSV–FC Twente op 4× gespeeld. Bij rust (1–1) Tijn Smolenaars vervangen door Nick Olij. Herladen behield minuut 45, score en de keeperwissel. De wedstrijd eindigde 2–2.
- Het verslag kende beide PSV-keepers 45 minuten en één tegengoal toe. Smolenaars kreeg zijn ene redding uit de eerste helft; Olij nul reddingen. Pasveer kreeg 90 minuten, twee reddingen en twee tegengoals. De cijfers verschenen ook in Carrière, voor alle zes clubs. Geen PSV-keeper kreeg een nul toegekend.
- Mobiele training, eindverslag en carrière visueel gecontroleerd. Geen horizontale pagina-overloop; de brede carrièretabel scrollt binnen zijn eigen blok. Geen fouten of waarschuwingen in de opgevraagde browserconsole. Na afloop de tijdelijke viewport hersteld en de testtab gesloten.
- De bestaande carrière op poort 3000 herladen: dezelfde club, speeldag, selectieomvang en clubkas bleven zichtbaar. De nieuwe keeperkwaliteiten zijn beschikbaar zonder een selectie-update.

Alle **73 automatische tests** slagen. Nieuw: keeperkwaliteit bij 400 identieke seeds, gelijke schoten/xG bij andere keepervaardigheden, conditie/moraal en veldspelers in doel, keeperadvies, trainingslimieten, keeperwissels met bewaren/hervatten, nul-regels, transfers en afwijzen van ongeldige keepergegevens. Twee compatibiliteitscontroles vergelijken uitslagen, events, credits, conditie, blessures en spelersstatistieken met vooraf berekende resultaten uit 0.6.0. Ook de bestaande 52-seizoenentest slaagt.

Beperkingen: de drie keepervaardigheden vormen samen één schotstopwaarde; rebounds, hoge ballen en aparte één-tegen-ééns ontbreken. Het model is geen officiële of gekalibreerde voorspelling. Geen fysieke mobiele apparaten of andere browserengines getest.

# Aanvulling 0.8.0 — kaarten, ondertal en schorsingen (26 september 2026)

Getest met een synthetische Ajax-carrière, door de agent gegenereerd uit de spelcode, op een apart lokaal adres (poort 43132). De geïmporteerde test begon in seizoen 3, net vóór een reproduceerbare rode kaart. De persoonlijke carrière op poort 3000 is niet gebruikt voor imports of wedstrijdtests.

- Op minuut 64 kreeg Tolu Arokodare direct rood. De klok stopte automatisch; het scherm toonde tien tegen elf en de lege spitspositie. De aanvoerdersband ging naar een overgebleven speler. De weggestuurde speler stond niet meer tussen de wisselopties.
- Marcos Leonardo van linksbuiten naar de lege spitspositie geschoven. Dit kostte geen wissel; linksbuiten bleef leeg. Na het heropenen van de testtab en na herladen bleven minuut, rode kaart, tien spelers en de aangepaste posities behouden.
- Desktop en mobiel 390 × 844 visueel gecontroleerd. Veld, lege plek, gele markeringen, positiekeuzes, eindverslag en schorsingenoverzicht bleven binnen hun containers. Geen horizontale pagina- of dialoogoverloop; namen op het kleine veld worden afgekort en zijn volledig beschikbaar in de positiekeuzes.
- Ajax–FC Twente eindigde op 90 minuten in 1–1. Het verslag toonde één rode kaart en twee wedstrijden schorsing voor Arokodare. De volgende aftrap werd met de oude opstelling geblokkeerd. Het selectievoorstel sloeg zowel de geschorste speler als een geblesseerde speler over; toepassen en herladen behielden de keuzes en de straf.
- De daaropvolgende wedstrijd tegen FC Utrecht uitgespeeld. Tijdens rust op minuut 45 bleef de schorsing op twee staan, ook na herladen. Na het eindsignaal (1–3) stond nog één gemiste wedstrijd open; opnieuw herladen behield dat aantal.
- Geen fouten of waarschuwingen in de opgevraagde console van de testtab. Tijdelijke viewport hersteld en testtab gesloten. De eigen carrière vervolgens herladen: clubkas, uitslagen, speeldag en selectieomvang bleven behouden; het nieuwe kaartenoverzicht is beschikbaar.

Alle **89 automatische tests** slagen. Nieuw: gele/direct rode/tweede gele kaarten, automatische pauze, ondertal, positie-aanpassingen zonder vervangende speler, exacte speelminuten en keeperminuten, schorsingen door kaartentelling, gemiste wedstrijden, training, transfers en seizoensovergang. Ook starten met tien spelers, afbreken onder zeven, dubbele reglementaire nederlaag, nul wedstrijdbonus voor de verliezer en afwijzen van inconsistente backups zijn afgedekt. Compatibiliteitscontroles vergelijken oude lopende wedstrijden met vooraf berekende 0.7.0-resultaten; de oudere 0.6.0-controles en 52-seizoenentest blijven slagen.

Beperkingen: alleen Chromium met gesimuleerde mobiele afmetingen. Zeldzame situaties zoals een vijfde rode kaart en een dubbele reglementaire nederlaag zijn automatisch getest, niet handmatig in de browser uitgespeeld. Spelregels en kaartfrequenties zijn niet officieel of gekalibreerd; keeperovertredingen, strafschoppen, VAR en acute blessures ontbreken.

# Aanvulling 0.9.0 — onderhandelen over clubtransfers

Een nieuwe PSV-testcarrière gestart op een afzonderlijk lokaal adres (poort 43133), met het gewone startbudget. Desktop 1440 × 900 en mobiel 390 × 844 gecontroleerd. De eigen carrière is niet gebruikt voor biedingen, aankopen of wedstrijdtests.

- Ajax geselecteerd en gefilterd op middenvelders en de naam Klaassen. Precies één speler bleef zichtbaar. Het bodformulier toonde vraagprijs 38.976, salaris 240 per speeldag en contract tot en met seizoen 3.
- Een bod van 10.000 werd afgewezen. De historie toonde de afwijzing en de clubkas bleef 120.000.
- Een nieuw bod van 30.000 leidde tot een tegenbod van 37.028. Na herladen stond dezelfde aanbieding nog open, met ongewijzigde clubkas en een voorspeld saldo van 82.972 na aankoop.
- Op mobiel de aankoop bevestigd en opnieuw herladen. Klaassen stond bij PSV (29 spelers); Ajax had 26 spelers over. De clubkas was 82.972 en de boekhouding bevatte precies één afschrijving van 37.028. Het oude Ajax-rugnummer was verwijderd.
- Een geaccepteerd bod van 25.000 op Mokio ingetrokken zonder betaling. Een volgend bod van 20.000 leverde een tegenbod van 24.444 op. Bij het starten van een wedstrijd verviel dat aanbod; de clubkas bleef 82.972 en transferknoppen werden tijdens het duel geblokkeerd.
- Desktop- en mobiele voorwaarden, knoppen, filters en historie bleven binnen de paginabreedte. Geen horizontale pagina-overloop. Het bodveld krijgt bij openen focus en komt in beeld. Geen fouten of waarschuwingen in de opgevraagde browserconsole.
- De eigen carrière op het oorspronkelijke adres geopend en herladen: clubkas en voortgang bleven gelijk. Alleen het bodformulier bekeken en geannuleerd; er is geen bod ingediend. Het bestaande scoutingrapport bleef beschikbaar naast Clubtransfers. De tijdelijke viewport is hersteld en de testtab gesloten.

Alle **103 automatische tests** slagen. De veertien nieuwe controles dekken onder meer migratie van oudere saves, acceptatie/afwijzing/tegenbod, bewaren en hervatten, eenmalige betaling, salaris en contract, stabiele speleridentiteit, behoud van handmatige opstelling, uitval en historie, budgetcontrole, selectielimieten, intrekken, vervangen, verloop bij aftrap/seizoensovergang/selectie-update, begrensde historie en afwijzen van ongeldige onderhandelingsgegevens. De bestaande 52-seizoenentest blijft slagen.

Beperkingen: lokale singleplayeronderhandelingen met vaste spelregels. Geen echte transfergegevens, online biedingen, eigen tegenstanderbudgetten of fysieke mobiele apparaten getest. De schermcontrole bevestigt de geteste flows; de markt is nog geen volledig gesimuleerde voetbaleconomie.

# Aanvulling 0.10.0 — clubbudgetten en ontvangen biedingen (26 september 2026)

Een nieuwe Ajax-testcarrière via de gewone interface gestart op poort 43134. De hoofdcarrière op poort 3000 is niet gebruikt voor wedstrijden, verkopen of imports. Getest in Chromium op desktop en met mobiele viewport 390 × 844.

- Ajax–FC Twente uitgespeeld tot 2–2. Na het eindsignaal verscheen Transferpost met drie biedingen. De eigen kas was 131.420; elk tegenstanderbudget ging van 120.000 naar 128.000. Vooraf kwam geen bod of betaling binnen.
- Het bod van PSV op Steven Berghuis (110.925) geopend. Het verkoopoverzicht toonde toekomstige kas 242.345, salarissen 11.130 per speeldag, besparing 450 en resterende selectie 26. Annuleren en herladen behielden de drie biedingen, spelers en kas.
- Mobiel de verkoop bevestigd. Na herladen was de eigen kas 242.345; PSV had 17.075 transferbudget en 29 spelers. De eigen boekhouding bevatte één verkoopregel van +110.925 en de PSV-budgetkaart één aankoopregel van −110.925 naast de bijdrage van +8.000.
- Het bod van Feyenoord op Maarten Paes afgewezen zonder transfer of geldbeweging. De historie onderscheidde Verkocht en Afgewezen. De mobiele pagina bleef binnen de breedte (scrollWidth = clientWidth = 375); voorwaarden, knoppen en budgetmutaties waren leesbaar.
- De volgende wedstrijd gestart en gepauzeerd op minuut nul. Het resterende AZ-bod op Oscar Gloukh stond daarna op Verlopen; de inbox was leeg. Er kwam nog geen nieuwe budgetbijdrage of bieding.
- Geen fouten of waarschuwingen in de opgevraagde testconsole. Tijdelijke viewport hersteld, bewijsbeeld opgeslagen en testtab gesloten.
- Hoofdcarrière herladen en de nieuwe lege inbox geopend. Overzicht en tactiekscherm waren inhoudelijk gelijk voor en na herladen; clubkas en bestaande voortgang bleven behouden. Tegenstanders kregen beginbudgetten zonder historische boekingen. De hoofdtab blijft beschikbaar.

Alle **117 automatische tests** slagen. De veertien nieuwe tests controleren onder andere oude saves en lopende wedstrijden, eenmalige budgetbijdragen, reproduceerbare betaalbare biedingen, verkoop na herladen, salaris en selectieherstel, geldbehoud tussen beide clubs, afwijzing, ontoereikend budget, selectielimieten, uitval en historie, verloop en begrensde opslag, ongeldige imports en de nieuwe schermbediening. Bestaande selectielimiettests gebruiken expliciete testbudgetten om de selectiegrens onafhankelijk van de nieuwe budgetgrens te blijven controleren. De 52-seizoenentest blijft slagen.

Beperkingen: vaste lokale biedingsregels en afzonderlijke transferbudgetten. Geen transfers tussen tegenstanders onderling, volledige tegenstanderboekhouding, online markt of fysieke mobiele apparaten getest.

# Aanvulling 0.11.0 — persoonlijke spelerontwikkeling (26 september 2026)

Een nieuwe Ajax-testcarrière via de interface gestart op poort 43135. De bestaande hoofdcarrière is alleen bekeken en herladen; geen trainingen, plannen, wedstrijden of transfers daarin uitgevoerd. Getest in Chromium op desktop en met mobiele viewport 390 × 844.

- Voor Marc ter Stegen een passingdoel van 63 ingesteld vanaf 61. Bewaren wijzigde geen vaardigheid of clubkas. De verwachting was twee individuele sessies of 360 gespeelde minuten.
- Eén individuele training verhoogde passing naar 62 en verlaagde conditie van 78 naar 75. Het overzicht schreef +1 toe aan individuele training; de gedeelde sessie was verbruikt. Herladen behield plan, vaardigheden, historie en sessielimiet.
- Ajax–FC Twente gespeeld, tijdens de rust op minuut 45 herladen en hervat. Het duel eindigde in 2–2. Het eindverslag en plan toonden 90 van 180 minuten, zonder voortijdig vaardigheidspunt. De verwachting was daarna één sessie of 90 extra minuten.
- Mobiel het plan, de voortgangsbalk en verwachting visueel bekeken. De pagina bleef binnen de beschikbare breedte: scrollWidth = clientWidth = 375.
- FC Utrecht–Ajax uitgespeeld tot 3–1. Na de tweede volledige wedstrijd verhoogde de ontwikkeling passing van 62 naar 63. Het eindverslag toonde de 90 gespeelde minuten en het bereikte doel.
- Herladen behield passing 63, de voltooide voortgang en de geblokkeerde knop Train volgens plan. De vaardigheidstabel toonde startwaarde 61 en totale groei +2, gesplitst in individuele training +1 en speelminuten +1. Beide verbeteringen stonden met hun juiste speeldag in de historie.
- Stop plan verwijderde het plan en behield passing 63 en beide historische verbeteringen. Geen fouten of waarschuwingen in de opgevraagde consoles. Bewijsbeeld opgeslagen, tijdelijke viewport hersteld en testtab gesloten.
- De hoofdcarrière vóór en na herladen vergeleken: de inhoud van het voortgangsoverzicht bleef gelijk. De nieuwe pagina is beschikbaar zonder selectie-update of verlies van bestaande voortgang.

Alle **133 automatische tests** slagen. De zestien nieuwe controles dekken onder meer migratie zonder terugwerkende groei, geldige doelen, trainingslimieten, conditie, werkelijk gespeelde minuten, wissels en rode kaarten, pauzeren en hervatten, bereiken en wijzigen van doelen, eenmalige verwerking, behoud van wedstrijdrapporten, transfers, seizoensovergang, begrensde historie, ongeldige backups en schermbediening. Historische uitslagcontroles gebruiken ongewijzigde verwachte resultaten uit 0.6.0 en 0.7.0; ook de bestaande 52-seizoenentest slaagt. Na een laatste tekstaanpassing zijn de veertien UI-tests opnieuw geslaagd.

Beperkingen: expliciet gekozen groeidoelen met vaste spelregels, geen officieel potentieel, leeftijdsmodel of jeugdopleiding. Alleen de beheerde Chromium-browser en gesimuleerde mobiele afmetingen getest. De tests bewijzen de verwerking van de ontwikkelregels, geen realistische of uitgebalanceerde ontwikkeling over een volledige voetbalcarrière.

# Aanvulling 0.12.0 — clubreputatie en sponsorvoorwaarden (26 september 2026)

Getest in een aparte browsercarrière op poort 43136, op desktop en met mobiele viewport 390 × 844. Voor de seizoenscontrole is een Feyenoord-testcarrière met de spelcode gegenereerd en via de gewone importpreview teruggezet. De eigen hoofdcarrière is niet gebruikt voor wedstrijden, imports of sponsorcontracten.

- Een nieuwe Ajax-testcarrière gestart. Reputatie begon op nul; Regionale partner en Landelijke partner waren geblokkeerd. Bekijken gaf geen betaling of reputatie.
- De gegenereerde testcarrière eindigde seizoen 2 op plaats vier met 94 reputatiepunten. Start nieuw seizoen gaf precies +10, totaal 104, niveau Gevestigd. De reeds bestaande seizoensbonus van 90.000 spelcredits bleef afzonderlijk verwerkt; reputatie betaalde zelf geen extra credits.
- Na herladen was Regionale partner beschikbaar en Landelijke partner nog geblokkeerd. Het regionale contract op mobiel afgesloten. De clubkas bleef bij ondertekenen 397.200; het contract werd actief en bleef na herladen bewaard.
- Reputatie, voortgang, sponsorkaarten en knoppen op mobiel visueel bekeken. Geen horizontale pagina-overloop: scrollWidth = clientWidth = 375. De navigatie en brede tabellen scrollen binnen hun eigen blok.
- Voor de nieuwe wedstrijd een inzetbaar elftal toegepast vanwege een bestaande schorsing. Feyenoord–FC Twente op 4× gespeeld, bij rust op 45 minuten en 1–0 herladen en hervat. Na de automatische pauze voor rood op minuut 64 verder gespeeld tot 3–1.
- Het eindverslag toonde precies +12 reputatie, totaal 116. De link naar Reputatie opende dezelfde historie en sloot het verslag ook blijvend na herladen. In Financiën stond precies één sponsorbetaling van 7.500. Herladen behield clubkas 431.775, reputatie en de enkele sponsorboeking.
- Geen fouten of waarschuwingen in de opgevraagde browserconsoles. Bewijsbeeld opgeslagen; viewport hersteld, testtab gesloten en aparte testserver gestopt.
- De hoofdcarrière vóór en na herladen vergeleken: het voortgangsoverzicht bleef inhoudelijk gelijk. De nieuwe reputatiepagina begon daar op nul met een startmoment bij de huidige speeldag. Er is geen persoonlijke save in de repository opgenomen.

Alle **149 automatische tests** slagen, inclusief zestien nieuwe controles voor reputatie en schermbediening. De controles omvatten oudere saves, oude lopende wedstrijden, v2-migratie, gewone en reglementaire uitslagen, herladen, eenmalige verwerking, alle zes eindbonussen, gedeeltelijke seizoenen, sponsorgrenzen en betalingen, bestaande contracten, transfers, selectie-updates, begrensde historie en ongeldige backups. Drie oudere testfixtures die rechtstreeks naar seizoen 3 springen initialiseren nu ook reputatie vanaf dat kunstmatige startmoment. Historische uitslagcontroles behouden dezelfde verwachte resultaten; de 52-seizoenentest blijft slagen.

Beperkingen: vaste lokale voortgangs- en sponsorregels. Reputatie beïnvloedt nog geen supporters, scouting, stadionbezoek of transferbereidheid. Geen fysieke mobiele apparaten, andere browserengines of online ranglijsten getest. De controles bewijzen verwerking van de regels, geen langetermijnbalans van de hele economie.


## Aanvulling 0.13.0 — gericht scouten en vergelijken, 26 september 2026

Gecontroleerd in de ingebouwde Chromium-browser op het bestaande vensterformaat en met een tijdelijke viewport van 390 × 844. Een aparte PSV-testcarrière op poort 43137 is gebruikt voor filters, shortlist, aankopen en een volledige wedstrijd. De eigen carrière op poort 3000 is alleen geopend, herladen en via navigatie bekeken.

- Gratis zoeken naar middenvelders met maximaal 100.000 credits en passing vanaf 65 vond Peer Koopmeiners. Een strengere minimumwaarde gaf nul resultaten zonder uitgaven.
- Bewaren op de shortlist en vergelijken met Paul Wanner en Guus Til lieten de clubkas op 120.000 credits. Herladen behield de shortlist en het zoekprofiel. Bekijk bod opende de juiste AZ-speler zonder een bod te versturen.
- Een betaalde opdracht met een onhaalbare prijsgrens van 1 credit leverde niets op en kostte niets. Daarna gaf een keeperopdracht met prijsgrens 100.000 en reflexen vanaf 55 vier passende spelers, voor één afschrijving van 15.000 credits.
- Aankoop van Adrián Rodríguez kostte 58.000 credits; de shortlist toonde daarna Eigen speler en zijn contract, zonder tweede aankoopknop. Iván Villar bleef als nog niet aangekochte kandidaat staan.
- Na een volledige testwedstrijd en herladen bleef de shortlist met drie namen behouden. Iván Villar was onbeschikbaar doordat het rapport was verlopen; de aangetrokken keeper en de clubkandidaat bleven beschikbaar met bijgewerkte carrièregegevens.
- Mobiele zoekvelden en de keepervergelijking zijn visueel gecontroleerd. Geen horizontale pagina-overloop; brede tabellen en navigatie scrollen binnen hun eigen vak.
- De bestaande Ajax-carrière opent zonder opslagwaarschuwing. De actuele samenvatting bleef bij een tweede herlaadcontrole gelijk. De nieuwe scoutingpagina staat klaar zonder in die carrière filters, shortlist, spelers of credits te wijzigen.
- Geen fouten of waarschuwingen in de opgevraagde browserconsole van beide tabbladen. De tijdelijke viewport is teruggezet.

Alle **166 automatische tests** slagen. De zeventien nieuwe tests dekken onder meer migratie van oude rapporten en lopende wedstrijden, gratis zoekopdrachten, ongeldige criteria, nulresultaten, maximaal vier kandidaten, scoutkorting, één opdracht per speeldag, de shortlistlimiet, vergelijking zonder mutaties, aankopen, verlopen kandidaten, seizoenen, backupvalidatie en schermbediening.

Beperkingen: lokale Chromium-controle en modeltests; geen fysieke Android/iOS-test, online accounts, serverbetalingen of Solana dApp Store-publicatie. De tests bevestigen spelregels en verwerking, geen officiële scoutingkwaliteit of uitgebalanceerde economie.


## Aanvulling 0.14.0 — transfers tussen computerclubs, 26 september 2026

De ingebouwde Chromium-browser is gecontroleerd op het bestaande desktopformaat en op 390 × 844. Transacties en een volledige wedstrijd zijn uitsluitend uitgevoerd in een aparte Ajax-testcarrière op poort 43138.

- Het lege transferjournaal toonde nul transacties en de vijf beginbudgetten van 120.000 credits. Filters en clubnavigatie waren beschikbaar.
- Ajax–FC Twente is volledig gespeeld, met herladen bij rust op 45 minuten en hervatten vanaf dezelfde 1–1. Na het eindsignaal volgde één transfer: Jari De Busser van AZ naar Feyenoord voor 110.990 credits.
- Het journaal en de selectie van Feyenoord toonden dezelfde speler. Feyenoord had daarna 29 spelers en 17.010 credits; AZ 27 spelers en 238.990 credits. De overige clubs hadden elk 128.000 na de bestaande speeldagbijdrage. De som van die vijf budgetten bleef 640.000 credits.
- Het filter PSV gaf geen transacties, Feyenoord wel. Doorklikken op Bekijk selectie opende Feyenoord; zoeken op Jari De Busser vond één speler zonder oud rugnummer.
- Herladen behield exact één journaalregel en dezelfde budgetten. De link vanuit het wedstrijdverslag opende het journaal zonder een tweede afhandeling.
- Desktop en mobiele transferkaart zijn visueel gecontroleerd, inclusief clublogo’s, prijs, filters en selectieknop. Op mobiel was er geen horizontale pagina-overloop. De viewport is daarna hersteld.
- De samenvatting van de bestaande Ajax-carrière op poort 3000 bleef voor en na herladen identiek. Het journaal begint daar leeg vanaf de huidige speeldag; eerdere wedstrijden kregen geen transfers achteraf. Er is in deze carrière geen testwedstrijd, aankoop of verkoop uitgevoerd.
- Geen fouten of waarschuwingen in de opgevraagde browserconsole van de testcarrière.

Alle **181 automatische tests** slagen. Vijftien nieuwe tests controleren migratie, ongewijzigde resultaten en financiën van v0.13-wedstrijden, eenmalige verwerking, behoud van budgettotalen, vaste speleridentiteit, shortlistverwijzingen, reserve- en budgetgrenzen, geen herhaalde verhuizing binnen een seizoen, vijftig bewaarde transacties met volledige totalen over acht seizoenen, ongeldige imports en de bediening van journaal en filters. Bestaande tests zijn aangepast waar ze veronderstelden dat computerclubs hun volledige budget onbesteed hielden; de financiële en selectiegrenzen blijven gecontroleerd. Oudere compatibiliteitsvingerafdrukken blijven gelijk.

Beperkingen: één browserengine en gesimuleerd mobiel formaat. De automatische clubs gebruiken een eenvoudige selectie- en budgetregel; salarissen en volledige langetermijnplanning van computerclubs zijn niet gemodelleerd. Online transacties en Solana zijn niet in deze uitbreiding getest of gebouwd.

## Vervolg: stadion, ticketprijzen en bezoekers (0.15.0, 26 september 2026)

- Getest met een afzonderlijke Ajax-carrière op poort 43139; de gebruikerscarrière op poort 3000 is niet gebruikt voor aankopen, wedstrijden of prijswijzigingen.
- Clubzaken → Stadion: vier prijsopties en rekenregels zichtbaar. Ticketprijs 3 gekozen zonder kosten; stadion van niveau 1 naar 2 uitgebreid voor 36.000 credits. Na herladen bleef de kas 84.000, de capaciteit 7.500 en de prijs 3.
- Verwachting bij aftrap: 35% bezetting, 2.625 bezoekers en 7.875 credits. Prijs- en uitbreidingsknoppen tijdens de wedstrijd geblokkeerd, ook na Opslaan & sluiten.
- Wedstrijd Ajax–FC Twente: rust op 45 minuten met 1–1; herladen behoudt de gepauzeerde wedstrijd. Daarna eindstand 2–2. Eindverslag toont 2.625 bezoekers en precies 7.875 credits; netto speeldagresultaat 12.795, clubkas 96.795.
- Na sluiten van het verslag toont Stadion één thuisduel met dezelfde aantallen. Na opnieuw herladen zijn schermwaarden en totalen identiek. De volgende uitwedstrijd toont nul ticketinkomsten.
- Mobiel 390 × 844 gecontroleerd. Ticketknoppen verkleind en tekstomloop verbeterd; alle vier prijskaarten hebben scrollWidth gelijk aan clientWidth (140 px). Pagina blijft binnen het scherm; bezoekershistorie scrolt binnen de tabel.
- `npm.cmd test`: 194 tests slagen. Nieuwe controles omvatten lege migratie zonder kaswijziging, oude v0.14-wedstrijden met exact dezelfde gehele carrière, prijzen en reputatie/formulegrenzen, bevroren aftrapafspraken, geen dubbele inkomsten, uitwedstrijden, reglementaire uitslagen, vijf seizoenen bezoekershistorie, ongeldige imports en schermbediening.
- Echte mobiele apparaten en andere browsers zijn niet getest. Capaciteiten, ticketprijzen en bezoekers blijven fictieve spelwaarden. Er zijn geen accounts of echte betalingen toegevoegd.
- Gebruikerscarrière opnieuw geopend op poort 3000: Ajax, seizoen 1, 8 gespeelde wedstrijden, 27 spelers en 101.446 credits behouden. Bestaand stadionniveau 2 geeft 7.500 spelplaatsen; de bezoekersmeting begint na speeldag 8. Alleen navigatie uitgevoerd.

## Vervolg: postvak voor de manager (0.16.0, 26 september 2026)

- Een aparte Ajax-testcarrière op poort 43140 gebruikt. De hoofdcarrière op poort 3000 is alleen herladen en via navigatie bekeken; geen leesmarkeringen of spelacties uitgevoerd.
- Nieuwe carrière toont één sponsormelding. Als gelezen markeren verwijdert de menuteller; filter Ongelezen geeft een lege toestand en een geblokkeerde bulkknop. Herladen behoudt de leesstatus en 120.000 credits.
- Opnieuw ongelezen markeren en Bekijk sponsors opent de sponsoropties zonder contract af te sluiten. Een wedstrijd gestart en op minuut nul opgeslagen en gesloten. De postvakknop opent dezelfde gepauzeerde wedstrijd op 0–0; pas Aftrap laat de klok lopen.
- Ajax–FC Twente op 4× gespeeld: rust op 45 minuten met 1–1, herladen en hervatten, eindstand 2–2. Clubkas na de bestaande afrekening 131.420 credits. De wedstrijdmelding verdwijnt; drie actuele transferbiedingen verschijnen.
- Filter Transfers en Markeer deze als gelezen markeert precies drie biedingen. De sponsormelding blijft ongelezen. Herladen behoudt één ongelezen van vier. Een transferbericht opent Ontvangen biedingen met dezelfde drie nog te beoordelen aanbiedingen en dezelfde clubkas, zonder verkoop.
- Desktop en mobiel 390 × 844 visueel gecontroleerd. Op mobiel één kolom, knoppen onder elkaar en tekst binnen de kaarten. Pagina scrollWidth = clientWidth = 375; kaartbreedtes beide 341. Op desktop geen pagina-overloop. Mobiel een afzonderlijke gelezen transfer opnieuw ongelezen gemaakt. De viewport is daarna hersteld.
- Geen fouten of waarschuwingen in de opgevraagde consoles van de testtab en hoofdtab. Tijdelijke testtab gesloten; bewijsbeeld van het hoofdpostvak opgeslagen.
- De tekst van het voortgangsscherm vóór en na herladen is exact gelijk: Ajax, seizoen 1, 9/10 wedstrijden, 27 spelers en 84.666 credits. Het postvak toont de bestaande twee biedingen en een schorsing, zonder de carrière te wijzigen.

Alle **208 automatische tests** slagen. Veertien nieuwe controles dekken savebehoud en oude lopende wedstrijden, actuele groepen en urgentie, gewijzigde of verdwenen berichten, contracten, transferstatus, geen betalingen door lezen, wedstrijdpauze, filters, bulkmarkering, backups, limieten, ongeldige sleutels, HTML-escaping en schermroutes. De historische carrièrevingerafdruktest negeert alleen het nieuwe lege inboxveld; bestaande spelresultaten blijven gelijk.

Beperkingen: één browserengine en een gesimuleerd mobiel formaat. Het postvak toont lokale actuele zaken, geen historisch nieuwsarchief of pushmeldingen. Online accounts, e-mail, wallet en packs zijn niet toegevoegd of getest.

## Vervolg: lichte wedstrijdblessures (0.17.0, 26 september 2026)

- Getest met een nieuwe PSV-carrière op poort 43141. De eigen Ajax-carrière is alleen herladen en via navigatie bekeken.
- PSV–FC Twente op 4× gestart. De wedstrijd pauzeerde automatisch op minuut 27, stand 1–1, bij een lichte tik van Mauro Júnior. Medische melding, tijdlijn en wissellijst toonden dezelfde speler; zijn effectieve conditie was 69%. Herladen behield de minuut, stand en pauze.
- De medische melding staat direct onder de score. Desktop en mobiel 390 × 844 gecontroleerd. Op mobiel bleef de melding binnen het scherm: panelbreedte en scrollWidth beide 287 px; pagina en viewport beide 375 px. De tijdelijke viewport is hersteld.
- Kies wissel selecteerde Mauro Júnior en focuste Speler in zonder de wedstrijd of clubkas te veranderen. Ryan Flamingo gekozen en pas met Wissel bevestigd. Na herladen bleven minuut 27, één gebruikte wissel en de tekst van het veld behouden.
- Bij rust stond het 1–1 op minuut 45. In minuut 53 ontstond een tweede lichte tik, nu bij invaller Ryan Flamingo. De automatische pauze werkte opnieuw. Daarna zonder nieuwe wissel hervat; Ryan speelde door met lagere effectieve conditie.
- Eindstand 2–2. Het verslag toonde beide blessuremomenten en voor beide spelers één gemiste speeldag. De clubkas was 131.705 credits; na herladen bleef dat bedrag gelijk. Het postvak toonde de groep met twee geblesseerden.
- Geen fouten of waarschuwingen in de opgevraagde browserconsoles. Testtab gesloten en aparte testserver gestopt. Een bewijsbeeld van de medische pauze is opgeslagen.
- Het voortgangsoverzicht van de hoofdcarrière was vóór en na herladen exact gelijk: Ajax, seizoen 1, 9/10 wedstrijden, 27 spelers en 84.666 credits. Geen wedstrijd, wissel, training of aankoop in die carrière uitgevoerd.

Alle **219 automatische tests** slagen. Elf nieuwe tests dekken exacte v0.16-carrièrevingerafdrukken, deterministische pauze en herladen, normale en automatische wissels, juiste speelminuten, doorspelen na drie wissels, tijdelijke conditieaftrek, tegenstanderblessures, selectiegrenzen, eenmalige afhandeling, herstel na de volgende speeldag, ongeldige importgegevens, HTML-escaping en schermbediening. Oudere compatibiliteitsfixtures laten de nieuwe aftrapvlag weg en houden hun oorspronkelijke verwachte hashes. De bestaande UI-test verwerkt nu ook de extra medische pauze.

Beperkingen: alleen lichte tikken kunnen tijdens de livewedstrijd optreden. De computertegenstander speelt daarmee door; zware blessures met gedwongen uitval en gerichte blessurewissels door computerclubs ontbreken nog. De vier overige clubs verwerken blessures na afloop. Geen fysieke mobiele apparaten of andere browserengines getest. Het zijn spelregels, geen medische gegevens over echte spelers.
