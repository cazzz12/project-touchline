# Direct doorspelen — 0.25.0

De lokale preview kon na clubkeuze in een openbare wachtkamer blijven staan: een wereld start pas met minstens twee menselijke managers. De tutorial afronden startte geen seizoen. Daarom biedt een wachtkamer met alleen het eigen account in lokale testmodus nu **Speel nu tegen de computer**.

## Eigen oefenseizoen

De gekozen wereld wordt een eigen oefenwereld. Club, spelers, training, credits en account blijven behouden. Er wordt geen tweede mens nagebootst. Andere managers vinden of betreden deze wereld daarna niet meer. De normale openbare wereldregels blijven voor andere werelden bestaan.

- **Speel wedstrijd** berekent één volledige speeldag. De eigen uitslag verschijnt boven de volgende wedstrijd; ranglijst, verslagen en clubkas worden tegelijk bijgewerkt.
- Bij een rustbeurt blijft **Speel speeldag** beschikbaar. De andere clubs spelen; jouw club ontvangt geen wedstrijdbonus.
- Training gebruikt de bestaande limiet van één sessie per speeldag en kost 1.000 spelcredits. Packs blijven uitsluitend in werelden met packs beschikbaar, volgens de bestaande limieten en kansen.
- Onderlinge biedingen vragen menselijke tegenstanders. De oefenwereld legt dit uit en verwijst naar training/packs. De volledige transfermarkt en live coaching blijven in de aparte lokale carrière.
- Aan het eind opent **Start volgend oefenseizoen** het nieuwe schema met behoud van selectie en clubkas. De eindstand blijft in de historie.

Deze acties zijn uitsluitend beschikbaar wanneer de server in lokale testmodus draait (`dev: true`). De server controleert deelname, één menselijke manager, wereldtype, versie en fase. Een herhaalde opdracht met dezelfde code boekt niet opnieuw. De automatische wereldklok slaat oefenwerelden over, ook na herstart. Nieuwe openbare spelers kunnen niet aansluiten op een begonnen oefenwereld.

## Herladen en profiel

De pagina bewaart de geopende wereld in `?play=<id>`. Herladen opent deze wereld opnieuw, mits het account nog deelneemt. Teruggaan naar Speelwerelden, de wachtkamer verlaten en uitloggen wissen deze verwijzing. Een onbekende verwijzing geeft geen toegang tot een andere wereld.

De profiel-emotiekeuze en de emotieweergave zijn verwijderd. De bestaande opgeslagen `mood` blijft intern behouden voor compatibiliteit; het profiel bewerken stuurt geen nieuw mood-veld. Er is geen database- of saveconversie nodig.

## Controles

**281/281 automatische tests slagen.** Nieuwe regressies controleren lokaal starten, productieblokkade, niet-deelnemers, een tweede manager, verouderde versies, idempotente wedstrijden, training, eigen klok, serviceherstart, seizoenafronding, rustbeurten in de interface, terugkeer uit de tutorial, herladen van de juiste wereld en oude profielen zonder emotiekeuze.

Browsercontrole in een aparte testdatabase: bestaande Ajax-testwereld starten, tactiek bewaren, trainen (120.000 → 119.000), Ajax–Sparta 1–2 spelen (129.000), herladen met dezelfde uitslag. Daarna India kiezen, Bengaluru FC bevestigen, lokaal starten en een rustbeurt afronden zonder wedstrijdbonus (120.000 blijft 120.000). Profiel bewaren zonder emotiekeuze; controle op 390 en 320 pixels zonder horizontale pagina-overloop; packs op 320 pixels. Geen consolefouten in de gecontroleerde tabs. Dit zijn browserformaten, geen fysieke telefoontests.

De gewone preview is na een SQLite-backup herstart. De geopende bestaande wereld wordt na herladen teruggevonden. De eigen Ajax-browsercarrière is alleen bekeken en houdt 27 spelers, 84.666 credits en negen gespeelde wedstrijden. Er is geen wedstrijd voor de gebruiker gespeeld en er zijn geen echte betalingen of publieke hosting ingeschakeld.
