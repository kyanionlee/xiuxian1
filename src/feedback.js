
/* ================================================================
   v1.6.0 试玩反馈修正（Claude）
   地图上下滑动、加点说明、职业平衡、道基进度、技能范围特效、引妖（妖物翻倍）、
   出发前提醒、自动流畅模式、从容难度。
   ================================================================ */
document.head.insertAdjacentHTML('beforeend', `<style id="feedback-style">
.map-viewport{overflow-y:hidden!important;touch-action:pan-x pan-y;overscroll-behavior-x:contain}
.overlay{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.go-remind{margin:12px 0;padding:12px 14px;border:1px solid #e6c879;border-radius:8px;background:rgba(230,200,121,.12);text-align:left}
.go-remind b{color:#e6c879}.go-remind .actions{justify-content:flex-start;margin-top:8px}
#lure-btn{margin-left:8px}
</style>`);

/* —— 职业平衡：剑修加强生存，毒师削弱后期站撸 —— */
CLASSES.jian.st = { crit:0.03, hp:30, armor:0.05 };
applyPoison = function(e, dps, dur){
  if (!e || e.dead || !(dps > 0)) return;
  const tox = (1 + 0.10 * lv('toxin')) * (P.cls === 'du' && isMatch() ? 1.25 : 1), d2u = dur * (1 + 0.2 * lv('contagion'));
  const cur = e.psn || { dps:0, t:0, tick:0.5 };
  e.psn = { dps:Math.min(cur.dps * 0.6 + dps * tox, dps * tox * 2), t:Math.max(cur.t, d2u), tick:cur.tick };
};
if (SK.rot){ const r0 = SK.rot.stat; SK.rot.stat = (l, ev) => Object.assign({}, r0(l, ev), ev ? { psn:14, spread:3 } : { psn:2 + 1.5 * l, spread:Math.max(1, Math.floor((l + 1) / 2)) }); }
for (const k of Object.keys(SK)) if ((k === 'toxin' || SK[k].sourcePassive === 'toxin') && SK[k].cat === 'p') SK[k].desc = () => '毒素伤害 +10%';

/* —— 技能范围特效：回风剑轮等「环身」类技能 —— */
const RING_STYLES = { return:['#9fe3ff', '剑'], quake:['#d9a35b', '震'], soul:['#b597dc', '魂'], wave:['#80c8ec', '音'], slow:['#a9d8ff', '寒'], chain:['#ffd76a', '雷'], shield:['#e6c879', '罡'], spring:['#72ccab', '元'], heal:['#72ccab', '清'] };
const TVFX = [];
for (const k of Object.keys(SK)){
  const s = SK[k]; if (!s.upd || !k.includes('_') || s.cat === 'p') continue;
  let style; try { style = s.stat(1, false).style; } catch (e) {}
  if (!RING_STYLES[style]) continue;
  const u = s.upd;
  s.upd = function(dt, st){ const before = P.t[k] || 0, r = u.call(this, dt, st); if ((P.t[k] || 0) > before + 0.3) TVFX.push({ style, x:P.x, y:P.y, r:(st.r || 100) * P.st.area, t:0, dur:style === 'return' ? 0.6 : 0.5 }); return r; };
}

/* —— 引妖：本关妖物翻倍 —— */
const LURE = { inside:false };
advanceEl.insertAdjacentHTML('beforeend', '<button class="btn" id="lure-btn">引妖 · 妖物翻倍 [G]</button>');
const lureBtn = document.getElementById('lure-btn');
function lure(){
  const s = STAGE; if (state !== 'play' || !s || s.done || s.lured) return;
  s.lured = true; s.zhanyi = Math.min(5, (s.zhanyi || 0) + 1);
  banner('引妖 · 妖物翻倍'); try { sfx('drum'); } catch (e) {}
  toast('本关妖物翻倍：修为更多，战意 +1，通关额外奖励灵石。');
  try { captureBattle(); } catch (e) {}
}
lureBtn.addEventListener('click', () => { audioInit(); lure(); });
document.addEventListener('keydown', e => { if (e.code === 'KeyG' && state === 'play' && !e.repeat){ e.preventDefault(); lure(); } });
const _spawnLure = spawn;
spawn = function(beh, x, y, extra){
  const e = _spawnLure(beh, x, y, extra);
  const s = STAGE;
  if (s && s.lured && !s.done && !LURE.inside && !['boss', 'elite'].includes(beh) && enemies.length < 380){
    LURE.inside = true;
    try { _spawnLure(beh, x === undefined ? undefined : x + rand(-24, 24), y === undefined ? undefined : y + rand(-24, 24), extra); } finally { LURE.inside = false; }
  }
  return e;
};
const _hudLure = hud;
hud = function(){
  _hudLure();
  const s = STAGE; if (!s || !lureBtn) return;
  lureBtn.disabled = !!s.lured || !!s.done;
  lureBtn.textContent = s.lured ? '已引妖 · 妖物翻倍中' : '引妖 · 妖物翻倍 [G]';
};
const _finishLure = finishStage;
finishStage = function(win){
  const s = STAGE;
  if (win && s && s.lured){ s.lureStones = Math.round(25 * (1 + s.ch)); P.stones += s.lureStones; }
  return _finishLure(win);
};
const _rewardLure = showReward;
showReward = function(){
  const r = _rewardLure();
  try { const s = STAGE; if (s && s.lureStones && RW && !RW.fail){ const sub = overlay.querySelector('.panel .sub'); if (sub) sub.insertAdjacentHTML('afterend', `<p class="help" style="color:#e6c879">引妖赏：灵石 +${s.lureStones}</p>`); } } catch (e) {}
  return r;
};

/* —— 出发前提醒：未分配的属性点、更好的装备、研习点 —— */
function betterGearCount(){
  const c = CLS();
  return P.bag.filter(it => {
    if (it.slot === 'weapon' && c && it.type !== c.weapon) return false;
    const cur = P.eq[it.slot];
    return !cur || it.rar > cur.rar || (it.rar === cur.rar && it.ch > cur.ch);
  }).length;
}
const _showMapRemind = showMap;
showMap = function(){
  const r = _showMapRemind();
  try {
    if (state !== 'map' || !P) return r;
    const pts = P.attrPts || 0, gear = betterGearCount(), tree = P.treePoints || 0, parts = [], acts = [];
    if (pts){ parts.push(`<b>${pts}</b> 个属性点未分配`); acts.push(btn('attr', '去加点', null, 'sm')); }
    if (gear){ parts.push(`行囊里有 <b>${gear}</b> 件更好的装备`); acts.push(btn('bag', '去换装', null, 'sm')); }
    if (tree){ parts.push(`<b>${tree}</b> 个研习点未使用`); acts.push(btn('skills', '去研习', null, 'sm')); }
    const top = overlay.querySelector('.world-top');
    if (parts.length && top) top.insertAdjacentHTML('afterend', `<div class="go-remind">出发前别忘了：${parts.join(' · ')}<div class="actions">${acts.join('')}</div></div>`);
  } catch (e) {}
  return r;
};

/* —— 加点页：说明没有上限、收益递减 —— */
const _showAttrNote = showAttr;
showAttr = function(back){
  const r = _showAttrNote(back);
  try { const pts = overlay.querySelector('.panel .pts'); if (pts) pts.insertAdjacentHTML('afterend', '<p class="help">属性点<b>没有上限</b>，可以一直加；但加成越高，每一点的实际收益越低。封顶值：减伤 55%、闪避 30%、冷却缩减 40%、暴击 50%。建议均衡分配。</p>'); } catch (e) {}
  return r;
};

/* —— 轮回殿：超过 10 重的项目用数字显示进度 —— */
const _showMetaPips = showMeta;
showMeta = function(){
  const r = _showMetaPips();
  try { for (const b of overlay.querySelectorAll('[data-act="buy"]')){ const k = b.dataset.k, u = UPS[k]; if (!u || u.max <= 10) continue; const pip = b.closest('.mrow')?.querySelector('.pips'); if (pip) pip.textContent = `${upLv(k)} / ${u.max}`; } } catch (e) {}
  return r;
};

/* —— 从容难度（新手推荐）：妖物血量 ×0.65、伤害 ×0.6，轮回点减半 —— */
const _stageMultEasy = stageMult, _dmgMultEasy = dmgMult;
stageMult = function(){ return _stageMultEasy() * (RUN && RUN.easy ? 0.65 : 1); };
dmgMult = function(){ return _dmgMultEasy() * (RUN && RUN.easy ? 0.6 : 1); };
const _showSetupEasy = showSetup;
showSetup = function(){
  if (setupSel.easy === undefined) setupSel.easy = META.lastEasy !== undefined ? !!META.lastEasy : (META.runs || 0) < 3;
  const r = _showSetupEasy();
  try {
    const h = [...overlay.querySelectorAll('.panel h3')].find(x => x.textContent.includes('劫数'));
    const row = `<h3>难度</h3><div class="toggles" style="justify-content:flex-start;flex-wrap:wrap">
      <button class="toggle" data-act="sdiff" data-k="easy" aria-pressed="${!!setupSel.easy}">从容（推荐新手）</button>
      <button class="toggle" data-act="sdiff" data-k="std" aria-pressed="${!setupSel.easy}">标准</button></div>
      <p class="help" style="text-align:left;margin:6px 0 0">从容：妖物血量 ×0.65、伤害 ×0.6，轮回点减半。标准难度才能挑战劫数。</p>`;
    if (h) h.insertAdjacentHTML('beforebegin', row);
  } catch (e) {}
  return r;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="sdiff"]'); if (!b) return;
  e.stopImmediatePropagation(); setupSel.easy = b.dataset.k === 'easy'; if (setupSel.easy) setupSel.jie = 0; showSetup();
}, true);
const _newRunEasy = newRun;
newRun = function(...a){ const r = _newRunEasy(...a); try { RUN.easy = !!setupSel.easy; if (RUN.easy) RUN.jie = 0; META.lastEasy = RUN.easy; } catch (e) {} return r; };
const _gameOverEasy = gameOver;
gameOver = function(win){
  const before = META.pts || 0, easy = RUN && RUN.easy, r = _gameOverEasy(win);
  try { if (easy){ const gained = (META.pts || 0) - before; if (gained > 0){ META.pts -= Math.floor(gained / 2); persist(); } } } catch (e) {}
  return r;
};

/* —— 自动流畅模式：帧率过低时降低画面精度、关闭华丽特效 —— */
const PERF = { last:0, acc:0, n:0, slow:0, done:false };
const _resizePerf = resize;
resize = function(){ _resizePerf(); if (PERF.done && DPR > 1){ DPR = 1; cvs.width = Math.round(W); cvs.height = Math.round(H); } };
const _updatePerf = update;
update = function(dt){
  _updatePerf(dt);
  if (state === 'play' && !PERF.done){
    const now = performance.now();
    if (PERF.last){ const gap = now - PERF.last; if (gap < 500){ PERF.acc += gap; PERF.n++; } }
    PERF.last = now;
    if (PERF.n >= 90){
      PERF.slow = PERF.acc / PERF.n > 30 ? PERF.slow + 1 : 0; PERF.acc = 0; PERF.n = 0;
      if (PERF.slow >= 2){ PERF.done = true; try { vividCombat = false; } catch (e) {} resize(); toast('检测到画面卡顿，已自动切换为流畅模式。'); }
    }
  } else PERF.last = 0;
  if (state === 'play'){ for (const f of TVFX){ f.t += dt; if (f.style === 'return'){ f.x = P.x; f.y = P.y; } } for (let i = TVFX.length - 1; i >= 0; i--) if (TVFX[i].t >= TVFX[i].dur) TVFX.splice(i, 1); }
};
const _drawWorldTV = drawPhase1World;
drawPhase1World = function(){
  _drawWorldTV();
  const c = ctx;
  for (const f of TVFX){
    const k = f.t / f.dur, [col, g] = RING_STYLES[f.style];
    if (f.style === 'return'){
      const rr = f.r * (0.55 + 0.45 * Math.min(1, k * 2));
      c.globalAlpha = 0.25 * (1 - k); c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(f.x, f.y, f.r, 0, 7); c.stroke();
      for (let i = 0; i < 6; i++){
        const a = i / 6 * Math.PI * 2 + f.t * 11;
        c.save(); c.translate(f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr); c.rotate(a + Math.PI / 2);
        c.globalAlpha = 0.9 * (1 - k); c.fillStyle = col; c.beginPath(); c.moveTo(0, -12); c.lineTo(3, 6); c.lineTo(-3, 6); c.closePath(); c.fill();
        c.globalAlpha = 0.35 * (1 - k); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 0.01, 0, 7); c.stroke();
        c.restore();
        c.globalAlpha = 0.35 * (1 - k); c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.arc(f.x, f.y, rr, a - 0.5, a); c.stroke();
      }
    } else {
      c.globalAlpha = 0.7 * (1 - k); c.strokeStyle = col; c.lineWidth = 3;
      c.beginPath(); c.arc(f.x, f.y, f.r * (0.5 + 0.5 * k), 0, 7); c.stroke();
      c.globalAlpha = 0.12 * (1 - k); c.fillStyle = col; c.beginPath(); c.arc(f.x, f.y, f.r, 0, 7); c.fill();
      c.globalAlpha = 0.8 * (1 - k); c.fillStyle = col; c.font = '15px "Ma Shan Zheng","Kaiti SC",serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + k; c.fillText(g, f.x + Math.cos(a) * f.r * (0.5 + 0.5 * k), f.y + Math.sin(a) * f.r * (0.5 + 0.5 * k)); }
      c.textBaseline = 'alphabetic';
    }
  }
  c.globalAlpha = 1;
};
addEventListener('resize', () => { if (PERF.done) resize(); });
