// Targeted checks only. Build into memory: never read/write the root index.html.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {chromium}=require('playwright'),src=path.resolve(__dirname,'..'),root=path.dirname(src);
let html;const guardedFS={...fs,readFileSync(p,...args){assert.notStrictEqual(path.resolve(p),path.join(root,'index.html'));return fs.readFileSync(p,...args);},writeFileSync(p,data){assert.strictEqual(path.resolve(p),path.join(root,'index.html'));html=data;}};
vm.runInNewContext(fs.readFileSync(path.join(src,'build.cjs'),'utf8'),{require:n=>n==='fs'?guardedFS:require(n),__dirname:src,console,Buffer});
(async()=>{const browser=await chromium.launch();let checks=0;
try{for(const size of [{width:360,height:640},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
 const page=await browser.newPage({viewport:size,isMobile:size.width<900,hasTouch:size.width<900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('http://game.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});const file=path.join(root,decodeURIComponent(url.pathname));if(url.pathname.startsWith('/assets/')&&fs.existsSync(file))return route.fulfill({body:fs.readFileSync(file)});return route.fulfill({status:404,body:''});});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.goto('http://game.test/');
 const results=await page.evaluate(()=>{
   META.seenNotice='1.6.0';newRun('jian',0);STAGE={ch:0,obj:'survive',clock:10,rushReady:0,done:false,fast:true,assaultCount:0,assaultKills:0,kills:0,nextWave:30};state='play';overlay.hidden=true;
   pause();const count=overlay.querySelectorAll('button').length;for(let i=0;i<10;i++)pause();
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;
   const a=[['pause does not duplicate',count===overlay.querySelectorAll('button').length],['tree unique',overlay.querySelectorAll('[data-act="v7-tree"]').length===1],['resume footer',!!overlay.querySelector('.pause-footer > [data-act="resume"]')],['quit last',overlay.querySelector('.pause-footer').lastElementChild.dataset.act==='quit']];
   for(let i=0;i<4;i++){state='play';pause();}a.push(['reopen unique',overlay.querySelectorAll('[data-act="v7-options"]').length===1]);
   showTree();a.push(['passives expanded',[...overlay.querySelectorAll('details')].some(d=>d.open&&d.querySelector('summary').textContent==='本职业心法')]);
   a.push(['no horizontal overflow',document.documentElement.scrollWidth<=innerWidth]);
   state='play';overlay.hidden=true;hud();const bell=document.getElementById('rush-btn'),l=document.getElementById('lure-btn');
   a.push(['touch controls visible',!advanceEl.hidden&&bell.getBoundingClientRect().height>=44&&l.getBoundingClientRect().height>=44]);
   l.click();a.push(['lure touch works',STAGE.lured===true]);
   const before=STAGE.assaultCount;bell.click();a.push(['bell touch works',STAGE.assaultCount>before]);
   enemies=[{x:P.x+40,y:P.y+40,hp:100,dead:false}];P.t.jian_rain=0;strikes=[];SK.jian_rain.upd(.01,SK.jian_rain.stat(1,false));
   a.push(['rain has sword metadata',strikes.length>0&&strikes[0].visualStyle==='jian_rain'&&strikes[0].k==='thunder']);
   for(const visualStyle of ['jian_rain','seal','array_storm','array_prison','hun_prison','fu_burst','meteor'])for(const t of [0,.3,.64])drawStrike({k:visualStyle,x:150,y:300,r:70,t,delay:.65,visualStyle});
   for(const k of ['thrust','ring','ringp','cone'])drawFx({k,x:150,y:300,r:70,len:100,a:0,t:.2,dur:.5});
   for(const style of Object.keys(RING_STYLES))TVFX.push({style,x:150,y:300,r:70,t:.2,dur:.5});drawPhase1World();TVFX.length=0;
   state='play';pause();return a;
 });
 for(const [name,pass]of results){assert(pass,`${size.width}: ${name}`);checks++;}assert.deepStrictEqual(errors,[]);
 if(size.width<900){
   await page.evaluate(()=>{state='play';overlay.hidden=true;STAGE.lured=false;STAGE.assaultCount=0;STAGE.rushReady=0;hud();});
   await page.locator('#lure-btn').tap();assert(await page.evaluate(()=>STAGE.lured),'real touch lure');checks++;
   await page.locator('#rush-btn').tap();assert(await page.evaluate(()=>STAGE.assaultCount>0),'real touch bell');checks++;
   await page.evaluate(()=>pause());
 }
 await page.evaluate(()=>{document.getElementById('toast').style.display='none';});
 if(process.env.POLISH_SCREENSHOT){
   await page.screenshot({path:path.join(src,'tests',`mobile-polish-${size.width}.png`)});
   if(size.width===1280){await page.evaluate(()=>{
     overlay.hidden=true;advanceEl.hidden=true;document.getElementById('hud').hidden=true;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#102c30';ctx.fillRect(0,0,1280,800);
     ['jian_rain','seal','array_storm','array_prison','fu_burst','meteor'].forEach((visualStyle,i)=>{const x=100+i*210;drawStrike({k:visualStyle,x,y:330,r:65,t:.35,delay:.65,visualStyle});ctx.fillStyle='#fff0cb';ctx.font='16px sans-serif';ctx.fillText(['落星剑雨','翻天印','雷阵','禁锢阵','爆裂符','流星'][i],x-35,430);});
   });await page.screenshot({path:path.join(src,'tests','mobile-polish-effects.png')});}
 }
 await page.close();
}console.log(`PASS ${checks} focused checks; no root HTML read or written.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

