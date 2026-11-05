'use strict';
/* ============ Cazamonstruos: flexiones contra monstruos ============
   Cada flexión = 1 de daño. La cámara frontal cuenta las flexiones con MediaPipe Pose. */
const MP_VER = '1.2.2';
const MP_LIB = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/vision_bundle.mjs`;
const MP_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/wasm`;
const MP_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

const SH = '<ellipse cx="100" cy="186" rx="58" ry="9" fill="#000" opacity=".3"/>';
const MONS = [
  { id: 'slime', n: 'Slime', hp: [5, 5], c: '#8BE04E', svg: SH + '<path d="M38 176C26 128 58 62 100 62s74 66 62 114c-20 8-104 8-124 0z" fill="#8BE04E"/><path d="M38 176c-4-14 0-28 8-26M162 176c4-14 0-28-8-26" fill="#8BE04E"/><ellipse cx="72" cy="94" rx="13" ry="8" fill="#fff" opacity=".5" transform="rotate(-35 72 94)"/><circle cx="80" cy="124" r="11" fill="#16210E"/><circle cx="120" cy="124" r="11" fill="#16210E"/><circle cx="84" cy="120" r="4" fill="#fff"/><circle cx="124" cy="120" r="4" fill="#fff"/><path d="M88 146q12 10 24 0" stroke="#16210E" stroke-width="5" fill="none" stroke-linecap="round"/>' },
  { id: 'duende', n: 'Duende', hp: [8, 8], c: '#7BCB4F', svg: SH + '<path d="M54 104L6 70l46 52z" fill="#6DBE45"/><path d="M146 104l48-34-46 52z" fill="#6DBE45"/><path d="M50 108L22 86l30 32zM150 108l28-22-30 32z" fill="#4E9A2E"/><ellipse cx="100" cy="118" rx="52" ry="56" fill="#7BCB4F"/><path d="M42 108Q100 0 158 108q-26-34-58-34t-58 34z" fill="#8B4A2B"/><path d="M100 14L82 66h36z" fill="#8B4A2B"/><ellipse cx="80" cy="114" rx="12" ry="9" fill="#FFE14D"/><ellipse cx="120" cy="114" rx="12" ry="9" fill="#FFE14D"/><ellipse cx="80" cy="114" rx="3" ry="7" fill="#111"/><ellipse cx="120" cy="114" rx="3" ry="7" fill="#111"/><path d="M64 98l30 8M136 98l-30 8" stroke="#2F5A1D" stroke-width="5" stroke-linecap="round"/><path d="M100 118l-9 20h15z" fill="#5FA93A"/><path d="M78 150q22 16 44 0" stroke="#22331A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M86 153l4 9 4-7zM106 155l4 7 4-9z" fill="#fff"/>' },
  { id: 'murci', n: 'Murciélago', hp: [10, 10], c: '#7A52B3', svg: SH + '<path d="M100 104C70 60 28 58 6 82c16 4 22 16 20 30 12-10 24-6 28 8 10-10 26-8 30 6z" fill="#5B3A8C"/><path d="M100 104c30-44 72-46 94-22-16 4-22 16-20 30-12-10-24-6-28 8-10-10-26-8-30 6z" fill="#5B3A8C"/><path d="M76 90l-6-36 22 28zM124 90l6-36-22 28z" fill="#7A52B3"/><ellipse cx="100" cy="118" rx="36" ry="40" fill="#7A52B3"/><ellipse cx="100" cy="134" rx="21" ry="19" fill="#9B7BD0"/><circle cx="87" cy="108" r="8" fill="#FF4D4D"/><circle cx="113" cy="108" r="8" fill="#FF4D4D"/><circle cx="89" cy="105" r="2.6" fill="#fff"/><circle cx="115" cy="105" r="2.6" fill="#fff"/><path d="M90 126q10 6 20 0" stroke="#2A1A45" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M92 127l3 9 3-7zM102 127l3 7 3-9z" fill="#fff"/>' },
  { id: 'esque', n: 'Esqueleto', hp: [12, 14], c: '#EDE8DA', svg: SH + '<g fill="#CFC8B6"><rect x="18" y="150" width="164" height="14" rx="7" transform="rotate(-16 100 157)"/><rect x="18" y="150" width="164" height="14" rx="7" transform="rotate(16 100 157)"/><circle cx="24" cy="142" r="9"/><circle cx="176" cy="142" r="9"/><circle cx="24" cy="174" r="9"/><circle cx="176" cy="174" r="9"/></g><path d="M48 104c0-52 104-52 104 0 0 26-12 34-18 38v22H66v-22c-6-4-18-12-18-38z" fill="#EDE8DA"/><ellipse cx="78" cy="106" rx="16" ry="18" fill="#17161A"/><ellipse cx="122" cy="106" rx="16" ry="18" fill="#17161A"/><circle cx="80" cy="108" r="4.5" fill="#FF5A4F"/><circle cx="120" cy="108" r="4.5" fill="#FF5A4F"/><path d="M100 122l-9 16h18z" fill="#17161A"/><path d="M80 150v14M92 150v14M104 150v14M116 150v14" stroke="#17161A" stroke-width="3"/><path d="M112 62l-6 16 10 8" stroke="#B9B3A3" stroke-width="3" fill="none"/>' },
  { id: 'lobo', n: 'Lobo', hp: [15, 15], c: '#8A909C', svg: SH + '<path d="M52 92l6-62 34 40zM148 92l-6-62-34 40z" fill="#6E7480"/><path d="M60 82l3-34 18 24zM140 82l-3-34-18 24z" fill="#C98E8E"/><path d="M44 104c0-36 26-46 56-46s56 10 56 46c0 30-21 50-56 72-35-22-56-42-56-72z" fill="#8A909C"/><path d="M46 112l-16 10 18 2-12 12 18-2M154 112l16 10-18 2 12 12-18-2" fill="#8A909C"/><path d="M76 124q24-12 48 0l-10 40q-14 10-28 0z" fill="#D7D9DE"/><ellipse cx="100" cy="130" rx="11" ry="8" fill="#17161A"/><path d="M64 102l26 4-18 8zM136 102l-26 4 18 8z" fill="#FFB020"/><path d="M92 152q8 6 16 0" stroke="#17161A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M94 154l2 6 2-5zM102 155l2 5 2-6z" fill="#fff"/>' },
  { id: 'orco', n: 'Orco', hp: [18, 22], c: '#7F9E57', svg: SH + '<path d="M46 110L16 94l30 34zM154 110l30-16-30 34z" fill="#6F8F4A"/><rect x="44" y="62" width="112" height="116" rx="46" fill="#7F9E57"/><path d="M84 64l6-30 10 26 10-30 8 34z" fill="#26262A"/><path d="M56 100q44-20 88 0v9q-44-14-88 0z" fill="#5E7A3D"/><circle cx="80" cy="116" r="7.5" fill="#FF4D4D"/><circle cx="120" cy="116" r="7.5" fill="#FF4D4D"/><path d="M92 122q8 16 16 0z" fill="#5E7A3D"/><path d="M68 150q32 16 64 0" stroke="#2C3A1C" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M76 153l-5-26 15 23zM124 153l5-26-15 23z" fill="#F4EFD9"/><path d="M122 74l12 26" stroke="#5E7A3D" stroke-width="4" stroke-linecap="round"/>' },
  { id: 'troll', n: 'Troll', hp: [25, 28], c: '#6F8FA6', svg: SH + '<ellipse cx="100" cy="120" rx="68" ry="64" fill="#6F8FA6"/><path d="M36 106q10-54 64-56t64 56q-20-20-42-14-22-16-44 0-22-6-42 14z" fill="#4F7A3A"/><circle cx="58" cy="80" r="6" fill="#4F7A3A"/><circle cx="146" cy="84" r="5" fill="#4F7A3A"/><path d="M62 104q14-8 28 0M110 104q14-8 28 0" stroke="#3E5568" stroke-width="6" stroke-linecap="round"/><circle cx="76" cy="112" r="6" fill="#111"/><circle cx="124" cy="112" r="6" fill="#111"/><ellipse cx="100" cy="128" rx="16" ry="20" fill="#5D7C93"/><path d="M64 154q36 22 72 0v10q-36 26-72 0z" fill="#3E5568"/><path d="M78 156l4-14 4 16zM114 158l4-16 4 14z" fill="#F4EFD9"/><circle cx="138" cy="138" r="4" fill="#5D7C93"/><circle cx="64" cy="136" r="3" fill="#5D7C93"/>' },
  { id: 'dragon', n: 'Dragón', hp: [30, 50], c: '#D6402F', svg: SH + '<path d="M62 112L4 46l14 52-18 14 30 8-10 20 42-10zM138 112l58-66-14 52 18 14-30 8 10 20-42-10z" fill="#9E2B25"/><path d="M70 74L50 22l36 42zM130 74l20-52-36 42z" fill="#F2D49B"/><path d="M92 62l8-20 8 20z" fill="#9E2B25"/><path d="M50 114c0-40 25-52 50-52s50 12 50 52c0 30-20 50-50 58-30-8-50-28-50-58z" fill="#D6402F"/><ellipse cx="100" cy="144" rx="32" ry="24" fill="#E35A44"/><ellipse cx="90" cy="138" rx="3.5" ry="5" fill="#5C1410"/><ellipse cx="110" cy="138" rx="3.5" ry="5" fill="#5C1410"/><path d="M64 104q14-12 28 2-14 8-28-2zM136 104q-14-12-28 2 14 8 28-2z" fill="#FFD60A"/><ellipse cx="80" cy="104" rx="2.4" ry="6" fill="#111"/><ellipse cx="120" cy="104" rx="2.4" ry="6" fill="#111"/><path d="M78 158q22 14 44 0" stroke="#7D1F18" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M84 159l4 10 4-8zM108 161l4 8 4-10z" fill="#fff"/><circle cx="84" cy="122" r="6" fill="#bbb" opacity=".35"/><circle cx="118" cy="120" r="5" fill="#bbb" opacity=".3"/>' }
];
const monSVG = (m, cls = '') => `<svg class="${cls}" viewBox="0 0 200 200">${m.svg}</svg>`;

/* ---- detector de flexiones: histéresis adaptativa ---- */
function RepCounter() { this.reset(); }
RepCounter.prototype.reset = function () { this.s = null; this.hi = null; this.lo = null; this.state = 'up'; this.lastT = -1e9; this.ready = false; };
RepCounter.prototype.feed = function (sig, t) {
  if (sig == null) return false;
  this.s = this.s == null ? sig : this.s * 0.55 + sig * 0.45;
  const s = this.s;
  if (this.hi == null) { this.hi = s; this.lo = s; }
  this.hi = Math.max(s, this.hi - 0.0015); this.lo = Math.min(s, this.lo + 0.0015);
  const range = this.hi - this.lo;
  this.ready = range >= 0.35;
  if (!this.ready) return false;
  if (this.state === 'up' && s < this.lo + range * 0.35) this.state = 'down';
  else if (this.state === 'down' && s > this.hi - range * 0.3 && t - this.lastT > 380) { this.state = 'up'; this.lastT = t; return true; }
  return false;
};
// señal: distancia vertical hombros→muñecas medida en anchos de hombro (alta arriba, baja abajo)
function pushSig(lm) {
  if (!lm) return { sig: null, why: 'none' };
  const v = i => lm[i] && (lm[i].visibility == null ? 1 : lm[i].visibility);
  if (v(11) < 0.5 || v(12) < 0.5) return { sig: null, why: 'shoulders' };
  const sw = Math.hypot(lm[11].x - lm[12].x, lm[11].y - lm[12].y);
  if (sw < 0.04) return { sig: null, why: 'far' };
  const ws = [15, 16].filter(i => v(i) > 0.35).map(i => lm[i].y);
  if (!ws.length) return { sig: null, why: 'hands' };
  const wy = ws.reduce((a, b) => a + b) / ws.length, sy = (lm[11].y + lm[12].y) / 2;
  return { sig: (wy - sy) / sw, why: null };
}

/* ---- estado ---- */
const H = { open: false, view: 'setup', mode: 'cam', sound: true, start: 0, idx: 0, hp: 0, max: 0, reps: 0, kills: [], lap: 0, pl: null, stream: null, raf: 0, det: new RepCounter(), ac: null, wl: null, lastDet: 0, lastTap: 0, cur: null, busy: false };
try { const p = JSON.parse(localStorage.getItem('forja.hunt') || '{}'); if (p.mode) H.mode = p.mode; if (p.sound === false) H.sound = false; } catch (e) {}
const huntStats = () => {
  const hs = (S.hunts || []); let best = 0, kills = 0, reps = 0, maxIdx = -1;
  hs.forEach(h => { best = Math.max(best, h.reps || 0); reps += h.reps || 0; (h.kills || []).forEach(id => { kills++; const i = MONS.findIndex(m => m.id === id); if (i > maxIdx) maxIdx = i; }); });
  return { best, kills, reps, unlocked: Math.min(MONS.length - 1, maxIdx + 1), n: hs.length };
};
function huntCard() {
  const st = huntStats(), next = MONS[st.unlocked];
  return `<div class="card hcard"><div class="hc-m">${monSVG(next, 'bob')}</div><div class="sp"><div class="ct" style="margin-bottom:4px">Reto · Flexiones</div><div class="b" style="font-size:19px;letter-spacing:-.02em">Cazamonstruos</div><div class="sm mut">${st.n ? `Récord ${st.best} flexiones · ${st.kills} cazados` : 'Cada flexión le quita 1 de vida a un monstruo'}</div><button class="btn s" style="margin-top:10px" data-act="hunt-open">Jugar</button></div></div>`;
}

/* ---- interfaz (capa propia, no la toca render()) ---- */
const hEl = () => document.getElementById('hunt');
function huntShell() {
  let el = hEl(); if (!el) { el = document.createElement('div'); el.id = 'hunt'; document.body.appendChild(el); }
  return el;
}
function huntSetupHTML() {
  const st = huntStats();
  return `<div class="hh"><button class="iconbtn" data-act="hunt-close" aria-label="Cerrar">${ICON.x}</button><div class="sp"><div class="eyebrow">Reto de flexiones</div><div class="b" style="font-size:22px;letter-spacing:-.02em">Cazamonstruos</div></div></div>
  <div class="hscroll">
  <div class="beast">${MONS.map((m, i) => `<button class="bst ${i <= st.unlocked ? '' : 'lock'} ${i === H.idx ? 'on' : ''}" data-act="hunt-pick" data-i="${i}" ${i <= st.unlocked ? '' : 'disabled'}>${monSVG(m)}<b>${i <= st.unlocked ? m.n : '???'}</b><span>${i <= st.unlocked ? (m.hp[0] === m.hp[1] ? m.hp[0] : m.hp[0] + '–' + m.hp[1]) + ' ❤' : 'Bloqueado'}</span></button>`).join('')}</div>
  <p class="note" style="margin:2px 2px 16px">Empiezas por el monstruo marcado y, al cazarlo, sale el siguiente. Cada uno que caces desbloquea el siguiente para la próxima vez.</p>
  <span class="lbl">Cómo cuento las flexiones</span>
  <div class="seg" style="margin-bottom:10px"><button class="${H.mode === 'cam' ? 'on' : ''}" data-act="hunt-mode" data-v="cam">Cámara</button><button class="${H.mode === 'tap' ? 'on' : ''}" data-act="hunt-mode" data-v="tap">Toque</button></div>
  <div class="card" style="padding:14px 16px">${H.mode === 'cam'
    ? `<ol class="steps" style="margin:0"><li>Apoya el iPhone de pie <b>en el suelo, a 1–1,5 m delante de ti</b>, con la pantalla mirándote.</li><li>Que se te vean <b>hombros y manos</b>.</li><li>Haz la primera flexión completa para calibrar. Luego, a muerte.</li></ol>`
    : `<ol class="steps" style="margin:0"><li>Deja el iPhone en el suelo, <b>debajo de tu cara</b>.</li><li>Cada vez que bajes, <b>toca la pantalla con la nariz o la barbilla</b>.</li></ol>`}</div>
  <div class="row" style="margin:6px 2px 18px"><span class="sm mut sp">Sonidos</span><div class="seg mini"><button class="${H.sound ? 'on' : ''}" data-act="hunt-sound" data-v="1">Sí</button><button class="${H.sound ? '' : 'on'}" data-act="hunt-sound" data-v="0">No</button></div></div>
  ${st.n ? `<div class="stats3" style="margin:0 0 18px"><div class="st"><b class="num">${st.best}</b><span>Récord</span></div><div class="st"><b class="num">${st.kills}</b><span>Cazados</span></div><div class="st"><b class="num">${st.reps}</b><span>Flexiones</span></div></div>` : ''}
  </div>
  <div class="hfoot"><button class="btn" data-act="hunt-go">¡A cazar!</button></div>`;
}
function huntPlayHTML() {
  return `<div class="hh"><button class="iconbtn" data-act="hunt-end" aria-label="Terminar">${ICON.x}</button><div class="sp"><div class="eyebrow" id="hLvl"></div><div class="b" id="hName" style="font-size:22px;letter-spacing:-.02em"></div></div><div class="hreps"><b class="num" id="hReps">0</b><span>flexiones</span></div></div>
  <div class="hpbar"><i id="hHp"></i><span class="num" id="hHpT"></span></div>
  <div class="arena ${H.mode === 'tap' ? 'tapzone' : ''}" id="hArena"><div id="hMon" class="mon"></div><div id="hFx"></div><div class="kills" id="hKills"></div></div>
  <div class="hbottom">
    ${H.mode === 'cam' ? `<div class="camw"><video id="hVid" playsinline muted autoplay></video><canvas id="hCan"></canvas></div>` : ''}
    <div class="sp" style="min-width:0"><div class="hstat" id="hStat">${H.mode === 'cam' ? 'Preparando cámara…' : 'Toca la pantalla con la nariz al bajar'}</div></div>
  </div>
  <div class="hfoot row"><button class="btn sec" style="flex:1" data-act="hunt-plus">+1 flexión</button><button class="btn" style="flex:1" data-act="hunt-end">Terminar</button></div>`;
}
function huntDoneHTML(r) {
  return `<div class="hscroll" style="padding-top:calc(var(--st) + 30px)"><div class="done-hero"><div class="eyebrow">Cacería terminada</div><div class="big num">${r.reps}</div><div class="mut b">flexiones</div></div>
  ${r.record ? '<div style="text-align:center;margin:10px 0"><span class="pill gold">¡Nuevo récord!</span></div>' : ''}
  <div class="card" style="margin-top:16px"><div class="ch"><span class="ct">Cazados</span><span class="sm mut">${r.kills.length}</span></div>
  ${r.kills.length ? `<div class="kgrid">${r.kills.map(id => monSVG(MONS.find(m => m.id === id))).join('')}</div>` : '<p class="sm mut" style="margin:0">Esta vez se escapó. La próxima cae.</p>'}</div>
  ${r.reps ? '<p class="note" style="text-align:center">Guardado en tu historial como entreno de flexiones.</p>' : ''}</div>
  <div class="hfoot"><button class="btn" data-act="hunt-close">Listo</button></div>`;
}
function huntPaint() {
  const el = huntShell();
  el.className = H.open ? 'on' : '';
  if (!H.open) { el.innerHTML = ''; return; }
  el.innerHTML = H.view === 'setup' ? huntSetupHTML() : H.view === 'play' ? huntPlayHTML() : huntDoneHTML(H.result);
  document.body.classList.toggle('lock', true);
}
function huntUpd() {
  const m = H.cur; if (!m) return;
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('hReps', H.reps); set('hName', m.n); set('hLvl', 'Monstruo ' + (H.kills.length + 1) + (H.lap ? ' · Nivel ' + (H.lap + 1) : ''));
  set('hHpT', Math.max(0, H.hp) + ' / ' + H.max);
  const b = document.getElementById('hHp'); if (b) { b.style.width = (Math.max(0, H.hp) / H.max * 100) + '%'; b.style.background = H.hp / H.max > .5 ? 'var(--acc)' : H.hp / H.max > .25 ? 'var(--gold)' : 'var(--red)'; }
  const k = document.getElementById('hKills'); if (k) k.innerHTML = H.kills.slice(-8).map(id => monSVG(MONS.find(x => x.id === id))).join('');
}
function spawn() {
  const base = MONS[Math.min(H.idx, MONS.length - 1)], lap = H.lap;
  let hp = base.hp[0] + Math.floor(Math.random() * (base.hp[1] - base.hp[0] + 1));
  if (lap) hp = Math.round(hp * (1 + lap * 0.2));
  H.cur = Object.assign({}, base, { n: lap ? base.n + ' ' + ['', 'furioso', 'ancestral', 'legendario'][Math.min(lap, 3)] : base.n });
  H.hp = H.max = hp; H.busy = false;
  const mon = document.getElementById('hMon'); if (mon) mon.innerHTML = monSVG(base, 'bob spawn');
  huntUpd();
}
function sfx(kind) {
  if (!H.sound || !H.ac) return;
  const a = H.ac, now = a.currentTime;
  const tone = (f, t0, d, type, g) => { const o = a.createOscillator(), v = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, now + t0); o.frequency.exponentialRampToValueAtTime(Math.max(40, f * .55), now + t0 + d); v.gain.setValueAtTime(g, now + t0); v.gain.exponentialRampToValueAtTime(.0001, now + t0 + d); o.connect(v).connect(a.destination); o.start(now + t0); o.stop(now + t0 + d + .02); };
  if (kind === 'hit') { tone(300, 0, .12, 'square', .07); tone(120, 0, .1, 'sawtooth', .05); }
  else if (kind === 'kill') { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * .08, .18, 'triangle', .09)); }
}
function hit() {
  if (!H.cur || H.busy) return;
  H.reps++; H.hp--;
  const mon = document.querySelector('#hMon svg');
  if (mon) { mon.classList.remove('hit'); void mon.getBBox(); mon.classList.add('hit'); }
  const fx = document.getElementById('hFx');
  if (fx) { const d = document.createElement('span'); d.className = 'dmg num'; d.textContent = '-1'; d.style.left = (40 + Math.random() * 20) + '%'; fx.appendChild(d); setTimeout(() => d.remove(), 800); }
  if (H.hp <= 0) {
    H.busy = true; H.kills.push(H.cur.id); sfx('kill');
    if (mon) { mon.classList.add('dead'); }
    const st = document.getElementById('hStat'); if (st) st.textContent = '¡' + H.cur.n + ' cazado!';
    huntUpd();
    setTimeout(() => { if (H.idx < MONS.length - 1) H.idx++; else H.lap++; if (H.view === 'play') spawn(); }, 900);
  } else { sfx('hit'); huntUpd(); }
}
async function loadPose() {
  if (H.pl) return H.pl;
  const { PoseLandmarker, FilesetResolver } = await import(MP_LIB);
  const fs = await FilesetResolver.forVisionTasks(MP_WASM);
  const mk = delegate => PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: MP_MODEL, delegate }, runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: .5, minPosePresenceConfidence: .5, minTrackingConfidence: .5 });
  try { H.pl = await mk('GPU'); } catch (e) { H.pl = await mk('CPU'); }
  return H.pl;
}
function drawPose(lm) {
  const c = document.getElementById('hCan'), v = document.getElementById('hVid'); if (!c || !v) return;
  const w = c.clientWidth, h = c.clientHeight, dpr = devicePixelRatio || 1;
  if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
  if (!lm) return;
  // el vídeo se ve con object-fit: cover y en espejo
  const vw = v.videoWidth || 1, vh = v.videoHeight || 1, sc = Math.max(w / vw, h / vh), ox = (w - vw * sc) / 2, oy = (h - vh * sc) / 2;
  const P = i => [w - (ox + lm[i].x * vw * sc), oy + lm[i].y * vh * sc];
  x.strokeStyle = '#D4FF3A'; x.lineWidth = 3; x.lineCap = 'round';
  [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]].forEach(([a, b]) => { if ((lm[a].visibility ?? 1) > .4 && (lm[b].visibility ?? 1) > .4) { const p = P(a), q = P(b); x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); } });
  x.fillStyle = '#fff'; [0, 11, 12, 13, 14, 15, 16].forEach(i => { if ((lm[i].visibility ?? 1) > .4) { const p = P(i); x.beginPath(); x.arc(p[0], p[1], 3.5, 0, 7); x.fill(); } });
}
function camLoop() {
  if (H.view !== 'play' || H.mode !== 'cam') return;
  const v = document.getElementById('hVid');
  if (v && H.pl && v.readyState >= 2) {
    const t = performance.now();
    if (t - H.lastDet >= 30) {
      H.lastDet = t; let res = null;
      try { res = H.pl.detectForVideo(v, t); } catch (e) {}
      const lm = res && res.landmarks && res.landmarks[0];
      drawPose(lm);
      const { sig, why } = pushSig(lm);
      const rep = H.det.feed(sig, t);
      const st = document.getElementById('hStat');
      if (st && !H.busy) {
        const msg = why === 'none' ? 'No te veo: ponte delante de la cámara' : why === 'shoulders' || why === 'far' ? 'Acércate un poco: no veo bien tus hombros' : why === 'hands' ? 'Necesito ver tus manos: aleja un poco el móvil' : !H.det.ready ? 'Te veo. Haz una flexión completa para calibrar' : '¡Dale! Te estoy contando';
        if (st.textContent !== msg) st.textContent = msg;
      }
      if (rep) hit();
    }
  }
  H.raf = requestAnimationFrame(camLoop);
}
async function huntStart() {
  try { localStorage.setItem('forja.hunt', JSON.stringify({ mode: H.mode, sound: H.sound })); } catch (e) {}
  try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (e) {} // no cortar la música que tengas puesta
  if (H.sound) { try { H.ac = H.ac || new (window.AudioContext || window.webkitAudioContext)(); H.ac.resume(); } catch (e) {} }
  try { if (navigator.wakeLock) H.wl = await navigator.wakeLock.request('screen'); } catch (e) {}
  Object.assign(H, { view: 'play', reps: 0, kills: [], lap: 0, start: Date.now(), busy: false });
  H.det.reset(); huntPaint(); spawn();
  if (H.mode === 'cam') {
    const st = document.getElementById('hStat');
    try {
      H.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      const v = document.getElementById('hVid'); if (!v) return huntStopCam();
      v.srcObject = H.stream; await v.play().catch(() => {});
      if (st) st.textContent = 'Cargando detector (solo tarda la primera vez)…';
      await loadPose();
      if (H.view === 'play') camLoop();
    } catch (e) {
      huntStopCam();
      if (st) st.textContent = 'No pude usar la cámara. Cuento por toque: toca con la nariz al bajar.';
      H.mode = 'tap'; const ar = document.getElementById('hArena'); if (ar) ar.classList.add('tapzone');
      const cw = document.querySelector('.camw'); if (cw) cw.remove();
    }
  }
}
function huntStopCam() {
  cancelAnimationFrame(H.raf);
  if (H.stream) { H.stream.getTracks().forEach(t => t.stop()); H.stream = null; }
}
async function huntFinish() {
  huntStopCam();
  try { if (H.wl) { await H.wl.release(); H.wl = null; } } catch (e) {}
  const best = huntStats().best, dur = Math.round((Date.now() - H.start) / 1000);
  const r = { reps: H.reps, kills: H.kills.slice(), record: H.reps > 0 && H.reps > best && (S.hunts || []).length > 0 };
  if (H.reps > 0) {
    await Store.put(uid('h'), { t: 'h', d: dkey(), ts: Date.now(), reps: H.reps, kills: r.kills, dur });
    await Store.put(uid('w'), { t: 'w', d: dkey(), ts: Date.now(), name: 'Cazamonstruos', dur, ex: [{ id: 'pushup', sets: [{ kg: 0, reps: H.reps }] }] });
    derive();
  }
  H.result = r; H.view = 'done'; H.cur = null; huntPaint();
}
document.addEventListener('pointerdown', e => {
  if (!H.open || H.view !== 'play' || H.mode !== 'tap') return;
  if (!e.target.closest('.tapzone')) return;
  const t = performance.now(); if (t - H.lastTap < 350) return; H.lastTap = t; hit();
});
document.addEventListener('visibilitychange', async () => { if (!document.hidden && H.view === 'play' && navigator.wakeLock) { try { H.wl = await navigator.wakeLock.request('screen'); } catch (e) {} } });
Object.assign(A, {
  'hunt-open'() { const st = huntStats(); H.idx = Math.min(H.idx, st.unlocked); if (!st.n) H.idx = 0; H.open = true; H.view = 'setup'; huntPaint(); },
  'hunt-pick'(el) { H.idx = +el.dataset.i; huntPaint(); },
  'hunt-mode'(el) { H.mode = el.dataset.v; huntPaint(); },
  'hunt-sound'(el) { H.sound = el.dataset.v === '1'; huntPaint(); },
  'hunt-go'() { huntStart(); },
  'hunt-plus'() { hit(); },
  'hunt-end'() { huntFinish(); },
  'hunt-close'() { huntStopCam(); H.open = false; H.view = 'setup'; huntPaint(); render(); }
});
