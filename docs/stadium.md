# Stadion en kaartverkoop — 0.15.0

Open **Clubzaken → Stadion** om de vier ticketprijzen te vergelijken, een prijs te bewaren, je stadion uit te breiden en de laatste twintig thuisduels te bekijken. Dit zijn fictieve spelcapaciteiten en spelcredits. Alle zes clubs gebruiken hetzelfde model; de cijfers beschrijven geen echte stadions, supporters of ticketprijzen.

## Verwachting en opbrengst

De capaciteit is `2.500 + 2.500 × stadionniveau`: van 5.000 plaatsen op niveau 1 tot 15.000 op niveau 5. Bestaande stadionupgrades blijven gelden. Een volgend niveau kost nog steeds `18.000 × nieuw niveau` en het onderhoud is `500 × niveau` per speeldag.

De bezetting start op 60%, met deze aanpassingen in procentpunten:

| Invloed | Berekening |
| --- | --- |
| Reputatie | +1 per volledige 25 verdiende punten, maximaal +20 |
| Recente vorm | Laatste vijf eigen uitslagen in het huidige seizoen: winst +2, gelijk 0, verlies −2 per duel |
| Ticketprijs 1 credit | +25 |
| Ticketprijs 2 credits | 0 |
| Ticketprijs 3 credits | −25 |
| Ticketprijs 4 credits | −40 |

Bezetting blijft tussen 10% en 100%. Bezoekers = capaciteit × bezetting, naar beneden afgerond; opbrengst = bezoekers × ticketprijs. Er is geen willekeur. Voorbeeld: een nieuw spelstadion op niveau 1, zonder reputatie of uitslagen, ontvangt bij 2 credits 3.000 bezoekers en 6.000 credits. Een hogere prijs kan minder opleveren door lagere bezetting. Bezoekers hebben geen effect op de wedstrijdsimulatie of spelersratings.

De vergelijking gebruikt huidige gegevens. Bestaande opgeslagen uitslagen kunnen dus de eerste verwachting beïnvloeden; dit voegt geen bezoekers of geld aan eerdere wedstrijden toe. Vorm begint in een nieuw seizoen opnieuw. Reputatie, prijs, stadionniveau, historie en totalen blijven behouden.

## Aftrap, betaling en bijzondere gevallen

- Een prijs kiezen kost niets en schrijft geen inkomsten bij. Prijswijzigingen en uitbreidingen zijn tijdens een lopende wedstrijd geblokkeerd.
- De eigen thuiswedstrijd bewaart prijs, capaciteit, factoren, bezetting en bezoekers bij de aftrap. Herladen, tactiek wijzigen en prestaties in diezelfde wedstrijd veranderen deze afspraak niet.
- Betaling volgt één keer bij afronding, samen met de bestaande salaris-, onderhouds-, sponsor- en bonusboekingen. Het wedstrijdverslag toont bezoekers en opbrengst; de boekhouding toont hetzelfde bedrag.
- Een uitwedstrijd levert geen eigen ticketinkomsten en geen regel in de bezoekershistorie op.
- Een reglementair beslist duel vóór de eerste gespeelde minuut krijgt nul bezoekers en nul ticketinkomsten. Bij afbreken na de aftrap blijven de afgesproken bezoekers en inkomsten behouden. Dit is een spelregel, geen echt restitutiebeleid.
- Na de tiende speeldag is de vergelijking slechts een indicatie. Na seizoensafsluiting geldt de nieuwe vormstand.

## Savebehoud

Ontbrekende stadiongegevens worden toegevoegd met ticketprijs 2, lege historie en nul bijgehouden bezoekers. Bestaande credits, uitslagen, opstellingen en faciliteiten blijven staan. Een al lopende wedstrijd uit 0.14 of eerder behoudt de vaste thuisinkomsten `3.000 + 3.000 × stadionniveau`; die krijgt geen bezoekershistorie achteraf. De nieuwe regels beginnen bij een volgende aftrap.

De save-sleutel en interne versie blijven hetzelfde. Backups bevatten de prijs, de afspraak voor een lopende wedstrijd, twintig historische thuisduels en blijvende totalen. Oudere historie telt verder via opgeslagen archieftotalen. Importcontrole bewaakt onder meer prijzen, capaciteit, rekenregels, volgorde, totalen, live-afspraken en de aansluiting van het laatste thuisverslag op de geboekte kaartverkoop.

Dit blijft een lokale economie. Online servercontrole, betaalde packs, wallet- of e-mailaanmelding en Solana-integratie volgen volgens de roadmap.
