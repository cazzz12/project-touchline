# Wat blijft er te doen?

Stand: **0.18.0, 26 september 2026**. De lokale voetbalmanager is speelbaar en wordt automatisch en visueel getest. De online game en het verdienmodel zijn nog niet gebouwd. Dit overzicht geeft de voorgestelde bouwvolgorde; het is geen belofte dat alle ideeën uit het oorspronkelijke concept noodzakelijk zijn voor de eerste release.

## Al aanwezig

- Zes echte clubs met bronselecties, logo's en profielen; spelratings en een fictieve minicompetitie.
- Handmatige basiself, zeven reserves, aanvoerder, tactieken, livewedstrijden, pauzeren en hervatten.
- Keepers, kaarten, schorsingen, blessures, herstel en blessurewissels door jouw computertegenstander.
- Training, persoonlijke ontwikkeling, scouting, shortlist, vergelijken, contracten en transfers tussen clubs.
- Clubkas, salarissen, sponsors, reputatie, faciliteiten, stadion, bezoekers, postvak en carrièrehistorie.
- Browseropslag, gecontroleerde backups en behoud van bestaande saves. 228 automatische tests; desktop- en mobiele browsercontrole.

Dit blijft een lokale singleplayergame. Er bestaan nog geen online accounts, verbonden wallets, echte betalingen of gekochte packs.

## Bouwvolgorde

| Prioriteit | Onderdeel | Wat moet er nog gebeuren? | Wanneer is deze stap geslaagd? |
| --- | --- | --- | --- |
| 1 — eerstvolgende stap | Betrouwbare online basis | Spelacties achter een server-API plaatsen; database, migraties, back-ups, versienummers en herstel; server beheert credits, eigendom, transfers en wedstrijdafrekening. | Herstart behoudt voortgang; dubbele of gelijktijdige verzoeken geven geen dubbele beloning; de browser kan geen eigen saldo opleggen. Lokaal prototype blijft bruikbaar. |
| 2 | Accounts en inloggen | E-mailaanmelding, sessies, uitloggen en herstel; daarna walletaanmelding en veilig koppelen aan hetzelfde account. | Dezelfde carrière is op twee apparaten beschikbaar; iedere gebruiker ziet alleen toegestane gegevens; walletbewijzen kunnen niet worden hergebruikt. Private keys blijven buiten Touchline. |
| 3 | Samen spelen | Online competitie, clubtoewijzing, seizoensplanning, gelijktijdige transfers en regels voor afwezigheid; daarna vrienden en privéruimtes. | Een volledige competitie met meerdere testaccounts werkt zonder dubbele club- of spelerbezitting en zonder verloren voortgang. Eigen clubs blijven beperkt tot privéruimtes. |
| 4 | Packs en verdienmodel | Inhoud, prijzen, gratis verdienroutes en eventuele kansen bepalen; aankoopoverzicht, servercontrole, ontvangstbewijzen, eenmalige levering en herstel. Betaalmethoden uitwerken en testen. | Testbetalingen leveren precies eenmaal de juiste inhoud; fouten zijn herstelbaar; kosten en inhoud zijn vooraf duidelijk; betalingen garanderen geen wedstrijdwinst. |
| 5 | Mobiele app en Solana | Android-app, bediening op echte toestellen, veilig walletkoppelen, Solana-testomgeving, netwerkonderbrekingen en distributie via de Solana dApp Store. | De app doorloopt installatie, aanmelden, spelen, hervatten en testbetaling op echte toestellen; actuele store- en integratievereisten zijn gecontroleerd voordat publicatie wordt voorbereid. |
| 6 | Besloten test en lancering | Meerdere menselijke testers, belasting- en beveiligingscontrole, monitoring, herstelproef, support, onboarding en productieomgeving. | Kritieke problemen zijn opgelost, herstel is beproefd en de eerste online versie is aantoonbaar klaar voor spelers. |

De volgende concrete ontwikkelstap is **de server- en opslaglaag voorbereiden en één spelactie volledig via de server laten lopen**. Daarna breiden we die route uit naar de overige acties. Een knop “wallet verbinden” zonder betrouwbare servereconomie maakt het spel nog niet online.

## Keuzes die vóór de bijbehorende fase nodig zijn

- **Online competitie:** meerdere afzonderlijke competities of één gedeelde wereld, clubverdeling, wedstrijdritme en wat er gebeurt als iemand niet aanwezig is.
- **Packs:** welke inhoud past bij echte clubs en spelers, hoe die ook door spelen te verdienen is, en hoe competitie eerlijk blijft. Er zijn nog geen prijzen of packkansen vastgesteld. Een marketplace, verhandelbare assets en SOL-beloningen zijn losse latere keuzes, geen vereisten voor de eerste online versie.
- **Bestaande saves:** lokaal door kunnen spelen, export/herstel behouden en een aparte overgang naar online. Lokale credits en bewerkbare backups mogen niet automatisch verkoopbare online waarde worden.
- **Productie:** hosting, e-maildienst, domein en budget kiezen zodra een werkende testversie en concrete kostenraming klaarstaan. Geen echte betaal- of hostingkosten activeren zonder een concrete afgesproken inzet.
- **Clubdata en commercieel gebruik:** selecties en bronnen onderhouden; gebruik van clublogo's, namen en eventuele spelersbeelden voor de commerciële distributie laten beoordelen. Ratings blijven herkenbaar als spelwaarden.

## Spelverbeteringen naast de online route

Balans over meer carrières, preciezere posities en leeftijdsgegevens, leeftijd/potentieel, teamchemie, karaktertrekken, extra tactische instructies, computercoaching op score en vermoeidheid, gedwongen uitval bij zware blessures, uitgebreidere contractonderhandelingen en transferplanning, stafspecialisaties en verdere supportersinteractie. Daarnaast kunnen audio, media/events, extra prestaties en optionele pushmeldingen volgen.

Deze uitbreidingen zijn nog niet allemaal nodig voor de eerste online test. Geen fictieve jeugdregens in de gewone competitie; jeugdontwikkeling moet aansluiten bij de keuze voor echte spelersnamen. De [volledige roadmap](roadmap.md) koppelt de huidige systemen aan het [oorspronkelijke concept](concept.md).
