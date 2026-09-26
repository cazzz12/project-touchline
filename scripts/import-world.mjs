// Build-time import only. No account, token, or browser session is needed.
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {validWorldPlayer,playerRating} from '../public/world-model.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const cache=root+'data/world-import/',output=root+'public/world/';
await mkdir(cache,{recursive:true});await mkdir(output,{recursive:true});
const refresh=process.argv.includes('--refresh');
const digest=s=>createHash('sha256').update(s).digest('hex');
async function cached(name,url,html=false){
  if(!refresh){try{return JSON.parse(await readFile(cache+name+'.json','utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}}
  const response=await fetch(url,{headers:{Accept:html?'text/html':'application/json'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`${response.status} bij ${url}; import gestopt, bestaande bundel behouden.`);
  const text=await response.text();let value;
  if(html){const match=text.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);if(!match)throw Error('EA-pagina heeft een ander formaat.');value=JSON.parse(match[1]).props.pageProps;}
  else value=JSON.parse(text);
  const result={url,retrievedAt:new Date().toISOString(),sha256:digest(text),value};
  await writeFile(cache+name+'.json',JSON.stringify(result));await delay(200);return result;
}
const sources=[];
const current=await cached('current-metadata','https://www.ea.com/games/ea-sports-fc/ratings',true);
if(current.value.gameDetails.slug!=='fc-27')throw Error('Clubbron is van editie veranderd. Controleer de import eerst.');
sources.push({...current,value:undefined});
// A deliberately fixed scope; missing leagues must remain visible as gaps.
const scope=[
 ['13','premier-league','Premier League','Engeland','Europa'],['53','laliga','LaLiga','Spanje','Europa'],
 ['31','serie-a','Serie A','Italië','Europa'],['19','bundesliga','Bundesliga','Duitsland','Europa'],
 ['16','ligue-1','Ligue 1','Frankrijk','Europa'],['10','eredivisie','Eredivisie','Nederland','Europa'],
 ['308','liga-portugal','Liga Portugal','Portugal','Europa'],['4','pro-league','Pro League','België','Europa'],
 ['68','super-lig','Süper Lig','Turkije','Europa'],['50','scottish-premiership','Premiership','Schotland','Europa'],
 ['80','austria','Bundesliga','Oostenrijk','Europa'],['189','swiss-super-league','Super League','Zwitserland','Europa'],
 ['350','saudi-pro-league','Saudi Pro League','Saoedi-Arabië','Azië'],['83','k-league','K League 1','Zuid-Korea','Azië'],
 ['2012','chinese-super-league','Super League','China','Azië'],['2149','indian-super-league','Super League','India','Azië'],
 ['39','mls','Major League Soccer','VS / Canada','Amerika'],['353','argentina','Liga Profesional','Argentinië','Amerika'],
 ['341','liga-mx','Liga MX','Mexico','Amerika'],['351','a-league','A-League','Australië / Nieuw-Zeeland','Oceanië']
];
const ratings=new Map();let total=Infinity;
for(let offset=0;offset<total;offset+=100){
  const page=await cached('fc26-'+offset,`https://drop-api.ea.com/rating/ea-sports-fc?locale=en&gender=0&limit=100&offset=${offset}`);
  const j=page.value;if(!Array.isArray(j.items)||!j.items.length||!Number.isInteger(j.totalItems))throw Error('Onvolledige ratingpagina.');
  if(offset&&j.totalItems!==total)throw Error('Ratingbron veranderde tijdens import. Gebruik --refresh.');total=j.totalItems;
  for(const p of j.items){if(p.gender.id!==0||ratings.has(p.id))throw Error('Dubbele speler of verkeerd filter in ratingbron.');ratings.set(p.id,p);}
  sources.push({...page,value:undefined});if(offset%1000===0)console.log(`FC 26: ${ratings.size}/${total}`);
}
if(ratings.size!==total)throw Error('Ratingtelling klopt niet.');
// The API has no edition field. Fail closed if these published FC 26 launch
// fingerprints change; never silently import the next edition as FC 26.
for(const [id,ovr,pace,finishing] of [[231747,91,97,92],[209331,91,89,94]]){
  const p=ratings.get(id);if(p?.overallRating!==ovr||p.stats.pac.value!==pace||p.stats.finishing.value!==finishing)throw Error('FC 26-editiecontrole mislukt.');
}
const aliases={115845:'Atalanta',131682:'Inter',131681:'AC Milan',110781:'Club León',110150:'Querétaro FC',112678:'Atlético de San Luis',113134:'FC Juárez'};
const officialLogos={115845:'https://media-sdp.legaseriea.it/clubLogos/b5846a2413804c2e8cab8b773b18370a_light.webp',131682:'https://media-sdp.legaseriea.it/clubLogos/b7421caff23448c49134fa4f9095ee09_light.webp',131681:'https://media-sdp.legaseriea.it/clubLogos/d0867ddf777c41789ca282b8276002b0_light.webp'};
const leagues=[],seen=new Set(),bundles=[];
for(const [eaId,id,name,country,region] of scope){
  const group=current.value.ratingsFilters.teamGroups.find(g=>g.id===eaId&&g.gender.id===0);
  if(!group)throw Error(`Competitie ontbreekt: ${name}`);
  const teamIds=group.teams.map(t=>t.id),players=[];let count=Infinity;
  for(let page=1;players.length<count;page++){
    const source=await cached(id+'-'+page,`https://www.ea.com/games/ea-sports-fc/ratings?gender=0&team=${teamIds.join(',')}&page=${page}`,true);
    if(source.value.gameDetails.slug!=='fc-27')throw Error('Clubbron is van editie veranderd.');
    const j=source.value.ratingDetails;if(!Array.isArray(j.items)||!j.items.length)throw Error(`Onvolledige selectie: ${id}`);
    if(page>1&&count!==j.totalItems)throw Error('Clubbron veranderde tijdens import.');count=j.totalItems;
    for(const p of j.items){if(!teamIds.includes(p.team.id)||p.gender.id!==0||seen.has(p.id))throw Error('Dubbele speler of verkeerd clubfilter.');seen.add(p.id);players.push(p);}
    sources.push({...source,value:undefined});
  }
  if(players.length!==count)throw Error('Spelerstelling klopt niet.');
  const clubs=group.teams.map(t=>({id:'ea-'+t.id,eaId:t.id,name:aliases[t.id]||t.label,sourceName:t.label,
    logo:officialLogos[t.id]||t.imageUrl,source:`https://www.ea.com/games/ea-sports-fc/ratings?team=${t.id}`,
    players:players.filter(p=>p.team.id===t.id).map(p=>{
      const old=ratings.get(p.id),stats=old?Object.fromEntries(Object.entries(old.stats).map(([k,v])=>[k,v.value])):null;
      return {id:'ea-'+p.id,eaId:p.id,name:p.commonName||[p.firstName,p.lastName].filter(Boolean).join(' '),
        position:p.position.shortLabel,alternatePositions:(p.alternatePositions||[]).map(v=>v.shortLabel),nationality:p.nationality.label,
        birthdate:p.birthdate?new Date(p.birthdate+' UTC').toISOString().slice(0,10):null,
        fc27:old?null:{overall:p.overallRating,position:p.position.shortLabel,alternatePositions:(p.alternatePositions||[]).map(v=>v.shortLabel),weakFoot:p.weakFootAbility,skillMoves:p.skillMoves,preferredFoot:p.preferredFoot===1?'Rechts':'Links',stats:Object.fromEntries(Object.entries(p.stats).map(([k,v])=>[k,v.value]))},
        fc26:old?{overall:old.overallRating,position:old.position.shortLabel,alternatePositions:(old.alternatePositions||[]).map(v=>v.shortLabel),
          weakFoot:old.weakFootAbility,skillMoves:old.skillMoves,preferredFoot:old.preferredFoot===1?'Rechts':'Links',stats}:null};
    }).sort((a,b)=>(playerRating(b)?.overall||0)-(playerRating(a)?.overall||0)||a.name.localeCompare(b.name))})).sort((a,b)=>a.name.localeCompare(b.name));
  if(clubs.some(c=>c.players.length<11||c.players.length>65))throw Error(`Onwaarschijnlijke selectiegrootte: ${id}`);
  if(clubs.some(c=>c.players.some(p=>!validWorldPlayer(p))))throw Error(`Ongeldige spelergegevens: ${id}`);
  const summary={id,eaId,name,country,region,clubs:clubs.map(({players,...c})=>({...c,playerCount:players.length,ratedCount:players.filter(p=>p.fc26).length,
    fallbackCount:players.filter(p=>p.fc27).length,playable:players.filter(playerRating).length>=18&&players.filter(p=>playerRating(p)&&p.position==='GK').length>=2})),playerCount:players.length,ratedCount:clubs.reduce((sum,c)=>sum+c.players.filter(p=>p.fc26).length,0),fallbackCount:clubs.reduce((sum,c)=>sum+c.players.filter(p=>p.fc27).length,0)};
  summary.playable=summary.clubs.every(c=>c.playable);leagues.push(summary);bundles.push([id,{id,clubs}]);
  console.log(`${country} · ${name}: ${clubs.length} clubs, ${players.length} spelers, ${summary.ratedCount} FC 26-ratings`);
}
const snapshot={schema:1,id:'world-'+current.retrievedAt.slice(0,10),retrievedAt:current.retrievedAt,rosterSource:'EA SPORTS FC 27 openbare ratingscatalogus',
  ratingSource:'FC 26 basisratings; FC 27 waar FC 26 ontbreekt',rosterDisclaimer:'EA-momentopname; niet per club bevestigd als actuele officiële selectie. Jeugdspelers en recente transfers kunnen ontbreken.',
  leagues,gaps:[{name:'J1 League',country:'Japan',reason:'Geen volledige selectie- en FC 26-ratingbron in deze import.'},{name:'Série A',country:'Brazilië',reason:'Geen volledige Braziliaanse competitie met echte spelers in deze EA-bron.'},{name:'Stars League',country:'Qatar',reason:'Geen volledige competitie in deze EA-bron.'},{name:'Pro League',country:'Verenigde Arabische Emiraten',reason:'Alleen losse clubs in deze EA-bron; geen volledige competitie.'}],
  playerCount:leagues.reduce((n,l)=>n+l.playerCount,0),ratedCount:leagues.reduce((n,l)=>n+l.ratedCount,0),fallbackCount:leagues.reduce((n,l)=>n+l.fallbackCount,0),clubCount:leagues.reduce((n,l)=>n+l.clubs.length,0)};
// Content-addressed bundles keep the previous index usable even if a write fails.
const hash=digest(JSON.stringify(bundles)).slice(0,16);snapshot.id+='-'+hash;snapshot.bundlePath='snapshot-'+hash+'/';
await mkdir(output+snapshot.bundlePath,{recursive:true});
for(const [id,bundle] of bundles)await writeFile(output+snapshot.bundlePath+id+'.json',JSON.stringify(bundle));
await writeFile(output+snapshot.bundlePath+'sources.json',JSON.stringify({snapshot:snapshot.id,sources,clubAliases:{sources:['https://www.legaseriea.it/team','https://www.atleticodesanluis.mx/noticias/2375/Atltico-de-San-Luis-ya-conoce-su-calendario-para-el-Apertura-2026'],names:aliases,logos:officialLogos}},null,2));
await writeFile(output+'index.json.tmp',JSON.stringify(snapshot,null,2));await rename(output+'index.json.tmp',output+'index.json');
console.log(JSON.stringify({clubs:snapshot.clubCount,players:snapshot.playerCount,ratings:snapshot.ratedCount,playableLeagues:leagues.filter(l=>l.playable).map(l=>l.id)}));
