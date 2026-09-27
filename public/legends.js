// Manually checked against EA's FC 26 Debut ICON artwork, 27 September 2026.
// Only the six displayed card totals and OVR are EA values. No invented substats.
export const legendSource='https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-launch-update';
export const legendArtwork='https://drop-assets.ea.com/images/qKutWNBHskVSgvatCGlTO/8316328616003f3290ab1f2211b4f18f/fc26-Launch-Update-Icons.jpg';
export const legends=[
 ['ibrahimovic','Zlatan Ibrahimović','ST',86,[80,87,77,85,41,84],'Zweden'],
 ['ronaldo','Ronaldo Nazário','ST',86,[88,86,71,86,35,67],'Brazilië'],
 ['iniesta','Andrés Iniesta','CM',86,[80,75,86,86,61,65],'Spanje'],
 ['kahn','Oliver Kahn','GK',86,[88,81,65,90,52,84],'Duitsland'],
 ['henry','Thierry Henry','ST',86,[87,85,77,84,46,73],'Frankrijk'],
 ['kroos','Toni Kroos','CM',86,[70,78,87,83,72,70],'Duitsland'],
 ['totti','Francesco Totti','ST',85,[81,86,85,85,36,71],'Italië'],
 ['marcelo','Marcelo','LB',85,[83,68,83,85,79,72],'Brazilië'],
 ['chiellini','Giorgio Chiellini','CB',85,[75,52,59,60,87,85],'Italië'],
 ['gerrard','Steven Gerrard','CM',85,[75,85,85,80,72,80],'Engeland'],
 ['cha-bum-kun','Cha Bum-kun','ST',85,[86,84,77,83,59,82],'Zuid-Korea']
].map(([key,name,position,overall,values,nationality])=>({id:'legend-'+key,name,position,overall,values,nationality,edition:'FC 26 Debut ICON',source:legendSource}));
export function legendMatchPlayer(p){
 const [a,b,c,d,e,f]=p.values,gk=p.position==='GK';
 // Transparent simulation mapping from card totals, not claimed EA subattributes.
 return {id:p.id,sourcePlayerId:p.id,name:p.name,position:p.position,alternatePositions:[],age:null,
  attack:gk?0:b,finishing:gk?0:b,passing:c,defending:gk?0:e,pace:gk?e:a,composure:p.overall,stamina:gk?p.overall:f,
  reflexes:gk?d:0,handling:gk?b:0,positioning:gk?f:0,fitness:100,morale:75,
  ratingEdition:p.edition,sourceRating:{overall:p.overall,position:p.position,cardTotals:[...p.values],source:p.source},
  sourceNote:'EA-kaarttotalen; overige wedstrijdwaarden zijn Touchline-afleidingen.',legend:true};
}
