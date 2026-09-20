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
  const layers = $$('.L', cov), scenes = $$('.L[viewBox], .L .drift svg, .L .flight svg', cov), scene = $('#scene');
  const crop = () => { const a = innerWidth/innerHeight; return a < .8 ? [330, 900] : (a < 1.1 ? [160, 1280] : [0, 1600]); };
  const frame = () => {
    const [vx, vw] = crop();
    scenes.forEach(l => l.setAttribute('viewBox', `${vx} 0 ${vw} 900`));
    // mirror preserveAspectRatio="xMidYMax slice" for the HTML bus scene
    const W = cov.clientWidth, H = cov.clientHeight, S = Math.max(W/vw, H/900);
    scene.style.transform = `translate(${((W - vw*S)/2 - vx*S).toFixed(2)}px, ${(H - 900*S).toFixed(2)}px) scale(${S.toFixed(4)})`;
  };
  frame(); addEventListener('resize', frame, {passive:true});
  if('ResizeObserver' in window) new ResizeObserver(frame).observe(cov);
  // bus: if motion-path is unsupported, park it on the road
  const bus = $('#bus');
  if(!CSS.supports('offset-path', 'path("M0 0 L1 1")')) bus.style.transform = 'translate(300px, 704px) rotate(4deg)';
  // scroll-linked fallback for browsers without CSS scroll-driven animations (mirrors the c-* keyframes)
  if(!motionEnabled || CSS.supports('animation-timeline', 'scroll()')) return;
  const PAR = {'l-stars':[0,70],'l-meteors':[0,70],'l-birds':[0,70],'l-glow':[0,-110],'l-clouds':[-90,30],'l-atmos':[-50,20],'l-clouds2':[-190,-40],'l-far':[0,30],'l-mist':[140,-30],'l-mid':[0,-20],'l-trees':[0,-70],'l-road':[0,-120],'l-bus':[0,-120],'l-fg':[0,-190],'l-flags':[0,-240]};
  const FADE = {'l-stars':.85,'l-meteors':.85,'l-birds':.85,'l-mist':.85,'l-atmos':.65};
  const mast = $('#mast'), lines = $('#lines'), route = $('.cover-route'), dawn = $('.l-dawn', cov); let ticking=false;
  const run = () => {
    ticking=false; const p = Math.min(1, Math.max(0, scrollY/(innerHeight*.88))); if(p>=1 && run.done) return; run.done = p>=1;
    layers.forEach(l => { const k = [...l.classList].find(c => PAR[c]); if(!k) return; const [x,y] = PAR[k]; l.style.transform = `translate3d(${(x*p).toFixed(1)}px, ${(y*p).toFixed(1)}px, 0)`; if(FADE[k]) l.style.opacity = 1 - FADE[k]*p; });
    if(dawn) dawn.style.opacity = .3 + .65*p;
    mast.style.transform = `translate3d(0, ${(150*p).toFixed(1)}px, 0)`; mast.style.opacity = 1-p;
    lines.style.transform = `translate3d(0, ${(70*p).toFixed(1)}px, 0)`; lines.style.opacity = 1-p;
    if(route) route.style.translate = `0 ${(120*p).toFixed(1)}px`;
    const portrait = matchMedia('(max-aspect-ratio: 4/5)').matches; bus.style.offsetDistance = (portrait ? 40 + 18*p : 14 + 64*p).toFixed(1) + '%';
  };
  addEventListener('scroll', () => { if(!ticking){ ticking=true; requestAnimationFrame(run); } }, {passive:true});
  run();
})();
