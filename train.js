'use strict';
/* ============ Rangos por ejercicio ============
   Se comparan tu 1RM estimado (o tus reps en peso corporal) con el estándar de un levantador
   intermedio de tu peso, altura y sexo. 1,0 = Esmeralda IV. */
const TIERS = [
  ['Hierro', '#8A8A92', .3], ['Bronce', '#C07A45', .45], ['Plata', '#B7C3CF', .6], ['Oro', '#EBC055', .8],
  ['Platino', '#3FC1B0', 1.0], ['Esmeralda', '#2ED47A', 1.2], ['Diamante', '#7FA2FF', 1.4],
  ['Maestro', '#B873FF', 1.6], ['Gran Maestro', '#FF5A4F', 1.85], ['Aspirante', '#FFD60A', Infinity]
];
const DIVS = ['IV', 'III', 'II', 'I'];
function rankRef(ex) {
  if (ex.k === 'bw') return ex.bwr ? ex.bwr[1][1] : null;
  return stdE1(ex, S.profile, 'i');
}
function bestVal(ex, extra) {
  const v = sessionsOf(ex.id, S.draft && S.draft.editId).map(h => sessE1(ex, h.sets));
  if (extra && extra.length) v.push(sessE1(ex, extra));
  return v.length ? Math.max(...v) : 0;
}
function rankOf(ex, val) {
  const ref = rankRef(ex); if (!ref || !val) return null;
  const f = val / ref, i = TIERS.findIndex(t => f < t[2]), lo = i ? TIERS[i - 1][2] : 0, hi = TIERS[i][2];
  let div = -1, prog, nextF, nextName;
  if (i < 7) {
    const p = (f - lo) / (hi - lo); div = Math.min(3, Math.floor(p * 4)); prog = p * 4 - div;
    nextF = lo + (hi - lo) * (div + 1) / 4; nextName = div < 3 ? TIERS[i][0] + ' ' + DIVS[div + 1] : TIERS[i + 1][0] + (i + 1 < 7 ? ' IV' : '');
  } else if (hi !== Infinity) { prog = (f - lo) / (hi - lo); nextF = hi; nextName = TIERS[i + 1][0]; }
  else { prog = 1; nextF = null; nextName = null; }
  return { i, name: TIERS[i][0], col: TIERS[i][1], div: div >= 0 ? DIVS[div] : '', score: i * 4 + Math.max(0, div), prog, f, ref, nextF, nextName };
}
const rankLabel = rk => rk ? rk.name + (rk.div ? ' ' + rk.div : '') : 'Sin rango';
function rankNextTxt(ex, rk, reps) {
  if (!rk || !rk.nextF) return rk ? 'Rango máximo. Eres una leyenda.' : '';
  if (ex.k === 'bw') return `Para ${rk.nextName}: ${Math.ceil(rk.nextF * rk.ref)} reps seguidas`;
  const r = reps || (ex.rep ? ex.rep[0] : 8), st = stepOf(ex), w = Math.ceil(rk.nextF * rk.ref / (1 + r / 30) / st) * st;
  return `Para ${rk.nextName}: ${kgf(w)} kg × ${r}`;
}
function rankBadge(rk, size = 36) {
  if (!rk) return `<svg width="${size}" height="${size}" viewBox="0 0 40 40"><path d="M20 3l14 5.5v10.5c0 8.6-6.2 14.8-14 18-7.8-3.2-14-9.4-14-18V8.5z" fill="none" stroke="#3A3A40" stroke-width="2" stroke-dasharray="3 3"/></svg>`;
  const c = rk.col, top = rk.i >= 7;
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40">${top ? `<path d="M3 14l7 4-2 9zM37 14l-7 4 2 9z" fill="${c}" opacity=".7"/>` : ''}<path d="M20 2l15 6v11c0 9-6.5 15.5-15 19C11.5 34.5 5 28 5 19V8z" fill="${c}" opacity=".25"/><path d="M20 6l11 4.5v8.5c0 7-5 12-11 15-6-3-11-8-11-15v-8.5z" fill="${c}"/><path d="M20 12.5l6 7-6 8.5-6-8.5z" fill="#fff" opacity=".9"/>${rk.i >= 9 ? '<path d="M14 4l3 3 3-4 3 4 3-3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>' : ''}</svg>`;
}
function rankBlock(ex, rk, reps) {
  return `<div class="rkb"><div class="rkb-b">${rankBadge(rk, 46)}</div><div class="sp" style="min-width:0"><div class="rkb-n" style="color:${rk ? rk.col : 'var(--mut)'}">${rankLabel(rk)}</div>
  ${rk ? `<div class="rkbar"><i style="width:${Math.round(rk.prog * 100)}%;background:${rk.col}"></i></div><div class="xs mut" style="margin-top:4px">${esc(rankNextTxt(ex, rk, reps))}</div>` : `<div class="xs mut">${rankRef(ex) ? 'Haz tu primera serie para conseguir rango' : 'Los ejercicios propios no tienen rango'}</div>`}</div></div>`;
}

/* ============ Pestaña Entreno ============ */
function vEntreno() {
  const d = S.draft, now = new Date();
  const head = (t, sub) => `<div class="top"><div><div class="eyebrow">${sub}</div><h1>${t}</h1></div></div>`;
  if (d && d.editId) return head('Entreno', 'Editando') + `<div class="card"><div class="b">Estás editando el entreno del ${fdate(d.d)}</div><p class="sm mut">Termina de editarlo para empezar uno nuevo.</p><button class="btn" data-act="wk-open">Abrir edición</button></div>`;
  if (d) return vEntrenoActive();
  const r = routineOf(), ti = todayIdx(), td = r[ti], doneToday = S.workouts.some(w => w.d === dkey());
  let h = head('Entreno', `${DIA[ti]}, ${now.getDate()} ${MES[now.getMonth()]}`);
  if (td.ex.length) {
    h += `<div class="today"><div class="eyebrow">${doneToday ? 'Hecho hoy ✓ · ' : ''}Tu rutina de hoy</div><div class="nm">${esc(dayName(td))}</div>
    <div class="enlist">${td.ex.map(id => { const ex = exById(id), sg = suggest(ex), rk = rankOf(ex, bestVal(ex));
      return `<div class="enrow">${rankBadge(rk, 30)}<div class="sp" style="min-width:0"><div class="b">${esc(ex.n)}</div><div class="xs mut">${sg.bw ? sg.reps[0] + '–' + sg.reps[1] + ' reps' : sg.kg ? kgR(sg.kg) + ' kg · ' + sg.reps[0] + '–' + sg.reps[1] + ' reps' : 'Primera vez'} · ${rankLabel(rk)}</div></div></div>`; }).join('')}</div>
    <button class="btn" data-act="en-start" data-day="${ti}">${doneToday ? 'Entrenar otra vez' : 'Empezar'}</button></div>`;
  } else {
    h += `<div class="card"><div class="eyebrow">Hoy</div><div class="b" style="font-size:24px;letter-spacing:-.03em;margin:4px 0">${r.some(x => x.ex.length) ? 'Toca descanso' : 'Sin rutina'}</div><p class="sm mut" style="margin:0">${r.some(x => x.ex.length) ? 'Si aun así te apetece, elige abajo qué hacer.' : 'Crea tu rutina en la pestaña Rutina y aparecerá aquí cada día.'}</p></div>`;
  }
  const others = r.map((x, i) => [x, i]).filter(([x, i]) => x.ex.length && i !== ti);
  h += `<div class="card"><div class="ch"><span class="ct">¿Hoy cambias de plan?</span></div>
   ${others.length ? `<div class="chips" style="margin-bottom:12px">${others.map(([x, i]) => `<button class="chip" data-act="en-start" data-day="${i}">${'LMXJVSD'[i]} · ${esc(dayName(x))}</button>`).join('')}</div>` : ''}
   <button class="btn sec" data-act="wk-start">${ICON.plus} Entreno personalizado</button></div>`;
  return h;
}
function vEntrenoActive() {
  const d = S.draft, list = d.ex || [];
  if (!list.length) return `<div class="top"><div><div class="eyebrow">Entreno personalizado · <span class="num" data-elapsed>0:00</span></div><h1>Entreno</h1></div></div>
    <div class="card"><div class="empty"><b>Elige tu primer ejercicio</b>Luego registras cada serie con dos toques.</div><button class="btn" data-act="pk-open">${ICON.plus} Añadir ejercicio</button><button class="btn ghost" data-act="wk-discard" style="color:var(--red)">Descartar</button></div>`;
  const cur = clamp(d.cur || 0, 0, list.length - 1), e = list[cur], ex = exById(e.id), bw = ex.k === 'bw', sets = e.sets || [], ls = sets[sets.length - 1], u = e.uid, st = stepOf(ex);
  const sg = suggest(ex), hist = sessionsOf(ex.id), prev = hist.length ? Math.max(...hist.map(h => sessE1(ex, h.sets))) : null;
  const kgPre = ls ? ls.kg : (sg.target != null ? sg.target : (sg.kg ? roundTo((sg.kg[0] + sg.kg[1]) / 2, st) : (bw ? 0 : '')));
  const rPre = ls ? ls.reps : (sg.last ? sg.last.sets[0].reps : Math.round((sg.reps[0] + sg.reps[1]) / 2));
  const rk = rankOf(ex, bestVal(ex, sets)), tot = list.reduce((a, x) => a + (x.sets || []).length, 0), nx = list[cur + 1];
  let best = prev;
  const rows = sets.map((s, j) => { const v = sessE1(ex, [s]); let pr = false; if (prev != null && v > best) { pr = true; best = v; }
    return `<div class="setrow"><span class="n num">${j + 1}</span><div class="v num">${bw ? `<b>${s.reps}</b> <span>reps</span>${s.kg ? ` <span>· +${kgf(s.kg)} kg</span>` : ''}` : `<b>${kgf(s.kg)}</b> <span>kg</span> × <b>${s.reps}</b>`}${pr ? '<span class="prtag">PR</span>' : ''}</div><button class="iconbtn" style="width:32px;height:32px" data-act="set-del" data-u="${u}" data-j="${j}">${ICON.x}</button></div>`; }).join('');
  const sugTxt = sg.src === 'none' ? `Objetivo: ${sg.reps[0]}–${sg.reps[1]} reps` : (bw ? `${sg.reps[0]}–${sg.reps[1]} reps` : `${kgR(sg.kg)} kg · ${sg.reps[0]}–${sg.reps[1]} reps`) + (sg.tip ? ' · ' + sg.tip : '');
  return `<div class="enhead"><div class="sp"><div class="eyebrow">Ejercicio ${cur + 1} de ${list.length} · <span class="num" data-elapsed>0:00</span></div></div><span class="pill">${tot} serie${tot === 1 ? '' : 's'}</span><button class="iconbtn" data-act="en-menu" aria-label="Opciones">${ICON.dots}</button></div>
  <div class="chips enchips">${list.map((x, i) => `<button class="chip ${i === cur ? 'on' : ''}" data-act="en-go" data-i="${i}">${(x.sets || []).length ? '✓ ' : ''}${esc(exById(x.id).n)}</button>`).join('')}</div>
  <div class="encard">
   <div class="exn" style="font-size:26px;line-height:1.1">${esc(ex.n)}</div><div class="xs mut b" style="margin-top:3px">${ex.m.map(m => MUSCLES[m]).join(' · ')}${ex.k === 'db' ? ' · kg por mancuerna' : ''}</div>
   ${rankBlock(ex, rk, ls ? ls.reps : sg.reps && sg.reps[0])}
   <div class="ensug">${esc(sugTxt)}</div>
   <div class="enset">Serie ${sets.length + 1}</div>
   <div class="enpick">
    <div><span class="lbl">${bw ? 'Lastre kg' : 'Peso kg'}</span><div class="bigstep"><button data-act="en-step" data-t="e${u}.kg" data-d="-${st}" data-min="0">−</button><input class="num" data-k="e${u}.kg" inputmode="decimal" value="${kgPre === '' || kgPre == null ? '' : String(kgPre).replace('.', ',')}" placeholder="0"><button data-act="en-step" data-t="e${u}.kg" data-d="${st}" data-min="0">+</button></div></div>
    <div><span class="lbl">Reps</span><div class="bigstep"><button data-act="en-step" data-t="e${u}.r" data-d="-1" data-min="1">−</button><input class="num" data-k="e${u}.r" inputmode="numeric" value="${rPre || ''}"><button data-act="en-step" data-t="e${u}.r" data-d="1" data-min="1">+</button></div></div>
   </div>
   <button class="btn endone" data-act="en-done" data-u="${u}">${ICON.check} Serie hecha</button>
   ${rows ? `<div class="sets">${rows}</div>` : ''}
   ${sg.last ? `<div class="lastl">Última vez (${fdate(sg.last.d)}): ${sg.last.sets.map(s => bw ? (s.kg ? `+${kgf(s.kg)}×${s.reps}` : s.reps) : `${kgf(s.kg)}×${s.reps}`).join(' · ')}</div>` : ''}
  </div>
  <div class="ennav">${cur > 0 ? `<button class="btn sec" style="flex:0 0 56px" data-act="en-go" data-i="${cur - 1}" aria-label="Anterior">←</button>` : ''}
   ${nx ? `<button class="btn ${sets.length ? '' : 'sec'}" data-act="en-go" data-i="${cur + 1}">Siguiente: ${esc(exById(nx.id).n)} →</button>` : `<button class="btn ${sets.length ? '' : 'sec'}" data-act="wk-finish">${ICON.check} Terminar entreno</button>`}</div>`;
}
SHEETS.enm = () => {
  const d = S.draft, e = d && d.ex && d.ex[clamp(d.cur || 0, 0, d.ex.length - 1)];
  return `<div class="sh-t">Entreno</div><div style="height:12px"></div>
  <button class="btn sec" data-act="en-add">${ICON.plus} Añadir ejercicio</button><div style="height:8px"></div>
  ${e ? `<button class="btn sec" data-act="en-rm" data-u="${e.uid}">Quitar ${esc(exById(e.id).n)}</button><div style="height:8px"></div>` : ''}
  <button class="btn" data-act="en-finish">${ICON.check} Terminar entreno</button>
  <button class="btn ghost" style="color:var(--red)" data-act="en-discard">Descartar entreno</button>`;
};
function startDraft(day) {
  const r = routineOf(), td = day != null ? r[day] : null;
  Store.putDraft({ t: 'draft', d: dkey(), start: Date.now(), name: td ? (td.name || '') : '', cur: 0, ex: td ? td.ex.map(id => ({ id, uid: uid('e').replace(/-/g, ''), sets: [] })) : [] });
  derive(); S.tab = 'entreno'; try { localStorage.setItem('forja.tab', S.tab); } catch (e) {}
}
Object.assign(A, {
  'en-start'(el) { const go = () => { startDraft(+el.dataset.day); S.sheets = []; render(); window.scrollTo(0, 0); }; if (S.draft) confirmSheet('Ya tienes un entreno abierto', 'Si empiezas otro, se descarta el actual.', 'Empezar nuevo', true, go); else go(); },
  'en-go'(el) { const d = clone(S.draft); d.cur = +el.dataset.i; Store.putDraft(d); derive(); render(); window.scrollTo(0, 0); },
  'en-step'(el) { const i = document.querySelector(`[data-k="${el.dataset.t}"]`); if (!i) return; const v = Math.max(+el.dataset.min, Math.round(((pnum(i.value) || 0) + parseFloat(el.dataset.d)) * 100) / 100); i.value = String(v).replace('.', ','); },
  'en-done'(el) {
    const u = el.dataset.u, i = findEx(u); if (i < 0) return;
    const ex = exById(S.draft.ex[i].id), bw = ex.k === 'bw', kg = pnum(val(`e${u}.kg`)), reps = parseInt(val(`e${u}.r`));
    if (!reps || reps < 1) return toast('Pon las reps');
    if (!bw && (kg == null || kg < 0)) return toast('Pon el peso');
    const before = rankOf(ex, bestVal(ex, S.draft.ex[i].sets));
    const d = clone(S.draft); d.ex[i].sets.push({ kg: kg || 0, reps }); Store.putDraft(d); derive();
    const after = rankOf(ex, bestVal(ex, d.ex[i].sets));
    render();
    if (after && (!before || after.score > before.score)) toast(`⬆ ${ex.n}: ${before ? 'subes a' : 'entras en'} ${rankLabel(after)}`);
    else toast(`Serie ${d.ex[i].sets.length} guardada`);
  },
  'en-menu'() { openSheet({ type: 'enm' }); },
  'en-add'() { S.sheets = []; S.pick = null; openSheet({ type: 'pk' }); },
  'en-rm'(el) { S.sheets = []; render(); A['ex-del'](el); },
  'en-finish'() { S.sheets = []; A['wk-finish'](); },
  'en-discard'() { S.sheets = []; A['wk-discard'](); }
});
