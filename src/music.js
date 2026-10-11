
/* ================================================================
   配乐模块（v1.5，Claude）：场景配乐、交叉淡化、按需加载
   曲目放在 assets/music/；任一曲目加载失败时，自动退回原有的合成古筝。
   ================================================================ */
const MUSIC_BASE = 'assets/music/';
const MUSIC_VOL = 0.55, MUSIC_FADE = 1.8, MUSIC_LOOP_XF = 2.5;
const MUSIC = { cur:null, want:null, a:null, b:null, unlocked:false, failed:{}, playing:false };
function musicScene(){
  const sc = (P && P.scene) || (RUN && CHAPTERS[RUN.ch] && CHAPTERS[RUN.ch].scene) || 'bamboo';
  return ['bamboo', 'desert', 'underworld'].includes(sc) ? sc : 'bamboo';
}
function musicWant(){
  const s = state;
  if (s === 'win') return 'ending';
  if (['story', 'dream', 'arc', 'local-story', 'ending-choice', 'over'].includes(s)) return 'story';
  if (STAGE && ['play', 'pause', 'levelup', 'event', 'bingjie'].includes(s)){
    const boss = STAGE.obj === 'boss' || (STAGE.boss && !STAGE.boss.dead);
    return boss ? 'battle_boss' : 'battle_' + musicScene();
  }
  if (!P || !RUN || ['title', 'setup', 'meta', 'savehub', 'journal'].includes(s)) return 'title';
  return 'map_' + musicScene();
}
// iOS 的 Safari 不允许网页直接改音量，所以经 Web Audio 增益节点控制；本地 file:// 打开时退回 el.volume
function musicEl(){
  const el = new Audio(); el.preload = 'auto'; el.loop = false; el.crossOrigin = 'anonymous';
  el.addEventListener('error', () => { if (el.dataset.track) MUSIC.failed[el.dataset.track] = true; });
  try {
    if (location.protocol !== 'file:' && SFX.ctx){ const src = SFX.ctx.createMediaElementSource(el), g = SFX.ctx.createGain(); g.gain.value = 0; src.connect(g); g.connect(SFX.ctx.destination); el._gain = g; }
  } catch (e) { el._gain = null; }
  if (!el._gain) el.volume = 0;
  return el;
}
const getVol = el => el._gain ? el._gain.gain.value : el.volume;
const setVol = (el, v) => { v = Math.max(0, Math.min(1, v)); if (el._gain) el._gain.gain.value = v; else el.volume = v; };
const musicOn = () => !META.muted && META.bgm !== false;
function musicFade(el, to, sec, done){
  if (!el) return;
  const from = getVol(el), t0 = performance.now();
  clearInterval(el._fade);
  el._fade = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / (sec * 1000));
    try { setVol(el, from + (to - from) * k); } catch (e) {}
    if (k >= 1){ clearInterval(el._fade); if (done) done(); }
  }, 50);
}
function musicStart(track){
  const el = MUSIC.a && !MUSIC.a.paused && MUSIC.a.dataset.track ? (MUSIC.b ||= musicEl()) : (MUSIC.a ||= musicEl());
  const old = el === MUSIC.a ? MUSIC.b : MUSIC.a;
  el.dataset.track = track;
  if (!el.src || !el.src.endsWith(track + '.mp3')) el.src = MUSIC_BASE + track + '.mp3';
  try { el.currentTime = 0; } catch (e) {}
  setVol(el, 0);
  const p = el.play();
  if (p && p.catch) p.catch(() => { MUSIC.playing = false; });
  musicFade(el, MUSIC_VOL, MUSIC_FADE);
  if (old && !old.paused) musicFade(old, 0, MUSIC_FADE, () => { try { old.pause(); } catch (e) {} });
  MUSIC.cur = track; MUSIC.playing = true;
}
function musicStop(){
  for (const el of [MUSIC.a, MUSIC.b]) if (el && !el.paused) musicFade(el, 0, 0.8, () => { try { el.pause(); } catch (e) {} });
  MUSIC.cur = null; MUSIC.playing = false;
}
function musicTick(){
  if (!MUSIC.unlocked || document.hidden) return;
  if (!musicOn()){ if (MUSIC.cur) musicStop(); return; }
  const want = musicWant();
  if (MUSIC.failed[want]){ if (MUSIC.cur) musicStop(); return; }
  if (want !== MUSIC.cur){ musicStart(want); return; }
  const el = [MUSIC.a, MUSIC.b].find(e => e && !e.paused && e.dataset.track === MUSIC.cur);
  if (el && el.duration && el.duration - el.currentTime < MUSIC_LOOP_XF) musicStart(MUSIC.cur);
}
const musicActive = () => MUSIC.unlocked && musicOn() && !MUSIC.failed[musicWant()];
const _bgmTickM = bgmTick;
bgmTick = function(){ if (musicActive()) return; return _bgmTickM(); };
function musicUnlock(){
  if (MUSIC.unlocked) return;
  MUSIC.unlocked = true;
  try { audioInit(); } catch (e) {}
  MUSIC.a ||= musicEl(); MUSIC.b ||= musicEl();
  // 在用户手势内先把备用播放器「激活」一次，iOS 之后才允许它自动播放（交叉淡化要用）
  const b = MUSIC.b, t = musicWant();
  try { b.src = MUSIC_BASE + t + '.mp3'; b.dataset.track = t; b.muted = true; const p = b.play();
    if (p && p.then) p.then(() => { b.pause(); b.muted = false; }).catch(() => { b.muted = false; }); else { b.pause(); b.muted = false; } } catch (e) { b.muted = false; }
  musicTick();
}
addEventListener('pointerdown', musicUnlock, { capture:true });
addEventListener('keydown', musicUnlock, { capture:true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden){ for (const el of [MUSIC.a, MUSIC.b]) if (el && !el.paused){ el._resume = true; try { el.pause(); } catch (e) {} } }
  else for (const el of [MUSIC.a, MUSIC.b]) if (el && el._resume){ el._resume = false; const p = el.play(); if (p && p.catch) p.catch(() => {}); }
});
setInterval(musicTick, 400);
