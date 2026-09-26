export const scoutingRoles={all:'Alle posities',GK:'Keeper',DEF:'Verdediger',MID:'Middenvelder',ATT:'Aanvaller'};
export const scoutingSkills={attack:'Aanval',passing:'Passing',defending:'Verdediging',pace:'Snelheid',finishing:'Afwerking',composure:'Kalmte',stamina:'Uithoudingsvermogen',reflexes:'Reflexen',handling:'Balvastheid',positioning:'Positionering'};
export const broadRole=p=>p.position==='GK'?'GK':['DEF','RB','CB','LB'].includes(p.position)?'DEF':['ATT','ST','RW','LW'].includes(p.position)?'ATT':'MID';
export const defaultCriteria=()=>({role:'all',budget:null,skill:'any',minimum:0});
export function validCriteria(c){return c!==null&&typeof c==='object'&&!Array.isArray(c)&&Object.hasOwn(scoutingRoles,c.role)
  && (c.budget===null||(Number.isSafeInteger(c.budget)&&c.budget>=1&&c.budget<=1e9))
  && (c.skill==='any'||Object.hasOwn(scoutingSkills,c.skill))&&Number.isInteger(c.minimum)&&c.minimum>=0&&c.minimum<=100
  && (c.skill!=='any'||c.minimum===0)&&(!['reflexes','handling','positioning'].includes(c.skill)||['all','GK'].includes(c.role));}
export function ensureScoutingDesk(game){
  if(game.scoutingDesk===undefined)game.scoutingDesk={schema:1,criteria:defaultCriteria(),shortlist:[],report:null};
  return game;
}
export function setScoutingCriteria(game,criteria){
  if(!validCriteria(criteria))return false;
  ensureScoutingDesk(game);game.scoutingDesk.criteria={role:criteria.role,budget:criteria.budget,skill:criteria.skill,minimum:criteria.minimum};return true;
}
export function matchesCriteria(p,price,c){return (c.role==='all'||broadRole(p)===c.role)&&(c.budget===null||price<=c.budget)
  &&(c.skill==='any'||(Number.isFinite(p[c.skill])&&p[c.skill]>=c.minimum));}
export function findScoutingPlayer(game,id){
  for(let club=0;club<game.clubs.length;club++){const player=game.clubs[club].players.find(p=>p.id===id);if(player)return {player,club};}
  const player=game.market.find(p=>p.id===id);return player?{player,club:null}:null;
}
export function addToShortlist(game,id){
  const found=findScoutingPlayer(game,id);ensureScoutingDesk(game);
  if(!found||found.club===0||game.scoutingDesk.shortlist.length>=20||game.scoutingDesk.shortlist.some(p=>p.id===id))return false;
  game.scoutingDesk.shortlist.push({id,name:found.player.name,season:game.season,round:game.round});return true;
}
export function removeFromShortlist(game,id){
  const list=game.scoutingDesk?.shortlist,index=list?.findIndex(p=>p.id===id)??-1;
  if(index<0)return false;list.splice(index,1);return true;
}
