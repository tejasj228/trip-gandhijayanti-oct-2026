/* ============================ COVER ART ============================ */
(function cover(){
  const cov = $('#cover');
  // stars: 4 twinkle groups instead of one animation per star
  let seed = 7; const rnd = () => (seed = (seed*9301+49297)%233280)/233280;
  const groups = [[],[],[],[]];
  for(let i=0;i<84;i++){
    const x = rnd()*1600, y = rnd()*430, r = .6 + rnd()*1.5, o = .35 + rnd()*.65;
    groups[i%4].push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#FFF6E2" opacity="${o.toFixed(2)}"/>`);
  }
  $('#stars').innerHTML = groups.map((g,i) => `<g class="sg" style="--d:${(4+i*1.3).toFixed(1)}s;--dl:${(-i*1.7).toFixed(1)}s">${g.join('')}</g>`).join('');
  // tree-line ridge
  const pts = ['0,960'];
  for(let x=0;x<=1600;x+=14){
    const base = 724 + 26*Math.sin(x/190) + 10*Math.sin(x/47+1);
    const h = 9 + 13*Math.abs(Math.sin(x*.37));
    pts.push(`${x},${base.toFixed(1)}`, `${x+7},${(base-h).toFixed(1)}`);
  }
  pts.push('1614,740','1614,960');
  $('#ridgeB').setAttribute('points', pts.join(' '));
  // prayer flags along the string
  const line = $('#line'), L = line.getTotalLength(), cols = ['#3B6FD8','#F1F2F6','#E0503C','#3D9C5E','#F0C23C'];
  let f=''; const n=13;
  for(let i=0;i<n;i++){
    const t = 0.06 + (i/(n-1))*0.9, p = line.getPointAtLength(t*L), p2 = line.getPointAtLength(Math.min(L, t*L+4));
    const ang = Math.atan2(p2.y-p.y, p2.x-p.x)*180/Math.PI;
    const c = cols[i%cols.length], dark = c==='#F1F2F6' ? 'rgba(20,30,60,.14)' : 'rgba(0,0,0,.2)';
    f += `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})"><g class="flag" style="--wd:${(2.8+(i%4)*.35).toFixed(2)}s;--wdl:${(-i*.37).toFixed(2)}s">
      <rect x="-15" y="0" width="30" height="23" fill="${c}"/><rect x="-15" y="14" width="30" height="9" fill="${dark}"/><rect x="-8" y="5" width="16" height="6" fill="rgba(0,0,0,.12)"/></g></g>`;
  }
  $('#flags').innerHTML = f;
  // framing: crop the wide scene on portrait screens so the bus and sun stay in view
  const layers = $$('.L', cov), scenes = $$('.L[viewBox], .L svg[viewBox]', cov);
  const frame = () => { const a = innerWidth/innerHeight; const vb = a < .8 ? '330 0 900 900' : (a < 1.1 ? '160 0 1280 900' : '0 0 1600 900'); scenes.forEach(l => l.setAttribute('viewBox', vb)); };
  frame(); addEventListener('resize', frame, {passive:true});
  // bus: if motion-path is unsupported, park it on the road
  const bus = $('#bus');
  if(!CSS.supports('offset-path', 'path("M0 0 L1 1")')) bus.setAttribute('transform', 'translate(500 748) rotate(4)');
  // scroll-linked fallback for browsers without CSS scroll-driven animations (mirrors the c-* keyframes)
  if(!motionEnabled || CSS.supports('animation-timeline', 'scroll()')) return;
  const PAR = {'l-stars':[0,70],'l-meteors':[0,70],'l-birds':[0,70],'l-glow':[0,-110],'l-clouds':[-90,30],'l-atmos':[-50,20],'l-clouds2':[-190,-40],'l-far':[0,30],'l-mist':[140,-30],'l-mid':[0,-20],'l-trees':[0,-70],'l-road':[0,-120],'l-fg':[0,-190],'l-flags':[0,-240]};
  const FADE = {'l-stars':.85,'l-meteors':.85,'l-birds':.85,'l-mist':.85,'l-atmos':.65};
  const mast = $('#mast'), lines = $('#lines'), route = $('.cover-route'), dawn = $('.l-dawn', cov); let ticking=false;
  const run = () => {
    ticking=false; const p = Math.min(1, Math.max(0, scrollY/(innerHeight*.88))); if(p>=1 && run.done) return; run.done = p>=1;
    layers.forEach(l => { const k = [...l.classList].find(c => PAR[c]); if(!k) return; const [x,y] = PAR[k]; l.style.transform = `translate3d(${(x*p).toFixed(1)}px, ${(y*p).toFixed(1)}px, 0)`; if(FADE[k]) l.style.opacity = 1 - FADE[k]*p; });
    if(dawn) dawn.style.opacity = .3 + .65*p;
    mast.style.transform = `translate3d(0, ${(150*p).toFixed(1)}px, 0)`; mast.style.opacity = 1-p;
    lines.style.transform = `translate3d(0, ${(70*p).toFixed(1)}px, 0)`; lines.style.opacity = 1-p;
    if(route) route.style.translate = `0 ${(120*p).toFixed(1)}px`;
    const portrait = matchMedia('(max-aspect-ratio: 4/5)').matches; bus.style.offsetDistance = (portrait ? 30 + 36*p : 14 + 64*p).toFixed(1) + '%';
  };
  addEventListener('scroll', () => { if(!ticking){ ticking=true; requestAnimationFrame(run); } }, {passive:true});
  run();
})();
/* ============================ AMBIENCE ============================ */
(function ambience(){
  const btns = $$('.snd'); if(!btns.length) return;
  const KEY = 'overnight.snd', SRC = 'audio/ambience.mp3', LEVEL = 9; // the recording is very quiet; ~+19 dB brings it to a soft bed
  let ctx, gain, src, buf, loading = false, on = false;
  const paint = () => btns.forEach(b => { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('busy', loading); $('.lbl', b).textContent = loading ? 'Loading' : (on ? 'Sound on' : 'Sound off'); });
  async function start(){
    if(!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500; lp.Q.value = .5;
      gain.connect(lp).connect(ctx.destination);
    }
    if(ctx.state === 'suspended') await ctx.resume();
    if(!buf){ loading = true; paint(); const res = await fetch(SRC); buf = await ctx.decodeAudioData(await res.arrayBuffer()); loading = false; }
    src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 1.5; src.loopEnd = buf.duration - 1.5;
    src.connect(gain); src.start(0, 1.5);
    const t = ctx.currentTime; gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(LEVEL, t + 3);
    on = true; paint();
  }
  function stop(){
    on = false; paint(); if(!ctx || !src) return;
    const t = ctx.currentTime, s = src; src = null;
    gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t); gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    setTimeout(() => { try{ s.stop(); }catch(e){} }, 1500);
  }
  btns.forEach(b => b.addEventListener('click', () => {
    if(loading) return;
    const want = !on; try{ localStorage.setItem(KEY, want ? '1' : '0'); }catch(e){}
    want ? start().catch(() => { loading = false; on = false; paint(); }) : stop();
  }));
  document.addEventListener('visibilitychange', () => { if(!ctx || !on) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  paint();
})();
