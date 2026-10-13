/* UI-only follow-up: keep this after feedback.js and before notice.js. */
const pauseBeforePolish = pause;
pause = function(...args){
  // All older wrappers append controls even when the inner pause is a no-op.
  if(state !== 'play') return;
  const result = pauseBeforePolish(...args), panel = overlay.querySelector('.panel');
  if(state !== 'pause' || !panel) return result;
  panel.classList.add('pause-panel');
  const resume = panel.querySelector('[data-act="resume"]'), quit = panel.querySelector('[data-act="quit"]');
  const footer = document.createElement('div'); footer.className = 'pause-footer';
  if(resume){resume.classList.add('pause-resume');footer.append(resume);}
  if(quit){quit.classList.add('pause-quit');footer.append(quit);}
  panel.append(footer);
  return result;
};
const treeBeforePolish = showTree;
showTree = function(...args){
  const result = treeBeforePolish(...args);
  for(const summary of overlay.querySelectorAll('details > summary'))
    if(summary.textContent.trim() === '本职业心法') summary.parentElement.open = true;
  return result;
};

// Keep the existing handlers, cooldowns and rewards; only shorten touch labels.
const hudBeforePolish = hud;
hud = function(...args){
  const result = hudBeforePolish(...args);
  if(!matchMedia('(max-width:700px), (pointer:coarse)').matches) return result;
  const bell = document.getElementById('rush-btn'), lureControl = document.getElementById('lure-btn');
  if(bell){bell.setAttribute('aria-label',bell.textContent);bell.title=bell.textContent;
    bell.textContent = bell.disabled ? (STAGE && STAGE.clock < STAGE.rushReady ? `鸣钟 ${Math.ceil(STAGE.rushReady-STAGE.clock)}秒` : '鸣钟 · 已迎战') : '鸣钟 · 迎战';}
  if(lureControl){lureControl.setAttribute('aria-label',lureControl.textContent);lureControl.title=lureControl.textContent;lureControl.textContent=STAGE?.lured?'引妖 · 已启用':'引妖 · 翻倍';}
  return result;
};
for(const type of ['pointerdown','touchstart','dblclick']) advanceEl.addEventListener(type,e=>e.stopPropagation());

// Drawing metadata only: preserve strike kind, hit timing, radius and damage.
for(const id of ['jian_rain','array_storm','array_prison','hun_prison','fu_burst']){
  const skill = SK[id], original = skill.upd;
  skill.upd = function(...args){const first=strikes.length,result=original.apply(this,args);for(let i=first;i<strikes.length;i++)strikes[i].visualStyle=id;return result;};
}
function polishedSword(c,x,y,length,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);
  const metal=c.createLinearGradient(-6,0,6,0);metal.addColorStop(0,'#57a9b6');metal.addColorStop(.5,'#f1fff4');metal.addColorStop(1,'#77c8d4');
  c.fillStyle=metal;c.strokeStyle='#d6ecdf';c.lineWidth=1;
  c.beginPath();c.moveTo(0,-length);c.lineTo(5,-length*.7);c.lineTo(3,-12);c.lineTo(-3,-12);c.lineTo(-5,-length*.7);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#b99355';c.lineWidth=3;c.beginPath();c.moveTo(-10,-14);c.quadraticCurveTo(0,-8,10,-14);c.moveTo(0,-10);c.lineTo(0,1);c.stroke();
  c.strokeStyle='#ebbf75';c.lineWidth=1;c.beginPath();c.moveTo(-3,1);c.lineTo(0,5);c.lineTo(3,1);c.stroke();c.restore();
}
function polishedSigil(c,x,y,r,t,col){
  c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=1.2;
  for(let j=0;j<2;j++){c.beginPath();c.arc(0,0,r*(.84+j*.16),t+j*.3,t+5.7+j*.3);c.stroke();}
  for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.15;c.save();c.rotate(a);c.beginPath();c.moveTo(r*.73,-4);c.lineTo(r*.81,0);c.lineTo(r*.73,4);c.moveTo(r*.92,-3);c.lineTo(r*1.02,-3);c.moveTo(r*.92,3);c.lineTo(r*1.02,3);c.stroke();c.restore();}c.restore();
}
function polishedSeal(c,x,y,size){
  c.save();c.translate(x,y);c.scale(size/80,size/80);
  const jade=c.createLinearGradient(-35,-60,35,10);jade.addColorStop(0,'#afd4ad');jade.addColorStop(.45,'#397d75');jade.addColorStop(1,'#163d40');
  c.fillStyle=jade;c.strokeStyle='#dfc280';c.lineWidth=1.5;
  // A carved jade mountain handle and bevelled stone base, rather than stacked boxes.
  c.beginPath();c.moveTo(-34,-18);c.lineTo(-28,-27);c.bezierCurveTo(-24,-30,-18,-28,-17,-37);c.lineTo(-8,-49);c.lineTo(-3,-42);c.lineTo(5,-62);c.lineTo(13,-50);c.bezierCurveTo(27,-51,28,-35,23,-27);c.lineTo(35,-18);c.lineTo(38,0);c.lineTo(0,13);c.lineTo(-38,0);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(-34,-18);c.lineTo(0,-7);c.lineTo(35,-18);c.moveTo(0,-7);c.lineTo(0,13);c.moveTo(-8,-49);c.lineTo(-5,-24);c.lineTo(5,-17);c.moveTo(13,-50);c.lineTo(9,-29);c.stroke();
  c.strokeStyle='#f5d590';for(let i=0;i<5;i++){const x=-29+i*6;c.beginPath();c.moveTo(x,-9+i*1.6);c.lineTo(x,-1+i*1.6);c.lineTo(x+3,-2+i*1.6);c.stroke();}c.restore();
}
drawStrike = function(s){
  if(s.t<0)return;
  const c=ctx,k=Math.min(1,Math.max(0,s.t/s.delay)),style=s.visualStyle||(s.k==='thunder'?'jian_rain':s.k);
  c.save();c.globalAlpha=.35+.35*k;polishedSigil(c,s.x,s.y,s.r,k,style==='jian_rain'?'#99dfdf':'#dbbf79');c.globalAlpha=1;
  if(style==='jian_rain'){
    for(let i=0;i<(vividCombat?5:3);i++){const a=i*2.4,r=i?s.r*.55:0,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r-(1-k)*230;
      c.strokeStyle='#8cded777';c.lineWidth=2;c.beginPath();c.moveTo(x,y-90);c.lineTo(x,y);c.stroke();polishedSword(c,x,y,58,Math.PI);}
  }else if(style==='seal') polishedSeal(c,s.x,s.y-(1-k)*240,Math.min(110,s.r));
  else if(style==='array_storm'){
    c.strokeStyle='#c0edff';c.lineWidth=3;c.beginPath();c.moveTo(s.x+18,s.y-220*(1-k)-60);c.lineTo(s.x-12,s.y-44);c.lineTo(s.x+9,s.y-48);c.lineTo(s.x,s.y);c.stroke();
  }else if(style.includes('prison')){
    for(let i=0;i<6;i++){const a=i*Math.PI/3,x=s.x+Math.cos(a)*s.r*.8,y=s.y+Math.sin(a)*s.r*.8;c.strokeStyle='#bdace9';c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x,y-60,s.x,s.y-90,s.x,s.y-110*k);c.stroke();}
  }else if(style==='fu_burst'){
    c.translate(s.x,s.y-80*(1-k));c.rotate(Math.sin(k*5)*.2);c.fillStyle='#e9c882';c.beginPath();c.moveTo(-12,-38);c.lineTo(14,-35);c.lineTo(10,10);c.lineTo(-14,6);c.closePath();c.fill();c.strokeStyle='#9c4231';c.lineWidth=2;c.beginPath();c.moveTo(0,-30);c.lineTo(-6,-22);c.lineTo(6,-18);c.lineTo(-5,-10);c.lineTo(4,0);c.stroke();
  }else{
    const x=s.x-(1-k)*220,y=s.y-(1-k)*320;c.fillStyle='#edaf65';c.beginPath();c.moveTo(x-48,y-90);c.bezierCurveTo(x+12,y-40,x+22,y+13,x,y+9);c.bezierCurveTo(x-25,y+10,x-25,y-24,x-48,y-90);c.fill();c.strokeStyle='#fff0bc';c.beginPath();c.moveTo(x-22,y-38);c.lineTo(x,y);c.stroke();
  }c.restore();
};
const fxBeforePolish=drawFx;
drawFx=function(f){
  if(!['thrust','ring','ringp','cone'].includes(f.k))return fxBeforePolish(f);
  const c=ctx,k=Math.min(1,f.t/f.dur);c.save();c.globalAlpha=1-k;
  if(f.k==='thrust'){polishedSword(c,f.x+Math.cos(f.a)*f.len*k,f.y+Math.sin(f.a)*f.len*k,Math.min(110,f.len*.65),f.a+Math.PI/2);}
  else if(f.k==='cone'){c.translate(f.x,f.y);c.rotate(f.a);c.strokeStyle='#e5c78c';for(let i=0;i<5;i++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(f.r*.6,(i-2)*14,f.r*(.5+k*.5),(i-2)*f.r*.15);c.stroke();}}
  else polishedSigil(c,f.x,f.y,Math.max(1,f.r*(.4+.6*k)),k,f.k==='ringp'?'#ba9fdf':'#a6dec5');
  c.restore();
};
// Replace only feedback.js's decorative layer; retain its underlying world draw.
drawPhase1World=function(){
  _drawWorldTV();
  for(const f of TVFX){
    const c=ctx,k=Math.min(1,f.t/f.dur),col=RING_STYLES[f.style][0],r=f.r*(.55+.45*k);
    c.save();c.globalAlpha=(1-k)*.8;
    if(f.style==='return'){
      for(let i=0;i<(vividCombat?6:3);i++){const a=i*Math.PI*2/(vividCombat?6:3)+f.t*11;polishedSword(c,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,32,a+Math.PI);}
    }else if(['quake','chain'].includes(f.style)){
      c.strokeStyle=col;c.lineWidth=2;for(let i=0;i<8;i++){c.save();c.translate(f.x,f.y);c.rotate(i*Math.PI/4);c.beginPath();c.moveTo(8,0);c.lineTo(r*.35,5);c.lineTo(r*.5,-8);c.lineTo(r,3);c.stroke();c.restore();}
    }else{
      polishedSigil(c,f.x,f.y,r,k,col);
      // Petal/feather motifs give healing, soul and protective a readable silhouette.
      for(let i=0;i<(vividCombat?8:4);i++){const a=i*Math.PI/4+k;c.save();c.translate(f.x+Math.cos(a)*r*.68,f.y+Math.sin(a)*r*.68);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(16,0);c.bezierCurveTo(-4,-11,-15,-5,-4,0);c.bezierCurveTo(-15,5,-4,11,16,0);c.fill();c.restore();}
    }c.restore();
  }
};
