// v1.6.1 定向检查：确认框、加点暂存、研习引导、开局宗门、流派共鸣、杂兵与兽潮。构建只在内存中进行。
require('./setup.cjs')('v162');
const fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require('playwright'),src=path.resolve(__dirname,'..'),root=path.dirname(src);
let html;const memFS={...fs,writeFileSync(p,data){if(path.resolve(p)===path.join(root,'index.html'))html=data;else fs.writeFileSync(p,data);}};
vm.runInNewContext(fs.readFileSync(path.join(src,'build.cjs'),'utf8'),{require:n=>n==='fs'?memFS:require(n),__dirname:src,console:{log(){}},Buffer});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('http://game.test/**',async route=>{const url=new URL(route.request().url());if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});const file=path.join(root,decodeURIComponent(url.pathname));if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({body:fs.readFileSync(file)});return route.fulfill({status:404,body:''});});
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
await page.goto('http://game.test/');
const out=await page.evaluate(()=>{const a=[],ok=(n,v)=>a.push({name:n,pass:!!v});
 ok('version',NOTICES[0].v==='1.6.2'&&SHANHAI_VERSION==='1.6.2');
 setupSel.cls='jian';newRun('jian',0);P.attrPts=2;showAttr(showMap);overlay.querySelector('[data-act="addattr"]').click();
 ok('minus shown',!!overlay.querySelector('[data-act="attr-minus"]'));overlay.querySelector('[data-act="attr-minus"]').click();
 ok('minus removes pending',!overlay.textContent.includes('待确认')&&P.attrPts===2);
 // 炼器师
 P.prof='smith';const w=P.eq.weapon;w.lvl=6;bagSel={eq:'weapon'};showBag(()=>showMap(),true);bagSel={eq:'weapon'};showBag(null,true);
 const fb=overlay.querySelector('[data-act="forge"]');ok('smith forge enabled at +6',fb&&!fb.disabled);bagAct('forge');ok('smith reaches +8',w.lvl===8);
 // 指引
 ok('guide not auto',(()=>{settings.guideSeen131=false;beginRun();return !guideContext131;})());
 // 首领限时
 RUN.easy=false;RUN.ch=0;startStage({id:'b',type:'boss',r:9});STAGE.obj='boss';STAGE.boss=spawn('boss');
 for(let i=0;i<30*105;i++){P.hp=P.st.maxHp;update(1/30);if(state!=='play'){state='play';overlay.hidden=true;}}
 ok('boss enrages after limit',STAGE.enraged&&STAGE.boss.enraged);draw();ok('hud shows enrage',document.getElementById('flow-hud').textContent.includes('狂暴'));
 // 引妖叠加
 startStage({id:'c',type:'combat',r:3});STAGE.obj='survive';lure();lure();lure();lure();ok('lure stacks to 3',STAGE.lureN===3);
 // 终局妖王
 RUN.ch=2;STAGE.ch=2;const b1=spawn('boss');RUN.easy=true;const b2=spawn('boss');ok('final boss tougher on standard',b1.maxHp>b2.maxHp*1.2);
 // 悟性递减
 P.attr.wu=30;recalc();ok('wu diminishing',P.st.xpMul<1+0.04*30-0.3);
 // 坊市
 state='map';P.stones=9999;openShop({id:'s',type:'shop'});const ks=SHOP.goods.map(g=>g.k);ok('shop has tree jade',ks.includes('v162-tree'));
 const i=ks.indexOf('v162-tree'),tp=P.treePoints||0;shopBuy(i);ok('tree jade works',P.treePoints===tp+1);
 SHOP.goods.push({k:'v162-wash',name:'x',desc:'',price:1});P.attr.gen=3;const pts=P.attrPts;shopBuy(SHOP.goods.length-1);ok('wash refunds',P.attr.gen===0&&P.attrPts>=pts+3);
 // 首领特效
 state='play';overlay.hidden=true;const bb=spawn('boss');initBossV7(bb);planBoss(bb);executeBoss(bb,bb.intent);draw();ok('boss fx queued',BFX.length>0);
 // 主动大招：十个主修
 for(const c of Object.keys(ULTS)){try{setupSel.cls=c;newRun('jian',0);RUN.easy=false;state='map';startStage({id:'u'+c,type:'combat',r:3});STAGE.obj='survive';
  for(let i=0;i<20;i++)spawn('chase',P.x+rand(-200,200),P.y+rand(-200,200));ULT.t=0;const hp0=enemies.reduce((t,e)=>t+e.hp,0);castUlt();
  for(let i=0;i<40;i++){update(1/30);if(state!=='play'){state='play';overlay.hidden=true;}}
  const hp1=enemies.filter(e=>!e.dead).reduce((t,e)=>t+e.hp,0);ok('ult '+c,ULT.t>20&&(hp1<hp0||['yushou','kuilei'].includes(c)));}catch(e){ok('ult '+c+' '+e.message,false);}}
 hud();ok('ult button',document.getElementById('ult-btn')&&document.getElementById('ult-btn').disabled);
 ULT.t=0;hud();ok('ult ready label',document.getElementById('ult-btn').classList.contains('ready'));
 return a;});
await browser.close();const failed=out.filter(c=>!c.pass).map(c=>c.name);
console.log(JSON.stringify({checks:out.length,failed,errors},null,1));if(failed.length||errors.length)process.exit(1);})().catch(e=>{console.error(e);process.exit(1);});
