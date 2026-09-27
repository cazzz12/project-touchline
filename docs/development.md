# Spelerontwikkeling — 0.11.0

Dit systeem voegt persoonlijke groeidoelen en een ontwikkelhistorie toe aan de bestaande training. Het werkt met huidige spelwaarden. Leeftijd of werkelijk talent wordt niet geschat. Een doelwaarde is een keuze van de manager, geen vaste voorspelling of officieel potentieel van de echte speler.

## Bediening

1. Open **Training → Spelerontwikkeling**, of **Bekijk ontwikkeling** in het spelersprofiel van je eigen speler.
2. Kies een speler en trainingsfocus. Keepers hebben naast de zeven algemene vaardigheden ook reflexen, balvastheid en positionering.
3. Kies een doel dat hoger is dan de huidige vaardigheid, tot maximaal 99. **Bewaar trainingsplan** legt alleen het doel vast. Ook een geblesseerde speler mag een doel krijgen; hij kan niet trainen zolang de blessure duurt.
4. **Train volgens plan** gebruikt de gewone individuele sessie: maximaal trainingscomplexniveau plus coachniveau aan punten en −3 conditie. Spelertraining, keepertraining en trainen volgens plan delen samen één sessie per speeldag. Teamtraining blijft afzonderlijk beschikbaar.

Bewaren, wijzigen en stoppen kan alleen buiten een lopende wedstrijd. Hetzelfde focusdoel verhogen behoudt opgespaarde minuten. Een andere vaardigheid kiezen of het plan stoppen wist alleen de minuten naar het volgende punt; eerder verdiende vaardigheden en de historie blijven behouden. Na bereiken van het doel stopt ervaringsgroei totdat een nieuw doel wordt gekozen. De bestaande losse trainingen kunnen nog wel verder ontwikkelen tot 99.

## Groei door wedstrijden

Een actief plan geeft één vaardigheidspunt per 180 werkelijk gespeelde minuten. De minuten worden pas bij het afronden van een speeldag verwerkt. Wie dertig minuten speelt, krijgt dertig minuten bij zijn plan. Een bankzitter zonder invalbeurt krijgt niets; bij rood stopt de teller op het moment van wegsturen. Bij een afgebroken of reglementaire wedstrijd tellen uitsluitend de werkelijk gespeelde minuten, dus bij nul gespeelde minuten geen groei.

De resterende minuten blijven staan tot een volgende wedstrijd. Bij het bereiken van het doel vervallen de restminuten. Dit voorkomt dat je op een voltooid doel onzichtbaar onbeperkt ervaring opspaart. Groei stopt bij de doelwaarde en bij 99. Bestaande hogere waarden worden niet verlaagd. Staf en faciliteiten vergroten de individuele trainingsopbrengst, niet de opbrengst per 180 speelminuten.

De afrekening gebeurt nadat alle wedstrijden zijn gesimuleerd. De verbeterde waarde beïnvloedt de volgende wedstrijd. Het afgelopen wedstrijdverslag behoudt zijn waarden van vóór deze verbetering. Een dubbele afronding of herladen geeft geen extra punten. Het eindverslag toont de voortgang van deelnemende spelers met een actief, nog niet voltooid plan.

De groeiverwachting rekent met de huidige staf: benodigde sessies = resterende punten gedeeld door de sessieopbrengst, naar boven afgerond. Benodigde minuten = benodigde hele vaardigheidspunten × 180 minus de al opgespaarde minuten. Dit zijn alternatieve routes; een combinatie kan sneller zijn. Beschikbaarheid, conditie en gekozen opstelling bepalen of die speeltijd werkelijk wordt gehaald.

## Historie en transfers

Per speler worden de beginwaarden bij activering, totalen per bron (teamtraining, individuele training, wedstrijden) en de laatste zestien daadwerkelijke verbeteringen bewaard. Geen verbetering betekent geen nieuwe historieregel. Conditieherstel is geen vaardigheidsgroei en verschijnt hier niet. Het totaal blijft bewaard wanneer oudere detailregels uit de begrensde historie verdwijnen.

Een transfer behoudt de ID, spelwaarden, beginwaarden en ontwikkelhistorie van de speler. Bij verkoop stopt het persoonlijke plan, inclusief de nog niet verzilverde minuten. Koop je dezelfde speler later terug, dan blijft zijn historie beschikbaar. Een nieuwe aanwinst zonder eerdere historie krijgt zijn huidige vaardigheden als beginwaarden. Seizoensovergangen behouden plannen, historie en deelminuten.

## Savebehoud

De opslagsleutel en saveversie blijven gelijk. Oudere carrières krijgen lege plannen en beginwaarden op basis van de bestaande spelers. Eerdere trainingen, geldstromen, selecties, tactieken en wedstrijdresultaten worden niet gewijzigd. Reeds gebruikte trainingssessies blijven gebruikt. Een al lopende oudere wedstrijd bouwt geen nieuwe ervaringsminuten op; de nieuwe regels beginnen bij de volgende aftrap.

De expliciete keuze **Selecties bijwerken** vervangt ook de spelerwaarden. Daarom begint de ontwikkelregistratie voor die vervangen selectie opnieuw. De vorige carrière blijft als herstelkopie beschikbaar. Gewoon herladen, exporteren of importeren vervangt geen ontwikkeling.

Imports controleren onder andere vaardigheidsnamen, doelwaarden, deelminuten, historie, bron, beginwaarden en de werkelijk gespeelde minuten in het laatste ontwikkelverslag. Ongeldige gegevens vervangen geen bestaande carrière.

## Grenzen

Dit is een lokaal ontwikkelmodel voor spelers van de manager. Tegenstanders voeren geen automatische trainingsplannen uit. Leeftijdsafhankelijke groei, vaste potentieelplafonds, karaktertrekken en nieuwe rollen zijn nog niet uitgewerkt. Er worden geen fictieve jeugdspelers toegevoegd.
