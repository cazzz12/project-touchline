import {readFileSync} from 'node:fs';
import {randomInt,randomUUID} from 'node:crypto';
import {toMatchPlayer,playerRating,validWorldPlayer} from '../public/world-model.js';
import {legends,legendMatchPlayer} from '../public/legends.js';
import {packTypes,packRulesVersion,packLimitPerRound,playerIdentity} from '../public/pack-rules.js';
import {fail} from './auth.js';
let savedPool;
function currentPlayers(){
 if(savedPool)return savedPool;
 const root=new URL('../public/world/',import.meta.url),index=JSON.parse(readFileSync(new URL('index.json',root)));
 if(!/^snapshot-[a-f0-9]{16}\/$/.test(index.bundlePath))throw Error('Ongeldig packbronpad.');
 const players=[];
 for(const league of index.leagues){if(!/^[a-z0-9-]+$/.test(league.id))throw Error('Ongeldige packbron.');const bundle=JSON.parse(readFileSync(new URL(index.bundlePath+league.id+'.json',root)));
  for(const club of bundle.clubs)for(const p of club.players){if(!validWorldPlayer(p)||!playerRating(p))throw Error('Ongeldige packspeler.');players.push(p);}}
 if(new Set(players.map(p=>p.id)).size!==players.length)throw Error('Dubbele speler in packbron.');
 return savedPool={id:index.id,players};
}
export function packService({draw=randomInt,pool=currentPlayers}={}){
 function open(state,clubIndex,packId){
  const pack=packTypes.find(p=>p.id===packId);if(!pack)fail(400,'Kies een bestaand pack.');
  const club=state.clubs[clubIndex],manager=state.managers[clubIndex],roundKey=state.season+':'+state.round;
  if(club.players.length>=40)fail(409,'Je selectie is vol. Maak eerst ruimte via transfers.');
  if(manager.credits<pack.price)fail(400,'Je hebt onvoldoende spelcredits.');
  const bought=manager.packRound===roundKey?manager.packsThisRound||0:0;
  if(bought>=packLimitPerRound)fail(409,'Je kunt maximaal twee packs per speeldag openen.');
  const source=pool(),owned=new Set(club.players.map(playerIdentity));
  const groups={normal:source.players.filter(p=>playerRating(p).overall<80&&!owned.has(p.id)),rare:source.players.filter(p=>playerRating(p).overall>=80&&!owned.has(p.id)),legendary:legends.filter(p=>!owned.has(p.id))};
  if(Object.values(groups).some(g=>g.length===0))fail(409,'Voor jouw selectie is een packgroep uitgeput. Er worden geen credits afgeschreven.');
  const roll=draw(10000);if(!Number.isInteger(roll)||roll<0||roll>=10000)throw Error('Ongeldige packloting.');
  const rarity=roll<pack.odds.normal?'normal':roll<pack.odds.normal+pack.odds.rare?'rare':'legendary';
  const index=draw(groups[rarity].length);if(!Number.isInteger(index)||index<0||index>=groups[rarity].length)throw Error('Ongeldige spelerloting.');
  const original=groups[rarity][index],player=rarity==='legendary'?legendMatchPlayer(original):toMatchPlayer(original);
  player.sourcePlayerId=original.id;player.id='card-'+randomUUID();player.rarity=rarity;
  const receipt={id:randomUUID(),pack:pack.id,name:pack.name,price:pack.price,currency:'spelcredits',rarity,playerId:player.id,playerName:player.name,sourcePlayerId:original.id,overall:player.sourceRating.overall,position:player.position,ratingEdition:player.ratingEdition,season:state.season,round:state.round+1,rules:packRulesVersion,source:source.id,odds:{...pack.odds}};
  club.players.push(player);manager.packRound=roundKey;manager.packsThisRound=bought+1;manager.packHistory=[receipt,...manager.packHistory||[]].slice(0,50);
  return receipt;
 }
 return {open};
}
