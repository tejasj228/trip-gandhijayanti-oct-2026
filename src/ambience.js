/* ============================ AMBIENCE ============================ */
(function ambience(){
  const btns = $$('.snd'); if(!btns.length) return;
  const KEY = 'overnight.snd', SRC = 'audio/ambience.mp3', LEVEL = 9; // the recording is very quiet; ~+19 dB brings it to a soft bed
  let ctx, gain, src, buf, pending, loading = false, playing = false;
  let on = true; try{ on = localStorage.getItem(KEY) !== '0'; }catch(e){}
  const paint = () => btns.forEach(b => { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('busy', loading); b.classList.toggle('playing', playing); $('.lbl', b).textContent = loading ? 'Loading' : (on ? 'Sound on' : 'Sound off'); });
  // Browsers only allow audio after a tap, so the file is fetched early and decoded at the first gesture.
  const saveData = navigator.connection && navigator.connection.saveData;
  const prefetch = () => { if(!pending && !buf && !saveData) pending = fetch(SRC).then(r => r.arrayBuffer()).catch(() => { pending = null; }); return pending; };
  async function start(){
    if(!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain(); gain.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500; lp.Q.value = .5;
      gain.connect(lp).connect(ctx.destination);
    }
    if(ctx.state === 'suspended') await ctx.resume();
    if(!buf){ loading = true; paint(); const ab = await (pending || prefetch() || fetch(SRC).then(r => r.arrayBuffer())); buf = await ctx.decodeAudioData(ab.slice(0)); loading = false; }
    if(!on || src) { paint(); return; }
    src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 1.5; src.loopEnd = buf.duration - 1.5;
    src.connect(gain); src.start(0, 1.5);
    const t = ctx.currentTime; gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(LEVEL, t + 3);
    playing = true; paint();
  }
  function stop(){
    playing = false; paint(); if(!ctx || !src) return;
    const t = ctx.currentTime, s = src; src = null;
    gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t); gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    setTimeout(() => { try{ s.stop(); }catch(e){} }, 1500);
  }
  const begin = () => start().catch(() => { loading = false; playing = false; paint(); });
  btns.forEach(b => b.addEventListener('click', () => {
    if(loading) return;
    on = !on; try{ localStorage.setItem(KEY, on ? '1' : '0'); }catch(e){}
    on ? begin() : stop();
  }));
  // first gesture anywhere (not on the toggle itself) starts the armed ambience
  let armed = true;
  const gesture = e => { if(!armed) return; if(e.target && e.target.closest && e.target.closest('.snd')) return; armed = false; if(on && !playing && !loading) begin(); };
  ['pointerdown','touchend','keydown'].forEach(ev => addEventListener(ev, gesture, {passive:true}));
  document.addEventListener('visibilitychange', () => { if(!ctx || !playing) return; document.hidden ? ctx.suspend() : ctx.resume(); });
  if(on) addEventListener('load', () => setTimeout(prefetch, 800), {once:true});
  paint();
})();
