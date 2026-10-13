const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),{chromium}=require('playwright');
const src=path.resolve(__dirname,'..'),root=path.dirname(src);let html;
vm.runInNewContext(fs.readFileSync(path.join(src,'build.cjs'),'utf8'),{require:n=>n==='fs'?{...fs,writeFileSync(p,s){assert.strictEqual(path.resolve(p),path.join(root,'index.html'));html=s;}}:require(n),__dirname:src,Buffer,console:{log(){}}});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});try{const p=await b.newPage({viewport:{width:1000,height:650}}),requests=[];
await p.route('http://game.test/**',r=>{const u=new URL(r.request().url());if(u.pathname==='/')return r.fulfill({body:html,contentType:'text/html'});if(u.pathname.includes('/ult/'))requests.push(u.pathname);const file=path.join(root,u.pathname);return u.pathname.includes('.webp')&&fs.existsSync(file)?r.fulfill({body:fs.readFileSync(file)}):r.fulfill({status:404,body:''});});
await p.addInitScript(()=>window.requestAnimationFrame=()=>0);await p.goto('http://game.test/');assert.strictEqual(requests.length,0,'art requested on title');
const count=await p.evaluate(()=>{let checks=0;const ok=(v,msg)=>{if(!v)throw Error(msg);checks++;};setupSel.cls='jian';newRun('jian',0);startStage({id:'safety',type:'combat',r:3});
fx=[];BFX.length=0;TVFX.length=0;for(let i=0;i<100;i++)emitUltArt('mix',i,100,30,5);ok(fx.length===40,'object cap');ok(fx[0].x===60,'drops oldest');ok(fx.every(f=>f.dur<=1),'lifetime cap');
for(let i=0;i<160;i++)fx.push({k:'spark',x:i,y:10,t:0,dur:2});trimArt();ok(fx.filter(f=>f.k==='spark').length===120,'particle object cap');ok(fx.filter(f=>f.k==='spark')[0].x===40,'oldest particles discarded');
const saved={radial:ctx.createRadialGradient,linear:ctx.createLinearGradient};let forbidden=0;ctx.createRadialGradient=ctx.createLinearGradient=()=>{forbidden++;throw Error('gradient in new drawing');};
Object.defineProperty(ctx,'shadowBlur',{configurable:true,set(){forbidden++;}});Object.defineProperty(ctx,'filter',{configurable:true,set(){forbidden++;}});
try{vividCombat=true;PERF.done=false;ULT_ART.dust=120;
for(const cls of ULT_ART_IDS)drawUltimateArt({style:cls,x:200,y:200,r:140,t:.3,dur:.75});
for(const shape of ['circle','ring','line','cross','meteors','fan','summon'])drawBossArt({shape,x:200,y:200,ex:200,ey:200,r:80,inner:40,len:140,w:35,angle:0,gap:.4,col:'#e0ce83',spots:[{x:200,y:200}],t:.3,dur:.7});
ok(ULT_ART.dust>=0,'procedural particle cap');ok(forbidden===0,'no expensive canvas features');
for(const mode of ['simple','perf']){vividCombat=mode!=='simple';PERF.done=mode==='perf';ULT_ART.dust=120;artDust(ctx,0,0,30,.3,'#fff',12);ok(ULT_ART.dust===120,'no particles '+mode);}
}finally{ctx.createRadialGradient=saved.radial;ctx.createLinearGradient=saved.linear;delete ctx.shadowBlur;delete ctx.filter;}
ok(ULT_ART_IDS.every(c=>ICONS['ult_'+c]),'10 manifest entries');
return checks;});
await p.evaluate(async()=>{for(let i=0;i<80&&!ULT_ART.sprites[9];i++)await new Promise(r=>setTimeout(r,20));if(ULT_ART.sprites.length!==10)throw Error('decode failed');});
assert(requests.includes('/assets/ult/ultimate-atlas.webp'));
await p.evaluate(()=>{overlay.hidden=true;advanceEl.hidden=true;document.getElementById('hud').hidden=true;document.getElementById('banner').style.display='none';document.getElementById('toast').style.display='none';ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#102d30';ctx.fillRect(0,0,cvs.width,cvs.height);vividCombat=true;PERF.done=false;ULT_ART.dust=120;ULT_ART_IDS.forEach((cls,i)=>{const x=100+i%5*200,y=150+Math.floor(i/5)*300;drawUltimateArt({style:cls,x,y,r:85,t:.25,dur:.8});ctx.fillStyle='#f4dfa4';ctx.font='17px sans-serif';ctx.fillText(ULTS[cls].name,x-40,y+115);});});
await p.screenshot({path:path.join(src,'tests','ult-art-preview.png')});console.log(`PASS ${count+2} visual safety/loading checks.`);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
