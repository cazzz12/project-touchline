# Fitheid en inzetbaarheid — 0.6.0

Deze regels simuleren uitsluitend gebeurtenissen binnen de eigen Touchline-carrière. Blessures, conditie en herstel beschrijven niet de werkelijke gezondheid van de genoemde spelers.

## Selectievoorstel

Onder Selectie staat het aantal inzetbare spelers en een overzicht van spelblessures. De knop **Stel fit elftal voor** doet een voorstel, zonder de opgeslagen opstelling te wijzigen. Het voorstel bevat de basiself, zeven bankspelers en de aanvoerder. **Annuleren** behoudt de handmatige selectie; **Pas voorstel toe** slaat het voorstel op.

Het advies weegt gegenereerde kwaliteit, positiefit en conditie. Het kiest een keeper in doel en één reservekeeper, plus zes veldspelers zolang die beschikbaar zijn. Een bestaande aanvoerder blijft aanvoerder als hij in het voorgestelde elftal staat. Een voorstel garandeert geen overwinning. Contractverloop blijft een afzonderlijke controle bij de aftrap.

Een speler met een actieve spelblessure mag niet in de wedstrijdselectie staan. De app wijst op de betreffende spelers en vraagt de manager om ze te vervangen. Er wordt geen handmatige opstelling stilzwijgend vervangen. Je kunt geen voorstel toepassen tijdens een lopende wedstrijd. Tegenstanders stellen automatisch inzetbare spelers op.

## Blessures

Na het eindsignaal kan een gebruikte speler een spelblessure krijgen. Er vallen tijdens de lopende wedstrijd nog geen spelers door blessures uit. Ongebruikte reserves kunnen geen nieuwe blessure krijgen. Het risico stijgt bij een lage beginconditie en meer gespeelde minuten. De uitkomst is reproduceerbaar: herladen verandert of geneest de blessure niet.

| Gebeurtenis in het spel | Uitval op medisch niveau 1 |
| --- | --- |
| Lichte tik | 1 speeldag |
| Spierklachten | 2 speeldagen |
| Enkelklachten | 3 speeldagen |

De speler mist de volgende één tot drie speeldagen. Na elke werkelijk afgeronde speeldag gaat er één af. Een nieuwe blessure wordt niet meteen op dezelfde speeldag ingekort. Conditieherstel en hersteltraining wissen de blessure niet. Geblesseerden slaan vaardigheids- en fysieke teamtraining over en kunnen niet individueel trainen.

Alle zes clubs gebruiken deze regels. Om de kleine minicompetitie speelbaar te houden ontstaan geen blessures die een club onder 18 inzetbare spelers of twee inzetbare keepers brengen. Een verkoop van een fitte speler mag dezelfde grens niet doorbreken. Een geblesseerde speler kan worden verkocht; zijn resterende hersteltijd volgt zijn vaste ID naar de nieuwe club. Dit prototype heeft nog geen lange blessures, schorsingen of medische stafspecialisten.

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

Lopende wedstrijden uit een oudere versie behouden hun gespeelde minuten, selectie, verwachte tegenstander en oude conditieafrekening. Alleen nieuw gestarte wedstrijden gebruiken de nieuwe regels. Backups behouden resterende hersteltijd; ongeldige medische gegevens worden afgewezen voordat de huidige carrière wordt vervangen.
