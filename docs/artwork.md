# Originele stadionachtergrond

Bestand: `public/assets/touchline-stadium-night.png` (1672 × 941 pixels).

Gemaakt op 27 september 2026 met de ingebouwde ImageGen, in **generate**-modus. De gebruikersreferentie bepaalde alleen de gewenste sfeer: nachtelijk blauw stadion en groen voetbalveld. Er is geen OSM-afbeelding bewerkt, gekopieerd of als beeldinput meegestuurd. Geen personages, merktekens, teksten of advertentieborden van die game.

Gebruikte ontwerpprompt:

> Create a brand-new original background illustration for Project Touchline, a premium mobile football manager login screen. Wide 16:9 composition, elevated corner-stand view looking diagonally over a complete luminous green football pitch with crisp white markings and goals. Midnight navy stadium roof and stands, cool white floodlights in the upper corners, gentle atmospheric mist. Distant crowd texture only; no foreground people, managers, mascots or characters. Polished realistic 3D game art. Dark upper central and right negative space for interface text. Original modern curved roof with subtle turquoise light strips. No writing, logos, branding, advertisements, watermarks, user interface, cards or buttons. Do not reproduce the reference game's specific architecture or advertisement layout. Background only.

De originele PNG wordt als lokale asset geserveerd. Het inlogscherm voegt een CSS-kleurlaag en contrasterende panelen toe. De packbeelden en spelerskaarten zijn originele CSS-vormen, geen EA-kaartafbeeldingen.

## Spelerstunnel — 0.22.0

Bestand: `public/assets/touchline-tunnel.png` (1672 × 941 pixels). Nieuw gemaakt met de ingebouwde ImageGen in generate-modus, 27 september 2026, zonder invoerafbeelding. Gebruikt in clubhuis, carrièrekoppen en wereldcatalogus.

Exacte prompt:

> Use case: stylized-concept. Asset type: original panoramic hero background for Project Touchline, a premium football manager game. Create a cinematic, highly detailed realistic 3D illustration, wide landscape about 16:9. Camera at ground level inside an empty football players' tunnel, looking out onto a bright emerald green pitch in a packed modern stadium at blue hour. The tunnel frames the view with deep midnight-navy concrete, brushed dark metal rails, subtle cyan strip lights and tiny amber highlights. Fine worn floor texture, soft reflections, distant floodlight beams and volumetric mist give depth. Composition: the tunnel entrance and visible green pitch sit mostly on the right half; the left half is naturally dark, quiet negative space for interface headings. A white football with subtle original dark geometric panels rests beside the right wall near the entrance, modest size. No people in the foreground, no player portraits, no characters, no UI, no text, no brands, no recognizable club logos, no watermarks. Sophisticated football atmosphere, exciting but readable as a website background. Unique architecture, no imitation of any existing football game's screen. Render an asset only, not a mockup.

## Lettertypes

`public/assets/fonts/Barlow-Regular.ttf`, `Barlow-SemiBold.ttf` en `BarlowCondensed-Bold.ttf` zijn ongewijzigde Google Fonts-bestanden, met de licentie in `OFL-Barlow.txt`. Bronmappen: https://github.com/google/fonts/tree/main/ofl/barlow en https://github.com/google/fonts/tree/main/ofl/barlowcondensed. Er worden geen fonts van een ander voetbalspel gekopieerd.

## 0.24.0 — voetbalbadges

Op verzoek zijn alle AI-managerportretten verwijderd. De oude portretatlas is uit de app verwijderd; profiel en assistent gebruiken nu de eigen voetbaliconen in kleurige CSS-badges. Er is geen nieuw portret gegenereerd. De zes opgeslagen avatarcodes blijven gelijk, zodat oude profielen blijven werken. De stadion- en trainingsachtergronden blijven behouden.

## 0.23.0 — Academy en historische portretproef

Modus: ingebouwde ImageGen, generate, nieuwe originele beelden; de gebruikersreferenties zijn gebruikt als inspiratie voor de sfeer, niet als overgenomen pixels of personages.

- De toenmalige atlas `touchline-managers.png` met zes portretten is in 0.24.0 verwijderd. De prompt hieronder is alleen historische herkomstinformatie.
- `public/assets/touchline-academy.png`: trainingscomplex voor de start en lessen.
- Voetbaliconen en vier profiel-emoties: eigen SVG-paden in `public/football-icons.js`.

### Historische prompt van de verwijderde portretten

Use case: stylized-concept. Asset type: one 3 by 2 portrait atlas for selectable manager avatars in Project Touchline, an original football manager game. Create exactly six separate square portrait panels in a perfectly even 3-column 2-row grid, no gaps, each equal size, total image landscape 3:2. Each panel is a centered head and shoulders portrait with ample headroom, facing camera, on identical dark midnight-navy studio gradient. Sophisticated stylized 3D collectible game art, detailed fabric and skin shading, believable adult proportions with gently expressive features, soft cyan rim lighting and warm stadium fill. Top row left: friendly woman coach with brown skin, dark curly hair tied high, navy sports jacket with turquoise trim. Top middle: East Asian man, short straight black hair, navy crewneck coach top. Top right: light skinned woman, short copper hair, navy tracksuit. Bottom left: dark skinned man with close-cropped hair and a neat beard, navy technical polo. Bottom middle: olive skinned man with wavy dark hair and subtle round glasses, navy coach jacket. Bottom right: older light skinned woman with silver short hair, navy sport jacket. All are unique fictional adults. Keep faces and shoulders within their own square, same camera distance and eye level. Clear friendly confident expressions. Palette midnight blue, turquoise, small gold details. No text, no numbers, no logos, no borders, no football club branding, no watermarks. Do not reproduce characters from any existing football game. This is an asset atlas, not a mockup.

### Prompt trainingscomplex

Use case: stylized-concept. Asset type: panoramic onboarding academy banner for Project Touchline, original football management game. A cinematic beautifully detailed 3D illustration of a professional football training ground at blue hour, seen from a low sideline viewpoint. Rich emerald cut-grass training pitch, crisp white touchline leading into the scene, turquoise and gold training cones, two white footballs with original geometric dark panels, a small practice goal, elegant modern training pavilion and distant softly glowing stadium floodlights. Atmosphere welcoming, aspirational and lively, polished premium sports game art. Keep the left third shadowy navy with subdued detail for a heading overlay; training gear and pitch occupy center and right. Wide landscape 16:9. Dark midnight blue sky, cyan rim lights, small warm golden window lights, realistic tactile grass and fabric, volumetric light giving depth. Empty training ground, no characters, no UI, no text, no logos, no branded footballs, no club emblems, no watermarks. Asset only, not a screenshot, do not copy another game's design.
