import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {worldClubs} from '../public/world-model.js';
const directory=fileURLToPath(new URL('../public/world/',import.meta.url));
export function worldRepository(root=directory){
  let index;try{index=JSON.parse(readFileSync(root+'index.json','utf8'));}catch(error){if(error.code==='ENOENT')return {index:null,create(){throw Error('De wereldcatalogus is nog niet beschikbaar.');}};throw error;}
  if(!/^snapshot-[a-f0-9]{16}\/$/.test(index.bundlePath))throw Error('Ongeldig databundelpad.');
  return {index,create(id){
    const entry=index.leagues.find(l=>l.id===id);if(!entry||!entry.playable)throw Error('Deze competitie heeft nog een onvolledige bronselectie. Bekijk de wereldcatalogus.');
    if(!/^[a-z0-9-]+$/.test(id))throw Error('Ongeldige competitie.');
    const bundle=JSON.parse(readFileSync(root+index.bundlePath+id+'.json','utf8'));
    if(bundle.id!==entry.id||bundle.clubs.length!==entry.clubs.length||bundle.clubs.some((c,i)=>c.id!==entry.clubs[i].id))throw Error('De databundel klopt niet met de catalogus.');
    return {clubs:worldClubs(bundle),catalog:{id,snapshot:index.id,name:entry.name,country:entry.country,rosterSource:index.rosterSource,ratingSource:index.ratingSource}};
  }};
}
