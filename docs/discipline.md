# Kaarten, ondertal en schorsingen — 0.8.0

Dit zijn eigen spelregels voor de fictieve minicompetitie van tien speeldagen. Ze beschrijven geen officiële competitieregels of werkelijk gedrag van de genoemde spelers.

## Tijdens de wedstrijd

Een overtreding kan zonder kaart blijven, geel opleveren of direct rood geven. Een tweede gele kaart in hetzelfde duel betekent rood. Meer pressing verhoogt het risico op overtredingen en kaarten. Beide ploegen en alle zes clubs gebruiken dezelfde regels.

Bij rood pauzeert de eigen livewedstrijd automatisch. De speler verlaat zijn positie; er verschijnt een lege plek op het veld. Een weggestuurde speler kan niet worden vervangen en telt niet meer mee bij balbezit, passing en kanscreatie. Zijn conditie en carrièreminuten tellen alleen tot zijn vertrek. Als de aanvoerder wordt weggestuurd, gaat de band naar een overgebleven speler.

Tijdens een pauze kun je onder **Spelers op het veld** twee posities verwisselen of een veldspeler naar een lege positie schuiven. Dit kost geen wissel. De keeperpositie mag niet leeg worden gemaakt. Gewone wissels blijven mogelijk tussen een speler op het veld en een beschikbare bankspeler, binnen het maximum van drie. Een wissel vult geen rode-kaartplek op. Posities, kaarten en speelminuten blijven na herladen behouden.

## Volgende speeldagen

| Gebeurtenis | Straf vanaf de volgende speeldag |
| --- | --- |
| Drie losse gele kaarten in één seizoen | Eén gemiste wedstrijd |
| Twee gele kaarten in hetzelfde duel | Eén gemiste wedstrijd |
| Direct rood | Twee gemiste wedstrijden |

Een duel met rood telt voor die speler niet ook mee als losse gele kaart. Eerdere losse gele kaarten blijven wel staan. Na een schorsing door drie losse gele kaarten begint die teller weer op nul. De carrièrecijfers tonen alle ontvangen kaarten; een tweede gele kaart telt daar als twee keer geel en één keer rood voor dat duel.

**Selectie** en **Voorbeschouwing** tonen de resterende schorsingen en wie met twee losse gele kaarten op scherp staat. Spelersprofielen tonen de eigen kaartenteller en carrièrekaarten. Een geschorste speler mag niet in de basis of op de bank staan. Het selectievoorstel slaat hem over; hij mag wel trainen. Een straf wordt pas na het afronden van een speeldag één wedstrijd korter, nooit bij laden, rust of alleen starten. Nieuwe straffen worden niet meteen ingekort.

Schorsingen volgen de vaste speler-ID bij een transfer. Bij een nieuw seizoen vervallen losse gele kaarten, maar resterende schorsingen blijven staan.

## Te weinig inzetbare spelers

Met zeven tot tien inzetbare spelers kun je na het toepassen van het selectievoorstel met een onvolledige ploeg starten. Er worden geen spelers verzonnen. Er moet een speler in doel staan; het spel geeft waar mogelijk de voorkeur aan een keeper. Ook een kleinere wisselbank is toegestaan.

Onder zeven spelers wordt een wedstrijd niet gespeeld of direct beëindigd. De betreffende club verliest reglementair met 0–3; als de tegenstander al meer dan drie goals heeft, blijft dat grotere aantal staan. Als beide clubs vooraf te weinig spelers hebben, krijgen beide nul punten bij een geregistreerde 0–0. Het verslag onderscheidt deze beslissing van werkelijk gemaakte goals. Er worden geen doelpunten of minuten voor spelers verzonnen.

Een reglementair verliezende eigen club ontvangt geen wedstrijdbonus. De normale inkomsten en kosten van de speeldag worden wel verwerkt. Bestaande schorsingen en blessures tellen deze afgeronde speeldag mee, zodat een club niet vastloopt. Tegenstanders stellen beschikbare spelers op; na rood behouden ze hun lege positie zonder aanvullende tactische herschikking.

## Opslag en modelgrenzen

De bestaande save-sleutel en saveversie blijven behouden. Ontbrekende kaartengegevens beginnen leeg, zonder oude uitslagen te herschrijven. Een lopende wedstrijd uit 0.7.0 of eerder behoudt zijn oorspronkelijke regels tot het eindsignaal. Nieuw gestarte wedstrijden gebruiken het kaartenmodel. Import controleert onder meer kaartentotalen, weggestuurde spelers, bezette posities, schorsingen en werkelijk gespeelde minuten.

Kaarten gebruiken een aparte reproduceerbare toevalsreeks. Het model is nog niet gekalibreerd op echte wedstrijden. Overtredingen worden momenteel aan veldspelers toegewezen; keeperovertredingen, strafschoppen, VAR en acute blessures tijdens het duel ontbreken. De tests controleren de verwerking van deze spelregels, niet een officiële sportvoorspelling.
