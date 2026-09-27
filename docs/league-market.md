# Transfers tussen computerclubs

Vanaf 0.14.0 zoeken de vijf computerclubs na een gespeelde speeldag ook onderling naar versterking. **Scouting & transfers → Transferjournaal** toont welke speler verhuisde, van welke club naar welke club, het bedrag en de reden. Dit zijn fictieve transfers in jouw carrière, geen actuele voetbaltransfers.

## Beslismoment en regels

Na afloop van alle drie wedstrijden van een speeldag worden resultaten, ontwikkeling, discipline en herstel verwerkt. De bestaande bijdrage van 8.000 spelcredits gaat naar ieder computerclubbudget. Daarna volgt maximaal één onderlinge transfer, vóór de clubs biedingen op jouw spelers maken. Hetzelfde budget wordt dus voor beide systemen gebruikt.

- De eerste club die een kandidaat mag kiezen rouleert. Als die geen geschikte kandidaat heeft, krijgt de volgende club een kans. De keuze is reproduceerbaar en gebruikt geen willekeurige trekking die door herladen verandert.
- Kandidaten komen uitsluitend uit de huidige selecties van de andere computerclubs. Jouw club, spelers, credits, opstelling en contracten zijn uitgesloten van deze automatische transacties.
- Alleen inzetbare reserves buiten het advies voor een 4-3-3 mogen vertrekken. Een geblesseerde of geschorste speler wordt niet gekozen. Het advies is een spelberekening, geen officiële basisopstelling.
- De bestaande verkoopgrenzen blijven gelden: minimaal achttien spelers, voldoende fitte en inzetbare vervangers en minstens twee keepers. De verkoper moet daarnaast minstens twee keepers, vijf verdedigers, vijf middenvelders en drie aanvallers binnen de betreffende positiegroep overhouden. Een koper mag maximaal 55 spelers hebben.
- De koper zoekt diepte tot de streefgetallen van drie keepers, acht verdedigers, zeven middenvelders en vijf aanvallers. Een speler mag hiervoor maximaal vijf algemene ratingpunten onder het gemiddelde van zijn positiegroep bij de koper zitten.
- Bij voldoende diepte is minstens drie ratingpunten verbetering ten opzichte van dat groepsgemiddelde nodig. Kandidaten worden gerangschikt op verschil plus twintig punten voor een tekort, vervolgens op laagste prijs en vaste speler-ID. Dit is een eenvoudig beleid, geen volledig tactisch of financieel planningsmodel.
- Een speler kan binnen dit systeem maximaal eenmaal per seizoen verhuizen. Handmatige managertransfers blijven onder hun eigen regels vallen.
- De vaste prijs is 105% van de bestaande spelwaarde, afgerond, met minimaal 1.000 credits. Dit is dezelfde berekening als de vraagprijs voor een reserve bij clubtransfers. De koper moet het bedrag volledig kunnen betalen; de verkoper mag zijn budgetlimiet niet overschrijden. De aankoop verlaagt het ene budget en verhoogt het andere met hetzelfde bedrag.

Als er geen kandidaat past, gebeurt er niets. De speeldag blijft wel verwerkt; later meer budget krijgen, opnieuw een scherm openen of herladen geeft geen tweede beslismoment.

## Identiteit en geschiedenis

De speler verhuist met dezelfde ID en spelwaarden. Zijn oude rugnummer vervalt om een dubbel nummer bij de koper te vermijden. Bestaande historie, ontwikkeling en discipline blijven aan de ID gekoppeld. Een shortlist kijkt de club en vraagprijs opnieuw op en volgt daardoor de verhuizing. Statistieken schrijven een nieuwe club pas bij zodra de speler daar daadwerkelijk minuten maakt.

Het journaal bewaart de laatste vijftig transacties en toont filters voor club en seizoen. De totale aantallen en volumes blijven behouden als oudere regels uit de lijst verdwijnen. De budgetboekhouding heeft haar eigen bestaande grens van honderd mutaties per club. Clublogo’s en knoppen naar de actuele selecties maken de verhuisde speler terugvindbaar.

## Bestaande saves en toekomstige onlineversie

Een oudere save krijgt alleen een leeg `leagueMarket`-onderdeel met schema 1, vanaf de huidige speeldag. Er worden geen transfers of budgetwijzigingen achteraf uitgevoerd. Oude lopende wedstrijden zonder `leagueMarketRules` behouden hun bestaande afhandeling. De regel geldt pas bij een nieuwe aftrap. Profielen en journaal bewaren geen kopieën waarmee een speler dubbel kan ontstaan.

Backupimport controleert schema, tijdstempels, clubverwijzingen, unieke transactienummers, maximaal één verhuizing per speeldag en per speler per seizoen, de prijsformule, totalen en ondersteunde wedstrijdregels. De gewone save-sleutel en saveversie blijven gelijk.

De spelbeslissingen staan los van de schermbediening. Voor de geplande onlineversie moeten de server en database deze beslissingen, betalingen en eigendomsoverdrachten gezamenlijk en eenmalig vastleggen. Dit lokale prototype biedt die online garanties nog niet. E-mail/walletaanmelding, betaalde packs en Solana dApp Store-distributie blijven onderdelen van de [roadmap](roadmap.md).
