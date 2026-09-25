import {formations, positionFit, rng} from './engine.js';
import {keeperAbility} from './keepers.js';

// Entirely fictional match availability. Never describes a real player's health.
export const injuryTypes={knock:{label:'Lichte tik',days:1},muscle:{label:'Spierklachten',days:2},ankle:{label:'Enkelklachten',days:3}};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const roundNumber=g=>(g.season-1)*10+g.round;
export function ensureFitness(game){
  if(game.medical===undefined)game.medical={schema:1,injuries:{},lastRound:roundNumber(game)};
  return game;
}
export const injuryFor=(game,id)=>game.medical?.injuries?.[id]||null;
export const availablePlayers=(game,index=0)=>game.clubs[index].players.filter(p=>!injuryFor(game,p.id));
export const unavailableSelection=game=>[...game.lineupIds,...game.benchIds].filter(id=>injuryFor(game,id));
export const fitnessAfterMinutes=(player,minutes=0)=>clamp(Math.round(player.fitness-minutes*(.08+(100-player.stamina)*.0015)),25,100);
export const medicalLevel=(game,index=0)=>index===0?game.management.facilities.medical:1;
export const restGain=(game,index,minutes)=> (minutes?12:18)+2*(medicalLevel(game,index)-1);
export function injuryRisk(player,minutes,level=1){
  if(minutes<=0)return 0;
  return Math.min(.12,(.012+Math.max(0,70-player.fitness)*.0012+minutes*.00015)*(1-(level-1)*.12));
}
export const injuryDuration=(kind,level)=>Math.max(1,injuryTypes[kind].days-Math.floor((level-1)/2));
function seedFor(text){let n=17;for(const c of text)n=Math.imul(n,31)+c.charCodeAt(0)|0;return n;}
function effectiveQuality(p){return (p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6*(.35+.65*p.fitness/100);}

// Pure advice: no save or manual selection is changed until the caller applies it.
export function recommendedSquad(game,index=0,formation=game.tactics.formation,keeperRules=1){
  const remaining=availablePlayers(game,index).slice(),lineupIds=[];
  if(remaining.length<18||!formations[formation])return null;
  for(const role of formations[formation]){
    remaining.sort((a,b)=>{
      const score=p=>(role==='GK'?(p.position==='GK'?10000:0):(p.position==='GK'?-10000:0))+(role==='GK'&&keeperRules===1?keeperAbility(p):effectiveQuality(p)*positionFit(p.position,role));
      return score(b)-score(a)||a.id.localeCompare(b.id);
    });
    lineupIds.push(remaining.shift().id);
  }
  remaining.sort((a,b)=>effectiveQuality(b)-effectiveQuality(a)||a.id.localeCompare(b.id));
  const keeper=remaining.filter(p=>p.position==='GK').sort((a,b)=>keeperRules===1?keeperAbility(b)-keeperAbility(a):0)[0];
  const reserves=remaining.filter(p=>p.id!==keeper?.id).sort((a,b)=>Number(a.position==='GK')-Number(b.position==='GK')||effectiveQuality(b)-effectiveQuality(a)||a.id.localeCompare(b.id));
  const benchIds=[...(keeper?[keeper.id]:[]),...reserves.map(p=>p.id)].slice(0,7);
  const captainId=index===0&&lineupIds.includes(game.captainId)?game.captainId:game.clubs[index].players.filter(p=>lineupIds.includes(p.id)).sort((a,b)=>b.composure-a.composure)[0].id;
  return {lineupIds,benchIds,captainId};
}
export function applyRecommendedSquad(game){
  if(game.pending)return false;
  const proposed=recommendedSquad(game);if(!proposed)return false;
  Object.assign(game,proposed);return true;
}

// One settlement per completed round. Use a separate seed so injuries never
// consume the match engine's random stream or change already-played minutes.
export function settleFitness(game,minutesByClub){
  ensureFitness(game);const number=roundNumber(game)+1;
  if(game.medical.lastRound>=number)return null;
  const report={injured:[],recovered:[]},oldInjuries=new Set(Object.keys(game.medical.injuries));
  for(const club of game.clubs)for(const p of club.players){
    const injury=injuryFor(game,p.id);if(!injury)continue;
    injury.remaining--;
    if(injury.remaining===0){delete game.medical.injuries[p.id];if(club===game.clubs[0])report.recovered.push(p.name);}
  }
  for(const [index,club] of game.clubs.entries()){
    const level=medicalLevel(game,index),minutes=minutesByClub[index]||{};
    for(const p of club.players){
      const played=minutes[p.id]||0,random=rng(seedFor(`${game.season}:${game.round}:${p.id}`));
      if(!oldInjuries.has(p.id)&&random()<injuryRisk(p,played,level)){
        const available=availablePlayers(game,index);
        // Keep this small local league playable without fictional emergency players.
        if(available.length>18&&(p.position!=='GK'||available.filter(p=>p.position==='GK').length>2)){
          const roll=random(),kind=roll<.4?'knock':roll<.8?'muscle':'ankle',remaining=injuryDuration(kind,level);
          game.medical.injuries[p.id]={kind,remaining,season:game.season,round:game.round+1};
          if(index===0)report.injured.push({name:p.name,kind,remaining});
        }
      }
      // Injured players rest too, but recovering condition does not clear an injury.
      p.fitness=clamp((played?fitnessAfterMinutes(p,played):p.fitness)+restGain(game,index,played),0,100);
    }
  }
  game.medical.lastRound=number;
  for(const p of report.injured)game.news.unshift(`${p.name}: ${injuryTypes[p.kind].label.toLowerCase()} in het spel. ${p.remaining} speeldag(en) niet inzetbaar.`);
  for(const name of report.recovered)game.news.unshift(`${name} is weer inzetbaar na herstel in het spel.`);
  return report;
}
export function seasonRest(game){
  ensureFitness(game);game.medical.injuries={};
  for(const club of game.clubs)for(const p of club.players)p.fitness=100;
  game.medical.lastRound=roundNumber(game);
}
