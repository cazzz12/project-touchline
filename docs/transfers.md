# Clubtransfers — 0.10.0

Dit systeem simuleert onderhandelingen binnen de lokale minicompetitie. Vraagprijzen, salarissen en reacties zijn spelwaarden, geen werkelijke transfergegevens. Er worden geen biedingen naar echte clubs gestuurd.

## Een speler kopen

1. Open **Scouting & transfers → Clubtransfers**. Kies een club, positie en eventueel een naam; klik **Toon spelers**.
2. Kies **Bieden op …**. Het formulier toont vraagprijs, conditie of uitval, salaris en contractduur. Annuleren verandert niets.
3. Dien een bod in binnen je huidige budget. De club reageert direct. Je betaalt nog niets en er worden geen credits gereserveerd.
4. Bij acceptatie of een tegenbod zie je het te betalen bedrag, het salaris per speeldag en je clubkas na aankoop. **Bevestig aankoop** voert de transfer één keer uit; **Intrekken** sluit het aanbod zonder kosten.

De speler staat daarna bij jouw club. Zijn ID, spelwaarden, conditie, moraal, keepervaardigheden, blessures, schorsingen en carrièrestatistieken blijven behouden. Het oude rugnummer vervalt. Je handmatige basiself, bank en aanvoerder blijven staan; kies zelf waar de aanwinst gaat spelen. De betaling staat in Clubzaken bij de geldstromen en het nieuwe contract bij de contracten.

## Prijs en reactie

De bestaande transferwaarde is `(rating − 40)² × 145`. Een speler uit de geadviseerde basis van de verkopende club heeft een vraagprijs van 125% van die waarde; een reserve 105%, afgerond op hele credits en met een minimum van 1.000. Het advies houdt rekening met conditie en inzetbaarheid. Dit bepaalt de vraagprijs voor een nieuw bod.

| Bod ten opzichte van de vraagprijs | Reactie |
| --- | --- |
| Minder dan 65% | Afgewezen |
| Vanaf 65%, onder 90% | Tegenbod van 95% van de vraagprijs, naar boven afgerond |
| Vanaf 90% | Het ingediende bedrag wordt geaccepteerd |

Een hoger bod dan de vraagprijs wordt dus niet automatisch verlaagd. Een nieuw bod op dezelfde speler vervangt zijn eerdere open aanbod. De reacties zijn reproduceerbaar; herladen geeft geen nieuwe kans op een goedkoper antwoord. Een overeengekomen bedrag blijft staan tot het aanbod sluit.

Het salaris is `max(100, (rating − 40) × 15)` credits per speeldag; het contract loopt tot en met het huidige seizoen plus twee. Salarissen worden zoals gebruikelijk na een speeldag betaald. Er is geen afzonderlijke tekenbonus of onderhandeling over het spelerscontract.

## Grenzen en geldigheid

- Maximaal vijf open aanbiedingen tegelijk. De opslag bevat maximaal 25 recente onderhandelingen; het scherm toont daarnaast maximaal twintig gesloten onderhandelingen.
- De verkopende club moet minimaal achttien spelers en twee keepers overhouden. Verkoop van een fitte/inzetbare speler mag de grens van achttien fitte/inzetbare spelers en twee beschikbare keepers niet doorbreken. Een geblesseerde of geschorste speler kan wel verhuizen wanneer die controles het toelaten.
- De kopende selectie bevat maximaal 55 spelers. Zowel het bod als de uiteindelijke aankoop controleert het beschikbare budget.
- Beginnen aan een wedstrijd sluit open aanbiedingen, ook wanneer de klok nog op nul staat. Een geblokkeerde aftrap sluit ze niet. Tijdens een wedstrijd kun je geen biedingen indienen, aankopen doen of aanbiedingen intrekken.
- Ook een nieuw seizoen en de expliciete selectie-update sluiten open aanbiedingen. Afgesloten onderhandelingen blijven als korte historie staan.
- Bevestigen controleert opnieuw eigenaarschap, inzetbaarheid bij de verkoper, selectieomvang en credits. Als een andere aankoop of uitgave de ruimte heeft verkleind, gaat deze aankoop niet door. Een herhaalde bevestiging betaalt niet opnieuw.

De bestaande scoutingpool en directe verkoop via Clubzaken blijven beschikbaar. Een bevestigde aankoop van een andere club verhoogt ook het transferbudget van die verkoper. Een directe verkoop via Clubzaken kost de koper 65% van de spelwaarde; zonder voldoende budget is die koper niet beschikbaar. Leningen, veilingen, clausules, transfers tussen tegenstanders onderling en online managers zijn latere uitbreidingen.

## Ontvangen biedingen

Na iedere volledig afgehandelde speeldag bekijken de vijf tegenstanders jouw spelers. Er komen maximaal drie biedingen: maximaal één per koper en één per speler. Open **Ontvangen biedingen** via Scouting & transfers of de melding op Overzicht.

- **Bekijk verkoop** toont de prijs, jouw kas en totale salarissen na verkoop, het resterende aantal spelers en of de speler in je basis, op je bank of aanvoerder is. Bekijken en annuleren veranderen geen spelgegevens.
- **Wijs bod af** houdt je speler en credits bij jouw club. Het gesloten bod blijft in de historie.
- **Bevestig verkoop** controleert de voorwaarden opnieuw. De koper betaalt het vaste bedrag, jij ontvangt datzelfde bedrag en het spelerscontract bij jouw club vervalt. De speler verhuist met zijn ID en historie; zijn oude rugnummer vervalt. Je opstelling, bank en aanvoerder worden opnieuw gecontroleerd, zoals bij directe verkoop. Bekijk je selectie daarna.
- Het bod blijft na herladen en export/import gelijk. Het vervalt bij de volgende succesvolle aftrap (ook op minuut nul), een nieuw seizoen of expliciete selectie-update. Een geblokkeerde aftrap laat het staan. Tijdens wedstrijden zijn verkoop en afwijzen geblokkeerd.
- Verkoop via een andere route sluit het ontvangen bod op die speler. Herhaald bevestigen geeft nooit nogmaals geld of een speler.

Clubs zoeken extra diepte bij minder dan drie keepers, acht verdedigers, zeven middenvelders of vijf aanvallers. Bij voldoende bezetting moet de speler minstens één ratingpunt boven het gemiddelde voor zijn brede positie liggen. Kandidaten worden beoordeeld op dat verschil, met twintig extra punten voor een onderbezette positie; lagere prijs en speler-ID breken gelijke scores. De eerste club die mag kiezen rouleert per speeldag. Geblesseerde en geschorste spelers krijgen geen nieuw bod; een eerder geboden speler kan later wel verhuizen met zijn uitval, mits je selectie voldoende vervangers houdt.

Een ontvangen bod is 85% van de spelwaarde op dat moment, naar beneden afgerond, met een waardebasis van minimaal 1.000 credits. Alleen betaalbare spelers komen in aanmerking. Een lager bod terugsturen of een persoonlijk contract uitonderhandelen is nog niet mogelijk. De gekozen belangstelling staat vast; herladen of het scherm opnieuw openen trekt geen andere biedingen. Dit gebruikt lokale spelregels, geen externe AI-dienst.

## Transferbudgetten

Iedere tegenstander begint bij activering van dit systeem met 120.000 credits. Na elke daarna afgeronde speeldag komt 8.000 bij het transferbudget, precies één keer. Oude speeldagen worden niet ingehaald. Bij een nieuw seizoen blijven budgetten staan; er is geen extra seizoensreset of bijdrage. Het maximum is 1 biljoen credits.

Alle transfers tussen jouw club en een tegenstander boeken bij beide clubs hetzelfde bedrag met tegengesteld teken. Een bod reserveert geen credits. Bij de uiteindelijke verkoop controleert het spel opnieuw het budget en de limiet van 55 spelers. Een ontvangen bod kan dus tijdelijk niet uitvoerbaar zijn na een andere aankoop door die club. Er zijn geen negatieve tegenstanderbudgetten en transfers lenen geen geld.

Dit is een afzonderlijk transferbudget, geen volledige simulatie van salarissen, sponsors of stadioninkomsten van de tegenstanders. De laatste honderd mutaties per club blijven opgeslagen; oudere bedragen schuiven naar het beginsaldo. Het scherm toont de laatste vijf. De inbox bewaart maximaal 25 biedingen en toont maximaal twintig gesloten biedingen.

## Bestaande saves

De opslagsleutel en interne saveversie blijven gelijk. Oudere saves krijgen een lege onderhandelingslijst zonder wijziging van spelers, credits, uitslagen of lopende wedstrijden. Open aanbiedingen worden bewaard bij herladen en export/import. Import controleert status, bedragen, speler, verkopende club, geldigheid en unieke onderhandelingsnummers. Afgesloten historie mag verwijzen naar spelers die inmiddels van club zijn veranderd.

Versie 0.10.0 voegt afzonderlijk de tegenstanderbudgetten en een lege inbox toe. Er worden geen oude transfers opnieuw geboekt en er ontstaan pas nieuwe biedingen na een volgende afgeronde speeldag. Lopende wedstrijden blijven intact. Import controleert ook budgetsaldi, doorlopende boekingen, clubvolgorde, biedingsprijs, status, geldigheid en unieke biedingsnummers. Ongeldige data wordt niet stilzwijgend hersteld of over de actieve carrière geschreven.
