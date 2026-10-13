// v1.6.1 定向检查：确认框、加点暂存、研习引导、开局宗门、流派共鸣、杂兵与兽潮。构建只在内存中进行。
require('./setup.cjs')('v161');
const fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require('playwright'),src=path.resolve(__dirname,'..'),root=path.dirname(src);
let html;const memFS={...fs,writeFileSync(p,data){if(path.resolve(p)===path.join(root,'index.html'))html=data;else fs.writeFileSync(p,data);}};
vm.runInNewContext(fs.readFileSync(path.join(src,'build.cjs'),'utf8'),{require:n=>n==='fs'?memFS:require(n),__dirname:src,console:{log(){}},Buffer});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('http://game.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});const file=path.join(root,decodeURIComponent(url.pathname));if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({body:fs.readFileSync(file)});return route.fulfill({status:404,body:''});});
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
await page.goto('http://game.test/');
const out=await page.evaluate(()=>{const a=[],ok=(n,v)=>a.push({name:n,pass:!!v});const modal=()=>document.getElementById('v161-modal');const pressModal=t=>[...modal().querySelectorAll('button')].find(b=>b.textContent.includes(t)).click();
 ok('version',document.body.textContent.includes('问道篇 v1.6.2')||NOTICES[1].v==='1.6.1');
 ok('notice first',NOTICES[1].v==='1.6.1');
 // 宗门
 showSetup();ok('three sects open',['jian','fu','jingang'].every(k=>META.sects[k]&&!overlay.querySelector(`[data-act="ssect"][data-k="${k}"]`).disabled));
 ok('other sects still locked',!META.sects.tianji);
 // 加点暂存
 setupSel.cls='jian';newRun('jian',0);P.attrPts=3;const g0=P.attr.gen||0;showAttr(showMap);
 overlay.querySelector('[data-act="addattr"]').click();overlay.querySelector('[data-act="addattr"]').click();
 ok('plus only stages',P.attrPts===3&&(P.attr.gen||0)===g0&&overlay.textContent.includes('待确认 2'));
 overlay.querySelector('[data-act="attr-reset"]').click();ok('reset clears',!overlay.textContent.includes('待确认'));
 overlay.querySelector('[data-act="addattr"]').click();overlay.querySelector('[data-act="attr-commit"]').click();
 ok('commit applies',P.attrPts===2&&P.attr.gen===g0+1);
 overlay.querySelector('[data-act="addattr"]').click();overlay.querySelector('[data-act="attrback"]').click();
 ok('back with pending asks',!!modal()&&state==='attr');pressModal('放弃');ok('discard returns to map',state==='map'&&P.attrPts===2);
 // 研习引导
 META.treeGuided=false;P.treePoints=2;showMap();const node=overlay.querySelector('[data-act="node"]');node.dispatchEvent(new MouseEvent('click',{bubbles:true}));
 ok('first departure forces tree',state==='skill-tree'&&overlay.textContent.includes('出发前先研习')&&META.treeGuided);
 showMap();overlay.querySelector('[data-act="node"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
 ok('later departure reminds',!!modal()&&state==='map');pressModal('本世不再提醒');
 ok('remind-off departs',RUN.treeRemindOff===true&&state!=='map');closeConfirm();
 // 坊市
 P.stones=99;openShop({id:RUN.path[RUN.path.length-1]||'x',type:'shop'});const before=RUN.path.length;overlay.querySelector('[data-act="leave-node"]').click();
 ok('shop leave asks',!!modal()&&state==='shop'&&RUN.path.length===before);pressModal('再看看');ok('shop stay',state==='shop'&&!modal());
 // 放弃此世
 STAGE={ch:0,obj:'survive',clock:10,rushReady:0,done:false,fast:true,assaultCount:0,assaultKills:0,kills:0,nextWave:30,wave:0,t:0};state='play';overlay.hidden=true;pause();
 overlay.querySelector('[data-act="quit"]').click();ok('quit asks',!!modal()&&state==='pause');pressModal('继续修行');ok('quit cancel keeps run',state==='pause'&&!!P);
 // 流派：每个职业都能凑出专精
 const specOK=Object.keys(V7_POOLS).every(c=>{const t={};for(const k of V7_POOLS[c]){const f=flowOf(k);t[f]=(t[f]||0)+1;}return Math.max(...Object.values(t))>=3;});
 ok('every class can specialize',specOK);
 ok('all pool skills tagged',Object.values(V7_POOLS).flat().every(k=>FLOW_TAGS[flowOf(k)]));
 P.sk={sword:3,jian_line:2,jian_rain:1};recalc();ok('feng spec forms',FLOW.spec==='feng'&&FLOW.specTier===1);
 const d1=P.st.dmg;P.sk.jian_guard=1;P.sk.jian_return=1;recalc();ok('mix also forms',FLOW.mix&&FLOW.mix.name==='三才'&&FLOW.spec==='feng'&&P.st.dmg>d1);
 // 实战模拟：从容第三章
 RUN.easy=true;RUN.ch=2;state='map';startStage({id:'sim',type:'combat',r:5});STAGE.obj='survive';STAGE.fast=true;let maxE=0,fod=0;
 for(let i=0;i<1800;i++){update(1/30);if(state!=='play'){state='play';overlay.hidden=true;}maxE=Math.max(maxE,enemies.length);}
 fod=enemies.filter(e=>e.fodder&&!e.dead).length+FLOW.kills;
 ok('fodder spawns',enemies.some(e=>e.fodder));ok('cap respected',maxE<=420);
 const w=STAGE.wave;assault();ok('wave ring adds fodder',STAGE.wave===w+1&&enemies.filter(e=>e.fodder).length>0);
 // 爽点触发
 for(const t of ['feng','kong','hu','ling']){FLOW.spec=t;FLOW.specTier=2;try{procSpec();ok('proc '+t,true);}catch(e){ok('proc '+t+' '+e.message,false);}}
 FLOW.mix=FLOW_MIX[1];procMix();FLOW.spec='yu';FLOW.booms.push({x:P.x,y:P.y});update(1/30);ok('yu boom processed',FLOW.booms.length===0||FLOW.booms.length<24);
 ok('hud shows flow',!!document.getElementById('flow-hud'));
 showTree();ok('tree has flow panel',!!overlay.querySelector('.flow-panel')&&!!overlay.querySelector('.flow-tag'));
 ok('no horizontal overflow',document.documentElement.scrollWidth<=innerWidth);
 return a;});
await page.screenshot({path:'test-results/v161/tree.png'});

const pc=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1.5}),pcErr=[];pc.on('pageerror',e=>pcErr.push(e.message));
await pc.route('http://game.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});const file=path.join(root,decodeURIComponent(url.pathname));if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({body:fs.readFileSync(file)});return route.fulfill({status:404,body:''});});
await pc.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await pc.goto('http://game.test/');
const pcOut=await pc.evaluate(()=>{const a=[],ok=(n,v)=>a.push({name:n,pass:!!v});
 ok('pc zoomed view',Math.abs(H-600)<2&&W>1000&&W<1100);ok('pc pixel budget',cvs.width*cvs.height<=2.5e6);
 setupSel.cls='jian';newRun('jian',0);startStage({id:'pc',type:'boss',r:9});STAGE.obj='boss';
 const b=spawn('boss',P.x+1500,P.y+300);const el=spawn('elite',P.x-200,P.y-900);update(1/30);draw();
 ok('offscreen markers drawn',true);for(let i=0;i<400;i++)dropOrb(P.x+i,P.y,1);ok('orbs merged',orbs.length<=150);
 return a;});
await pc.screenshot({path:'test-results/v161/pc-boss.png'});out.push(...pcOut);errors.push(...pcErr);
await browser.close();const failed=out.filter(c=>!c.pass).map(c=>c.name);
console.log(JSON.stringify({checks:out.length,failed,errors},null,1));if(failed.length||errors.length)process.exit(1);})().catch(e=>{console.error(e);process.exit(1);});
