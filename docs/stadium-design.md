# Floodlights — de Touchline-stadionstijl (0.22.0)

De volledige interface gebruikt dezelfde voetbalwereld: een nachtelijk stadion achter de app, helder gras op de tactische borden, diepblauwe panelen, turquoise lichtaccenten en zachte gouden details. Login, clubhuis, carrière, elftal, training, transfers, clubzaken, wedstrijdvensters, packs en wereldcatalogus delen `public/stadium-theme.css`. Bestaande spelregels, bronratings en saveformaat zijn niet veranderd.

## Direct naar het clubhuis

In lokale testmodus staat bovenaan de login **Direct naar het clubhuis**. De knop meldt aan met `preview@touchline.test` via de bestaande browsergebonden challenge en codeverificatie. Er is geen nieuw onbeveiligd aanmeldendpoint. Een geldige bestaande sessie blijft bestaan. De gewone testaccountflow zit onder **Of gebruik een eigen testaccount**.

De knop verschijnt niet in productie en de helper weigert een niet-lokale sessiemodus. De server blijft voor testmodus alleen loopback toelaten en accepteert geen echte e-mailadressen. Het proefaccount deelt servervoortgang op deze lokale installatie; de lokale browsercarrière blijft afzonderlijk op `/career`.

## Typografie en beelden

Koppen en scores gebruiken **Barlow Condensed Bold**, doorlopende tekst en formulieren **Barlow Regular/SemiBold**. Smalle, stevige koppen geven een voetbaluitzending-gevoel; gewone tekst blijft ruimer en beter leesbaar. Dit is een ontwerpkeuze, geen claim dat de voorkeur van alle spelers is onderzocht.

De bestanden komen uit [Google Fonts Barlow](https://github.com/google/fonts/tree/main/ofl/barlow) en [Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed), onder de meegeleverde SIL Open Font License. Ze staan in `public/assets/fonts/`, zodat de interface geen Google Fonts-verzoek nodig heeft. Font-display swap houdt de tekst zichtbaar tijdens laden. Afbeeldingen en fonts worden een dag lokaal gecachet; schermcode en stijlen blijven herladen bij wijzigingen.

De bestaande stadionachtergrond is aangevuld met een origineel tunnelbeeld. Panelen, veldstrepen, grasstructuur, packkaarten en lichteffecten worden met CSS getekend. Beelden zijn decoratief; instructies en spelinformatie staan als echte tekst in de pagina. De [assetlijst en prompts](artwork.md) leggen de herkomst vast.

## Mobiel en toegankelijkheid

Op telefoons wordt het carrièremenu een horizontale balk met tekstlabels. Online competities houden hun vaste ondermenu. Invoervelden gebruiken minimaal 16-pixeltekst en acties doorgaans minstens 46 pixels hoogte. Tabellen scrollen binnen hun eigen vak. Lange paginakoppen en clubkas kunnen onder elkaar staan. Vorm en tekstlabels ondersteunen kleurverschillen. Toetsenbordfocus en vermindering van beweging blijven aanwezig.

## Verificatie

De volledige automatische suite slaagt: **270 tests**. De nieuwe test bewijst dat snelle toegang de gewone codeverificatie gebruikt, een bestaande account ongemoeid laat en geen productieaanmelding omzeilt. Na de laatste assetcachewijziging slagen ook de 24 gerichte account-/interface-/HTTP-controles, inclusief fonttype en caching.

De twaalf carrièremenu's zijn via de browser geopend op desktop en telefoon. Bij 390 pixels is de te brede kop van Voorbeschouwing gecorrigeerd; bij 320 pixels is de trainingsindeling smaller gemaakt. De bestaande Ajax-carrière is uitsluitend bekeken, met behoud van 84.666 credits, 27 spelers en negen gespeelde wedstrijden. Verdere schermproeven gebruiken een aparte database en localhost-oorsprong, zodat hun cookies en saves losstaan van de gebruiker.

Ook online competitie, elftal, transfers en packs zijn op 320 pixels geopend. De wereldcatalogus, Ajax-selectie en het profiel van Steven Berghuis passen binnen dezelfde schermbreedte. In een afzonderlijke testcarrière is het gepauzeerde wedstrijdvenster geopend en na herladen hervat. De lange statistieknaam Passnauwkeurigheid houdt nu ruimte tussen beide scores. Snelle toegang is in de echte lokale preview gebruikt; die opent het clubhuis zonder code over te typen.

Een browser op telefoonformaat is geen bewijs voor alle fysieke telefoons of mobiele wallets. Echte toesteltests blijven op de roadmap staan. USDC/SOL-betalingen blijven uitgeschakeld.
