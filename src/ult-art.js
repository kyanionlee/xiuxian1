/* Cosmetic only. Never remove strikes/zones/projectiles: those own hit tests. */
const ULT_ART = { seq:0, objects:40, particles:120, sprites:[], loading:false, left:40, dust:120 };
const ULT_ART_IDS=['jian','fa','ti','hun','yue','array','fu','yushou','kuilei','du'];
const ULT_ART_COLORS=['#c7f4ec','#ffae63','#f1d28a','#c5a4ef','#9ce1ec','#a3dbff','#ffdf93','#acdfad','#dbbb82','#9cd691'];
function artSimple(){return PERF.done || !vividCombat;}
function loadUltArt(){
  if(ULT_ART.loading)return;ULT_ART.loading=true;
  const im=new Image();im.decoding='async';
  im.onload=()=>{for(let i=0;i<10;i++){const tile=document.createElement('canvas');tile.width=tile.height=64;const c=tile.getContext('2d');c.beginPath();c.arc(32,32,29,0,Math.PI*2);c.clip();c.drawImage(im,(i%5)*128+12,Math.floor(i/5)*128+12,104,104,0,0,64,64);ULT_ART.sprites[i]=tile;}};
  im.src='assets/ult/ultimate-atlas.webp';
}
function trimArt(){
  const pools=[fx,BFX,TVFX],all=[];let particles=0;
  for(const pool of pools)for(const f of pool){
    f.artSeq ||= ++ULT_ART.seq;f.dur=Math.min(1,f.dur||.5);
    if(f.k==='spark')particles++;else all.push({pool,f});
  }
  all.sort((a,b)=>a.f.artSeq-b.f.artSeq);
  for(let i=0;i<all.length-40;i++){const {pool,f}=all[i];pool.splice(pool.indexOf(f),1);}
  for(let i=0;i<fx.length&&particles>120;)if(fx[i].k==='spark'){fx.splice(i,1);particles--;}else i++;
}
function emitUltArt(style,x,y,r,dur=.75){
  fx.push({k:'ultimateArt',style,x,y,r,t:0,dur:Math.min(1,dur),artSeq:++ULT_ART.seq});trimArt();
}
// All glow is two translucent circles; no blur/filter or per-frame gradients.
function artHalo(c,x,y,r,col,alpha){
  c.fillStyle=col;c.globalAlpha=alpha*.35;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  c.globalAlpha=alpha*.65;c.beginPath();c.arc(x,y,r*.58,0,Math.PI*2);c.fill();
}
function artBlade(c,x,y,a,size,col){
  c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;
  c.beginPath();c.moveTo(size,0);c.lineTo(size*.64,-3);c.lineTo(-8,-2);c.lineTo(-8,2);c.lineTo(size*.64,3);c.closePath();c.fill();
  c.strokeStyle='#f1d28a';c.lineWidth=2;c.beginPath();c.moveTo(-9,-7);c.lineTo(-6,0);c.lineTo(-9,7);c.moveTo(-7,0);c.lineTo(-17,0);c.stroke();c.restore();
}
function artDust(c,x,y,r,k,col,n=12){
  if(artSimple())return;n=Math.min(n,ULT_ART.dust);ULT_ART.dust-=n;c.strokeStyle=col;c.lineWidth=1.5;
  c.beginPath();for(let i=0;i<n;i++){const a=i*2.39996,rr=r*(.25+k*.7),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;
    c.moveTo(xx,yy);c.lineTo(xx+Math.cos(a)*8*(1-k),yy+Math.sin(a)*8*(1-k));}c.stroke();
}
function artGlyphRing(c,x,y,r,k,col,n=8){
  c.strokeStyle=col;c.lineWidth=1.4;
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n+k*.25,cs=Math.cos(a),sn=Math.sin(a);c.beginPath();c.moveTo(x+cs*r*.86-sn*5,y+sn*r*.86+cs*5);c.lineTo(x+cs*r*.97,y+sn*r*.97);c.lineTo(x+cs*r*.86+sn*5,y+sn*r*.86-cs*5);c.stroke();}
}
function drawUltimateArt(f){
  const c=ctx,k=Math.min(1,f.t/f.dur),fade=1-k,idx=ULT_ART_IDS.indexOf(f.style),col=ULT_ART_COLORS[idx]||'#d6e7bd',r=f.r*(.3+.7*k);
  c.save();artHalo(c,f.x,f.y,Math.min(r,90),col,fade*.18);c.globalAlpha=fade*.85;
  if(f.style==='jian'||f.style==='feng'){
    for(let i=0;i<12;i++){const a=i*Math.PI/6;artBlade(c,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r,a,42,col);}
  }else if(f.style==='fa'){
    for(let i=0;i<6;i++){const a=i*Math.PI/3,x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r;c.fillStyle=col;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-22,y-8,x-6,y-38,x-45,y-72);c.bezierCurveTo(x+18,y-38,x+20,y+8,x,y);c.fill();}
  }else if(f.style==='hun'||f.style==='yushou'||f.style==='ling'){
    for(let i=0;i<6;i++){const a=i*Math.PI/3;c.save();c.translate(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(24,0);c.quadraticCurveTo(8,-23,-8,-11);c.lineTo(-16,-26);c.lineTo(-14,0);c.quadraticCurveTo(-38,6,-48,15);c.quadraticCurveTo(-4,7,24,0);c.fill();c.restore();}
  }else if(f.style==='yue'){
    for(let j=0;j<3;j++){c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,r*(.55+j*.2),k+j*.4,k+Math.PI*1.65+j*.4);c.stroke();}
  }else if(f.style==='du'){
    c.strokeStyle=col;c.lineWidth=5;c.beginPath();for(let i=0;i<=30;i++){const a=i*.42,rr=r*i/30,x=f.x+Math.cos(a)*rr,y=f.y+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  }else{
    artGlyphRing(c,f.x,f.y,r,k,col);
    if(['array','fu','kong','mix'].includes(f.style))for(let i=0;i<6;i++){const a=i*Math.PI/3;c.save();c.translate(f.x,f.y);c.rotate(a);c.strokeStyle=col;c.beginPath();c.moveTo(r*.25,0);c.lineTo(r*.5,8);c.lineTo(r*.6,-9);c.lineTo(r,0);c.stroke();c.restore();}
    else for(let i=0;i<6;i++){const a=i*Math.PI/3,x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r;c.strokeStyle=col;c.beginPath();c.moveTo(x-10,y-16);c.lineTo(x+10,y-16);c.lineTo(x+8,y+4);c.lineTo(x,y+13);c.lineTo(x-8,y+4);c.closePath();c.stroke();}
  }
  artDust(c,f.x,f.y,r,k,col);
  // Native 64px cached tile: no draw-time image resampling or allocation.
  if(idx>=0&&ULT_ART.sprites[idx]){c.globalAlpha=fade;c.drawImage(ULT_ART.sprites[idx],f.x-32,f.y-32);}
  c.restore();
}
function drawBossArt(f){
  const c=ctx,k=Math.min(1,f.t/f.dur),fade=1-k,col=f.col;
  c.save();c.globalAlpha=fade*.85;c.strokeStyle=col;c.fillStyle=col;
  if(f.shape==='circle'||f.shape==='ring'){
    // Ring's safe inner area remains empty; render only the struck annulus.
    c.globalAlpha=.13*fade;c.beginPath();c.arc(f.x,f.y,f.r,0,Math.PI*2);if(f.shape==='ring')c.arc(f.x,f.y,f.inner,0,Math.PI*2,true);c.fill('evenodd');
    c.globalAlpha=fade;artGlyphRing(c,f.x,f.y,f.r,k,col);if(f.shape==='ring')artGlyphRing(c,f.x,f.y,f.inner,k,col);
    artDust(c,f.x,f.y,f.r,k,col,12);
  }else if(f.shape==='line'||f.shape==='cross'){
    const count=f.shape==='cross'?2:1;
    for(let j=0;j<count;j++){c.save();c.translate(f.x-(count===2&&j===0?f.len/2:0),f.y-(count===2&&j===1?f.len/2:0));c.rotate(count===2?j*Math.PI/2:f.angle);
      c.globalAlpha=.22*fade;c.beginPath();c.moveTo(0,-f.w/2);c.lineTo(f.len,0);c.lineTo(0,f.w/2);c.lineTo(f.len*.2,0);c.closePath();c.fill();
      c.globalAlpha=fade;c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.lineTo(f.len*.25,-f.w*.14);c.lineTo(f.len*.42,f.w*.16);c.lineTo(f.len*.6,-f.w*.1);c.lineTo(f.len,0);c.stroke();c.restore();}
  }else if(f.shape==='meteors'){
    for(const p of f.spots||[]){c.globalAlpha=fade;artGlyphRing(c,p.x,p.y,f.r,k,col,6);artDust(c,p.x,p.y,f.r,k,col,6);}
  }else if(f.shape==='fan'){
    c.lineWidth=2;for(let i=0;i<12;i++){const a=f.angle+f.gap+(Math.PI*2-f.gap*2)*i/11;artBlade(c,f.ex+Math.cos(a)*(40+k*80),f.ey+Math.sin(a)*(40+k*80),a,20,col);}
  }else{c.globalAlpha=fade;artGlyphRing(c,f.ex,f.ey,50+k*70,k,col,5);}
  c.restore();
}
const drawFxBeforeUltArt=drawFx;
drawFx=function(f){
  if(f.k==='spark'){
    if(artSimple()||ULT_ART.dust<=0)return;ULT_ART.dust--;ctx.save();ctx.globalAlpha=1-f.t/f.dur;ctx.strokeStyle='#ebd9a1';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+3,f.y-3);ctx.stroke();ctx.restore();return;
  }
  if(ULT_ART.left--<=0)return;
  if(f.k==='ultimateArt')return drawUltimateArt(f);
  if(['impact','dissolve','boom','slam'].includes(f.k)){
    const c=ctx,k=Math.min(1,f.t/f.dur),col=f.col||'#d5e8c6';c.save();
    artHalo(c,f.x,f.y,Math.max(4,(f.r||16)*(.3+.7*k)),col,(1-k)*.2);c.globalAlpha=1-k;
    artDust(c,f.x,f.y,f.r||22,k,col,8);c.restore();return;
  }
  return drawFxBeforeUltArt(f);
};
const strikeBeforeUltArt=drawStrike;
drawStrike=function(s){
  if(ULT_ART.left--<=0)return;
  if(!s.ultArt)return strikeBeforeUltArt(s);
  if(s.t<0||s.t>=1)return;
  const c=ctx,k=Math.min(1,s.t/s.delay),col=ULT_ART_COLORS[ULT_ART_IDS.indexOf(s.ultArt)];
  c.save();c.globalAlpha=.55;artGlyphRing(c,s.x,s.y,s.r,k,col,6);c.globalAlpha=.95;
  if(s.ultArt==='jian')artBlade(c,s.x,s.y-(1-k)*150,Math.PI/2,50,col);
  else if(s.ultArt==='fa'){const y=s.y-(1-k)*180;c.fillStyle=col;c.beginPath();c.moveTo(s.x-36,y-65);c.quadraticCurveTo(s.x+26,y-12,s.x,y+8);c.quadraticCurveTo(s.x-18,y+7,s.x-36,y-65);c.fill();}
  else{c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.moveTo(s.x+12,s.y-160*(1-k)-25);c.lineTo(s.x-10,s.y-26);c.lineTo(s.x+8,s.y-30);c.lineTo(s.x,s.y);c.stroke();}c.restore();
};
const drawBeforeUltArt=draw;
draw=function(...a){trimArt();ULT_ART.left=Math.max(0,40-TVFX.length);ULT_ART.dust=artSimple()?0:120;return drawBeforeUltArt(...a);};
const startBeforeUltArt=startStage;
startStage=function(...a){loadUltArt();return startBeforeUltArt(...a);};
// UI icons are demand-loaded, with the existing text label as fallback.
const hudBeforeUltArt=hud;
hud=function(...a){const r=hudBeforeUltArt(...a);if(P&&ultBtn){const key='ult_'+P.cls;if(ultBtn.dataset.artKey!==key){ultBtn.dataset.artKey=key;ultBtn.style.backgroundImage=`url("${ICONS[key]||''}")`;ultBtn.style.backgroundSize='32px 32px';ultBtn.style.backgroundRepeat='no-repeat';ultBtn.style.backgroundPosition='4px center';ultBtn.style.paddingLeft='39px';}}return r;};
const treeBeforeUltArt=showTree;
showTree=function(...a){const r=treeBeforeUltArt(...a);const p=overlay.querySelector('.flow-panel p');if(P&&p&&p.textContent.includes('主动大招')&&!p.querySelector('.paint-icon'))p.insertAdjacentHTML('afterbegin',iconMarkup('ult_'+P.cls,'绝','g'));return r;};
