# Clubbeheer en carrière — bijgewerkt voor 0.15.0

Deze systemen werken lokaal met spelcredits. Geen van de bedragen, salarissen, contracten, stadionniveaus of sponsors beschrijft de echte club. De gewone competitie blijft uitsluitend bestaande clubs en echte spelersnamen gebruiken.

## Geldstromen

Een afgeronde speeldag boekt voor je eigen club één keer de wedstrijdbonus, thuisinkomsten en sponsorbetaling, gevolgd door salarissen en onderhoud. Pauzeren, herladen en het verslag opnieuw bekijken betalen niets dubbel.

| Post | Spelregel |
| --- | --- |
| Wedstrijdbonus | 35.000 winst, 18.000 gelijk, 10.000 verlies |
| Thuisinkomsten | Bezoekers × gekozen ticketprijs; zie [stadionregels](stadium.md). Uitwedstrijden leveren dit niet op; al lopende oude wedstrijden behouden hun vaste bedrag |
| Startsalaris per speler | Maximaal van 100 en (algemene rating − 40) × 15, per speeldag |
| Onderhoud | 500 × stadionniveau + 250 × trainingsniveau + 250 × herstelniveau |
| Stafkosten | 500 × elk niveau van trainings- en scoutingstaf, per speeldag |
| Scouting | 15.000 − 1.500 × scoutingstafniveau |

Clubzaken toont een begroting en de laatste 500 boekingen, inclusief saldo na iedere boeking. Oudere boekingen worden verwerkt in het beginsaldo; het totaal blijft kloppen. Een negatieve clubkas blokkeert aankopen en upgrades. Wedstrijden, verkopen en kosteloos contractverlenging blijven mogelijk.

## Contracten en verkopen

Nieuwe spelerscontracten lopen tot en met het huidige seizoen + 2. Een contract is te verlengen zodra er hoogstens het volgende seizoen over is. Verlengen kost geen tekenbonus; het salaris stijgt met 8% (naar boven afgerond) en de looptijd wordt opnieuw het huidige seizoen + 2. Een verlopen speler blijft geregistreerd, maar moet vóór deelname in de basiself of op de bank verlengen. Er is een knop om alle aflopende contracten samen te verlengen.

Verkoop eerst bekijken, een kopende club kiezen, vervolgens bevestigen. Annuleren verandert niets. De vijf andere clubs bieden 65% van de gegenereerde transferwaarde. Er blijven minimaal 18 inzetbare spelers en twee inzetbare keepers achter. Kopende clubs kunnen maximaal 55 spelers hebben. De speler behoudt zijn ID, opgebouwde statistieken en eventuele spelblessure. Basiself, bank en aanvoerder worden zo nodig aangevuld. De directe verkoop gebruikt een vaste prijs en het beschikbare tegenstanderbudget. Voor onderhandelen en ontvangen biedingen gebruik je Scouting & transfers.

Contracten, aankopen, verkopen en investeringen zijn tijdens een lopende wedstrijd geblokkeerd.

## Faciliteiten en staf

Faciliteiten starten op niveau 1, maximaal 5. Staf begint op 0, maximaal 3. Een stap kost het basisbedrag × het nieuwe niveau. Investeringen blijven behouden na een seizoen.

| Onderdeel | Basisbedrag | Effect |
| --- | --- | --- |
| Stadionvoorzieningen | 18.000 | +2.500 spelplaatsen per niveau; bezetting en ticketprijs bepalen de opbrengst |
| Trainingscomplex | 14.000 | +1 ontwikkelpunt per niveau boven 1 |
| Herstelcentrum | 10.000 | +1 conditiepunt bij herstel per niveau boven 1 |
| Trainingsstaf | 16.000 | +1 ontwikkelpunt per niveau |
| Scoutingstaf | 18.000 | −1.500 scoutingkosten per niveau |

Individuele training is één extra sessie per speeldag voor één inzetbare speler en één vaardigheid. Het effect is trainingsniveau + stafniveau; de speler verliest 3 conditiepunten. Vaardigheden komen niet boven 99. Persoonlijke plannen zijn vanaf 0.11.0 beschikbaar; een leeftijdscurve, potentieel- of jeugdsysteem ontbreekt nog. Sinds 0.6.0 beïnvloedt het herstelcentrum ook blessurerisico en rust tussen speeldagen; zie [fitheid en inzetbaarheid](fitness.md).

## Sponsors

Je kiest één fictief spelcontract per seizoen, voor de resterende wedstrijden. De keuze is daarna vast tot de seizoensafsluiting. Een eindbonus wordt naar rato van de resterende speeldagen bij ondertekening berekend. Vlak voor het einde tekenen levert dus geen volledige seizoensbonus op.

| Contract | Per wedstrijd | Extra per zege | Bonus bij seizoensafsluiting |
| --- | --- | --- | --- |
| Zekerheid | 6.000 | 0 | 0 |
| Overwinningen | 2.500 | 5.000 | 30.000 bij top 3, naar rato |
| Titelambitie | 1.000 | 3.000 | 100.000 bij kampioenschap, naar rato |

## Voorbeschouwing en automatische instructies

De voorbeschouwing vergelijkt gemiddelde spelwaarden van de gekozen basiself met de verwachte tegenstander, toont recente vorm, eerdere ontmoetingen en spelers met lage conditie. De tegenstander gebruikt momenteel een automatische 4-3-3. Dit is geen voorspelling van een echte wedstrijd.

Voor de aftrap kun je drie regels instellen:

- Vanaf minuut 70 bij achterstand: mentaliteit 80, tempo 70. Eén keer per wedstrijd.
- Vanaf minuut 75 bij voorsprong: mentaliteit 25, tempo 35. Eén keer per wedstrijd.
- Vanaf minuut 60 een speler onder 60% conditie vervangen als er een fittere passende bankspeler is. Maximaal één wissel per minuut en drie wissels totaal, inclusief handmatige wissels.

Pauzeren stopt deze regels; handmatig coachen blijft mogelijk. Uitgevoerde regels verschijnen in het verslag. Herladen voert dezelfde tactische regel niet opnieuw uit. Een gesloten of gepauzeerde browser speelt niet verder. Dit is geen online afwezigheidsmanager.

## Historie

Een zege levert 120 XP op, gelijkspel 70 en verlies 40. Iedere 1.000 XP geeft een niveau; dit geeft geen wedstrijdvoordeel. Mijlpalen omvatten eerste winst, tien zeges, honderd goals, een titel en faciliteitenniveau 3.

Bij het starten van een volgend seizoen blijven eindstand en uitslagen bewaard. De laatste 50 seizoenen blijven in detail zichtbaar; oudere totalen blijven meetellen. Spelers krijgen duels, basisplaatsen, minuten, goals en clubs in hun profiel. Doelpuntenmakers worden bij nieuwe wedstrijden op ID gekoppeld. Een transfer verwijdert de historie niet.

Oudere saves krijgen alleen de ontbrekende onderdelen. Clubkas, resultaten en lopende wedstrijd blijven behouden. Beschikbare oude resultaten tellen mee voor de manager, maar ontbrekende individuele statistieken of verdwenen vorige seizoenen worden niet verzonnen. Dezelfde backup- en herstelknoppen bewaren ook de nieuwe onderdelen. Een oudere applicatieversie kan deze uitbreidingen niet volledig beheren; blijf na upgraden dezelfde of een nieuwere versie gebruiken.

## Tegenstanderbudgetten vanaf 0.10.0

Direct verkopen gebruikt nu het transferbudget van de gekozen koper. Zonder voldoende credits of selectieruimte is die club niet beschikbaar. Iedere verkoop boekt dezelfde opbrengst bij jou en uitgave bij de koper. Via **Scouting & transfers → Ontvangen biedingen** zie je ook spontane biedingen en alle tegenstanderbudgetten. Zie [de transferregels](transfers.md) voor bedragen, bevestiging en savebehoud.

## Persoonlijke ontwikkelplannen vanaf 0.11.0

**Training → Spelerontwikkeling** toont groeidoelen, beginwaarden en vooruitgang per bron. Trainen volgens plan deelt de bestaande individuele sessie met speler- en keepertraining. Actieve plannen geven daarnaast groei per 180 werkelijk gespeelde minuten, pas na de wedstrijd. Zie [de ontwikkelregels](development.md) voor tellers, transfers en savebehoud.

## Clubreputatie vanaf 0.12.0

**Clubzaken → Reputatie** toont verdiende punten, mijlpalen en recente prestaties. Nieuwe resultaten geven 12 punten voor winst, 5 voor gelijkspel en 1 voor verlies; eigen reglementair verlies geeft nul. Alleen volledig bijgehouden nieuwe seizoenen krijgen een eindbonus. Vanaf 100 en 300 punten komen respectievelijk Regionale partner en Landelijke partner beschikbaar. Bestaande sponsorcontracten veranderen niet. Zie [de reputatieregels](reputation.md) voor bedragen, voorwaarden en savebehoud.
