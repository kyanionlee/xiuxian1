// Focused visual/performance acceptance, builds in memory; does not read root HTML.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {chromium}=require('playwright'),src=path.resolve(__dirname,'..'),root=path.dirname(src);let html;
const memFS={...fs,writeFileSync(p,data){if(path.resolve(p)===path.join(root,'index.html'))html=data;else fs.writeFileSync(p,data);}};
vm.runInNewContext(fs.readFileSync(path.join(src,'build.cjs'),'utf8'),{require:n=>n==='fs'?memFS:require(n),__dirname:src,console:{log(){}},Buffer});
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/ult-art-baseline.json'),'utf8'));
(async()=>{const b=await chromium.launch({headless:true,args:["--enable-gpu","--use-angle=d3d11"],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});const sys=await (await b.newBrowserCDPSession()).send('SystemInfo.getInfo');const report={environment:'Playwright Chromium, D3D11 GPU rendering; mobile viewport simulation, not phone hardware',gpu:sys.gpu.devices,features:sys.gpu.featureStatus,runs:[],checks:[]};
try{for(const size of [{width:1920,height:1080},{width:390,height:844}])for(const mode of ['vivid','simple','perf']){
 const p=await b.newPage({viewport:size,isMobile:size.width===390,hasTouch:size.width===390,deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('http://game.test/**',r=>{const u=new URL(r.request().url());if(u.pathname==='/')return r.fulfill({contentType:'text/html',body:html});if(!u.pathname.startsWith('/assets/')&&!u.pathname.startsWith('/src/assets/ult/'))return r.fulfill({status:404,body:''});const f=path.join(root,u.pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f)}):r.fulfill({status:404,body:''});});
 await p.addInitScript(()=>{window.nativeArtRAF=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;});await p.goto('http://game.test/');
 await p.evaluate(mode=>{vividCombat=mode!=='simple';PERF.done=mode==='perf';META.sfx=false;META.bgm=false;META.hintsDone=true;setupSel.cls='jian';newRun('jian',0);startStage({id:'warm',type:'combat',r:3});},mode);
 await p.evaluate(async()=>{for(let i=0;i<120&&!ULT_ART.sprites[9];i++)await new Promise(r=>setTimeout(r,20));if(ULT_ART.sprites.length!==10)throw Error('Atlas not decoded');});
 const result=await p.evaluate(async mode=>{
   const costs=[],intervals=[],casts=[],shapes=['circle','ring','line','cross','meteors','fan','summon'];let peakEffects=0,peakParticles=0;
   const tick=()=>new Promise(r=>nativeArtRAF(r));
   for(const [ci,cls]of Object.keys(ULTS).entries()){
     setupSel.cls=cls;newRun('jian',0);RUN.easy=false;startStage({id:'art-'+cls,type:'boss',r:9});STAGE.obj='boss';ULT.t=0;
     for(let j=0;j<55;j++)spawn('chase',P.x+Math.cos(j)*180,P.y+Math.sin(j)*180,{hp:1e7,maxHp:1e7});
     const boss=spawn('boss',P.x+110,P.y+70,{hp:1e8,maxHp:1e8});initBossV7(boss);boss.bossNext=999;STAGE.boss=boss;
     const a={shape:shapes[ci%7],x:P.x+50,y:P.y+30,ex:boss.x,ey:boss.y,r:95,inner:42,len:260,w:45,angle:.4,gap:.5,label:'性能检查',spots:[{x:P.x-80,y:P.y},{x:P.x+80,y:P.y}]};
     const castStart=performance.now();castUlt();executeBoss(boss,a);const castCost=performance.now()-castStart;casts.push(cls);let last=await tick();
     for(let n=0;n<64;n++){
       const now=await tick();intervals.push(now-last);last=now;
       state='play';overlay.hidden=true;P.hp=P.st.maxHp;P.inv=5;
       const start=performance.now();update(1/60);draw();costs.push(performance.now()-start+(n===0?castCost:0));
       peakEffects=Math.max(peakEffects,fx.filter(f=>f.k!=='spark').length+BFX.length+TVFX.length);peakParticles=Math.max(peakParticles,artSimple()?0:120-ULT_ART.dust);
     }
   }
   const avg=a=>a.reduce((s,n)=>s+n,0)/a.length,p95=a=>a.slice().sort((a,b)=>a-b)[Math.floor(a.length*.95)];
   return {mode,casts:casts.length,classes:casts,frames:costs.length,meanWorkMs:avg(costs),p95WorkMs:p95(costs),meanFrameMs:avg(intervals),p95FrameMs:p95(intervals),peakEffects,peakParticles,canvas:[cvs.width,cvs.height]};
 },mode);
 assert.strictEqual(errors.length,0,errors.join('\n'));assert(result.meanWorkMs<=20,JSON.stringify(result));assert(result.meanFrameMs<=20,JSON.stringify(result));assert(result.peakEffects<=40);assert(result.peakParticles<=120);if(mode!=='vivid')assert.strictEqual(result.peakParticles,0);
 report.runs.push({viewport:size,...result});console.log(JSON.stringify(report.runs.at(-1)));
 if(mode==='vivid'){
  const same=await p.evaluate(({ult,flow})=>{
   const current=[castUlt,procSpec,procMix],old=[new Function('return ('+ult+')')(),new Function(flow+';return procSpec')(),new Function(flow+';return procMix')()];
   const saved={line,aoe,hit,heal,addShield,applyPoison,captureBattle,hud,banner,sfx,toast,recalc,setTimeout,random:Math.random};let log=[];
   line=(...a)=>log.push(['line',...a]);aoe=(...a)=>log.push(['aoe',...a]);hit=(e,...a)=>log.push(['hit',e.id,...a]);heal=(...a)=>log.push(['heal',...a]);addShield=(...a)=>log.push(['shield',...a]);applyPoison=(e,...a)=>log.push(['poison',e.id,...a]);captureBattle=hud=banner=sfx=toast=recalc=()=>{};window.setTimeout=f=>f();Math.random=()=>.35;
   const snapshot=(fn,cls,spec)=>{P.cls=cls;P.t={};P.x=100;P.y=100;P.inv=0;P.st.area=1;ULT.t=0;ULT.pet=0;FLOW.spec=spec;FLOW.specTier=2;FLOW.mix=FLOW_MIX[1];FLOW.frenzyT=0;state='play';STAGE.done=false;fx=[];strikes=[];zones=[];enemies=Array.from({length:12},(_,i)=>({id:i,x:130+i*5,y:100,hp:1000,dead:false}));log=[];fn();return JSON.stringify({log,strikes:strikes.map(({ultArt,...s})=>s),zones,cd:ULT.t,inv:P.inv,pet:ULT.pet,frenzy:FLOW.frenzyT});};
   let count=0;try{for(const cls of Object.keys(ULTS)){if(snapshot(current[0],cls)!==snapshot(old[0],cls))throw Error('Changed gameplay '+cls);count++;}for(const spec of ['feng','kong','hu','ling']){if(snapshot(current[1],'jian',spec)!==snapshot(old[1],'jian',spec))throw Error('Changed proc '+spec);count++;}if(snapshot(current[2],'jian')!==snapshot(old[2],'jian'))throw Error('Changed mix');count++;return count;}finally{({line,aoe,hit,heal,addShield,applyPoison,captureBattle,hud,banner,sfx,toast,recalc}=saved);window.setTimeout=saved.setTimeout;Math.random=saved.random;}
  },baseline);report.checks.push({viewport:size,gameplayEquivalentCases:same});
 }
 await p.close();
}fs.writeFileSync(path.join(src,'tests','ult-art-results.json'),JSON.stringify(report,null,2)+'\n');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
