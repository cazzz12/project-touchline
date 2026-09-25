# Project Touchline

## Online Football Management × Solana

### 1. Visie

Project Touchline wordt een persistent online voetbalmanagementspel waarin iedere gebruiker een eigen fictieve voetbalclub opricht en deze over vele seizoenen uitbouwt.

De speler is tegelijk:

- manager;
- technisch directeur;
- scout;
- jeugdopleider;
- clubeigenaar.

Het spel combineert de dagelijkse toegankelijkheid van een mobiele managergame met veel diepere systemen rond tactiek, scouting, transfers, spelersontwikkeling, financiën, stadionontwikkeling en multiplayer.

Solana is geen gimmick boven op het spel. Blockchain wordt alleen gebruikt waar het daadwerkelijk voordeel biedt:

- wallet-identiteit;
- betalingen;
- aantoonbaar eigendom;
- zeldzame collectibles;
- marketplace-transacties;
- controleerbare rewards;
- wedstrijd-/seizoenintegriteit;
- SOL-prijzen.

Het uitgangspunt is:

**Eerst moet Touchline een uitstekende voetbalmanager zijn. Daarna pas een uitstekende Solana-game.**

---

# 2. De vier belangrijkste ontwerpprincipes

## Skill boven geld

Een manager met veel SOL mag nooit automatisch de beste zijn.

Een sterk team helpt uiteraard, maar tactieken, scouting, training, selectiebeheer, vermoeidheid, moraal en tegenstanderanalyse moeten wedstrijden kunnen beslissen.

Daarom scheiden we:

**rarity ≠ football strength**

Een Legendary-kaart kan extreem zeldzaam zijn zonder automatisch een 95-rated speler te zijn.

---

## Persistent club ownership

Je begint niet ieder seizoen opnieuw.

Je houdt:

- club;
- stadion;
- academy;
- staff;
- spelers;
- managerniveau;
- historie;
- records;
- trophies;
- cosmetics;
- collectibles.

Een gebruiker kan daardoor twee jaar later nog steeds dezelfde club hebben.

---

## Economie moet duurzaam zijn

Rewards komen niet uit het niets.

Er ontstaat een treasury waarin inkomsten binnenkomen uit bijvoorbeeld:

- packs;
- cosmetics;
- marketplace fees;
- club customization;
- premium competitions;
- sponsorships.

Een vooraf bepaald gedeelte kan vervolgens naar prize pools gaan.

---

## Blockchain alleen waar zinvol

Een tackle of training hoeft geen Solana-transactie te worden.

Dat zou traag, ingewikkeld en onnodig zijn.

De eigenlijke game draait grotendeels server-side. Alleen settlement, ownership en bepaalde bewijsstukken komen on-chain.

---

# 3. Account en onboarding

Nieuwe gebruiker:

**Start Game → kies clubnaam → ontwerp badge → kies stad/regio → krijg starter squad**

Wallet hoeft niet onmiddellijk verplicht te zijn.

Een speler kan eerst kennismaken met het spel.

Pas wanneer iemand bijvoorbeeld:

- SOL wil ontvangen;
- een pack met SOL koopt;
- een collectible ontvangt;
- iets verkoopt;

verschijnt:

**Connect Wallet**

Dat verlaagt de onboardingbarrière enorm.

Voor Android kunnen we Mobile Wallet Adapter gebruiken, waarvoor Solana Mobile actuele React Native- en Anchor-integratie documenteert.

De wallet blijft non-custodial.

**Wij bewaren nooit private keys.**

---

# 4. Club creation

Iedere manager kiest:

**Club Name**

Bijvoorbeeld:

Amsterdam Athletic

**Club Code**

AMS

**Club Colors**

Hoofdkleur + secundaire kleur.

**Badge**

Editor met:

- vorm;
- icoon;
- kleuren;
- patroon;
- initialen.

**Home Kit / Away Kit**

Later kunnen premium skins en limited kits worden toegevoegd.

---

# 5. Managerprofiel

Iedere gebruiker krijgt een permanente manageridentiteit.

Voorbeeld:

**Manager: Koen**

Level 42
Club: Amsterdam Athletic
Seasons: 9
Matches: 286
Wins: 174
Draws: 51
Losses: 61
Win Rate: 60,8%

League Titles: 3
Cups: 2
Continental Cups: 1
Highest Division: Elite II

Daarnaast:

**Trophy Cabinet**

Hier komen zowel normale trophies als bepaalde on-chain commemorative collectibles.

Bijvoorbeeld:

**Season 1 Founder**

of:

**2027 Champions Cup Winner #1/1**

---

# 6. Club Reputation

Je club krijgt een aparte reputatiewaarde.

Voorbeeld:

`Club Reputation: 1.842`

Reputatie bepaalt onder andere:

- aantrekkelijkheid voor spelers;
- beschikbare sponsors;
- kwaliteit scouts;
- wedstrijdinkomsten;
- toegang tot bepaalde toernooien;
- fanbase;
- commerciële mogelijkheden.

Reputatie kan niet simpelweg gekocht worden.

Je moet hem verdienen.

---

# 7. Competitiestructuur

De normale ladder:

Bronze IV
Bronze III
Bronze II
Bronze I

Silver IV → I

Gold IV → I

Platinum IV → I

Diamond IV → I

Elite III
Elite II
Elite I

Daarboven kan later een:

**World League**

komen voor de beste managers.

Iedere league bevat bijvoorbeeld 16 echte managers.

Iedereen speelt thuis en uit.

Per seizoen:

Top 3 → promotie
Bottom 3 → degradatie

Daarnaast:

- League Cup;
- Continental Cup;
- Champions Cup;
- World Championship;
- Invitational tournaments.

---

# 8. Seizoenen

Een seizoen moet kort genoeg zijn om progressie te voelen, maar lang genoeg om rivaliteit te creëren.

Iedere speeldag bevat bijvoorbeeld één competitiewedstrijd.

Tussendoor kunnen plaatsvinden:

- bekerwedstrijden;
- vriendschappelijke wedstrijden;
- training;
- scouting;
- transfers.

Na afloop worden:

- kampioenen bepaald;
- promoties uitgevoerd;
- degradaties uitgevoerd;
- rewards uitgekeerd;
- records opgeslagen;
- trophies toegekend.

Daarna start een nieuw seizoen.

Je club zelf blijft bestaan.

---

# 9. Spelersmodel

Iedere speler bestaat uit veel meer dan een overall rating.

## Basisdata

Naam
Leeftijd
Lengte
Voet
Positie
Secundaire positie
Regio/nationaliteit
Contract
Salaris
Marktwaarde
Vorm
Fitness
Moraal
Reputatie

---

# 10. Technische attributes

Voor veldspelers bijvoorbeeld:

Finishing
Long Shots
Passing
Crossing
Dribbling
First Touch
Technique
Set Pieces
Heading

---

# 11. Mentale attributes

Vision
Composure
Positioning
Anticipation
Decision Making
Aggression
Work Rate
Leadership
Concentration
Creativity

---

# 12. Fysieke attributes

Acceleration
Sprint Speed
Strength
Stamina
Agility
Balance
Jumping
Natural Fitness

---

# 13. Verdedigende attributes

Marking
Tackling
Interceptions
Defensive Positioning
Aerial Defending

---

# 14. Keeper attributes

Reflexes
Handling
Positioning
One-on-One
Distribution
Aerial Ability
Command of Area
Kicking

---

# 15. Hidden attributes

Niet iedere waarde wordt volledig aan de manager getoond.

Bijvoorbeeld:

Potential
Consistency
Injury Proneness
Professionalism
Pressure Handling
Adaptability
Big Match Personality

Scouting onthult deze eigenschappen geleidelijk.

---

# 16. Potential

Speler:

**J. Navarro**

Age: 17
OVR: 63

Eerste scouting:

`Potential: 73–91`

Tweede scouting:

`Potential: 82–90`

Top scout:

`Potential: 86–89`

Daardoor bestaat onzekerheid zoals bij echt scoutingwerk.

---

# 17. Dynamic potential

Potential is niet volledig statisch.

Een speler die:

- regelmatig speelt;
- goed traint;
- goede coaches heeft;
- hoge moraal heeft;
- weinig blessures heeft;

kan iets beter ontwikkelen.

Een speler die jarenlang niet speelt kan juist stagneren.

---

# 18. Player traits

Speciale eigenschappen:

**Clinical Finisher**

Verhoogde efficiëntie bij goede kansen.

**Playmaker**

Zoekt vaker progressieve passes.

**Engine**

Verliest minder stamina.

**Big Game Player**

Kleine composurebonus in finales.

**Injury Prone**

Grotere kans op blessures.

**One Club Man**

Grotere loyaliteit.

**Hot Head**

Meer kaarten.

Traits maken spelers uniek.

---

# 19. Leeftijdscurve

Een speler ontwikkelt ongeveer:

15–18 → snelle ontwikkeling
19–23 → ontwikkeling
24–28 → peak
29–31 → stabiel
32+ → geleidelijke decline

Maar iedere speler heeft een andere curve.

Daardoor kunnen uitzonderingen bestaan zoals late bloomers.

---

# 20. Squad management

Iedere club heeft bijvoorbeeld:

25 eerste-teamspelers.

Je kiest:

Starting XI
Bench
Reserves

Daarnaast:

Captain
Vice Captain
Penalty Taker
Free Kick Taker
Corners Left
Corners Right

---

# 21. Posities

GK

RB
RWB
CB
LB
LWB

CDM
CM
CAM

RM
LM
RW
LW

CF
ST

Spelers kunnen meerdere posities leren.

---

# 22. Formaties

Onder andere:

4-4-2
4-3-3
4-2-3-1
4-1-4-1
4-3-2-1
4-2-2-2
3-4-3
3-5-2
5-3-2
5-2-3

Later kunnen custom positional structures komen.

---

# 23. Tactieken

Een tactiek bevat bijvoorbeeld:

### Mentality

Ultra Defensive
Defensive
Balanced
Attacking
Ultra Attacking

### Tempo

0–100

### Width

0–100

### Defensive Line

0–100

### Pressing

0–100

### Passing

Short
Mixed
Direct

### Build-up

Slow
Balanced
Fast

### Chance creation

Possession
Balanced
Direct

### Defensive style

Low Block
Mid Block
High Press
Gegenpress

### Marking

Zonal
Man-to-Man
Hybrid

---

# 24. Player instructions

Voorbeeld linksback:

Join Attack
Balanced
Stay Back

Voor spits:

Target Man
False 9
Poacher
Complete Forward
Pressing Forward

Voor middenvelder:

Deep Playmaker
Box-to-Box
Ball Winner
Mezzala
Advanced Playmaker

Hierdoor heeft dezelfde formatie totaal verschillende speelstijlen.

---

# 25. Tactical familiarity

Een team dat iedere wedstrijd compleet van tactiek verandert krijgt een nadeel.

Spelers bouwen familiarity op voor:

- formatie;
- positie;
- rol;
- pressing;
- teamstijl.

Daardoor loont een voetbalfilosofie.

---

# 26. Team Chemistry

Chemistry bestaat uit meerdere factoren:

- hoeveel wedstrijden samen;
- tactische familiariteit;
- moraal;
- spelerrelaties;
- managervertrouwen;
- roltevredenheid.

Geen simplistisch groen lijntje omdat twee spelers dezelfde nationaliteit hebben.

---

# 27. Training

Iedere dag stel je trainingsfocus in.

Bijvoorbeeld:

Recovery
Fitness
Tactics
Finishing
Defending
Possession
Set Pieces
Individual Development

Te zwaar trainen:

- ontwikkeling
- fitnessverbetering

maar:

- fatigue
- blessurerisico

Managers moeten dus keuzes maken.

---

# 28. Individual development

Voorbeeld:

**17-jarige RW**

Focus:

Dribbling

Extra focus:

Weak Foot

Nieuwe rol:

Inside Forward

Met een goede jeugdcoach kan ontwikkeling sneller verlopen.

---

# 29. Fitness

Iedere speler heeft:

Condition
Match Sharpness
Fatigue

Een sterspeler iedere wedstrijd 90 minuten laten spelen heeft gevolgen.

Managers moeten rouleren.

---

# 30. Blessures

Voorbeelden:

Knock
Hamstring strain
Ankle injury
Muscle injury
Major injury

Medische faciliteiten en staff kunnen:

- risico verminderen;
- diagnose verbeteren;
- herstel versnellen.

---

# 31. Moraal

Moraal wordt beïnvloed door:

- speeltijd;
- resultaten;
- contract;
- teamrol;
- captain;
- transfers;
- beloften;
- managerbeslissingen.

Een unhappy ster kan dus slechter gaan spelen.

---

# 32. Contracts

Contract bevat:

Salary
Contract Length
Signing Bonus
Appearance Bonus
Goal Bonus
Clean Sheet Bonus
Release Clause

Later kunnen spelers onderhandelen.

---

# 33. Transfermarkt

Managers kunnen spelers:

kopen
verkopen
veilen
lenen
verhuren

Marketplace listing:

**J. Navarro**

Age 22
OVR 81
Potential 84

Asking price:

18.000.000 Credits

Je kunt bieden:

`15.000.000`

of:

`12.000.000 + speler`

Later kunnen clauses worden toegevoegd.

---

# 34. NPC transfermarkt

We hebben ook systeemclubs nodig.

Anders ontstaan onvoldoende spelers.

NPC-markt genereert en koopt spelers volgens een dynamisch economisch model.

Hierdoor bestaan:

- player sinks;
- nieuwe spelers;
- marktliquiditeit.

---

# 35. Scouting

Je bouwt een scoutingnetwerk.

Regio's:

Northern Europe
Southern Europe
Eastern Europe
South America
North America
Africa
Asia
Oceania

Scout opdracht:

**Brazil — Wonderkids — 12h**

Resultaat:

6 gevonden spelers.

De manager kiest welke verder onderzocht worden.

---

# 36. Scout specialiteiten

Een scout kan goed zijn in:

Potential Judgement
Current Ability
South America
Young Players
Defenders
Analytics

Hierdoor bouw je een complete scoutingafdeling.

---

# 37. Youth Academy

Een van de belangrijkste langetermijnsystemen.

Academy Level:

1 → 10

Upgrades:

Youth Coaching
Facilities
Recruitment
Accommodation
Sports Science
Education

Periodiek verschijnen academy-spelers.

Bijvoorbeeld:

**Mateo Reyes**

Age: 16
CAM
OVR: 58
Potential: 89–94

Zo'n vondst moet een enorm moment voelen.

---

# 38. Regen-spelers

Omdat alle spelers fictief zijn, kunnen we een enorme procedurally generated voetbalwereld creëren.

Iedere gegenereerde speler krijgt:

- uniek ID;
- naam;
- attributes;
- development curve;
- personality;
- face/avatar seed;
- career history.

Zo kan de wereld onbeperkt doorgroeien.

---

# 39. Staff

Je club kan personeel aannemen.

Head Coach
Assistant Manager
Attack Coach
Defence Coach
Goalkeeper Coach
Fitness Coach
Youth Coach
Scout
Chief Scout
Doctor
Physio
Data Analyst

Iedere medewerker heeft eigenschappen.

---

# 40. Data Analyst

Een interessante functie vóór wedstrijden.

Voorbeeldrapport:

**Opponent Analysis**

72% van hun aanvallen loopt via rechts.

Hun LB heeft:

Stamina 61

Ze gebruiken in 8 van hun laatste 10 wedstrijden:

4-3-3 High Press.

Hun tegengoals ontstaan vooral via counters.

Daarmee kan de manager bewust zijn tactiek aanpassen.

---

# 41. Stadion

Stadium Level 1 → 20

Upgrades:

Capacity
VIP Area
Hospitality
Club Shop
Training Complex
Medical Center
Academy
Data Center

Meer capaciteit betekent meer wedstrijddaginkomsten, maar onderhoud stijgt ook.

---

# 42. Club finances

Iedere club heeft een echte boekhouding.

Income:

Tickets
Sponsorship
Prize Money
Transfers
Merchandise

Expenses:

Wages
Transfers
Staff
Facilities
Scouting
Maintenance

Managers kunnen dus financieel wanbeleid voeren.

Een club kan rijk zijn maar een slechte selectie hebben, of andersom.

---

# 43. Sponsorships

Sponsors geven objectives.

Bijvoorbeeld:

**SolPay**

Base:

1.5M Credits

Bonus:

Finish Top 4 → +500k

Reach Cup Quarterfinal → +250k

Andere sponsor:

lagere base maar hogere performance bonuses.

---

# 44. Match engine

Dit is het belangrijkste technische onderdeel van het hele spel.

Geen simpele:

`Team Rating A > Team Rating B = A wint`

De wedstrijd wordt opgebouwd uit possessions.

Iedere possession gaat bijvoorbeeld door:

Recovery
Build-up
Progression
Final Third
Chance Creation
Shot
Outcome

Iedere stap gebruikt:

- relevante attributes;
- tactiek;
- posities;
- fatigue;
- morale;
- chemistry;
- match state;
- opponent positioning;
- gecontroleerde random variance.

---

# 45. Voorbeeld matchberekening

Een winger probeert zijn verdediger voorbij te gaan.

Engine vergelijkt onder andere:

Attacker:

Dribbling
Acceleration
Technique
Decision Making

tegen:

Defender:

Positioning
Tackling
Acceleration
Anticipation

Daarbovenop:

Fatigue
Morale
Tactical Support
Home Modifier
Match randomness

Daaruit volgt:

Successful dribble
Loss of possession
Foul
Pass backwards
Cross opportunity

---

# 46. Kansmodel

Intern kunnen we kansen modelleren met een sigmoid/logistic functie in plaats van eenvoudige lineaire percentages.

Conceptueel:

`P(success) = sigmoid(skill advantage + tactical modifiers + context + variance)`

Daardoor geeft 90 dribbling geen gegarandeerd succes tegen 70 tackling.

Dat voorkomt voorspelbare exploits.

---

# 47. Expected Goals

Iedere kans krijgt intern een xG.

Bijvoorbeeld:

Penalty:

0.76 xG

Open play vanaf 25 meter:

0.04 xG

1-op-1:

0.38 xG

Hierdoor kunnen we achteraf uitstekende analytics genereren.

---

# 48. Live match

De wedstrijd speelt realtime of versneld af.

Voorbeeld:

**62'**

Navarro verovert de bal.

**63'**

Diaz stuurt Reyes diep.

**63'**

Reyes staat één-op-één.

**64'**

GOAL!

Amsterdam Athletic 2–1 Rotterdam City

Daaronder:

Possession
Shots
xG
Pass Accuracy
Duels Won

---

# 49. Live management

Tijdens een wedstrijd kan de manager ingrijpen:

Formation Change
Substitution
Mentality
Pressing
Tempo
Defensive Line

Dat moet voordelen hebben maar geen constant micro-management vereisen.

---

# 50. Offline managers

Wedstrijden moeten ook doorgaan als iemand slaapt.

De manager kan daarom vooraf instellen:

**Auto Instructions**

Bijvoorbeeld:

If winning after 75':

Defensive mentality

If player fitness <60:

substitute

If losing after 70':

switch 4-2-3-1

Dat is ideaal voor een wereldwijde game.

---

# 51. Match integrity

Interessant gebruik van blockchain:

We zetten niet iedere matchactie on-chain.

In plaats daarvan maken we na iedere speelronde een cryptografische batch van:

- match ID;
- match seed commitment;
- score;
- belangrijke matchdata;
- resultaat.

Daarvan maken we een Merkle root.

Die root kan periodiek op Solana worden vastgelegd.

Daardoor kan later bewezen worden dat wij resultaten niet achteraf hebben aangepast.

Dat is daadwerkelijk nuttig blockchaingebruik.

---

# 52. Match replay

Iedere match krijgt een deterministische replay-log.

Dus:

zelfde match seed + dezelfde inputs = dezelfde replay.

Hiermee kunnen:

- bugs worden onderzocht;
- verdachte wedstrijden worden bekeken;
- highlights opnieuw worden afgespeeld.

---

# 53. Packs

Packs kunnen centrale engagementitems worden.

Maar ze mogen niet de hele game bepalen.

Voorbeeld:

**Scout Pack**

5 items

**Elite Pack**

5 items
1 gegarandeerd Rare+

**Legend Pack**

5 items
1 gegarandeerd Epic+

---

# 54. Mogelijke pack-content

Player Contract
Scout Report
Training Item
Staff Candidate
Kit
Badge
Stadium Cosmetic
Celebration
Collectible
Special Edition Player

---

# 55. Rarity

Common
Rare
Epic
Legendary
Icon

Belangrijk:

Een Common wonderkid kan uiteindelijk beter worden dan een Legendary veteraan.

Rarity bepaalt vooral:

- schaarste;
- art;
- cosmetic treatment;
- collectible status;
- edition size;
- bepaalde unieke eigenschappen.

Niet simpelweg:

Legendary = sterkste.

---

# 56. Pack odds

Voorbeeld, nog te balanceren:

Common: 65%

Rare: 25%

Epic: 8%

Legendary: 1,8%

Icon: 0,2%

Betaalde random packs moeten hun kansen duidelijk tonen.

Omdat packs met crypto en mogelijk verhandelbare assets per land verschillende juridische gevolgen kunnen hebben, moet dit vóór mainnet-release per doelmarkt juridisch worden gecontroleerd. De actuele Solana Mobile Publisher Policy vereist in ieder geval naleving van toepasselijke wet- en regelgeving.

Geen verborgen odds.

---

# 57. Pity system

Om extreme pech te voorkomen:

bijvoorbeeld:

Na X packs zonder Epic:

verhoogde Epic probability.

Na Y packs:

gegarandeerde Epic.

Het systeem toont de gebruiker exact waar hij staat.

---

# 58. Geen eigen token bij launch

Ik zou bewust geen `$TOUCH` token lanceren.

We gebruiken aanvankelijk:

### Credits

Off-chain.

Verdienbaar via gameplay.

Voor:

- transfers;
- wages;
- staff;
- training;
- facilities.

### SOL

On-chain.

Voor:

- bepaalde packs;
- collectibles;
- marketplace;
- rewards.

### Reward Points

Niet-verhandelbaar.

Voor competitive ranking en reward allocation.

Een eigen token kan later, maar alleen wanneer daar werkelijk een economische reden voor bestaat.

---

# 59. SOL rewards

Ik zou niet onbeperkt betalen voor iedere losse overwinning.

Dat nodigt bots uit.

Beter:

Match Win:

Credits
XP
Reward Points

Reward Points bepalen bijvoorbeeld de verdeling van een periodieke reward pool.

Voorbeeld:

**Weekly Competitive Pool**

100 SOL

Rewards voor:

league placement
cup results
achievement tier
manager performance

---

# 60. Kleine win rewards

Later kunnen directe SOL-winbonussen bestaan, maar met:

- dagelijkse limiet;
- minimale accountleeftijd;
- competitive eligibility;
- botdetectie;
- minimale league;
- capped payout.

Daarmee voorkom je dat iemand 10.000 accounts maakt.

---

# 61. No staking on matches

In V1 zou ik managers niet tegen elkaar laten gokken:

`ik zet 0.1 SOL in en jij ook`

Dat maakt het juridische en economische model veel ingewikkelder.

Onze prize pools komen vanuit:

- game treasury;
- sponsors;
- events.

Niet vanuit winnaar-neemt-inzet wedstrijden.

---

# 62. Treasury

Een transparant economisch model:

Pack Sales
Marketplace Fees
Cosmetics
Premium Features

↓

**Game Treasury**

↓

Development / Operations
Rewards
Tournament Pools
Community Events

Exacte percentages worden pas na economische simulaties vastgesteld.

---

# 63. Marketplace

Verhandelbare collectibles kunnen rechtstreeks tussen wallets worden verkocht.

Voorbeeld:

**Season 3 Legendary Reyes**

Edition:

37 / 500

Seller:

2.4 SOL

Platform fee kan bijvoorbeeld een klein percentage bedragen.

Niet iedere normale speler hoeft verhandelbaar on-chain te zijn.

---

# 64. Wat wordt NFT/cNFT?

Niet:

iedere speler
iedere training
ieder contract
iedere transfer

Wel mogelijk:

Founder Players
Limited Editions
Championship Cards
Trophies
Rare Kits
Badges
Historical Moments
Stadium Skins

Voor collectibles op grote schaal is Bubblegum V2 interessant: Metaplex documenteert compressed NFTs als een veel goedkoper model voor grote aantallen assets, met DAS voor indexing/fetching.

Voor premium, individuele collectibles kunnen Metaplex Core-assets interessant zijn.

---

# 65. Special player editions

Interessante combinatie:

Een normale speler bestaat server-side.

Maar na een uitzonderlijk seizoen kan bijvoorbeeld ontstaan:

**Reyes — Season 8 Golden Boot**

Limited:

250 copies

Deze collectible kan verhandelbaar zijn.

In-game kan hij een unieke kaartvisual of cosmetic geven, zonder extreem competitief voordeel.

---

# 66. Trophy collectibles

Wanneer iemand een belangrijk toernooi wint:

**World Champion — Season 14**

kan een unieke on-chain trophy worden uitgegeven.

Edition:

1/1

Dat creëert echte historie.

---

# 67. Transfer Hooks

Token-2022 ondersteunt onder andere Transfer Hooks waarmee custom logica tijdens transfers kan worden uitgevoerd.

Dat kan later bijvoorbeeld nuttig zijn voor bepaalde assetregels.

Maar we gebruiken dit alleen als er daadwerkelijk behoefte aan bestaat; complexe tokenlogica toevoegen zonder noodzaak maakt walletcompatibiliteit lastiger.

---

# 68. Manager skill tree

Managers ontwikkelen zelf ook.

Vier branches:

### Tactics

Pressing
Set Pieces
Counter Attacking
Possession

### Development

Youth Development
Training
Player Morale

### Scouting

Potential Judgement
Regional Knowledge
Scouting Speed

### Business

Negotiation
Sponsors
Commercial Revenue

Bonussen blijven bewust klein.

Skill moet belangrijker blijven dan +10%-bonussen.

---

# 69. Achievements

Voorbeelden:

First Victory
10 Match Win Streak
Promoted
League Champion
100 Goals
Undefeated Season
Academy Graduate Scores
Millionaire Club
World Champion

Achievements geven:

XP
cosmetics
badges
profile decorations

Niet overal SOL.

---

# 70. Rivals

Wanneer twee clubs vaak belangrijke wedstrijden tegen elkaar spelen kan een rivalry ontstaan.

Bijvoorbeeld:

**Amsterdam Athletic**

vs

**Rotterdam City**

Matches: 17
Amsterdam Wins: 8
Rotterdam Wins: 7
Draws: 2

Biggest Win:

5–1

Dit ontstaat automatisch uit historie.

---

# 71. Friends

Gebruikers kunnen:

vrienden toevoegen
friendlies spelen
competities maken
teams bekijken
trophies bekijken

---

# 72. Alliances

Managers kunnen een organisatie oprichten.

Bijvoorbeeld:

**Dutch Lions**

Max bijvoorbeeld 30 managers.

Alliance bevat:

chat
ranking
shared achievements
alliance tournaments

---

# 73. Alliance wars

Bijvoorbeeld:

5 managers tegen 5 managers.

Iedere manager speelt een opponent.

Totale score bepaalt winnaar.

Rewards bestaan vooral uit:

club XP
cosmetics
alliance rating

---

# 74. Private leagues

Vriendengroep:

Create League

8–20 managers.

Opties:

match schedule
transfer rules
squad budget
season length
private invite

Ideaal voor communities en influencers.

---

# 75. World tournaments

Een groot recurring event:

**Touchline World Cup**

4096 gekwalificeerde managers.

Group Stage

↓

Knockout

↓

Round of 32

↓

Final

Winnaar ontvangt:

exclusive trophy
profile title
SOL reward
limited collectible

---

# 76. Daily gameplay loop

Open app.

Bekijk:

training results
scouting results
transfer offers
injuries
news

Daarna:

stel training in
check markt
pas lineup aan
analyseer opponent
speel/bekijk match
claim progression

Een actieve manager heeft genoeg te doen zonder uren verplicht online te zijn.

---

# 77. Weekly loop

League matches
Cup match
Weekly objectives
Scouting
Transfers
Facility upgrades
Reward ranking

Iedere week eindigt met een duidelijke progressiemoment.

---

# 78. Seasonal loop

Compete

↓

Promote / Relegate

↓

Prize Distribution

↓

Player Development

↓

Contracts

↓

Transfer Window

↓

New Season

---

# 79. Long-term loop

Club bouwen

↓

Talent ontdekken

↓

Trophies winnen

↓

Stadion uitbreiden

↓

Legacy opbouwen

↓

World ranking beklimmen

Dit moet jarenlang kunnen doorgaan.

---

# 80. AI newspaper

AI kan de gamewereld enorm levendig maken.

Maar AI bepaalt nooit wedstrijdresultaten.

Na wedstrijden genereert AI bijvoorbeeld:

**Athletic verrast koploper met gedurfde tactische wissel**

Manager Koen schakelde in de 67e minuut over naar een 4-2-3-1, waarna Reyes tweemaal gevaarlijk werd.

---

# 81. Transfer rumours

AI-media:

**Navarro onderweg naar London Royals?**

Bronnen rond de club melden dat London Royals belangstelling heeft getoond.

Deze verhalen worden gebaseerd op echte game-events.

---

# 82. Press conferences

Voor belangrijke wedstrijden:

Journalist:

“Jullie hebben drie wedstrijden niet gewonnen. Staat er druk op het team?”

Antwoord:

“We hebben vertrouwen.”

Effect:

- kleine morale

of:

“Spelers moeten verantwoordelijkheid nemen.”

Mogelijk:

- motivation
  − morale bij bepaalde personalities.

---

# 83. Fan sentiment

Club heeft:

Fans
Trust
Excitement

Supporters reageren op:

resultaten
transfers
jeugdspelers
ticketprijzen
clubprestaties

Dit beïnvloedt inkomsten en sfeer.

---

# 84. Dynamic events

Voorbeeld:

Speler wil nieuw contract.

Captain raakt geblesseerd.

Sponsor wil meeting.

Youngster vraagt speeltijd.

Topclub doet bod.

Speler wil vertrekken.

Hierdoor voelt clubmanagement organisch.

---

# 85. Live events

Bijvoorbeeld:

**South America Week**

Scouting bonus.

**Academy Week**

Meer youth prospects.

**Derby Weekend**

Extra club XP.

**Founders Tournament**

Limited trophy.

Live events zorgen voor afwisseling zonder pure power creep.

---

# 86. Seasons met thema

Season 1:

Founders

Season 2:

Future Stars

Season 3:

Global Clubs

Season 4:

Road to Glory

Iedere season krijgt:

cosmetics
challenges
collectibles
special competitions

---

# 87. Battle/Manager Pass

Optioneel kan er een seasonal Manager Pass komen.

Free Track

en:

Premium Track.

Premium bevat vooral:

cosmetics
club customization
extra scouting convenience
collectibles

Geen exclusieve 99-rated spelers.

---

# 88. Anti-pay-to-win systeem

Competitive leagues kunnen werken met een:

**Squad Cost Rating**

Iedere speler heeft een squad-cost.

Een extreem sterke selectie kost veel punten.

Bepaalde competitions krijgen bijvoorbeeld:

Maximum Squad Cost: 1.500

Een manager moet dus keuzes maken.

Hiermee kunnen we verschillende competitievormen creëren.

---

# 89. Salary cap events

Special tournament:

Maximum Wage Bill:

10M

Hierdoor draait het om squad construction.

Niet om wallet size.

---

# 90. Draft mode

Een van de leukste latere modes.

Iedereen krijgt dezelfde random player pool.

Managers draften om de beurt.

Geen eigen squad.

Geen voordeel door aankopen.

Daarna:

8-player knockout tournament.

Perfect voor echte competitieve ranking.

---

# 91. Fantasy draft tournaments

Entry hoeft niet financieel te zijn.

Managers betalen bijvoorbeeld:

Tournament Ticket

dat via gameplay te verdienen is.

Hierdoor blijft de mode breed toegankelijk.

---

# 92. Club philosophy

Je kiest langetermijnidentiteit.

Bijvoorbeeld:

Youth Development
High Press
Possession Football
Counter Attack
Galácticos
Moneyball

De filosofie beïnvloedt objectives en bepaalde clubbonussen.

---

# 93. Moneyball system

Data-georiënteerde managers kunnen verborgen waarde zoeken.

Voorbeeld:

Player A:

OVR 77
Price 4M

maar:

Progressive Passes: Elite
Interceptions: Elite
Stamina: Elite

Misschien past hij perfect in jouw systeem.

Dus OVR is nooit alles.

---

# 94. Advanced analytics

Premium managementdata hoeft niet betaald te zijn; het kan onderdeel worden van staff/facilities.

Statistieken:

xG
xA
Pass Maps
Shot Maps
Heatmaps
Progressive Passes
Pressures
Duels
Turnovers
Possession Chains

Een Data Center-upgrade ontsluit diepere analyses.

---

# 95. Rankings

Global Manager Ranking

Country Ranking

Friends Ranking

Alliance Ranking

Season Ranking

Youth Development Ranking

Transfer Profit Ranking

Niet alleen “wie heeft meeste geld”.

---

# 96. Hall of Fame

Historische wereldrecords:

Most Championships
Longest Win Streak
Most Goals
Best Season
Highest Transfer
Greatest Academy Player

Hierdoor ontstaat een echte wereldgeschiedenis.

---

# 97. Technical architecture

## Mobile

React Native
TypeScript
Android-first

Wallet:

Solana Mobile Wallet Adapter.

Solana Mobile documenteert momenteel MWA voor React Native en transaction signing, waardoor dit goed aansluit op de dApp Store.

---

# 98. Backend

Ik zou beginnen met:

**API**

TypeScript / NestJS

**Database**

PostgreSQL

**Caching**

Redis

**Real-time**

WebSockets

**Jobs**

Queue/workers voor:

match simulation
scouting
training
transfers
notifications

---

# 99. Match simulation service

De simulator krijgt een aparte service.

Input:

Team A snapshot
Team B snapshot
Tactics A
Tactics B
Match seed
Environment

Output:

Score
Events
Player ratings
xG
Stats
Injuries
Cards
Replay log

Belangrijk:

Na kickoff worden de gebruikte inputs immutable.

---

# 100. Database entities

Belangrijkste tabellen:

User
Wallet
Club
ManagerProfile
Player
PlayerAttributes
PlayerDevelopment
Contract
Squad
Lineup
TacticPreset
Staff
Facility
Season
League
LeagueMembership
Fixture
Match
MatchSnapshot
MatchEvent
PlayerMatchStats
TransferListing
TransferBid
ScoutingAssignment
ScoutReport
YouthProspect
PackDefinition
PackOpening
InventoryItem
Collectible
WalletTransaction
RewardEpoch
RewardClaim
Achievement
Alliance
Friendship
Notification
AuditBatch

---

# 101. Player IDs

Iedere speler krijgt een onveranderlijke UUID.

Naam en club kunnen veranderen.

ID nooit.

Alle career history hangt aan dat ID.

Daardoor kunnen we bijvoorbeeld tonen:

**Career**

Season 1 — Amsterdam
Season 3 — Berlin
Season 5 — Madrid

---

# 102. Server authority

De mobiele client mag nooit zeggen:

“Ik heb gewonnen, geef reward.”

Server bepaalt:

match result
inventory
credits
progression
pack result
reward eligibility

Blockchaintransacties worden onafhankelijk geverifieerd.

---

# 103. Purchase flow

Gebruiker kiest pack.

↓

Backend creëert purchase intent.

↓

App bouwt SOL-transactie.

↓

Wallet tekent.

↓

Transaction wordt bevestigd.

↓

Backend verifieert:

amount
recipient
signature
purchase ID

↓

Pack wordt geopend.

Dit moet volledig idempotent zijn.

Dezelfde transactie kan nooit twee packs opleveren.

---

# 104. Pack randomness

Randomness mag nooit door client worden bepaald.

Voor een serieuze uitvoering gebruiken we auditable randomness, bijvoorbeeld een cryptografische commit/reveal-constructie of andere verifieerbare randomness.

Resultaat wordt gekoppeld aan:

purchase ID
pack ID
randomness proof/commitment
items

Hierdoor kunnen we pack results later controleren.

---

# 105. Reward architecture

Treasury bezit SOL.

Rewards worden per periode berekend.

Backend maakt:

Reward Epoch #41

Wallet A → 0.4 SOL
Wallet B → 0.25 SOL
Wallet C → 0.18 SOL

Daaruit kan een on-chain claimstructuur worden gemaakt.

Gebruiker klikt:

**Claim Reward**

Wallet ontvangt SOL.

---

# 106. Treasury security

Geen enkele ontwikkelaar mag alleen de hoofdtreasury kunnen leegmaken.

Hoofdtreasury:

multisig.

Daarnaast:

kleine operational payout wallet.

Limits:

daily payout cap
per-user cap
emergency pause

On-chain programs moeten voor mainnet worden geaudit.

---

# 107. Anti-bot / anti-sybil

SOL rewards maken botting onvermijdelijk als we niets doen.

Signalen:

account age
matches played
device patterns
wallet patterns
behavior
market abuse
multiple accounts
impossible activity
shared farming patterns

Competitive SOL rewards vereisen extra eligibility.

---

# 108. Reward eligibility

Bijvoorbeeld:

Account minimaal 7 dagen oud.

Minimaal 15 competitive matches.

Geen active sanctions.

Wallet connected.

Minimale manager level.

Geen verdachte multi-account behavior.

Parameters kunnen later worden aangepast.

---

# 109. Match-fixing

We controleren bijvoorbeeld:

herhaaldelijk verliezen tegen dezelfde wallet
verdachte transfers
resource funneling
alliances met ongebruikelijke resultaten
multi-account fingerprints

Flagged matches worden uitgesloten van rewards totdat gecontroleerd.

---

# 110. Transfer manipulation

Wash trading voorkomen door:

minimum listing time
market history
suspicious-price detection
rate limits
related-account detection

We moeten voorkomen dat Credits of assets via farmaccounts naar één hoofdaccount stromen.

---

# 111. Marketplace security

Alle blockchainassets worden vanuit chain-state gelezen.

Nooit vertrouwen op:

“de client zegt dat hij NFT X bezit.”

Backend controleert daadwerkelijke wallet ownership.

---

# 112. Asset indexing

Wanneer we op schaal compressed collectibles gebruiken, hebben we een DAS-capabele infrastructuur/RPC nodig; Bubblegum V2-documentatie vermeldt dat standaard-RPC alleen hiervoor niet voldoende is.

---

# 113. Admin platform

We bouwen naast de game een intern dashboard.

Administrators kunnen zien:

online players
economy
pack sales
SOL treasury
rewards
market prices
inflation
match errors
flagged accounts
reports
server health

---

# 114. Economy dashboard

Belangrijke metrics:

Credits Generated
Credits Burned
Average Club Balance
Average Player Price
SOL Revenue
Reward Expense
Marketplace Volume
Pack Purchases

We moeten dagelijks kunnen zien of inflatie uit de hand loopt.

---

# 115. Competitive-health metrics

Nog belangrijker:

Win rate spenders vs non-spenders.

Average OVR per league.

Tactical upset percentage.

New-player win rate.

Squad concentration.

Als spenders structureel bijvoorbeeld bijna altijd gratis spelers verslaan, hebben we een designprobleem.

---

# 116. Retention metrics

D1 Retention
D7 Retention
D30 Retention

Matches per user.

Training interactions.

Transfer interactions.

Scouting usage.

League completion.

Wallet connect percentage.

Pack conversion.

Maar retention mag niet gebaseerd worden op manipulatieve dark patterns.

---

# 117. Notifications

Opt-in push notifications:

Match starts soon.

Scout returned.

Transfer offer received.

Player injured.

League promotion secured.

Pack collectible sold.

Reward available.

Niet:

“KOOP NU OF JE VERLIEST.”

---

# 118. App navigation

Onderste navigatie:

**Home**

**Squad**

**Match**

**Market**

**Club**

Home bevat:

next match
league table
news
tasks
recent results

---

# 119. Squad screen

Pitch view.

Spelers slepen naar positie.

Bovenaan:

Formation
Chemistry
Fitness
Team Rating

Klik speler:

profile
stats
development
contract
career
training

---

# 120. Match Center

Pre-match:

Opponent
Form
Lineup
Tactical analysis
History

Live:

Score
Timeline
Stats
Tactics
Subs

Post-match:

Ratings
xG
Analytics
Rewards
News Report

---

# 121. Marketplace UI

Tabs:

Players
Collectibles
Staff
Auctions
My Listings

Filters:

Position
Age
OVR
Potential
Price
Contract
Traits

---

# 122. Club screen

Stadium
Academy
Staff
Finances
Sponsors
History
Trophies
Customization

---

# 123. Wallet screen

SOL balance

Collectibles

Rewards

Transactions

Connected wallet

Belangrijk:

We presenteren dit als clubfinanciën/ownership-functionaliteit, niet als crypto-dashboard.

---

# 124. Art direction

Niet proberen FIFA na te doen.

Eigen stijl:

modern
clean
dark/navy interface
stadium lighting
premium sports analytics look

Spelerkaarten mogen visueel indrukwekkend zijn.

Een Legendary pack moet een spannend openingmoment zijn.

Maar normale managementschermen moeten snel en functioneel blijven.

---

# 125. Pack opening presentation

Pack purchase bevestigd.

↓

Stadion wordt donker.

↓

Clubkleuren verschijnen.

↓

Rarity animation.

↓

Position.

↓

Region.

↓

Player silhouette.

↓

Reveal.

Legendary moet speciaal voelen zonder dat het irritant lang duurt.

---

# 126. Sound

Crowd reactions.

Transfer notification.

Goal sound.

Pack rarity cues.

Trophy presentation.

Geluid kan enorm bijdragen aan reward moments.

---

# 127. IP-strategie

V1 gebruikt uitsluitend:

fictieve spelers
fictieve clubs
eigen logo's
eigen competities
eigen kits

Geen:

Premier League logo's
echte clublogo's
echte spelersfoto's
Football Manager branding
OSM branding

Later kunnen officiële licenties worden onderzocht.

---

# 128. Solana dApp Store

Publicatie gebeurt volgens de dan actuele Solana Mobile-procedure.

Momenteel wordt voor publicatie een App NFT gebruikt en per release een Release NFT voordat de app ter review wordt ingediend.

Dat bouwen we vanaf het begin mee in de releasepipeline.

---

# 129. Fase A — simulation prototype

Eerst bouwen we de echte kern.

100 fictieve spelers.

2 teams.

Tactieken.

Match simulator.

Match statistics.

Doel:

Kan een managerbeslissing logisch zichtbaar effect hebben?

Nog geen blockchain nodig.

---

# 130. Fase B — playable game

Toevoegen:

accounts
clubs
squads
training
tactics
matches
league
standings
player progression
transfers
scouting

Nu hebben we daadwerkelijk een voetbalmanager.

---

# 131. Fase C — economy

Toevoegen:

Credits
club finances
contracts
staff
academy
stadium
sponsors

Nu bestaat een volwaardige economische game.

---

# 132. Fase D — Solana

Toevoegen:

wallet connect
SOL purchase flow
packs
treasury
reward claims
transaction verification

Eerst volledig op Devnet testen.

---

# 133. Fase E — competitive beta

Toevoegen:

competitive divisions
promotion
relegation
cups
leaderboards
anti-bot
reward epochs

Pas wanneer dit stabiel is, echte SOL rewards.

---

# 134. Fase F — ownership

Toevoegen:

collectibles
limited editions
trophies
marketplace
compressed assets

---

# 135. Fase G — social

Friends
alliances
private leagues
rivals
spectating
alliance competitions

---

# 136. Fase H — advanced world

AI news
press conferences
fan sentiment
dynamic events
world tournaments
draft mode
advanced analytics
2D match viewer

---

# 137. MVP

De eerste publieke versie hoeft niet 137 systemen tegelijk te bevatten.

De kern-MVP:

Club creation

Squad

30+ player attributes

Tactics

Training

Transfers

Scouting

League

Daily matches

Match simulation

Live match feed

Credits

Wallet connect

SOL pack purchase

Pack opening

Manager profile

Leaderboard

Reward Points

Periodic SOL rewards

Anti-bot basics

Dat is al een serieuze game.

---

# 138. Wat bewust NA de MVP komt

Youth Academy depth

Staff depth

Stadium management

Marketplace

NFT collectibles

Alliances

World tournaments

AI newspaper

Press conferences

Draft mode

2D matches

Die systemen kunnen bovenop een bewezen core-loop worden gebouwd.

---

# 139. De echte killer feature

De belangrijkste differentiator hoeft uiteindelijk niet eens crypto te zijn.

Ik zou dit proberen te bereiken:

**Iedere speler in de wereld heeft een echte carrière.**

Stel:

In Season 2 produceert jouw academy:

Mateo Reyes.

Age 16.

Potential 92.

Hij speelt zes seizoenen voor je.

184 matches.

77 goals.

Je verkoopt hem voor een clubrecord.

Vier seizoenen later staat hij tegenover jou in de Champions Cup Final.

Zijn hele historie bestaat nog.

En als hij uiteindelijk stopt:

**Club Legend — Mateo Reyes**

184 matches
77 goals
2 championships
1 continental title

Vervolgens kan een commemorative collectible worden gemint.

Dat creëert emotionele waarde die je niet zomaar kunt kopen.

---

# 140. Eindbeeld

Project Touchline moet uiteindelijk tegelijk voelen als:

een football manager
een multiplayer strategy game
een club-building game
een collectible game
een live-service sportwereld

met daaronder Solana voor:

ownership
payments
rewards
history
settlement

De grootste fout zou zijn om een matige voetbalgame te bouwen met veel crypto.

De juiste volgorde is:

**Football → Competition → Community → Economy → Blockchain.**

Wanneer die volgorde klopt, kunnen packs en SOL juist veel interessanter worden omdat spelers daadwerkelijk iets geven om hun club, hun spelers en hun geschiedenis.