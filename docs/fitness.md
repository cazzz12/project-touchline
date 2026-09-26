# Fitheid en inzetbaarheid — bijgewerkt voor 0.17.0

Deze regels simuleren uitsluitend gebeurtenissen binnen de eigen Touchline-carrière. Blessures, conditie en herstel beschrijven niet de werkelijke gezondheid van de genoemde spelers.

## Selectievoorstel

Onder Selectie staat het aantal inzetbare spelers en een overzicht van spelblessures. De knop **Stel fit elftal voor** doet een voorstel, zonder de opgeslagen opstelling te wijzigen. Het voorstel bevat maximaal elf starters, zeven bankspelers en de aanvoerder; blessures en schorsingen worden overgeslagen. Bij onvoldoende inzetbare spelers blijven plaatsen leeg. **Annuleren** behoudt de handmatige selectie; **Pas voorstel toe** slaat het voorstel op.

Het advies weegt gegenereerde kwaliteit, positiefit en conditie. Het kiest een keeper in doel en één reservekeeper, plus zes veldspelers zolang die beschikbaar zijn. Een bestaande aanvoerder blijft aanvoerder als hij in het voorgestelde elftal staat. Een voorstel garandeert geen overwinning. Contractverloop blijft een afzonderlijke controle bij de aftrap.

Een speler met een actieve spelblessure mag niet in de wedstrijdselectie staan. De app wijst op de betreffende spelers en vraagt de manager om ze te vervangen. Er wordt geen handmatige opstelling stilzwijgend vervangen. Je kunt geen voorstel toepassen tijdens een lopende wedstrijd. Tegenstanders stellen automatisch inzetbare spelers op.

## Blessures

In nieuw gestarte wedstrijden kunnen eigen spelers én de tegenstander een **lichte tik** krijgen tussen minuut 1 en 89. Alleen spelers die op dat moment op het veld staan doen mee aan die kans. Een gewisselde of al weggestuurde speler krijgt geen latere wedstrijdblessure. Maximaal twee spelers per club krijgen zo'n tik per wedstrijd; dezelfde speler hoogstens één keer.

Bij een eigen tik pauzeert de klok automatisch. **Kies wissel** selecteert de getroffen speler en focust de reservekeuze, zonder een spelactie uit te voeren. Met **Wissel** bevestig je een gewone wissel. **Hervatten** laat de speler doorspelen. De lichte tik verlaagt de effectieve conditie voor de volgende wedstrijdminuten met 15 punten, met een bodem van 10%. Het wijzigt geen basisvaardigheden. Heb je drie wissels gebruikt of geen reserve meer, dan blijft doorspelen mogelijk. Een tik veroorzaakt geen lege veldplaats of reglementair verlies.

De tegenstander speelt in deze eerste versie door met dezelfde conditieaftrek. Automatische blessurewissels voor computerclubs en zware blessures met gedwongen uitval ontbreken nog. Het bestaande automatisch wisselen van vermoeide eigen spelers kan, indien aangezet, na hervatten reageren op de lagere conditie.

Na afloop krijgt een speler met zo'n tik één speeldag herstel, ook wanneer hij is gewisseld. Dit wordt pas verwerkt bij de gewone wedstrijdafrekening; tijdens de wedstrijd bewaart het verslag de gebeurtenis. Een tik wordt niet nogmaals door de controle na afloop toegewezen. Herladen geeft geen nieuwe worp en herstelt geen blessure.

Na het eindsignaal kunnen andere gebruikte spelers nog een spelblessure krijgen. Ongebruikte reserves kunnen geen nieuwe blessure krijgen. Het risico stijgt bij een lage beginconditie en meer gespeelde minuten. De vier clubs buiten de livewedstrijd houden hun bestaande afhandeling na het eindsignaal.

Voor de livewedstrijd is de kans per speler per gespeelde minuut de bestaande risicofunctie voor 90 minuten, gedeeld door 180. De gewone nacontrole krijgt voor beide clubs een halve kans, zodat wedstrijdmeldingen niet simpelweg boven op de volledige oude kans komen. Door grenzen en onafhankelijke worpen is dit geen exact gelijke totale kans. Het medische niveau verlaagt beide kansen. De blessureworp gebruikt een aparte vaste seed en verbruikt geen toeval uit de berekening van schoten of kaarten.

| Gebeurtenis in het spel | Uitval op medisch niveau 1 |
| --- | --- |
| Lichte tik | 1 speeldag |
| Spierklachten | 2 speeldagen |
| Enkelklachten | 3 speeldagen |

Een na afloop vastgestelde blessure duurt één tot drie speeldagen. Een lichte tik uit de livewedstrijd duurt altijd één speeldag. Na elke werkelijk afgeronde speeldag gaat er één af. Een nieuwe blessure wordt niet meteen op dezelfde speeldag ingekort. Conditieherstel en hersteltraining wissen de blessure niet. Geblesseerden slaan vaardigheids- en fysieke teamtraining over en kunnen niet individueel trainen.

Alle zes clubs gebruiken herstel en de blessuregrenzen. Om de kleine minicompetitie speelbaar te houden ontstaan geen nieuwe blessures die een club onder 18 inzetbare spelers of twee inzetbare keepers brengen. Een verkoop van een inzetbare speler mag dezelfde grens niet doorbreken. Schorsingen kunnen de beschikbare selectie wel onder die grens brengen; dan geldt de regeling voor [ondertal](discipline.md). Een geblesseerde speler kan worden verkocht; zijn resterende hersteltijd volgt zijn vaste ID naar de nieuwe club. Lange blessures en medische stafspecialisten ontbreken nog.

## Herstelcentrum

De bestaande faciliteit beïnvloedt nu drie onderdelen:

- 12% minder blessurerisico per niveau boven 1, tot 48% op niveau 5.
- Twee extra conditiepunten bij de rust tussen speeldagen per niveau boven 1.
- Nieuwe blessures duren op niveau 3–4 één speeldag korter en op niveau 5 twee korter, met minimaal één gemiste speeldag. Een upgrade kort een al vastgestelde blessure niet achteraf in.

Tegenstanders gebruiken medisch niveau 1. De bestaande bouwprijzen en onderhoudskosten veranderen niet.

## Conditie en seizoensrust

De conditiedaling tijdens de wedstrijd blijft gebaseerd op werkelijke speelminuten en uithoudingsvermogen. Daarna verwerkt het spel de rust tussen twee speeldagen: gebruikte spelers herstellen 12 conditiepunten, ongebruikte spelers 18, plus de bonus van het herstelcentrum. Dit geldt één keer per afgeronde speeldag, voor alle clubs. De conditie blijft maximaal 100.

Bij het starten van een volgend seizoen krijgen alle spelers 100% conditie en verdwijnen de resterende korte blessures door de seizoensrust. Spelersidentiteit, ratings, contracten en carrièrestatistieken blijven behouden.

## Compatibiliteit

Het bestaande saveformaat en de opslagsleutel blijven behouden. Een aanvullend medisch gegevensblok wordt alleen ingevuld als het ontbreekt. Oudere saves krijgen geen blessures en geen conditieherstel achteraf. Opstarten schrijft niet naar browseropslag.

Lopende wedstrijden uit een oudere versie behouden hun gespeelde minuten, selectie, verwachte tegenstander en oude conditieafrekening. Alleen nieuw gestarte wedstrijden gebruiken de nieuwe regels. De vlag `injuryRules: 1` wordt bij aftrap bewaard, nooit achteraf aan een lopende wedstrijd toegevoegd. Backups controleren onder andere speleridentiteit, gespeelde minuten, zijde, uniek blessuremoment, maximale aantallen en de vaste duur van de lichte tik. Backups behouden resterende hersteltijd; ongeldige medische gegevens worden afgewezen voordat de huidige carrière wordt vervangen.
