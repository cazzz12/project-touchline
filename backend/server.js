import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {openDatabase} from './database.js';
import {authService,resendMailer,fail} from './auth.js';
import {leagueService,fields} from './leagues.js';

const root=fileURLToPath(new URL('../public/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const loopback=host=>['localhost','127.0.0.1','[::1]'].includes(host);
export function configuration(env=process.env){
  const port=Number(env.PORT||3000),host=env.HOST||'127.0.0.1',origin=env.TOUCHLINE_ORIGIN||`http://127.0.0.1:${port}`,dev=env.TOUCHLINE_AUTH_MODE!=='production';
  const url=new URL(origin);if(url.origin!==origin)throw new Error('TOUCHLINE_ORIGIN moet alleen protocol, host en poort bevatten.');
  if(dev&&(!loopback(host)||!loopback(url.hostname)))throw new Error('Lokale testaanmelding mag alleen op loopback draaien.');
  if(!dev&&(url.protocol!=='https:'||!env.RESEND_API_KEY||!env.TOUCHLINE_EMAIL_FROM))throw new Error('Productie vraagt HTTPS, RESEND_API_KEY en TOUCHLINE_EMAIL_FROM.');
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Ongeldige PORT.');
  return {host,port,origin,dev,dbPath:env.TOUCHLINE_DB||fileURLToPath(new URL('../data/touchline.sqlite',import.meta.url)),sendEmail:dev?undefined:resendMailer({key:env.RESEND_API_KEY,from:env.TOUCHLINE_EMAIL_FROM})};
}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim().split('=')).filter(a=>a.length===2));}
async function jsonBody(req){
  if(!req.headers['content-type']?.startsWith('application/json'))fail(415,'Gebruik een JSON-opdracht.');
  let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384)fail(413,'De opdracht is te groot.');chunks.push(chunk);}
  try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{fail(400,'De opdracht bevat ongeldige JSON.');}
}
export function createApplication(config){
  const db=openDatabase(config.dbPath),auth=authService(db,config),leagues=leagueService(db,config),allowedHost=new URL(config.origin).host;
  const secure=!config.dev,cookieName=secure?'__Host-touchline_session':'touchline_session';
  const cookie=(name,value,seconds)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${secure?'; Secure':''}`;
  const server=createServer(async(req,res)=>{
    const respond=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try{
      const url=new URL(req.url,config.origin),pathname=decodeURIComponent(url.pathname);
      if(pathname.startsWith('/api/')){
        res.setHeader('Cache-Control','no-store');
        if(req.headers.host!==allowedHost)fail(403,'Open Touchline via het ingestelde adres.');
        if(req.method!=='GET'&&req.method!=='POST')fail(405,'Deze methode is niet toegestaan.');
        if(req.method==='POST'&&req.headers.origin!==config.origin)fail(403,'Deze opdracht komt niet van Touchline.');
        const jar=cookies(req),session=auth.getSession(jar[cookieName]),ip=req.socket.remoteAddress||'unknown';
        if(req.method==='GET'&&pathname==='/api/session')return respond(200,{mode:config.dev?'local-test':'production',account:session?auth.accountView(session):null,csrf:session?.csrf||null});
        const input=req.method==='POST'?await jsonBody(req):null;
        if(pathname==='/api/auth/challenge'&&input){
          fields(input,['kind','identifier','link']);if(input.link&&(!session||req.headers['x-csrf-token']!==session.csrf))fail(403,'Meld je opnieuw aan.');
          let browser=jar.touchline_intent;if(!/^[A-Za-z0-9_-]{43}$/.test(browser||'')){browser=randomBytes(32).toString('base64url');res.setHeader('Set-Cookie',cookie('touchline_intent',browser,1800));}
          return respond(200,await auth.challenge(input,browser,session,ip));
        }
        if(pathname==='/api/auth/verify'&&input){fields(input,['id','code','signature']);const result=auth.complete(input,jar.touchline_intent||'',session,ip);res.setHeader('Set-Cookie',cookie(cookieName,result.sessionToken,7*86400));return respond(200,{ok:true});}
        if(!session)fail(401,'Meld je aan om samen te spelen.');
        if(input){if(req.headers['x-csrf-token']!==session.csrf)fail(403,'Je sessie is veranderd. Vernieuw de pagina.');auth.rate('actions:'+session.account,180,60000);}
        if(pathname==='/api/logout'&&input){fields(input,['all']);auth.logout(session,input.all===true);res.setHeader('Set-Cookie',cookie(cookieName,'',0));return respond(200,{ok:true});}
        if(pathname==='/api/account/name'&&input){fields(input,['name']);leagues.rename(session.account,input.name);return respond(200,{ok:true});}
        if(pathname==='/api/leagues'&&req.method==='GET')return respond(200,{leagues:leagues.list(session.account)});
        if(pathname==='/api/leagues'&&input)return respond(200,leagues.create(session.account,input));
        if(pathname==='/api/leagues/join'&&input)return respond(200,leagues.join(session.account,input));
        const match=pathname.match(/^\/api\/leagues\/([a-f0-9-]{36})(\/actions)?$/);
        if(match){if(match[2]&&input)return respond(200,leagues.act(session.account,match[1],input));if(!match[2]&&req.method==='GET')return respond(200,leagues.view(match[1],session.account));}
        fail(404,'Deze API-route bestaat niet.');
      }
      if(!['GET','HEAD'].includes(req.method))fail(405,'Deze methode is niet toegestaan.');
      const relative=pathname==='/'?'index.html':pathname==='/online'?'online.html':pathname.slice(1);
      const file=resolve(root,relative);if(!file.startsWith(resolve(root)+sep))fail(403,'Geen toegang.');
      try{const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);}catch{fail(404,'Bestand niet gevonden.');}
    }catch(error){if(!res.headersSent)respond(error.status||500,{error:error.status?error.message:'Er ging iets mis op de server. Probeer opnieuw.'});else res.end();}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  return {server,db,close:()=>new Promise(resolve=>{server.close(()=>{db.close();resolve();});server.closeIdleConnections();})};
}
