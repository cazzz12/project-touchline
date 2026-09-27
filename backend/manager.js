import {defaultProfile,avatarNames,moods,starterStages,lessons} from '../public/manager-model.js';
import {transaction} from './database.js';
import {fail} from './auth.js';
const key=user=>'manager-profile:'+user;
const isObject=v=>v&&typeof v==='object'&&!Array.isArray(v);
function allowed(input,keys){if(!isObject(input)||!Object.keys(input).length||Object.keys(input).some(k=>!keys.includes(k)))fail(400,'Ongeldige profielopdracht.');}
export function readManager(db,user){const raw=db.prepare('SELECT value FROM settings WHERE key=?').get(key(user));return raw?{...defaultProfile(),...JSON.parse(raw.value)}:defaultProfile();}
function write(db,user,p){db.prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key(user),JSON.stringify(p));return p;}
export function saveManager(db,user,input){
 allowed(input,['name','avatar','mood','motto']);
 if('name' in input&&(typeof input.name!=='string'||input.name.trim().length<2||input.name.trim().length>30||/[<>\x00-\x1f]/.test(input.name)))fail(400,'Gebruik een managernaam van 2 tot 30 tekens.');
 if('avatar' in input&&(!Number.isInteger(input.avatar)||input.avatar<0||input.avatar>=avatarNames.length))fail(400,'Kies een managerportret.');
 if('mood' in input&&!Object.hasOwn(moods,input.mood))fail(400,'Kies een geldige emotie.');
 if('motto' in input&&(typeof input.motto!=='string'||input.motto.trim().length>80||/[<>\x00-\x1f]/.test(input.motto)))fail(400,'Gebruik een motto van maximaal 80 tekens, zonder HTML.');
 return transaction(db,()=>{const p=readManager(db,user);for(const k of ['avatar','mood','motto'])if(k in input)p[k]=typeof input[k]==='string'?input[k].trim():input[k];if('name' in input)db.prepare('UPDATE accounts SET name=? WHERE id=?').run(input.name.trim(),user);return write(db,user,p);});
}
export function saveGuide(db,user,input){
 allowed(input,['stage','onboarding','lesson']);
 if('stage' in input&&!starterStages.includes(input.stage))fail(400,'Onbekende startstap.');
 if('onboarding' in input&&typeof input.onboarding!=='boolean')fail(400,'Ongeldige tutorialkeuze.');
 if('lesson' in input&&!lessons.some(l=>l.id===input.lesson))fail(400,'Onbekende oefenles.');
 return transaction(db,()=>{const p=readManager(db,user);if('stage' in input)p.stage=input.stage;if('onboarding' in input)p.onboarding=input.onboarding;if(input.lesson&&!p.learned.includes(input.lesson))p.learned.push(input.lesson);return write(db,user,p);});
}
