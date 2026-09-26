# Clubgegevens

Momentopname gecontroleerd op **25 september 2026**. Dit is geen live datakoppeling. De eerste-elftalpagina's van de clubs bepalen welke spelers in deze versie bij welke club beginnen. Alleen namen, rugnummers en de op die pagina opgegeven brede posities zijn overgenomen. Stafleden zijn uitgesloten.

| Club | Spelers | Selectiebron |
| --- | ---: | --- |
| Ajax | 27 | https://www.ajax.nl/teams/ajax-1 |
| Feyenoord | 28 | https://www.feyenoord.com/nl/teams/feyenoord-1/selectie |
| PSV | 28 | https://www.psv.nl/teams/team |
| AZ | 28 | https://www.az.nl/teams/az |
| FC Utrecht | 30 | https://www.fcutrecht.nl/teams/selectie |
| FC Twente | 26 | https://fctwente.nl/teams/eerste-selectie/spelers |

Samen 167 spelers in `public/clubs.js`. Spelling volgt de selectiepagina (bijvoorbeeld PSV's “Matej Kovár” en Ajax' “Marc ter Stegen”). Clubrollen worden als GK, DEF, MID en ATT opgeslagen. Een brede rol past op de bijbehorende formatieplaatsen; er wordt geen officiële voorkeurskant of specialisatie verzonnen. Leeftijd ontbreekt in deze momentopname en wordt als onbekend getoond.

Ratings, conditie, moraal, transferprijzen en wedstrijdprestaties zijn gegenereerde spelwaarden. De automatische basiself, zeven reserves en aanvoerder zijn spelkeuzes. Rugnummers beschrijven de bronselectie en zijn nog geen apart instelbaar onderdeel van een carrière. Transfers en training kunnen je carrière laten afwijken van de momentopname.

De scoutingspool gebruikt nog de oudere CC0-namenlijst uit [openfootball/players](https://github.com/openfootball/players). De game claimt niet dat die spelers momenteel beschikbaar zijn voor een transfer. Namen die al bij een van de zes clubs spelen worden uitgesloten, ook wanneer hun identifier uit een andere dataset komt. Leeftijden in die oudere lijst zijn schattingen op basis van geboortejaar.

## Logo's

De bestanden in `public/assets/clubs/` komen van de clubsites of hun gekoppelde beeldarchief. Ze worden lokaal geladen zodat de game niet voor elk logo een externe verbinding nodig heeft. Het zijn bestaande clubmerken; de rechten blijven bij de betreffende rechthebbenden. Ze vallen niet onder de CC0-licentie van de namenlijst. Touchline is een onafhankelijk prototype zonder officiële clubaffiliatie.

| Bestand | Assetbron |
| --- | --- |
| ajax.svg | https://www.ajax.nl/media/vimnukaa/ajax-klassiek-logo-pms200.svg |
| feyenoord.png | https://dam.feyenoord.nl/m/64e3a60dc7f314a8/Groot_logo-Feyenoord_logo.png |
| psv.svg | https://www.psv.nl/upload/477187f4-cb9b-4e59-87cb-1772a0492446_PSV_logo_color.svg |
| az.svg | https://www.az.nl/assets/toolkit/images/logo-az--fullcolor.svg |
| utrecht.svg | https://www.fcutrecht.nl/assets/toolkit/images/logo-fcu.svg |
| twente.svg | https://fctwente.nl/resources/themes/fctwente/dist/images/logo.svg |

## Bestaande carrières

Versie 4- en 5-saves behouden bij openen hun eigen selectie, transfers, training, opstelling en eventueel lopende wedstrijd. De bestaande migratie voor versie 2/3 blijft beschikbaar. Nieuwe carrières krijgen direct de bronselecties.

Via **Voortgang → Selecties bijwerken** kun je een oudere carrière bewust omzetten. Dat kan alleen buiten een lopende wedstrijd. De vervanging wordt eerst in een kopie voorbereid en gecontroleerd. De huidige carrière wordt als vorige save opgeslagen voordat de nieuwe save wordt geschreven. Als een schrijfactie faalt, blijft de actieve carrière intact.

De clubvolgorde blijft gelijk: uitslagen verwijzen naar die volgorde. Credits, punten, seizoen, uitslagen, laatste wedstrijdverslag, tactiek en gebruikte trainings-/scoutingsbeurt blijven behouden. Spelers, hun spelwaarden, basiself, wisselbank en aanvoerder worden vervangen. Openstaande transferaanbiedingen vervallen. Met **Vorige save terugzetten** kun je de laatste vervanging ongedaan maken. Er wordt één vorige save bewaard; download die als je hem langer wilt bewaren.

## Een latere momentopname onderhouden

Controleer opnieuw alle zes officiële pagina's, werk `public/clubs.js`, de datum, aantallen en deze bronnenlijst bij, en voer `npm.cmd test` uit. Identifiers volgen de genormaliseerde spelersnaam en blijven daardoor gelijk bij een clubwissel; naamvarianten moeten expliciet worden gekoppeld. Test naast nieuwe carrières ook een oude save met een lopende wedstrijd. Een nieuwe databundel mag nooit automatisch gebruikersselecties vervangen.
