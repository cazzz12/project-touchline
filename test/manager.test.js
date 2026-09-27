import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../backend/database.js';
import {readManager,saveManager,saveGuide} from '../backend/manager.js';
import {lessonResult,lessons} from '../public/manager-model.js';
import {starterView,academyView,profileForm} from '../public/manager-ui.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dbFor(t){const db=openDatabase(':memory:');for(const id of ['a','b'])db.prepare('INSERT INTO accounts VALUES (?,?,?)').run(id,id,0);t.after(()=>db.close());return db;}
test('manager profile and guide survive restart without changing existing accounts, world data or auth secret',()=>{
 const dir=mkdtempSync(join(tmpdir(),'touchline-guide-')),file=join(dir,'game.sqlite');let db=openDatabase(file);
 try{db.prepare('INSERT INTO accounts VALUES (?,?,?)').run('a','Existing manager',0);db.prepare('INSERT INTO leagues VALUES (?,?,?,?,?)').run('league','a','oldcode',4,'{"existing":"untouched"}');const secret=db.prepare("SELECT value FROM settings WHERE key='auth-secret'").get().value;
 saveManager(db,'a',{name:'Coach Alex',avatar:5,mood:'heart',motto:'Samen tot het fluitsignaal'});saveGuide(db,'a',{stage:'learn',lesson:'training'});saveGuide(db,'a',{lesson:'training'});saveGuide(db,'a',{onboarding:false});db.close();db=openDatabase(file);
 assert.deepEqual(readManager(db,'a'),{avatar:5,mood:'heart',motto:'Samen tot het fluitsignaal',stage:'learn',onboarding:false,learned:['training']});assert.equal(db.prepare("SELECT name FROM accounts WHERE id='a'").get().name,'Coach Alex');assert.equal(db.prepare("SELECT state FROM leagues WHERE id='league'").get().state,'{"existing":"untouched"}');assert.equal(db.prepare("SELECT value FROM settings WHERE key='auth-secret'").get().value,secret);assert.equal(db.prepare('PRAGMA user_version').get().user_version,3);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
test('invalid profiles fail atomically and tutorial progress stays isolated per account',t=>{
 const db=dbFor(t),before=readManager(db,'a');for(const input of [{name:'Valid',avatar:7},{name:'x'},{mood:'__proto__'},{motto:'<img onerror=alert(1)>'},{motto:'x'.repeat(81)},{credits:999999},{avatar:'2'}])assert.throws(()=>saveManager(db,'a',input));
 for(const input of [{stage:'admin'},{onboarding:'false'},{lesson:'reward'},{learned:lessons.map(l=>l.id)},{}])assert.throws(()=>saveGuide(db,'a',input));assert.deepEqual(readManager(db,'a'),before);assert.equal(db.prepare("SELECT name FROM accounts WHERE id='a'").get().name,'a');saveGuide(db,'a',{lesson:'sell'});assert.deepEqual(readManager(db,'b'),before);
});
test('profile without emotion keeps old stored preferences while removing all emotion controls',t=>{
 const db=dbFor(t);saveManager(db,'a',{name:'Coach',avatar:4,mood:'heart',motto:'Samen winnen'});saveGuide(db,'a',{lesson:'training'});
 saveManager(db,'a',{name:'Coach Nova',avatar:3,motto:'Altijd vooruit'});const profile=readManager(db,'a');assert.equal(profile.mood,'heart');assert.deepEqual(profile.learned,['training']);assert.equal(profile.avatar,3);
 const html=profileForm({name:'Coach Nova',profile},esc);assert.doesNotMatch(html,/emotie|name="mood"|mood-picker/);assert.match(html,/name="avatar" value="3" checked/);
});

test('all lessons have one correct choice and invalid exercises cannot finish a lesson',()=>{
 for(const l of lessons){for(let i=0;i<l.choices.length;i++)assert.equal(lessonResult(l.id,i).correct,i===l.answer);assert.ok(lessonResult(l.id,l.answer).text.length>20);}for(const [id,choice] of [['unknown',0],['training',-1],['training',20],['sell',NaN]])assert.throws(()=>lessonResult(id,choice));
});
test('club cards require an explicit available club and tutorial markup keeps profile text inert',t=>{
 const db=dbFor(t),account={name:'<script>bad</script>',profile:readManager(db,'a')};const catalog={leagues:[{id:'eredivisie',name:'Eredivisie',country:'Nederland',playable:true,clubs:[{name:'Ajax'},{name:'PSV'}]}]},directory={rooms:[{id:'room',title:'Server',clubs:[{index:0,name:'Ajax',occupied:true},{index:1,name:'PSV',occupied:false}]}]};
 const html=starterView({account,esc,catalog,directory,selectedCatalog:'eredivisie',selectedRoom:'room',region:'eu',rules:'collection',stage:'club'});assert.match(html,/name="club" value="0" required disabled/);assert.match(html,/name="club" value="1" required /);assert.doesNotMatch(html,/\bchecked\b/);assert.match(profileForm(account,esc),/&lt;script&gt;/);assert.doesNotMatch(profileForm(account,esc),/<script>/);const lesson=academyView({account,esc,lessonId:'training'});assert.match(lesson,/oefentraining/);assert.doesNotMatch(lesson,/data-command=|id="train"/);
});
