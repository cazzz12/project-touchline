export const packRulesVersion='touchline-packs-v1';
export const packTypes=[
 {id:'scout',name:'Scout Pack',price:12000,description:'Een nieuwe naam voor jouw selectie.',odds:{normal:8000,rare:1900,legendary:100}},
 {id:'spotlight',name:'Spotlight Pack',price:30000,description:'Meer kans op een zeldzame speler of een icoon.',odds:{normal:6000,rare:3500,legendary:500}}
];
export const rarityNames={normal:'Normaal',rare:'Zeldzaam',legendary:'Legendarisch'};
export const packLimitPerRound=2;
export const playerIdentity=p=>p.sourcePlayerId||p.id;
