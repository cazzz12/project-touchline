# Keepers en schoten stoppen

Vanaf 0.7.0 beïnvloedt de keeper de kans dat een schot op doel een goal wordt. De speler op de eerste plek van je basiself staat in het doel, ook na een wissel. Een veldspeler op die plek krijgt een duidelijk nadeel.

## Vaardigheden

Bij **Clubs → speler openen** hebben keepers drie extra spelwaarden: reflexen, balvastheid en positionering. De keeperrating weegt ze als 50%, 25% en 25%. De effectieve keeperkracht hangt ook af van conditie en moraal. De voorbeschouwing toont deze kracht voor beide basiskeepers; het voorstel voor een fit elftal gebruikt diezelfde kracht voor de keeper en reservekeeper.

Ontbrekende vaardigheden worden één keer afgeleid van de bestaande verdediging en kalmte: reflexen 60/40, balvastheid 50/50, positionering 70/30, afgerond. Getrainde waarden worden daarna bewaard. Dit zijn gegenereerde spelratings, geen officiële beoordelingen. De algemene rating, transferprijs en bestaande salarissen veranderen hierdoor niet.

**Training → Keepertraining** gebruikt de gewone individuele sessie: één speler en één vaardigheid per speeldag, naast teamtraining. De verbetering is trainingscomplexniveau plus stafniveau, maximaal 99; het kost drie conditiepunten. Een geblesseerde keeper kan niet individueel trainen. Tijdens wedstrijden is training geblokkeerd.

## Wedstrijd en carrière

Een gestopt schot noemt de keeper in het liveverslag. Reddingen verschijnen naast de andere wedstrijdcijfers. Het eindverslag verdeelt minuten, reddingen en tegengoals over de keepers die daadwerkelijk in het doel stonden. Bij **Carrière** staan die cijfers voor alle zes clubs, met reddingspercentage en het aantal keren de nul gehouden.

Een nul telt bij ten minste 60 minuten als keeper en geen tegengoal tijdens die minuten. Een tegengoal vóór het invallen of na het uitvallen telt niet tegen die keeper. Een invaller met 30 minuten krijgt dus wel zijn reddingen en tegengoals, maar geen nul. Het reddingspercentage is reddingen / (reddingen + tegengoals); bij nul schoten tegen staat een streepje.

De nieuwe keepercijfers beginnen bij nieuwe wedstrijden. Eerdere wedstrijden worden niet achteraf gereconstrueerd. Spelers behouden hun keepervaardigheden en bijgehouden carrière bij een transfer.

## Saves en simulatieregels

Het saveformaat en de opslagsleutel blijven gelijk. Nieuwe wedstrijden slaan `keeperRules: 1` en keeperminuten op. Een oude lopende wedstrijd zonder deze markering houdt de oude schotafhandeling, tegenstanderkeuze en overige wedstrijden van die speeldag. Herladen of een backup importeren verandert dat niet. De nieuwe regels beginnen bij de volgende aftrap.

Voor reproduceerbaarheid gebruikt het keepersmodel dezelfde willekeurige schotwaarde als het vorige model; het voegt geen extra trekkingen toe. xG beschrijft de kans vóór het keepereffect. Keeperkracht is `rating × (0,6 + 0,4 × conditie / 100) + (moraal − 70) × 0,04`, begrensd op 0–100. Voor een veldspeler in het doel wordt de kracht eerst met 0,4 vermenigvuldigd.

De bestaande goal-kans bij een schot op doel wordt vermenigvuldigd met `1 + (65 − keeperkracht) × 0,012`, begrensd op 0,6–1,75. De uiteindelijke kans ligt tussen 2% en 98%. Een betere keeper kan dus nog steeds een goal tegen krijgen. Alle drie vaardigheden werken hier samen voor schoten stoppen; afzonderlijke rebounds, hoge ballen en één-tegen-ééns zijn nog niet gemodelleerd.

Dit model is illustratief en niet gekalibreerd op echte voetbaldata. Tests vergelijken 400 gelijke wedstrijdseeds met verschillende keepervaardigheden: schoten en xG blijven gelijk, terwijl de betere keeper minder tegengoals krijgt. Aanvullende tests bewaken onder meer keeperwissels, hervatten, trainingen, transfers en exacte compatibiliteit met lopende wedstrijden uit 0.6.0.
