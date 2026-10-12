require('./setup.cjs')('assets');
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const checks=[],errors=[],ok=(name,v)=>checks.push({name,pass:!!v}),root=process.cwd();
 const html=fs.readFileSync('index.html','utf8');ok('no embedded raster images',!/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100}/.test(html));ok('HTML under 600 KB',Buffer.byteLength(html)<600000);
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',f.endsWith('.webp')?'image/webp':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/index.html`;
 const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:360,height:640}}),requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.goto(url);await page.waitForLoadState('networkidle');
 ok('homepage defers combat and NPC',!requests.some(x=>/monsters|characters|summons|professions|npc-/.test(x)));
 await page.evaluate(()=>{setupSel.cls='jian';newRun('jian',0);showMap();showPerson('yun');});await page.waitForFunction(()=>document.querySelector('.npc-portrait')?.naturalWidth>0);
 ok('NPC loaded on demand',requests.some(x=>x.endsWith('npc-yun.webp')));ok('other NPCs deferred',!requests.some(x=>/npc-(yan|tang|li|deng|su)/.test(x)));
 await page.screenshot({path:'test-results/assets/npc-mobile.png'});
 await page.evaluate(()=>{showMap();startStage(RUN.map.rows[0][0]);});await page.waitForFunction(()=>monsterArt.naturalWidth>0&&terrainArt.naturalWidth>0);
 ok('combat art loaded on demand',requests.some(x=>x.endsWith('monsters.webp')));await page.screenshot({path:'test-results/assets/combat-mobile.png'});
 const broken=await browser.newPage();broken.on('pageerror',e=>errors.push(e.message));await broken.route('**/assets/**',r=>r.abort());await broken.goto(url);await broken.evaluate(()=>{setupSel.cls='jian';newRun('jian',0);showMap();startStage(RUN.map.rows[0][0]);draw();});ok('missing art leaves battle playable',await broken.evaluate(()=>state==='play'&&!!P));await broken.evaluate(()=>showPerson('yun'));await broken.waitForLoadState('networkidle');ok('failed portrait hidden, text retained',await broken.evaluate(()=>document.querySelector('.npc-portrait').hidden&&overlay.textContent.includes('沈青蘅')));
 const offline=await browser.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto(pathToFileURL(path.join(root,'index.html')).href);await offline.evaluate(()=>{newRun('jian',0);showPerson('yun');});await offline.waitForFunction(()=>document.querySelector('.npc-portrait')?.naturalWidth>0);ok('relative assets work with file URL',true);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 const result={checks:checks.length,failed:checks.filter(x=>!x.pass),errors};fs.writeFileSync('test-results/assets/results.json',JSON.stringify(result,null,2));console.log(result);if(result.failed.length||errors.length)process.exitCode=1;
})();
