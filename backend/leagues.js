import {randomBytes,randomUUID} from 'node:crypto';
import {newGame,schedule,standings} from '../public/game.js';
import {formations,lineUp,simulate} from '../public/engine.js';
import {transaction} from './database.js';
import {fail,digest} from './auth.js';

const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const tactics={formation:'4-3-3',mentality:50,pressing:50,tempo:50};
export function fields(value,keys){if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!keys.includes(k)))fail(400,'Ongeldige opdracht.');}
const label=(s,max=50)=>typeof s==='string'&&s.trim().length>=2&&s.trim().length<=max&&!/[\x00-\x1f]/.test(s);
function fresh(title){
  const clubs=newGame().clubs;
  return {schema:1,title,phase:'lobby',season:1,round:0,seed:randomBytes(4).readUInt32BE(),clubs,results:[],reports:[],offers:[],history:[],
    managers:clubs.map(c=>({tactics:{...tactics},lineupIds:lineUp(c,'4-3-3',1).map(p=>p.id),credits:120000,trainedRound:-1,ready:false,ledger:[{season:1,round:0,amount:120000,label:'Startbudget',balance:120000}]}))};
}
function cash(state,i,amount,label){const m=state.managers[i];m.credits+=amount;m.ledger.push({season:state.season,round:state.round+1,amount,label,balance:m.credits});m.ledger=m.ledger.slice(-100);}
function lineup(state,i){const m=state.managers[i];if(m.lineupIds.some(id=>!state.clubs[i].players.some(p=>p.id===id)))m.lineupIds=lineUp(state.clubs[i],m.tactics.formation,1).map(p=>p.id);}
function settleRound(s){
  s.offers=[];s.reports=[];
  for(const [home,away] of schedule()[s.round]){
    const result=simulate({seed:(s.seed+s.season*100003+s.round*101+home*7)>>>0,clubs:[s.clubs[home],s.clubs[away]],homeTactics:s.managers[home].tactics,awayTactics:s.managers[away].tactics,homeSelection:s.managers[home].lineupIds,awaySelection:s.managers[away].lineupIds,keeperRules:1});
    const goals=result.stats.map(v=>v.goals);s.results.push({home,away,goals,round:s.round+1});
    s.reports.push({home,away,goals,round:s.round+1,stats:result.stats,events:result.events});
    for(const [i,other] of [[home,away],[away,home]]){const n=i===home?0:1;cash(s,i,goals[n]>goals[1-n]?26000:goals[n]===goals[1-n]?18000:10000,`Wedstrijdbonus tegen ${s.clubs[other].name}`);}
  }
  s.round++;s.managers.forEach(m=>{m.ready=false;});if(s.round===10)s.phase='complete';
}

export function leagueService(db,{now=Date.now}={}){
  const get=id=>{const row=db.prepare('SELECT * FROM leagues WHERE id=?').get(id);if(!row)fail(404,'Competitie niet gevonden.');return {...row,data:JSON.parse(row.state)};};
  const members=id=>db.prepare('SELECT m.account,m.club,a.name FROM members m JOIN accounts a ON a.id=m.account WHERE league=? ORDER BY club').all(id);
  const member=(id,user)=>{const m=db.prepare('SELECT club FROM members WHERE league=? AND account=?').get(id,user);if(!m)fail(403,'Je bent geen deelnemer aan deze competitie.');return m.club;};
  function view(id,user){
    const i=member(id,user),r=get(id),s=r.data,people=members(id);
    return {id:r.id,code:r.code,version:r.version,owner:r.owner===user,myClub:i,title:s.title,phase:s.phase,season:s.season,round:s.round,clubs:s.clubs,
      members:people.map(p=>({club:p.club,name:p.name,ready:s.managers[p.club].ready})),my:s.managers[i],table:standings(s),fixtures:s.round<10?schedule()[s.round]:[],results:s.results,reports:s.reports,history:s.history,
      offers:s.offers.filter(o=>o.buyer===i||o.seller===i)};
  }
  function once(user,input,fn){
    if(typeof input.id!=='string'||!/^[\w-]{16,80}$/.test(input.id))fail(400,'De opdracht mist een geldige unieke code.');
    return transaction(db,()=>{
      const fingerprint=digest(JSON.stringify(input)),previous=db.prepare('SELECT * FROM operations WHERE account=? AND id=?').get(user,input.id);
      if(previous){if(previous.fingerprint!==fingerprint)fail(409,'Deze opdrachtcode is al gebruikt.');return JSON.parse(previous.result);}
      const result=fn();db.prepare('INSERT INTO operations VALUES (?,?,?,?,?)').run(user,input.id,fingerprint,JSON.stringify(result),now());return result;
    });
  }
  function create(user,input){fields(input,['id','title','club']);if(!label(input.title)||!integer(input.club,0,5))fail(400,'Kies een naam en een echte club.');
    return once(user,input,()=>{
      if(db.prepare('SELECT count(*) AS n FROM members WHERE account=?').get(user).n>=10)fail(400,'Je kunt aan maximaal tien competities deelnemen.');
      const id=randomUUID(),code=randomBytes(6).toString('hex').toUpperCase();db.prepare('INSERT INTO leagues VALUES (?,?,?,?,?)').run(id,user,code,1,JSON.stringify(fresh(input.title.trim())));db.prepare('INSERT INTO members VALUES (?,?,?)').run(id,user,input.club);return {id};
    });
  }
  function join(user,input){fields(input,['id','code','club']);if(typeof input.code!=='string'||!/^[A-F0-9]{12}$/i.test(input.code)||!integer(input.club,0,5))fail(400,'Controleer je competitiecode en club.');
    return once(user,input,()=>{
      const r=db.prepare('SELECT * FROM leagues WHERE code=?').get(input.code.toUpperCase());if(!r)fail(404,'Competitiecode niet gevonden.');
      if(JSON.parse(r.state).phase!=='lobby')fail(409,'Deze competitie is al gestart.');
      if(db.prepare('SELECT 1 FROM members WHERE league=? AND (account=? OR club=?)').get(r.id,user,input.club))fail(409,'Deze club is bezet of je doet al mee.');
      if(db.prepare('SELECT count(*) AS n FROM members WHERE account=?').get(user).n>=10)fail(400,'Je kunt aan maximaal tien competities deelnemen.');
      db.prepare('INSERT INTO members VALUES (?,?,?)').run(r.id,user,input.club);db.prepare('UPDATE leagues SET version=version+1 WHERE id=?').run(r.id);return {id:r.id};
    });
  }
  function act(user,leagueId,input){
    fields(input,['id','version','type','tactics','lineupIds','playerId','skill','seller','amount','offerId','name']);
    return once(user,{...input,leagueId},()=>{
      const i=member(leagueId,user),r=get(leagueId),s=r.data,m=s.managers[i],people=members(leagueId);
      if(!integer(input.version,1,1e12)||input.version!==r.version)fail(409,'De competitie is veranderd. Vernieuw en probeer opnieuw.');
      if(input.type==='start'){
        if(r.owner!==user)fail(403,'Alleen de organisator kan starten.');if(s.phase!=='lobby'||people.length<2)fail(409,'Er moeten minimaal twee managers in de lobby zitten.');s.phase='active';
      }else if(input.type==='season'){
        if(r.owner!==user)fail(403,'Alleen de organisator kan het seizoen openen.');if(s.phase!=='complete')fail(409,'Rond eerst het seizoen af.');
        s.history.push({season:s.season,table:standings(s)});s.history=s.history.slice(-20);s.season++;s.round=0;s.results=[];s.reports=[];s.offers=[];s.phase='active';s.managers.forEach(m=>{m.trainedRound=-1;m.ready=false;});
      }else{
        if(s.phase!=='active')fail(409,'Deze actie kan alleen tijdens een gestart seizoen.');
        if(input.type==='unready'){m.ready=false;}
        else{
          if(m.ready)fail(409,'Trek eerst je gereedmelding in.');
          if(input.type==='ready'){
            m.ready=true;if(people.every(p=>s.managers[p.club].ready))settleRound(s);
          }else if(input.type==='tactics'){
            const t=input.tactics;fields(t,['formation','mentality','pressing','tempo']);if(!Object.hasOwn(formations,t.formation)||!['mentality','pressing','tempo'].every(k=>integer(t[k],0,100)))fail(400,'Ongeldige tactiek.');m.tactics={...t};
            const ids=input.lineupIds;if(!Array.isArray(ids)||ids.length!==11||new Set(ids).size!==11||ids.some(id=>!s.clubs[i].players.some(p=>p.id===id))||s.clubs[i].players.find(p=>p.id===ids[0]).position!=='GK')fail(400,'Kies elf verschillende eigen spelers, met een keeper in het doel.');m.lineupIds=[...ids];
          }else if(input.type==='train'){
            const p=s.clubs[i].players.find(p=>p.id===input.playerId);if(!p||!['attack','passing','defending','pace','finishing','composure'].includes(input.skill))fail(400,'Kies een eigen speler en vaardigheid.');
            if(m.trainedRound===s.round)fail(409,'Je hebt deze speeldag al getraind.');if(m.credits<1000||p[input.skill]>=99)fail(400,'Onvoldoende credits of vaardigheid al maximaal.');p[input.skill]++;m.trainedRound=s.round;cash(s,i,-1000,`Training ${p.name}`);
          }else if(input.type==='offer'){
            const seller=input.seller;if(!integer(seller,0,5)||seller===i||!people.some(p=>p.club===seller))fail(400,'Bied op een speler van een andere menselijke manager.');
            if(s.managers[seller].ready)fail(409,'Deze manager is al klaar voor de speeldag.');
            if(!s.clubs[seller].players.some(p=>p.id===input.playerId)||!integer(input.amount,1000,10000000)||input.amount>m.credits)fail(400,'Ongeldige speler of bedrag.');
            if(s.offers.filter(o=>o.buyer===i).length>=5||s.offers.some(o=>o.buyer===i&&o.playerId===input.playerId))fail(409,'Maximaal vijf biedingen en één bod per speler.');
            s.offers.push({id:randomUUID(),buyer:i,seller,playerId:input.playerId,amount:input.amount});
          }else if(['accept','reject','cancel'].includes(input.type)){
            const offer=s.offers.find(o=>o.id===input.offerId);if(!offer)fail(409,'Dit bod is verlopen.');if((input.type==='cancel'?offer.buyer:offer.seller)!==i)fail(403,'Je mag dit bod niet afhandelen.');
            if(input.type==='accept'){
              const seller=s.clubs[i],buyer=s.clubs[offer.buyer],p=seller.players.find(p=>p.id===offer.playerId),bm=s.managers[offer.buyer];
              if(!p||bm.ready||bm.credits<offer.amount)fail(409,'De koper is al klaar, heeft onvoldoende credits of de speler is verhuisd.');
              if(seller.players.length<=18||(p.position==='GK'&&seller.players.filter(p=>p.position==='GK').length<=2)||buyer.players.length>=40)fail(409,'De transfer past niet binnen de selectiegrenzen.');
              seller.players=seller.players.filter(v=>v.id!==p.id);buyer.players.push(p);cash(s,i,offer.amount,`Verkoop ${p.name}`);cash(s,offer.buyer,-offer.amount,`Aankoop ${p.name}`);lineup(s,i);s.offers=s.offers.filter(o=>o.playerId!==p.id);
            }else s.offers=s.offers.filter(o=>o.id!==offer.id);
          }else fail(400,'Onbekende spelactie.');
        }
      }
      db.prepare('UPDATE leagues SET version=version+1,state=? WHERE id=?').run(JSON.stringify(s),leagueId);return {id:leagueId};
    });
  }
  return {create,join,act,view,list:user=>db.prepare('SELECT l.id,l.state,m.club FROM leagues l JOIN members m ON m.league=l.id WHERE m.account=?').all(user).map(r=>{const s=JSON.parse(r.state);return {id:r.id,title:s.title,phase:s.phase,club:s.clubs[r.club].name,round:s.round,season:s.season};}),
    rename:(user,name)=>{if(!label(name,30))fail(400,'Gebruik een managernaam van 2 tot 30 tekens.');db.prepare('UPDATE accounts SET name=? WHERE id=?').run(name.trim(),user);}};
}
