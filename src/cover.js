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
  const layers = $$('.L', cov);
  const frame = () => { const a = innerWidth/innerHeight; const vb = a < .8 ? '330 0 900 900' : (a < 1.1 ? '160 0 1280 900' : '0 0 1600 900'); layers.forEach(l => l.setAttribute('viewBox', vb)); };
  frame(); addEventListener('resize', frame, {passive:true});
  // bus: if motion-path is unsupported, park it on the road
  const bus = $('#bus');
  if(!CSS.supports('offset-path', 'path("M0 0 L1 1")')) bus.setAttribute('transform', 'translate(500 748) rotate(4)');
})();
