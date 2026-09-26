# Postvak voor de manager

Vanaf versie 0.16.0 bundelt **Postvak** actuele aandachtspunten uit de bestaande carrière. De spelregels voor geld, selecties en wedstrijden veranderen hierdoor niet. Het overzicht en de navigatie tonen hoeveel berichten ongelezen zijn.

## Welke berichten verschijnen?

| Onderwerp | Wanneer en waarheen |
| --- | --- |
| Blessures en schorsingen | Eigen spelers die niet inzetbaar zijn; één groep per soort, met namen en resterende speeldagen. Heeft de basiself of bank zo'n speler, dan staat het bericht bovenaan. Opent Selectie. |
| Contracten | Verlopen contracten en contracten die dit of volgend seizoen eindigen staan in afzonderlijke groepen. Opent Contracten & verkopen. |
| Ontvangen biedingen | Alleen nog open biedingen uit de huidige speeldag. Opent Ontvangen biedingen. |
| Aankoopbiedingen | Een geaccepteerd bod of tegenbod op een speler die nog bij de verkoper speelt. Opent Clubtransfers bij die club, met lege zoekfilters. |
| Clubkas | Een negatief saldo geeft een aandachtspunt met een link naar Financiën. |
| Sponsor | Geen sponsor gekozen, het seizoen loopt nog en er is geen wedstrijd bezig. Opent Sponsors. |
| Trainingsdoelen | Eigen spelers met een actief plan waarvan de doelwaarde werkelijk is gehaald. Opent Spelerontwikkeling bij een van die spelers. |
| Wedstrijd | Er staat een wedstrijd open. Het bericht toont de minuut en pauzestatus; openen start de klok niet. |
| Seizoen | Tien speeldagen afgerond. Opent Overzicht, waar de manager zelf het volgende seizoen kan starten. |

Dit zijn gebeurtenissen en voorwaarden in het spel, geen uitspraken over echte blessures, contracten of transferinteresse. Er verschijnen geen verzonnen nieuwsberichten of oude gebeurtenissen zonder opgeslagen onderbouwing.

## Lezen en beslissen

- Filter op **Alles / Ongelezen** en **Alles / Selectie / Transfers / Clubzaken**. Filters veranderen geen spelgegevens.
- **Markeer deze als gelezen** geldt alleen voor de zichtbare ongelezen berichten. Andere categorieën blijven onaangeraakt.
- Eén bericht kan ook weer ongelezen worden gemarkeerd. Gelezen berichten behouden hun urgentie en zijn onder Alles beschikbaar zolang de situatie geldt.
- De actieknop markeert het bericht als gelezen en opent het juiste scherm. Hij accepteert geen bod, verkoopt geen speler, verlengt geen contract, kiest geen sponsor en hervat geen wedstrijd.
- De bestaande beslisschermen controleren opnieuw of een actie nog geldig is. Een inmiddels verdwenen bericht kan geen oude actie uitvoeren.

## Bewaren en bestaande saves

Het postvak is een afgeleide van de huidige carrière, geen historisch archief. Berichten verdwijnen bijvoorbeeld na herstel, afwijzing van een bod of het kiezen van een sponsor. Een gewijzigde groep blessures of contracten kan opnieuw als ongelezen verschijnen. Alleen het verlopen van wedstrijdminuten maakt een gelezen wedstrijdmelding niet opnieuw ongelezen.

`game.inbox` bevat schema 1 en maximaal 128 unieke leesmarkeringen. Bij wijzigen worden markeringen voor verdwenen berichten opgeruimd. Backups controleren het schema, de limiet en geldige sleutels. De interne saveversie 5 en de bestaande browseropslagsleutel blijven gelijk.

Bij een oudere save wordt alleen een lege lijst met leesmarkeringen toegevoegd. Credits, spelers, uitslagen, contracten en een lopende wedstrijd blijven behouden. Bestaande actuele zaken verschijnen vanzelf; oude afhandeling wordt niet nagebootst.

## Latere online versie

Dit is een lokaal postvak binnen de geopende game. Er zijn geen e-mails, browserpushmeldingen, accounts of externe berichten toegevoegd. In de latere online versie komen de feiten van de server en hoort de leesstatus bij het account. Optionele pushmeldingen zijn een aparte roadmapstap; wallets, packs en betalingen worden niet via dit lokale postvak afgehandeld.
