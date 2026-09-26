# Wereldvoetbal — 0.20.0

Momentopname opgehaald op 26 september 2026: **20 competities, 351 clubs, 9.636 spelers**. Hiervan hebben 6.838 spelers FC 26-basisratings en 2.798 een FC 27-aanvulling. De gebruiker heeft deze aanvulling expliciet gekozen. Geen zelfbedachte vervangingsattributen.

## Wat kun je doen?

Open **Wereldvoetbal** (`/world`). Filter op continent, competitie en positie of zoek een speler/club over de hele catalogus. Clubpagina’s tonen de volledige selectie zoals aangeleverd door de bron. Profielen tonen naam, nationaliteit, geboortedatum indien beschikbaar, primaire en alternatieve posities, voet, weak foot, skill moves, algemene rating en alle beschikbare numerieke attributen. De gebruikte editie staat bij iedere speler.

In **Samen spelen** kun je zestien wereldcompetities starten. Clubs beginnen met hun geïmporteerde selectie en attributen. Iedereen speelt thuis en uit tegen iedere andere club. Een oneven aantal clubs geeft per ronde één rustbeurt zonder wedstrijd of bonus. Dit is ons eigen wedstrijdschema, geen nabootsing van officiële play-offs, conferenties of nationale reglementen. De oorspronkelijke zesclubvariant blijft beschikbaar.

## Bronnen en edities

- [EA-ratingscatalogus](https://www.ea.com/games/ea-sports-fc/ratings): momenteel FC 27, gebruikt voor clubindeling, speler-ID’s, namen, posities en ontbrekende FC 26-ratings. Dit is EA’s selectie, niet per club als actuele officiële selectie geverifieerd. De bron kan jeugdspelers en recente transfers missen.
- `https://drop-api.ea.com/rating/ea-sports-fc`: bij deze import nog FC 26-basisgegevens. De API heeft geen editieveld. We controleren gepubliceerde FC 26-waarden van Mbappé (91 OVR, 97 snelheid, 92 afwerken) en Salah (91 OVR, 89 snelheid, 94 afwerken). Een afwijking stopt de import, zodat een nieuwe editie niet stilzwijgend als FC 26 wordt ingevoerd. De twee controles vervangen geen afzonderlijke verificatie van elk attribuut; hashes van iedere bronrespons blijven bewaard.
- [EA’s FC 26-beschrijving](https://www.ea.com/games/ea-sports-fc/fc-26/news/fc-26-authenticity) beschrijft de dekking van de game. De openbare ratingsbron heeft een beperktere spelersdekking. De bronratings zijn basisratings, geen actuele vormupdates, speciale kaarten of potentieelratings.
- [Lega Serie A](https://www.legaseriea.it/team) levert de echte namen en logo’s van Atalanta, Inter en AC Milan in plaats van hun generieke EA-clubnamen. [Atlético de San Luis](https://www.atleticodesanluis.mx/noticias/2375/Atltico-de-San-Luis-ya-conoce-su-calendario-para-el-Apertura-2026) bevestigt de herstelde spelling van vier Mexicaanse clubnamen. De oorspronkelijke bronnaam blijft apart bewaard.

Koppeling gaat uitsluitend via dezelfde numerieke EA-speler-ID; nooit via een gok op naam. Primaire en alternatieve **clubposities** komen uit de nieuwere bron. De oorspronkelijke ratingpositie blijft in het profiel zichtbaar. Nieuwe transfers in de echte wereld wijzigen lopende carrières niet automatisch.

Logo’s laden vanaf EA of Lega Serie A. Bij een laadfout toont de catalogus een placeholder. Er worden geen spelersportretten of kaartontwerpen overgenomen. Deze gegevensimport verleent Touchline geen commerciële rechten op merken of EA-data; distributierechten blijven een apart punt voor de publieke release.

## Dekking

| Regio | Competities |
| --- | --- |
| Europa | Engeland, Spanje, Italië, Duitsland, Frankrijk, Nederland, Portugal, België, Turkije, Schotland, Oostenrijk, Zwitserland |
| Azië | Saoedi-Arabië, Zuid-Korea, China, India |
| Amerika | MLS (VS/Canada), Argentinië, Mexico |
| Oceanië | Australië/Nieuw-Zeeland |

Vier competities zijn alleen te bekijken omdat niet iedere club minimaal 18 spelers en twee keepers in de bron heeft:

| Competitie | Onvoldoende bronselectie |
| --- | --- |
| Liga Portugal | Moreirense FC: 15 spelers, één keeper |
| Süper Lig | Gaziantep: één keeper |
| Chinese Super League | Chongqing FC: 12 spelers, één keeper |
| A-League | Auckland, Brisbane, Central Coast en Wellington: minder dan 18 spelers; Macarthur en Perth: één keeper |

Dit zegt niets over de echte selectiegrootte: de openbare EA-bron mist gegevens. We maken geen spelers of ratings bij om een controle te laten slagen. Japan, Brazilië, Qatar en de VAE hebben nog geen volledige databundel. Ook nationale competities buiten deze scope zijn niet automatisch toegevoegd. De catalogus presenteert deze hiaten zichtbaar.

## Vertaling naar de simulatie

De bronattributen blijven apart bewaard. Aanval gebruikt aanvalspositionering; passing, verdedigen en snelheid gebruiken de bijbehorende EA-totalen; afwerken, kalmte en uithoudingsvermogen gebruiken hun subattributen. Keeperreflexen, balvastheid en keeperpositionering komen rechtstreeks uit de keeperattributen.

EA’s zes kaarttotalen hebben bij keepers een andere betekenis. Daarom gebruikt hun loopsnelheid het afgeronde gemiddelde van acceleratie/sprintsnelheid, passing de korte passing en veldverdedigen het gemiddelde van verdedigend inzicht/staande tackle. Dat zijn transparante Touchline-afleidingen, geen extra officiële EA-attributen. De profielweergave verbergt verkeerd te interpreteren kaarttotalen voor keepers en toont de echte subattributen. Alternatieve posities tellen mee in de opstelling en simulatie.

Conditie begint op 100 en moraal op 75: spelstatus, geen EA-waarderingen. Credits, prijzen, contracten, blessures, vorm en training blijven Touchline-systemen. De EA-bronrating verandert niet wanneer je traint; alleen de speelwaarden van je competitie veranderen.

## Saves en updates

Lokale versie-2–5-saves, hun sleutel en migraties blijven intact. De nieuwe databundel wordt uitsluitend voor **nieuwe online competities** gebruikt. Bestaande online competities bevatten hun eigen selectie en blijven daarvan gebruikmaken, ook na een import. De SQLite-migratie van schema 1 naar 2 verruimt alleen de toegestane clubindex in lidmaatschappen; er worden geen accounts, clubs of uitslagen vervangen.

`npm.cmd run import:world` bouwt de bundel uit gecachte bronresponsen of haalt ontbrekende pagina’s op. `npm.cmd run import:world -- --refresh` haalt alles opnieuw op. De cache staat onder `data/world-import/` en wordt niet gepubliceerd. De importer stopt bij HTTP-fouten, veranderde aantallen, dubbele spelers, onverwachte edities of ongeldige attributen. Publicatie gebruikt een map met inhoudshash en vervangt pas na validatie de catalogusindex. Tijdens een mislukte import blijft de vorige bundel bruikbaar. Verouderde clubkeuzes worden door de server afgewezen op snapshot-ID; een opdracht mag nooit door een herordening een andere club kiezen.

Controleer bij een nieuwe momentopname aantallen, clubnamen, dekking en primaire bronnen opnieuw. Herstart daarna de server en voer `npm.cmd test` uit. Bestaande competities blijven ongewijzigd. De ruwe bronresponsen en hashes zijn voor controle; claim geen actuele volledige officiële selecties zonder die aanvullende clubcontrole.
