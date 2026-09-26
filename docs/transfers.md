# Clubtransfers — 0.9.0

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

De bestaande scoutingpool en directe verkoop via Clubzaken blijven beschikbaar. Tegenstanders hebben nog geen eigen transferbudget of zelfstandige transferplannen. Het aankoopbedrag wordt daarom nog niet in een afzonderlijke boekhouding van de verkoper verwerkt. Leningen, veilingen, clausules en transfers tussen online managers zijn latere uitbreidingen.

## Bestaande saves

De opslagsleutel en interne saveversie blijven gelijk. Oudere saves krijgen een lege onderhandelingslijst zonder wijziging van spelers, credits, uitslagen of lopende wedstrijden. Open aanbiedingen worden bewaard bij herladen en export/import. Import controleert status, bedragen, speler, verkopende club, geldigheid en unieke onderhandelingsnummers. Afgesloten historie mag verwijzen naar spelers die inmiddels van club zijn veranderd.
