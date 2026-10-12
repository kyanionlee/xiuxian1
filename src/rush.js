
/* ================================================================
   v1.6.0 鸣钟赏（Claude）：提前迎战的奖励（参考塔防的「提前叫波」）
   - 灵石：每提前 1 秒得 1.2 ×（章节+1）；上一波残余妖物超过 25 只时 ×1.5（叠浪）
   - 战意：每次提前鸣钟 +1 层（最多 5 层，本关有效），每层伤害 +5%、修为获取 +8%
   - 提前召唤妖王/镇守（提前超过 5 秒）或战意 ≥3：本关战利品装备品质 +1
   - 本关每累计提前 15 秒，额外 +1 轮回点
   ================================================================ */
const RUSH = { manual:false };
function rushReward(saved){
  const s = STAGE; if (!s || saved <= 0.5) return;
  const alive = enemies.filter(e => !e.dead).length, overlap = alive > 25;
  const stones = Math.round(saved * 1.2 * (1 + s.ch) * (overlap ? 1.5 : 1));
  s.rushSaved = (s.rushSaved || 0) + saved; s.rushStones = (s.rushStones || 0) + stones;
  s.zhanyi = Math.min(5, (s.zhanyi || 0) + 1);
  P.stones += stones;
  texts.push({ x:P.x, y:P.y - 40, v:`鸣钟赏 +${stones} 灵石${overlap ? ' · 叠浪' : ''}`, t:0, heal:true });
  toast(`提前 ${Math.round(saved)} 秒迎战：灵石 +${stones}${overlap ? '（叠浪 ×1.5）' : ''}，战意 ×${s.zhanyi}`);
}
const _rushOrig = rush;
rush = function(){ RUSH.manual = true; try { return _rushOrig(); } finally { RUSH.manual = false; } };
const _assaultRush = assault;
assault = function(){
  const s = STAGE, early = RUSH.manual && s && !s.done ? (s.nextWave || 0) - (s.clock || 0) : 0;
  const r = _assaultRush();
  try { if (early > 0.5) rushReward(early); } catch (e) {}
  return r;
};
const _summonFinalRush = summonFinal;
summonFinal = function(){
  const s = STAGE, had = s && (s.boss || s.guardian);
  const due = s ? (s.fast ? 12 : s.obj === 'boss' ? 150 : 120) : 0, early = RUSH.manual && s && !had ? due - (s.clock || 0) : 0;
  const r = _summonFinalRush();
  try { if (early > 0.5 && (s.boss || s.guardian)){ rushReward(early); if (early > 5) s.rushFinal = true; } } catch (e) {}
  return r;
};
const zhanyi = () => (STAGE && STAGE.zhanyi) || 0;
const _hitRush = hit;
hit = function(e, dmg, ...rest){ return _hitRush(e, zhanyi() ? dmg * (1 + 0.05 * zhanyi()) : dmg, ...rest); };
const _gainXpRush = gainXp;
gainXp = function(v){ return _gainXpRush(zhanyi() ? v * (1 + 0.08 * zhanyi()) : v); };
const _hudRush = hud;
hud = function(){
  _hudRush();
  try {
    const s = STAGE, note = document.getElementById('rush-note'); if (!s || !note) return;
    note.textContent = (s.zhanyi || s.rushStones)
      ? `战意 ×${s.zhanyi || 0}（伤害 +${5 * (s.zhanyi || 0)}%）· 本关鸣钟赏 ${s.rushStones || 0} 灵石`
      : '提前迎战：越早鸣钟，灵石越多，并叠加战意';
  } catch (e) {}
};
const _finishStageRush = finishStage;
finishStage = function(win){
  const s = STAGE;
  if (win && s && s.rushSaved){
    s.rushPts = Math.floor(s.rushSaved / 15);
    if (s.rushPts) META.pts = (META.pts || 0) + s.rushPts;
  }
  const r = _finishStageRush(win);
  try {
    if (win && s && (s.rushFinal || (s.zhanyi || 0) >= 3) && RW && RW.opts){
      const i = RW.opts.findIndex(o => o.item && o.item.rar < 4);
      if (i >= 0){ const old = RW.opts[i].item; RW.opts[i].item = genItem(old.slot, old.rar + 1, old.ch, old.type); s.rushUpgraded = true; }
    }
  } catch (e) {}
  return r;
};
const _showRewardRush = showReward;
showReward = function(){
  const r = _showRewardRush();
  try {
    const s = STAGE; if (!s || !s.rushSaved || !RW || RW.fail) return r;
    const parts = [`提前 ${Math.round(s.rushSaved)} 秒`, `灵石 +${s.rushStones || 0}`, `战意 ×${s.zhanyi || 0}`];
    if (s.rushPts) parts.push(`轮回点 +${s.rushPts}`);
    if (s.rushUpgraded) parts.push('一件装备品质 +1');
    const sub = overlay.querySelector('.panel .sub');
    if (sub) sub.insertAdjacentHTML('afterend', `<p class="help" style="color:#e6c879">鸣钟赏：${parts.join(' · ')}</p>`);
  } catch (e) {}
  return r;
};
