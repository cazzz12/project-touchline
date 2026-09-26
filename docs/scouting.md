# Gericht scouten en vergelijken

Vanaf 0.13.0 staat bij **Scouting & transfers** een bewaard zoekprofiel, een shortlist en een vergelijking met je eigen spelers. Dit gebruikt spelcredits en lokale carrièregegevens. Er is geen online markt of betaling met echt geld.

## Zoeken en een opdracht geven

- **Gericht zoeken** bekijkt gratis de vijf andere clubselecties en je huidige scoutingrapport. Kies een positiegroep, optionele maximale transferprijs en eventueel een vaardigheid met minimumwaarde van 0–100. Keepersvaardigheden werken alleen met Keepers of Alle posities.
- De beste twaalf passende spelers worden getoond, gesorteerd op de gekozen vaardigheid, anders algemene rating. Gelijke scores worden op prijs en daarna speler-ID gesorteerd. Het aantal gevonden spelers blijft zichtbaar; clubtransfers geeft toegang tot de volledige selecties.
- De prijsgrens geldt per speler, exclusief scoutingkosten en salaris. Een passende kandidaat kan meer kosten dan je huidige clubkas; een club kan een verkoop ook weigeren. Je betaalt pas volgens de bestaande transferregels.
- **Scoutingrapport → Stuur scouts** gebruikt hetzelfde profiel om maximaal vier spelers uit de bestaande externe namenlijst te zoeken. Zonder gekozen vaardigheid blijft de bestaande reproduceerbare trekking behouden; met een vaardigheid kiest de scout de hoogste passende waarden. Spelers die al bij een club zitten, worden op ID en genormaliseerde naam uitgesloten.
- Een opdracht kost 15.000 credits, verminderd met 1.500 per scoutniveau, eenmaal per speeldag. Minder dan vier passende kandidaten levert een kleiner rapport voor dezelfde zichtbare opdrachtprijs op. Bij nul kandidaten, een lopende wedstrijd, onvoldoende credits of een reeds gebruikte opdracht wordt niets afgeschreven.
- Het betaalde rapport bewaart zijn eigen profiel, speeldag en werkelijke scoutingkosten. Later filters veranderen trekt geen nieuwe spelers en verandert dat rapport niet. Het rapport vervalt bij afronding van de volgende wedstrijd, bij een nieuw seizoen of bij expliciet vervangen van de clubselecties. Een lopende wedstrijd en herladen behouden het rapport.

De externe lijst bevat echte namen, maar de transferbeschikbaarheid en vaardigheden zijn gegenereerd. Het rapport doet geen uitspraak over actuele vrije spelers, officiële ratings, leeftijd of potentieel.

## Shortlist

Bewaar maximaal twintig verschillende kandidaten. Een vermelding bevat de vaste speler-ID, de naam en het seizoen/de speeldag waarop je de speler bewaarde. Zoeken, bewaren, verwijderen en vergelijken kosten niets en veranderen de opstelling niet.

Prijs, vaardigheden, conditie en club worden steeds uit de huidige carrière gelezen. Na aankoop wordt de kandidaat als eigen speler getoond, met zijn werkelijke contract. Een verlopen rapport maakt een niet aangekochte kandidaat onbeschikbaar; de naam blijft verwijderbaar op de shortlist staan. Een vermelding is geen reservering en bevat geen spelerskopie waarmee je een verlopen transfer alsnog kunt uitvoeren. Shortlist en profiel blijven ook over seizoenen bewaard.

## Vergelijken

De vergelijking kiest standaard de eigen basisspeler met de hoogste rolscore binnen dezelfde brede positiegroep. Als daar geen basisspeler staat, kiest het de beste eigen speler uit die groep. Je kunt zelf een andere eigen speler uit dezelfde groep kiezen.

| Groep | Berekening rolscore, afgerond |
| --- | --- |
| Keeper | 50% reflexen + 25% balvastheid + 25% positionering |
| Verdediger | 50% verdediging + 20% passing + 15% snelheid + 15% kalmte |
| Middenvelder | 45% passing + 25% kalmte + 20% uithoudingsvermogen + 10% verdediging |
| Aanvaller | 30% aanval + 35% afwerking + 20% snelheid + 15% kalmte |

De tabel toont ook losse vaardigheden, conditie, inzetbaarheid, transferprijs en salarisverschil. Formatie en de plek van je eigen speler geven context. Exacte positiefit, conditie, moraal en tactische schuiven tellen niet mee in deze rolscore. Het is een hulpmiddel voor selectiebeleid, geen voorspelling van wedstrijduitkomsten of echt potentieel.

## Bewaren en toekomstige onlineversie

Oudere saves krijgen alleen een leeg `scoutingDesk`-onderdeel met schema 1. Credits, spelers, uitslagen, opstelling en live wedstrijd blijven behouden. Een bestaand scoutingrapport blijft geldig zonder een achteraf verzonnen zoekprofiel. Backupimport controleert criteria, unieke IDs, limieten, tijdstempels en rapportgegevens; ongeldige bestanden vervangen de actieve carrière niet.

De spelregels staan los van de HTML in `scouting-state.js` en `scouting.js`. Dat helpt een latere verplaatsing naar de server. Dit is nog geen servercontrole of bescherming tegen lokaal gewijzigde saves. Accounts met e-mail/wallet, servereconomie, koopbare packs en de Solana dApp Store staan in de [roadmap](roadmap.md).
