# Accounts en eerste multiplayer — 0.19.0

Deze versie voegt een afzonderlijke servergestuurde multiplayerproef toe aan het lokale spel. Open **Samen spelen** in het menu, of `/online`. De bestaande lokale carrière blijft op `/` staan. Browser-saves, lokale credits en backups worden niet naar de online economie geïmporteerd.

## Lokaal proberen op Windows

Node.js **24.4 of nieuwer** is vereist voor de ingebouwde SQLite-API; er zijn geen npm-afhankelijkheden. De ontwikkelmachine is gecontroleerd met Node 24.21.0.

1. Stop een oude server met Ctrl+C en start vanuit de projectmap met `npm.cmd start`.
2. Open `http://127.0.0.1:3000/online`.
3. Gebruik bijvoorbeeld `ajax@touchline.test`. Klik **Vraag testcode aan**, voer de getoonde code in en meld je aan.
4. Maak een competitie en kies Ajax. Bewaar de competitiecode.
5. Open een andere browser of een privévenster voor `psv@touchline.test`. Twee gewone tabs delen cookies en zijn dus hetzelfde account. Dezelfde browser uitloggen en wisselen tussen testaccounts kan ook.
6. Vul de code in en kies PSV. De organisator kan nu het seizoen starten.
7. Beide managers kiezen hun elftal en tactiek en klikken **Klaar voor de speeldag**. De laatste gereedmelding verwerkt alle drie wedstrijden één keer.

De standaardserver luistert alleen op `127.0.0.1`. De getoonde testcodes bewijzen geen eigendom van een echte mailbox en werken uitsluitend met adressen die eindigen op `.test`. Dit is geen publieke online release en geen manier om vrienden op internet uit te nodigen. Er worden geen echte e-mails of wallettransacties uitgevoerd door de tests.

## Wat werkt?

- Accounts met eenmalige e-mailcodes, sessies, uitloggen, uitloggen op alle apparaten en managernaam.
- Phantom-aanmelding via een cryptografisch gecontroleerd Solana-bericht. Een wallet en e-mailadres kunnen na een nieuwe bewijsstap aan hetzelfde account worden gekoppeld. Er is geen automatische samenvoeging van bestaande accounts.
- Herstel via een nieuwe e-mailcode voor een gekoppeld adres. Een wallet-only account zonder gekoppelde e-mail kan niet worden hersteld als de wallet verloren gaat.
- Competities met twee tot zes menselijke managers; overige clubs zijn computerclubs. Iedere manager heeft één unieke club per competitie. Maximaal tien competities per account.
- Zes bestaande clubs en echte spelersnamen, handmatige basiself, tien formaties, drie tactiekwaarden en één individuele training per speeldag voor 1.000 spelcredits.
- Tien gezamenlijke speeldagen, dezelfde ranglijst voor alle deelnemers, laatste wedstrijdverslagen, clubkassen, eigen transactielijst en doorstart naar een volgend seizoen. De laatste twintig seizoenseindstanden blijven bewaard.
- Biedingen tussen menselijke managers. De verkoper accepteert of weigert; de koper kan intrekken. Een bod reserveert geen geld. Acceptatie controleert het actuele saldo en verplaatst speler en credits in één database-transactie. Minimaal 18 spelers/twee keepers blijven bij de verkoper; maximaal 40 bij de koper. Een verkochte basisspeler veroorzaakt een nieuw automatisch gekozen elftal bij de verkoper, zodat geen ongeldige spelerreferentie blijft staan.
- Automatisch verversen van competities, versienummers tegen verouderde wijzigingen en herhalen van een onzekere opdracht zonder dubbele verwerking. Een nog onbeantwoorde spelopdracht wordt in tabopslag bewaard voor opnieuw controleren na herladen. Andere ingelogde accounts nemen die opdracht niet over.

## Bewuste grenzen van deze eerste versie

Dit is een aparte, kleinere spelvariant. Wedstrijden worden volledig door de server berekend zodra alle managers klaar zijn. Live coaching, reserves/wissels, aanvoerder, blessures, schorsingen, scouting, sponsors, stadion en andere uitgebreide carrièresystemen zijn nog niet allemaal naar multiplayer overgezet. De lokale versie behoudt die functies. Het bestaan van de serverproef betekent dus niet dat de volledige offline game al online is.

Deelnemers liggen na de start vast. Er is nog geen deadline, vervangende manager, lobbybeheer met verwijderen/verlaten of afhandeling van een langdurig afwezige organisator. De competitie wacht dan. Deze regels moeten vóór een publieke test worden uitgewerkt. Eigen clubs, aparte sociale vriendenlijsten, openbare matchmaking en pushmeldingen ontbreken nog. De huidige competitiecode geeft toegang tot een lobby met echte clubs; dit is niet de toekomstige privéruimte met eigen clubs.

De economie is een testmodel: een startbudget van 120.000 spelcredits, wedstrijdbonussen van 26.000/18.000/10.000 bij winst/gelijk/verlies en eenvoudige individuele training. Geen betalingen, packs, verhandelbare waarde of rewards. De browser stuurt nooit een nieuw saldo, spelersobject of wedstrijduitslag naar de server.

## Opslag, herstart en backup

De database staat standaard in `data/touchline.sqlite`, buiten `public`. SQLite-transacties, WAL en volledige synchronisatie bewaren accounts, identiteiten, sessies, limieten, competities en verwerkte opdrachtcodes. Een herstart behoudt dezelfde gegevens. Schemawijzigingen gebruiken `PRAGMA user_version`; een onbekende nieuwere versie wordt geweigerd.

Maak een consistente backup, ook terwijl de server draait:

```powershell
npm.cmd run backup:db
```

Er verschijnt een nieuw bestand onder `backups`. Een bestaand doel wordt nooit overschreven. Bewaar databasebackups privé; ze bevatten accounts en sessiegegevens. Ze horen niet in GitHub. `.gitignore` sluit databases, backups en omgevingsbestanden uit.

Herstel zonder de huidige database te overschrijven: stop de server, kopieer een gekozen backup naar een **nieuwe** bestandsnaam, wijs `TOUCHLINE_DB` daarnaar en start opnieuw. Bijvoorbeeld, met jouw werkelijk aangemaakte backupnaam:

```powershell
# Kies een nog niet bestaande doelnaam; Copy-Item zonder Force is op zichzelf geen overschrijfbeveiliging.
if (Test-Path -LiteralPath '.\data\herstel.sqlite') { throw 'Kies een nieuwe doelnaam.' }
Copy-Item -LiteralPath '.\backups\jouw-backup.sqlite' -Destination '.\data\herstel.sqlite'
$env:TOUCHLINE_DB = (Resolve-Path -LiteralPath '.\data\herstel.sqlite').Path
npm.cmd start
```

De vorige database blijft bewaard. Herstel kan eerdere sessies terugbrengen; laat accounts daarna opnieuw inloggen en gebruik **Uitloggen op alle apparaten** wanneer sessie-intrekking nodig is. Automatische backupplanning, versleutelde offsite-opslag en beheerdersherstel zijn nog niet ingericht.

## Echte e-mail en bereikbaarheid

De code bevat een Resend-transport. Voor een externe test moeten eerst een hostingomgeving, HTTPS-domein en geverifieerde afzender worden ingericht. Vereiste omgevingsvariabelen:

| Variabele | Betekenis |
| --- | --- |
| `TOUCHLINE_AUTH_MODE=production` | Echte e-mail gebruiken; geen testcodes in antwoorden |
| `TOUCHLINE_ORIGIN` | Exacte HTTPS-oorsprong, bijvoorbeeld `https://game.example.com`, zonder afsluitende slash |
| `RESEND_API_KEY` | Geheim voor de maildienst, alleen op de server |
| `TOUCHLINE_EMAIL_FROM` | Geverifieerde afzender van de maildienst |
| `HOST`, `PORT` | Luisteradres achter de gekozen HTTPS-proxy; standaard 127.0.0.1:3000 |
| `TOUCHLINE_DB` | Duurzaam databasepad, behouden tussen deployments |

De proxy moet de oorspronkelijke `Host` behouden. Er wordt niet op willekeurige doorgestuurde IP-headers vertrouwd; achter één proxy deelt verkeer zonder verdere inrichting een IP-limiet. Configureer dit gericht voor de gekozen hostingopzet. Productiemodus weigert te starten zonder HTTPS-oorsprong en mailconfiguratie. Testmodus weigert een niet-lokaal luisteradres. Een typfout of ontbrekende productiemodus is dus geen route om testcodes publiek beschikbaar te maken.

Er is nog geen hosting, domein, geverifieerde afzender of echte mailtest ingericht. Geen kosten of publieke toegang zijn geactiveerd. De cryptografische walletflow is automatisch getest met tijdelijke sleutels; de interactie met een echte Phantom-wallet moet nog op een geschikt toestel/browser worden beproefd. De ingebouwde browser heeft geen Phantom-provider. Mobiele walletadapters en Solana dApp Store-publicatie zijn afzonderlijke latere stappen.

## Beveiliging en verificatie

Inlogcodes verlopen na tien minuten, zijn aan de aanvragende browser gebonden en laten maximaal vijf verificatiepogingen toe. Codes worden als HMAC opgeslagen; sessietokens als hashes. Walletberichten binden domein, URI, adres, nonce, vervaltijd en eventuele accountkoppeling. Bewijs is eenmalig. Koppelen vraagt een sessie van minder dan vijftien minuten oud. Sessies duren maximaal zeven dagen en kunnen worden ingetrokken.

Mutaties vragen dezelfde oorsprong, JSON, een sessie en een CSRF-token. Cookies zijn HttpOnly/SameSite=Strict, met Secure in productie. Requests hebben een limiet van 16 KB. Database-limieten remmen aanmeldpogingen en spelacties; die blijven bestaan na herstart. Accountidentiteiten worden alleen aan de eigenaar getoond. Iedere competitieactie controleert lidmaatschap, clubbezit, spelregels en versienummer. SQL gebruikt parameters. Transacties draaien zonder async-werk binnen de transactie.

Deze maatregelen zijn een basis, geen afgeronde productiebeveiliging of onafhankelijke securityaudit. Opschonen van oude opdrachten, databasegroei, schaaltests, privacybeheer, accountexport/verwijdering, monitoring en operationeel beheer staan nog open. SQLite is hier bedoeld voor één kleine server; horizontaal schalen vraagt extra ontwerp.

Automatische tests gebruiken afzonderlijke databases en accounts. Ze controleren onder andere gelijktijdige clubclaims, identiteitskoppeling, cryptografische handtekeningen, verlopen codes/sessies, CSRF, overspending, eenmalige afrekening, terugdraaien bij fouten, tien speeldagen, seizoensovergang, backup en herstart. Browsercontrole gebruikt een aparte oorsprong en testdatabase; de gebruikerscarrière wordt niet als testfixture gebruikt.

Implementatiebronnen: [Node SQLite](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html), [Phantom-berichtondertekening](https://docs.phantom.com/solana/signing-a-message) en [Resend-verzend-API](https://resend.com/docs/api-reference/emails/send-email), geraadpleegd op 26 september 2026.
