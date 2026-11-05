'use strict';
/* ============ Música: mando de Spotify (Web API + PKCE) ============
   El sonido sale de la app de Spotify; Forja la controla. Requiere Spotify Premium. */
const SPOT = {
  scopes: 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative',
  redirect: () => location.origin + location.pathname,
  tokenUrl: 'https://accounts.spotify.com/api/token'
};
S.np = null; S.spPl = null;
const sp = () => Store.items.spotify || null;
const spOn = () => !!(sp() && sp().refresh);
const rnd = n => { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; const b = crypto.getRandomValues(new Uint8Array(n)); return Array.from(b, x => a[x % a.length]).join(''); };
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function spLogin(cid) {
  const ver = rnd(64), ch = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ver)));
  await Store.put('spotify', { t: 'sp', cid });
  // el verifier viaja en "state" para que funcione aunque iOS abra la vuelta en Safari
  const state = rnd(8) + '.' + cid + '.' + ver;
  location.href = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: cid, scope: SPOT.scopes, code_challenge_method: 'S256',
    code_challenge: ch, redirect_uri: SPOT.redirect(), state
  });
}
async function spCallback() {
  const q = new URLSearchParams(location.search);
  if (!q.has('code') && !q.has('error')) return;
  history.replaceState(null, '', location.pathname);
  if (q.get('error')) { toast('Spotify: acceso cancelado'); return; }
  const parts = (q.get('state') || '').split('.'), cid = parts[1], ver = parts[2];
  try {
    const r = await fetch(SPOT.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: SPOT.redirect(), client_id: cid, code_verifier: ver }) });
    const j = await r.json();
    if (!j.access_token) throw new Error(j.error_description || 'sin token');
    await Store.put('spotify', { t: 'sp', cid, access: j.access_token, refresh: j.refresh_token, exp: Date.now() + j.expires_in * 1000 - 60000, at: Date.now() });
    if (isIOS && !isStandalone()) openSheet({ type: 'spcode' });
    else { toast('Spotify conectado'); spPoll(true); }
  } catch (e) { toast('No se pudo conectar Spotify'); }
}
let spRefreshing = null;
async function spToken() {
  const s = sp(); if (!s || !s.refresh) return null;
  if (s.access && Date.now() < s.exp) return s.access;
  if (spRefreshing) return spRefreshing;
  spRefreshing = (async () => {
    try {
      const r = await fetch(SPOT.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: s.refresh, client_id: s.cid }) });
      if (!r.ok) {
        if (r.status === 400 || r.status === 401) { await Store.put('spotify', { t: 'sp', cid: s.cid }); toast('Vuelve a conectar Spotify'); paintMbar(); }
        return null;
      }
      const j = await r.json();
      await Store.put('spotify', Object.assign({}, s, { access: j.access_token, refresh: j.refresh_token || s.refresh, exp: Date.now() + j.expires_in * 1000 - 60000 }));
      return j.access_token;
    } catch (e) { return null; } finally { spRefreshing = null; }
  })();
  return spRefreshing;
}
async function spApi(path, opt = {}, retry = true) {
  const t = await spToken(); if (!t) throw { code: 'auth' };
  const r = await fetch('https://api.spotify.com/v1' + path, Object.assign({}, opt, { headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } }));
  if (r.status === 401 && retry) { const s = sp(); if (s) await Store.put('spotify', Object.assign({}, s, { exp: 0 })); return spApi(path, opt, false); }
  if (r.status === 204 || r.status === 202) return null;
  const j = await r.json().catch(() => null);
  if (!r.ok) throw { code: r.status, reason: j && j.error && (j.error.reason || j.error.message) };
  return j;
}
async function spPoll(force) {
  if (!spOn() || document.hidden) return;
  if (!force && !document.querySelector('.mbar,.musbig')) return;
  try {
    const j = await spApi('/me/player');
    if (!j || !j.item) S.np = { none: true, dev: j && j.device && j.device.name };
    else {
      const imgs = (j.item.album && j.item.album.images) || [];
      S.np = { play: j.is_playing, name: j.item.name, art: (j.item.artists || []).map(a => a.name).join(', '), img: (imgs[imgs.length - 1] || imgs[0] || {}).url, big: (imgs[0] || {}).url, dev: j.device && j.device.name };
    }
  } catch (e) { S.np = { err: e.code }; }
  paintMbar();
}
setInterval(spPoll, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) spPoll(); });

const MI = {
  note: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 5v14l10-7zM16 5h3v14h-3z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 5v14L9 12zM5 5h3v14H5z"/></svg>'
};
function mbarHTML() {
  if (!spOn()) return `<button class="mb-empty" data-act="mus-open">${MI.note}<span>Conecta Spotify para controlar tu música aquí</span></button>`;
  const n = S.np;
  if (!n) return `<button class="mb-empty" data-act="mus-open">${MI.note}<span>Cargando música…</span></button>`;
  if (n.err || n.none) return `<button class="mb-empty" data-act="mus-open">${MI.note}<span>${n.err ? 'Sin conexión con Spotify' : 'Nada sonando · Elegir playlist'}</span></button>`;
  return `<div class="mb"><button class="mb-i" data-act="mus-open">${n.img ? `<img src="${esc(n.img)}" alt="">` : MI.note}<div class="mb-t"><b>${esc(n.name)}</b><span>${esc(n.art)}</span></div></button>
   <button class="mb-c" data-act="mus-prev" aria-label="Anterior">${MI.prev}</button><button class="mb-c mb-p" data-act="mus-pp" aria-label="${n.play ? 'Pausa' : 'Reproducir'}">${n.play ? MI.pause : MI.play}</button><button class="mb-c" data-act="mus-next" aria-label="Siguiente">${MI.next}</button></div>`;
}
function paintMbar() {
  const h = mbarHTML();
  document.querySelectorAll('.mbar').forEach(el => { if (el.innerHTML !== h) el.innerHTML = h; });
  const big = document.querySelector('.musbig'); if (big) { const b = musBigHTML(); if (big.innerHTML !== b) big.innerHTML = b; }
}
function musBigHTML() {
  const n = S.np;
  if (!n || n.none || n.err) return `<div class="mus-now"><div class="mus-art">${MI.note}</div><div><div class="b">${n && n.err ? 'Sin conexión con Spotify' : 'Nada sonando'}</div><div class="sm mut">Elige una playlist de abajo${n && n.dev ? ' · ' + esc(n.dev) : ''}</div></div></div>`;
  return `<div class="mus-now"><div class="mus-art">${n.big ? `<img src="${esc(n.big)}" alt="">` : MI.note}</div><div class="sp" style="min-width:0"><div class="b" style="font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.name)}</div><div class="sm mut" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n.art)}</div>${n.dev ? `<div class="xs mut" style="margin-top:2px">En ${esc(n.dev)}</div>` : ''}</div></div>
  <div class="mus-ctl"><button data-act="mus-prev">${MI.prev}</button><button class="pp" data-act="mus-pp">${n.play ? MI.pause : MI.play}</button><button data-act="mus-next">${MI.next}</button></div>`;
}
async function spEnsureDevice() {
  try {
    const d = await spApi('/me/player/devices'), devs = (d && d.devices) || [];
    const dev = devs.find(x => x.is_active) || devs.find(x => /smartphone/i.test(x.type)) || devs[0];
    if (!dev) return null;
    if (!dev.is_active) await spApi('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [dev.id], play: false }) });
    return dev.id;
  } catch (e) { return null; }
}
async function spDo(fn) {
  try { await fn(); }
  catch (e) {
    if (e.code === 404 || e.reason === 'NO_ACTIVE_DEVICE') {
      const id = await spEnsureDevice();
      if (id) { try { await fn(id); } catch (e2) { toast('Spotify no respondió'); } }
      else { openSheet({ type: 'spnodev' }); return; }
    } else if (e.code === 403) toast('Spotify necesita Premium para controlar la música');
    else if (e.code === 'auth') toast('Conecta Spotify primero');
    else toast('Spotify no respondió');
  }
  setTimeout(() => spPoll(true), 700);
}
const devQ = id => id ? '?device_id=' + encodeURIComponent(id) : '';
Object.assign(A, {
  'mus-open'() { openSheet({ type: 'mus' }); if (spOn()) { spPoll(true); spLoadPl(); } },
  'mus-pp'() { const n = S.np, playing = n && n.play; if (n && !n.none) { n.play = !playing; paintMbar(); } spDo(id => spApi('/me/player/' + (playing ? 'pause' : 'play') + devQ(id), { method: 'PUT' })); },
  'mus-next'() { spDo(id => spApi('/me/player/next' + devQ(id), { method: 'POST' })); },
  'mus-prev'() { spDo(id => spApi('/me/player/previous' + devQ(id), { method: 'POST' })); },
  'mus-pl'(el) { const uri = el.dataset.uri; toast('Poniendo playlist…'); spDo(id => spApi('/me/player/play' + devQ(id), { method: 'PUT', body: JSON.stringify({ context_uri: uri }) })); },
  'sp-connect'() { const cid = (val('sp.cid') || '').trim(); if (!/^[0-9a-f]{32}$/i.test(cid)) return toast('Ese Client ID no parece válido (32 caracteres)'); spLogin(cid); },
  async 'sp-copyuri'() { try { await navigator.clipboard.writeText(SPOT.redirect()); toast('Copiado'); } catch (e) { toast('No se pudo copiar'); } },
  async 'sp-copycode'() { const s = sp(); try { await navigator.clipboard.writeText(btoa(JSON.stringify({ c: s.cid, r: s.refresh }))); toast('Código copiado'); } catch (e) { toast('No se pudo copiar'); } },
  async 'sp-paste'() { try { const j = JSON.parse(atob((val('sp.code') || '').trim())); if (!j.c || !j.r) throw 0; await Store.put('spotify', { t: 'sp', cid: j.c, refresh: j.r, access: null, exp: 0 }); toast('Spotify conectado'); S.sheets = []; render(); spPoll(true); } catch (e) { toast('Ese código no es válido'); } },
  'sp-off'() { confirmSheet('¿Desconectar Spotify?', 'Podrás volver a conectarlo cuando quieras.', 'Desconectar', true, async () => { const s = sp(); await Store.put('spotify', { t: 'sp', cid: s && s.cid }); S.np = null; S.spPl = null; S.sheets = []; render(); }); }
});
async function spLoadPl() {
  try { const j = await spApi('/me/playlists?limit=50'); S.spPl = (j && j.items || []).filter(Boolean).map(p => ({ uri: p.uri, n: p.name, img: p.images && p.images.length ? p.images[p.images.length - 1].url : null, c: p.tracks && p.tracks.total })); }
  catch (e) { S.spPl = { err: e.code }; }
  const el = document.getElementById('spl'); if (el) el.innerHTML = plHTML();
}
function plHTML() {
  const L = S.spPl;
  if (!L) return '<div class="empty">Cargando playlists…</div>';
  if (L.err) return '<div class="empty">No se pudieron cargar tus playlists.</div>';
  if (!L.length) return '<div class="empty">No tienes playlists guardadas.</div>';
  return L.map(p => `<button class="pkrow" data-act="mus-pl" data-uri="${esc(p.uri)}"><div class="mus-th">${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : MI.note}</div><div class="sp" style="min-width:0"><div class="b" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.n)}</div>${p.c != null ? `<div class="xs mut">${p.c} canciones</div>` : ''}</div><span style="color:var(--acc)">${MI.play}</span></button>`).join('');
}
SHEETS.mus = () => {
  if (spOn()) return `<div class="sh-t">Música</div><div style="height:12px"></div><div class="musbig card" style="padding:16px">${musBigHTML()}</div>
    <span class="lbl">Tus playlists</span><div id="spl">${plHTML()}</div>
    <div style="height:12px"></div><button class="btn ghost" data-act="sp-off">Desconectar Spotify</button>`;
  const s = sp();
  return `<div class="sh-t">Conecta Spotify</div><p class="mut sm" style="margin:4px 0 14px">Forja hace de mando: ves qué suena, cambias de canción y eliges playlist sin salir. El sonido sale de la app de Spotify. Necesitas <b style="color:var(--tx)">Spotify Premium</b>.</p>
   <ol class="steps" style="margin-bottom:14px"><li>Entra en <b>developer.spotify.com/dashboard</b> con tu cuenta y pulsa <b>Create app</b>.</li>
   <li>Nombre: <b>Forja</b>. En <b>Redirect URI</b> pega esta dirección:<br><code class="uri">${esc(SPOT.redirect())}</code> <button class="btn s sec" style="display:inline-flex;margin-top:6px" data-act="sp-copyuri">Copiar dirección</button></li>
   <li>Marca <b>Web API</b>, acepta y guarda.</li><li>Abre la app → <b>Settings</b> → copia el <b>Client ID</b> y pégalo aquí:</li></ol>
   <input class="inp" data-k="sp.cid" placeholder="Client ID" value="${esc((s && s.cid) || '')}" autocomplete="off" autocapitalize="off" spellcheck="false">
   <div style="height:10px"></div><button class="btn" data-act="sp-connect">${MI.note} Conectar Spotify</button>
   <div style="height:22px"></div><span class="lbl">¿Te pidió pegar un código?</span><input class="inp" data-k="sp.code" placeholder="Pega aquí el código de Spotify" autocomplete="off" autocapitalize="off" spellcheck="false"><div style="height:10px"></div><button class="btn sec" data-act="sp-paste">Usar código</button>`;
};
SHEETS.spcode = () => `<div class="sh-t">Último paso</div><p class="mut sm" style="margin:4px 0 16px">Spotify se ha abierto en Safari en vez de en la app. Copia este código, abre Forja desde el icono y pégalo en Música → «¿Te pidió pegar un código?».</p><button class="btn" data-act="sp-copycode">Copiar código</button><button class="btn ghost" data-act="close">Cerrar</button>`;
SHEETS.spnodev = () => `<div class="sh-t">Abre Spotify un momento</div><p class="mut sm" style="margin:4px 0 16px">Spotify no tiene ningún dispositivo activo. Abre la app de Spotify, dale a play a cualquier canción y vuelve a Forja: desde aquí ya podrás controlarla.</p><a class="btn" href="spotify:" style="text-decoration:none">Abrir Spotify</a><button class="btn ghost" data-act="close">Cerrar</button>`;
