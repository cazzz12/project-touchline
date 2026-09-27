# Computercoach — 0.18.0

Bij een nieuw gestarte wedstrijd krijgt jouw computertegenstander een vaste bank van maximaal zeven inzetbare reserves. De basiself gebruikt de bestaande 4-3-3-selectie. Bij een lichte tik zoekt de coach op dezelfde minuut een passende, fittere vervanger. De wissel telt vanaf de volgende minuut, zonder de klok te pauzeren. Eigen blessures en rode kaarten behouden hun bestaande coachpauze.

Er zijn maximaal drie wissels. De keeper wordt alleen door een keeper vervangen. Voor een veldpositie kiest de coach een passende veldspeler; rolgeschiktheid gaat voor kwaliteit en conditie. Een geblesseerde, geschorste, al gebruikte of niet op de oorspronkelijke bank ingeschreven speler komt niet in aanmerking. Zonder geschikte vervanger speelt de geblesseerde speler door met de bestaande conditieaftrek. Een rode kaart levert nooit een vervangende speler op.

De tijdlijn en het blok **Wissels tegenstander** tonen minuut, vertrekkende speler, reserve en reden. Het eindverslag bewaart dezelfde gegevens. Gespeelde minuten, keeperminuten, conditieverlies en carrièrestatistieken volgen de echte deelname. De geblesseerde speler mist nog steeds de volgende speeldag; wisselen verkort zijn herstel niet.

De bank, wissels en minutentelling worden samen opgeslagen. Herladen herhaalt geen wissel. Backupcontrole reconstrueert deelname uit de basiself, wissels en rode kaarten en wijst tegenstrijdige minuten af. Keeperacties van vóór een keeperwissel blijven geldig. Historische verslagen bewaren spelersnamen, ook na latere transfers.

Een al lopende wedstrijd zonder `opponentCoach` behoudt de oude regels. Er komt geen bank achteraf bij en de uitkomst wordt niet opnieuw berekend. Het saveformaat en de bestaande opslagsleutel blijven gelijk.

Dit is de coach van de computerclub in jouw livewedstrijd. De overige twee wedstrijden van een speeldag gebruiken nog hun bestaande volledige simulatie. Scoregestuurde tactiek, geplande vermoeidheidswissels voor de computer en zware blessures met gedwongen uitval blijven toekomstige uitbreidingen.
