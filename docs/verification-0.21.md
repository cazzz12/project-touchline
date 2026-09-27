# Verificatie 0.21.0 — 27 september 2026

## Automatisch

`node --test` op Node 24.21.0: **269 geslaagd, nul mislukt**. De nieuwe controles omvatten matchmaking, vrije/gelijktijdige clubclaims, regio- en spelregelscheiding, verlaten vóór start, deadlines, inhalen na uitval, nieuwe seizoenen, ongewijzigde codecompetities, packkansen, duplicatebescherming, eenmalige afschrijving en levering, rollback, ongeldige betaalvelden, oude database-upgrades, beide walletproviders en HTTP-autorisatie/CSRF. De interface herlaadt de vrije plekken bij een claimconflict.

## Browserproef

Chromium in de Codex-browser, met een afzonderlijke testserver en SQLite-database:

- Twee testaccounts melden aan via een e-mailtestcode. Ajax maakt een Eredivisie-wereld, PSV vindt dezelfde wereld zonder uitnodigingscode. Ajax is daar zichtbaar bezet.
- De wereld start automatisch na de lobbydeadline. Alleen de testklok is versneld; de echte spelregels blijven dertig minuten/24 uur.
- Scout Pack levert Carlos Protesoni; Spotlight Pack levert Moxmet Nebijan. Dit zijn de werkelijk willekeurig getrokken resultaten, niet speciaal gekozen voorbeeldkaarten. Selectie groeit van dertig naar 32; 120.000 credits worden 108.000 en daarna 78.000. Beide packknoppen blokkeren bij twee packs.
- Formatie 4-4-2 wordt opgeslagen. Een manager meldt gereed, de ander blijft afwezig. De deadline levert negen wedstrijden en één wedstrijdbonus; PSV wint bij FC Twente en krijgt 26.000 credits, saldo 104.000.
- Herladen en een echte herstart van de testserver behouden de volledige zichtbare competitietekst exact, inclusief ranglijst, uitslagen en geldstromen. De twee spelers en packhistorie blijven aanwezig. De nieuwe speeldag heeft opnieuw twee packplaatsen.
- Login, opstelling, competitie, transfers en packs gecontroleerd op smalle schermen (320 en 390 pixels). Geen horizontale pagina-overloop; brede tabellen mogen binnen hun eigen container scrollen. Desktoplogin ook visueel gecontroleerd. Geen consolewaarschuwingen/fouten in de testtab.

De test gebruikt geen echte wallet of e-mailbezorging. Native mobiele wallets, echte telefoons, aankopen, externe hosting, hoge belasting en economische balans zijn hiermee niet bewezen.

## Bestaande gegevens

Vóór de update is een privébackup van de serverdatabase gemaakt. Schema 2 wordt 3; alle negen bestaande tabellen zijn vóór en na de migratie per inhoudshash vergeleken en identiek. Alleen de nieuwe lege wereldtabel is toegevoegd.

De bestaande lokale Ajax-carrière is uitsluitend bekeken. Op `/career` zijn zowel het overzicht als de carrièrehistorie tekstueel identiek aan vóór de herstart: seizoen 1, negen gespeelde wedstrijden, 27 spelers en 84.666 credits. Er is geen wedstrijd gespeeld of selectie vervangen.

Bewijsbeelden zijn lokaal opgeslagen buiten de repository: `outputs/touchline-v21-login.png` en `outputs/touchline-v21-mobile.png`. Testaccounts en databases worden niet meegepubliceerd.
