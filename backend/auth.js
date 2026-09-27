import {createHash,createHmac,randomBytes,randomInt,randomUUID,createPublicKey,verify,timingSafeEqual} from 'node:crypto';
import {transaction} from './database.js';
export const digest=text=>createHash('sha256').update(text).digest('hex');
export function fail(status,message){throw Object.assign(new Error(message),{status});}
const token=()=>randomBytes(32).toString('base64url');
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export function decodeAddress(address){
  if(typeof address!=='string'||address.length<32||address.length>44)fail(400,'Ongeldig Solana-adres.');
  let n=0n;for(const char of address){const i=alphabet.indexOf(char);if(i<0)fail(400,'Ongeldig Solana-adres.');n=n*58n+BigInt(i);}
  const hex=n.toString(16),bytes=n===0n?Buffer.alloc(0):Buffer.from(hex.length%2?'0'+hex:hex,'hex');
  const result=Buffer.concat([Buffer.alloc(address.match(/^1*/)[0].length),bytes]);if(result.length!==32)fail(400,'Ongeldig Solana-adres.');return result;
}
export function authService(db,{origin,dev,sendEmail,now=Date.now}){
  const secret=db.prepare('SELECT value FROM settings WHERE key=?').get('auth-secret').value;
  const proof=(id,code)=>createHmac('sha256',secret).update(id+':'+code).digest('hex');
  function rate(key,max=8,window=3600000){
    const time=now();db.prepare('DELETE FROM limits WHERE expires<?').run(time);
    db.prepare('INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,time+window);
    if(db.prepare('SELECT count FROM limits WHERE key=?').get(key).count>max)fail(429,'Te veel pogingen. Probeer het later opnieuw.');
  }
  function getSession(cookie){return cookie?db.prepare('SELECT s.*,a.name FROM sessions s JOIN accounts a ON a.id=s.account WHERE hash=? AND expires>?').get(digest(cookie),now()):null;}
  function accountView(session){return {id:session.account,name:session.name,identities:db.prepare('SELECT kind,identifier FROM identities WHERE account=? ORDER BY kind').all(session.account)};}
  function clean(){db.prepare('DELETE FROM challenges WHERE expires<?').run(now());db.prepare('DELETE FROM sessions WHERE expires<?').run(now());}
  async function challenge({kind,identifier,link=false},browser,session,ip){
    clean();rate('challenge-ip:'+ip,30);if(!['email','wallet'].includes(kind))fail(400,'Kies e-mail of wallet.');
    if(link&&(!session||now()-session.created>15*60000))fail(401,'Meld je opnieuw aan voordat je een inlogmethode koppelt.');
    if(kind==='email'){
      if(typeof identifier!=='string'||identifier.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(identifier))fail(400,'Vul een geldig e-mailadres in.');
      identifier=identifier.toLowerCase().trim();if(dev&&!identifier.endsWith('.test'))fail(400,'Gebruik in lokale testmodus een adres dat eindigt op .test, zoals manager@touchline.test.');
    }else decodeAddress(identifier);
    rate('challenge-identity:'+kind+':'+digest(identifier));
    const id=randomUUID(),code=String(randomInt(100000,1000000)),expires=now()+10*60000,account=link?session.account:null;
    const message=`${new URL(origin).host} vraagt je aan te melden bij Touchline met je Solana-wallet:\n${identifier}\n\n${link?'Koppel deze wallet aan Touchline-account '+account+'.':'Aanmelden bij Touchline.'} Geen betaling of transactie.\nURI: ${origin}\nVersion: 1\nNonce: ${id}\nIssued At: ${new Date(now()).toISOString()}\nExpiration Time: ${new Date(expires).toISOString()}`;
    db.prepare('DELETE FROM challenges WHERE browser=? AND kind=?').run(digest(browser),kind);
    db.prepare('INSERT INTO challenges(id,kind,identifier,proof,browser,account,expires) VALUES (?,?,?,?,?,?,?)').run(id,kind,identifier,kind==='email'?proof(id,code):message,digest(browser),account,expires);
    if(kind==='email'&&!dev){try{await sendEmail(identifier,code,id);}catch{db.prepare('DELETE FROM challenges WHERE id=?').run(id);fail(503,'De e-mail kon niet worden verstuurd. Probeer het later opnieuw.');}}
    return {id,expires,...(kind==='wallet'?{message}:{}),...(dev&&kind==='email'?{testCode:code}:{}),link};
  }
  function complete({id,code,signature},browser,session,ip){
    rate('verify-ip:'+ip,60,600000);
    const c=db.prepare('SELECT * FROM challenges WHERE id=?').get(typeof id==='string'?id:'');
    if(!c||c.expires<=now()||c.browser!==digest(browser)||c.attempts>=5)fail(400,'Deze aanmelding is verlopen of ongeldig. Vraag een nieuwe code aan.');
    if(c.account&&session?.account!==c.account)fail(401,'Meld je opnieuw aan om te koppelen.');
    db.prepare('UPDATE challenges SET attempts=attempts+1 WHERE id=?').run(c.id);
    let valid=false;
    if(c.kind==='email')valid=typeof code==='string'&&/^\d{6}$/.test(code)&&equal(proof(c.id,code),c.proof);
    else if(typeof signature==='string'&&/^[A-Za-z0-9+/]{86}==$/.test(signature)){
      const key=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),decodeAddress(c.identifier)]),type:'spki',format:'der'});
      valid=verify(null,Buffer.from(c.proof),key,Buffer.from(signature,'base64'));
    }
    if(!valid)fail(400,'De code of handtekening klopt niet.');
    return transaction(db,()=>{
      const consumed=db.prepare('DELETE FROM challenges WHERE id=? AND proof=? AND browser=? AND expires>? AND attempts<=5').run(c.id,c.proof,c.browser,now());
      if(consumed.changes!==1)fail(400,'Deze aanmelding is al gebruikt of verlopen. Vraag nieuw bewijs aan.');
      const existing=db.prepare('SELECT account FROM identities WHERE kind=? AND identifier=?').get(c.kind,c.identifier);
      if(c.account&&existing&&existing.account!==c.account)fail(409,'Deze inlogmethode hoort al bij een ander account.');
      const account=c.account||existing?.account||randomUUID();
      if(!existing&&!c.account)db.prepare('INSERT INTO accounts VALUES (?,?,?)').run(account,'Manager '+account.slice(0,6),now());
      if(!existing)db.prepare('INSERT INTO identities VALUES (?,?,?)').run(c.kind,c.identifier,account);
      if(session)db.prepare('DELETE FROM sessions WHERE hash=?').run(session.hash);
      const sessionToken=token(),csrf=token();db.prepare('INSERT INTO sessions VALUES (?,?,?,?,?)').run(digest(sessionToken),account,csrf,now(),now()+7*86400000);
      return {sessionToken,csrf};
    });
  }
  return {rate,challenge,complete,getSession,accountView,logout:(session,all=false)=>db.prepare(all?'DELETE FROM sessions WHERE account=?':'DELETE FROM sessions WHERE hash=?').run(all?session.account:session.hash)};
}

export function resendMailer({key,from,request=fetch}){return async(to,code,id)=>{
  const response=await request('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':'login-'+id},body:JSON.stringify({from,to:[to],subject:'Je Touchline-inlogcode',text:`Je Touchline-code is ${code}. Deze is 10 minuten geldig. Deel deze code met niemand. Niet zelf aangevraagd? Negeer dit bericht.`})});
  if(!response.ok)throw new Error('Email delivery failed');
};}
