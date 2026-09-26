export const statGroups=[
 ['Snelheid',[['pac','Snelheid'],['acceleration','Acceleratie'],['sprintSpeed','Sprintsnelheid']]],
 ['Schieten',[['sho','Schieten'],['positioning','Aanvalspositie'],['finishing','Afwerken'],['shotPower','Schotkracht'],['longShots','Afstandsschoten'],['volleys','Volleys'],['penalties','Strafschoppen']]],
 ['Passing',[['pas','Passing'],['vision','Visie'],['crossing','Voorzetten'],['freeKickAccuracy','Vrije trappen'],['shortPassing','Korte passing'],['longPassing','Lange passing'],['curve','Effect']]],
 ['Dribbelen',[['dri','Dribbelen (totaal)'],['agility','Wendbaarheid'],['balance','Balans'],['reactions','Reacties'],['ballControl','Balcontrole'],['dribbling','Dribbelen'],['composure','Kalmte']]],
 ['Verdedigen',[['def','Verdedigen'],['interceptions','Onderscheppen'],['headingAccuracy','Koppen'],['defensiveAwareness','Verdedigend inzicht'],['standingTackle','Staande tackle'],['slidingTackle','Sliding']]],
 ['Fysiek',[['phy','Fysiek'],['jumping','Springen'],['stamina','Uithoudingsvermogen'],['strength','Kracht'],['aggression','Agressie']]],
 ['Keepen',[['gkDiving','Duiken'],['gkHandling','Balvastheid'],['gkKicking','Uittrappen'],['gkPositioning','Positionering'],['gkReflexes','Reflexen']]]
];
export const positionGroups={GK:'Keeper',RB:'Verdediger',RWB:'Verdediger',CB:'Verdediger',LB:'Verdediger',LWB:'Verdediger',CDM:'Middenvelder',CM:'Middenvelder',CAM:'Middenvelder',RM:'Middenvelder',LM:'Middenvelder',RW:'Aanvaller',LW:'Aanvaller',ST:'Aanvaller',CF:'Aanvaller'};
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
export const playerRating=p=>p.fc26||p.fc27||null;
export const ratingEdition=p=>p.fc26?'FC 26':p.fc27?'FC 27':null;
export function validWorldPlayer(p){return p&&/^ea-\d+$/.test(p.id)&&p.id==='ea-'+p.eaId&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=120&&Object.hasOwn(positionGroups,p.position)
  &&Array.isArray(p.alternatePositions)&&p.alternatePositions.every(v=>Object.hasOwn(positionGroups,v))
  &&!(p.fc26&&p.fc27)&&[p.fc26,p.fc27].every(r=>r==null||integer(r.overall,1,99)&&integer(r.weakFoot,1,5)&&integer(r.skillMoves,1,5)&&['Links','Rechts'].includes(r.preferredFoot)&&Object.hasOwn(positionGroups,r.position)&&Array.isArray(r.alternatePositions)&&r.alternatePositions.every(v=>Object.hasOwn(positionGroups,v))&&statGroups.flatMap(g=>g[1]).every(([key])=>integer(r.stats?.[key],0,99)));}
export function toMatchPlayer(p){
  if(!validWorldPlayer(p)||!playerRating(p))throw Error('Deze speler mist gecontroleerde EA-attributen.');
  const s=playerRating(p).stats,gk=playerRating(p).position==='GK';
  // Fixed mapping, no random attributes. OVR remains the source rating;
  // training modifies the separate match values, never the source snapshot.
  return {id:p.id,eaId:p.eaId,name:p.name,position:p.position,alternatePositions:[...p.alternatePositions],age:null,
    attack:s.positioning,passing:gk?s.shortPassing:s.pas,defending:gk?Math.round((s.defensiveAwareness+s.standingTackle)/2):s.def,pace:gk?Math.round((s.acceleration+s.sprintSpeed)/2):s.pac,finishing:s.finishing,composure:s.composure,stamina:s.stamina,
    reflexes:s.gkReflexes,handling:s.gkHandling,positioning:s.gkPositioning,fitness:100,morale:75,ratingEdition:ratingEdition(p),sourceRating:structuredClone(playerRating(p))};
}
export function worldClubs(bundle){
  const ids=new Set();
  if(!bundle||!Array.isArray(bundle.clubs)||bundle.clubs.length<2||bundle.clubs.length>40)throw Error('Ongeldige wereldcompetitie.');
  const clubs=bundle.clubs.map(c=>{
    if(!/^ea-\d+$/.test(c.id)||typeof c.name!=='string'||!Array.isArray(c.players)||!c.players.every(validWorldPlayer))throw Error('Ongeldige clubgegevens.');
    for(const p of c.players){if(ids.has(p.id))throw Error('Dubbele speler in competitie.');ids.add(p.id);}
    const players=c.players.filter(playerRating).map(toMatchPlayer);
    if(players.length<18||players.filter(p=>p.position==='GK').length<2)throw Error(`${c.name} heeft te weinig EA-ratings voor een speelbare selectie.`);
    return {id:c.id,name:c.name,logo:c.logo,players,unratedPlayers:c.players.filter(p=>!playerRating(p)).map(p=>({id:p.id,name:p.name,position:p.position}))};
  });
  if(new Set(clubs.map(c=>c.id)).size!==clubs.length)throw Error('Dubbele club.');return clubs;
}
export const safeClubLogo=url=>typeof url==='string'&&(/^https:\/\/drop-assets\.ea\.com\/images\/[A-Za-z0-9/_.-]+\.png$/.test(url)||/^https:\/\/media-sdp\.legaseriea\.it\/clubLogos\/[a-f0-9]+_light\.webp$/.test(url))?url:null;
export function playerStatGroups(p){return ratingEdition(p)&&playerRating(p).position==='GK'?statGroups.map(([title,stats])=>[title,stats.filter(([key])=>!['pac','sho','pas','dri','def','phy'].includes(key))]):statGroups;}
