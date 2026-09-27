# Wedstrijdstijl — 0.24.0

De aangeleverde voetbalmanagerbeelden zijn gebruikt voor sfeer en visuele hiërarchie: een stadion achter donkerblauwe panelen, helderblauwe bediening, geel voor belangrijke labels en compacte sportlettertypes. Touchline houdt eigen beelden, SVG-iconen, lettertypes en spelregels. Er zijn geen personages, advertenties, wachttijden of producten uit de referentie toegevoegd.

## Wat verandert

- De AI-profielatlas is verwijderd. Profiel, profielkeuze en assistent tonen eigen voetbalbadges: Clubhart, Spelmaker, Aanvoerder, Tacticus, Winnaar en Clubicoon.
- Barlow Condensed wordt ook gebruikt voor navigatie, knoppen en taaklabels. Langere teksten blijven in Barlow. Fonts worden lokaal geladen.
- De lokale carrière heeft bovenaan club, merk en menu. Het volgende duel toont beide clublogo's, thuis/uit en een VS-blok, met bestaande speel-/hervatknop. Hetzelfde presentatieblok verschijnt bij de eigen volgende wedstrijd in een actieve speelwereld.
- Drie snelkoppelingen brengen je naar training, voorbereiding en transfers.
- De voorbereidingstakenlijst toont vijf bestaande toestanden: complete inzetbare basiself met keeper, aanvoerder uit de basis, teamtraining gebruikt, basisspelers vanaf 70% conditie en zeven inzetbare reserves. Een vinkje is een hulpmiddel, geen winstvoorspelling of verplichte aankoop. Iedere rij opent het bijbehorende scherm; klikken voert geen training of wijziging uit.
- Trainingssessies krijgen duidelijke voetbaliconen en een actie onderaan. Scout- en Spotlight-packs hebben blauw/paarse verpakkingen, zichtbare kansen en een oranje openingsknop. Kosten en kansen zijn ongewijzigd.
- Gedeelde knoppen, tabellen, formulieren, wedstrijdvensters, profiel, lessen en wereldcatalogus krijgen dezelfde blauwe/geelgouden afwerking.

## Behoud en grenzen

De waarden 0–5 voor `profile.avatar` blijven bestaan en kiezen nu de bijbehorende badge. Naam, emotie, motto, lessen, wereldkeuzes, selectie, uitslagen en credits krijgen geen migratie. Het lokale saveformaat en SQLite-schema 3 blijven ongewijzigd. Er zijn geen betalingen of publieke servers aangezet.

## Controle

Alle 276 automatische tests slagen na de wijziging, inclusief save- en profielbehoud. Browsercontrole gebruikt de bestaande carrière uitsluitend om te bekijken en een afzonderlijke lokale testdatabase voor het bewaren van een profielbadge. De opgeslagen badge blijft na herladen geselecteerd; de elementen gebruiken SVG en CSS zonder portretbestanden.

Desktop en telefoonformaten zijn visueel bekeken: clubhuis, training, voorbereiding, profiel en packs. Op 320 pixels passen de geteste schermen zonder horizontale pagina-overloop. Afzonderlijk is 390 pixels gebruikt voor telefooncontrole. Deze browserformaten vervangen geen test op een echt toestel.

De bestaande Ajax-carrière houdt 27 spelers, 84.666 credits en negen gespeelde wedstrijden. De testwereld houdt 32 PSV-spelers en 104.000 credits; tijdens deze stylingcontrole zijn geen wedstrijden, trainingen of packaankopen uitgevoerd.
