import {clubTransferQuote} from './transfers.js';
import {overall,transferValue} from './management.js';
import {broadRole,matchesCriteria,findScoutingPlayer} from './scouting-state.js';
import {keeperAttributes} from './keepers.js';

export const roleWeights={GK:{reflexes:50,handling:25,positioning:25},DEF:{defending:50,passing:20,pace:15,composure:15},MID:{passing:45,composure:25,stamina:20,defending:10},ATT:{attack:30,finishing:35,pace:20,composure:15}};
export function roleScore(player){const p=player.position==='GK'?{...player,...keeperAttributes(player)}:player;return Math.round(Object.entries(roleWeights[broadRole(player)]).reduce((sum,[skill,weight])=>sum+p[skill]*weight,0)/100);}
export function scoutingCandidate(game,id){
  const found=findScoutingPlayer(game,id);if(!found)return null;
  const {player,club}=found;
  if(club===0)return {...found,source:game.clubs[0].name,price:null,salary:game.management.contracts[id].salary,reason:'Al in jouw selectie.'};
  if(club!==null){const q=clubTransferQuote(game,club,id);return {...found,source:q.sellerName,price:q.asking,salary:q.salary,reason:q.reason};}
  return {...found,source:'Scoutingrapport',price:transferValue(player),salary:Math.max(100,(overall(player)-40)*15),reason:game.pending?'Rond eerst de lopende wedstrijd af.':game.clubs[0].players.length>=55?'Je selectie zit vol (55 spelers).':''};
}
export function searchCandidates(game){
  const c=game.scoutingDesk.criteria;
  return [...game.clubs.slice(1).flatMap(club=>club.players),...game.market].map(p=>scoutingCandidate(game,p.id)).filter(q=>matchesCriteria(q.player,q.price,c))
    .sort((a,b)=>(c.skill==='any'?overall(b.player)-overall(a.player):b.player[c.skill]-a.player[c.skill])||a.price-b.price||a.player.id.localeCompare(b.player.id));
}
export function compareCandidate(game,id,ownId){
  const candidate=scoutingCandidate(game,id);if(!candidate||candidate.club===0)return null;
  const group=broadRole(candidate.player),options=game.clubs[0].players.filter(p=>broadRole(p)===group);
  const own=ownId?options.find(p=>p.id===ownId):options.filter(p=>game.lineupIds.includes(p.id)).sort((a,b)=>roleScore(b)-roleScore(a))[0]||options.slice().sort((a,b)=>roleScore(b)-roleScore(a))[0];
  if(!own)return null;
  const weights=roleWeights[group],score=roleScore(candidate.player),ownScore=roleScore(own);
  return {candidate,own,options,weights,score,ownScore,difference:score-ownScore,salaryDifference:candidate.salary-game.management.contracts[own.id].salary,
    skills:Object.keys(weights),slot:game.lineupIds.indexOf(own.id)};
}
