'use strict';
/* ============ Técnica: biblioteca ampliada + tutoriales ============ */
// [id, nombre, tipo, principales, secundarios, ratio 1RM/peso | rangos reps, rango reps, tren inferior]
const EXTRA = [
  ['incbench', 'Press inclinado con barra', 'bar', ['pecho'], ['hombros', 'triceps'], .82, [6, 10]],
  ['dbbench', 'Press banca mancuernas', 'db', ['pecho'], ['triceps', 'hombros'], .36, [8, 12]],
  ['declbench', 'Press declinado', 'bar', ['pecho'], ['triceps'], .95, [6, 10]],
  ['pecdeck', 'Contractora (pec deck)', 'mach', ['pecho'], [], .6, [10, 15]],
  ['dbfly', 'Aperturas con mancuernas', 'db', ['pecho'], [], .14, [10, 15]],
  ['chinup', 'Dominadas supinas', 'bw', ['espalda', 'biceps'], [], [[2, 5], [6, 10], [10, 15]]],
  ['tbar', 'Remo en T', 'bar', ['espalda'], ['biceps', 'trapecio'], .75, [8, 12]],
  ['closepull', 'Jalón agarre estrecho', 'cable', ['espalda'], ['biceps'], .78, [8, 12]],
  ['machrow', 'Remo en máquina', 'mach', ['espalda'], ['biceps'], .8, [8, 12]],
  ['straightpull', 'Pullover en polea', 'cable', ['espalda'], [], .35, [10, 15]],
  ['hyper', 'Hiperextensiones', 'bw', ['espalda', 'gluteos'], ['isquios'], [[8, 12], [12, 20], [20, 30]]],
  ['frontraise', 'Elevaciones frontales', 'db', ['hombros'], [], .12, [10, 15]],
  ['arnold', 'Press Arnold', 'db', ['hombros'], ['triceps'], .22, [8, 12]],
  ['reardelt', 'Pájaros', 'db', ['hombros'], ['trapecio'], .08, [12, 20]],
  ['uprow', 'Remo al mentón', 'bar', ['hombros', 'trapecio'], [], .4, [10, 12]],
  ['machpress', 'Press hombro máquina', 'mach', ['hombros'], ['triceps'], .55, [8, 12]],
  ['preacher', 'Curl predicador', 'bar', ['biceps'], [], .35, [8, 12]],
  ['cablecurl', 'Curl en polea', 'cable', ['biceps'], ['antebrazo'], .35, [10, 15]],
  ['conccurl', 'Curl concentrado', 'db', ['biceps'], [], .14, [10, 12]],
  ['inclcurl', 'Curl inclinado', 'db', ['biceps'], [], .13, [8, 12]],
  ['closebench', 'Press cerrado', 'bar', ['triceps'], ['pecho', 'hombros'], .8, [6, 10]],
  ['ohext', 'Extensión de tríceps tras nuca', 'db', ['triceps'], [], .28, [10, 12]],
  ['benchdip', 'Fondos en banco', 'bw', ['triceps'], ['pecho', 'hombros'], [[6, 10], [10, 15], [15, 25]]],
  ['kickback', 'Patada de tríceps', 'db', ['triceps'], [], .08, [10, 15]],
  ['wristcurl', 'Curl de muñeca', 'bar', ['antebrazo'], [], .3, [12, 20]],
  ['revcurl', 'Curl inverso', 'bar', ['antebrazo', 'biceps'], [], .3, [10, 15]],
  ['barshrug', 'Encogimientos con barra', 'bar', ['trapecio'], ['antebrazo'], 1.0, [10, 15]],
  ['frontsquat', 'Sentadilla frontal', 'bar', ['cuadriceps'], ['gluteos', 'abdomen'], 1.1, [5, 8], 1],
  ['goblet', 'Sentadilla goblet', 'db', ['cuadriceps', 'gluteos'], [], .4, [8, 12], 1],
  ['bulgarian', 'Sentadilla búlgara', 'db', ['cuadriceps', 'gluteos'], [], .22, [8, 12], 1],
  ['hack', 'Sentadilla hack', 'mach', ['cuadriceps'], ['gluteos'], 1.5, [8, 12], 1],
  ['stepup', 'Subidas al cajón', 'db', ['cuadriceps', 'gluteos'], [], .22, [8, 12], 1],
  ['sumo', 'Peso muerto sumo', 'bar', ['gluteos', 'isquios', 'cuadriceps'], ['espalda'], 1.6, [3, 6], 1],
  ['goodmorning', 'Buenos días', 'bar', ['isquios'], ['espalda', 'gluteos'], .55, [8, 12], 1],
  ['seatcurl', 'Curl femoral sentado', 'mach', ['isquios'], [], .6, [10, 15], 1],
  ['nordic', 'Curl nórdico', 'bw', ['isquios'], [], [[1, 3], [3, 6], [6, 10]]],
  ['glutebridge', 'Puente de glúteo con barra', 'bar', ['gluteos'], ['isquios'], 1.2, [10, 15], 1],
  ['abductor', 'Abductores en máquina', 'mach', ['gluteos'], [], .9, [12, 20], 1],
  ['cablekick', 'Patada de glúteo en polea', 'cable', ['gluteos'], [], .2, [12, 15], 1],
  ['seatcalf', 'Gemelos sentado', 'mach', ['gemelos'], [], .8, [12, 20], 1],
  ['standcalf', 'Gemelos de pie en escalón', 'bw', ['gemelos'], [], [[12, 20], [20, 30], [30, 50]]],
  ['crunchbw', 'Crunch abdominal', 'bw', ['abdomen'], [], [[10, 15], [15, 25], [25, 40]]],
  ['russian', 'Giros rusos', 'bw', ['abdomen'], [], [[10, 20], [20, 30], [30, 50]]],
  ['abmach', 'Crunch en máquina', 'mach', ['abdomen'], [], .6, [10, 15]],
  ['hangknee', 'Elevación de rodillas colgado', 'bw', ['abdomen'], [], [[6, 10], [10, 15], [15, 20]]]
];
EXTRA.forEach(([id, n, k, m, s, r, rep, lo]) => EXB.push(k === 'bw' ? { id, n, k, m, s, bwr: r, lo: false } : { id, n, k, m, s, r, rep, lo: !!lo }));

const TIPS = {
  bench: ['Escápulas juntas y hacia abajo, pecho arriba', 'Baja la barra a la parte baja del pecho', 'Pies firmes en el suelo y codos a unos 45°'],
  incdb: ['Banco a 30–45°, no más', 'Baja las mancuernas hasta la altura del pecho', 'Sube juntándolas sin chocarlas, codos algo cerrados'],
  chestpress: ['Ajusta el asiento: agarres a la altura del pecho', 'Espalda pegada al respaldo', 'Empuja sin bloquear los codos de golpe'],
  fly: ['Codos ligeramente flexionados todo el recorrido', 'Abre hasta notar estiramiento en el pecho', 'Junta las manos apretando el pecho, no tirando con los brazos'],
  dips: ['Inclina el torso adelante para trabajar más el pecho', 'Baja hasta que el codo forme 90°', 'Hombros abajo, lejos de las orejas'],
  pushup: ['Cuerpo recto de la cabeza a los talones', 'Manos algo más abiertas que los hombros', 'Baja el pecho casi al suelo, codos a 45°'],
  pullup: ['Empieza colgado con los brazos estirados', 'Tira llevando los codos hacia las costillas', 'Sube hasta pasar la barbilla de la barra, sin balanceo'],
  pulldown: ['Agarre algo más ancho que los hombros', 'Lleva la barra a la parte alta del pecho', 'Saca pecho y no eches el cuerpo atrás en exceso'],
  row: ['Torso inclinado unos 45°, espalda recta', 'Tira de la barra hacia el ombligo', 'Junta las escápulas arriba y baja controlando'],
  cablerow: ['Espalda recta, sin balancearte', 'Tira hacia el abdomen con los codos pegados', 'Aprieta la espalda y vuelve estirando despacio'],
  dbrow: ['Mano y rodilla en el banco, espalda plana', 'Lleva la mancuerna hacia la cadera', 'Codo pegado al cuerpo, sin girar el torso'],
  ohp: ['Glúteos y abdomen apretados, sin arquear la espalda', 'La barra sube en línea recta por delante de la cara', 'Termina con la barra justo encima de la cabeza'],
  dbohp: ['Espalda pegada al respaldo', 'Baja las mancuernas a la altura de las orejas', 'Empuja hacia arriba sin chocarlas'],
  lateral: ['Codos un poco flexionados', 'Sube hasta la altura de los hombros, no más', 'Baja lento: el control es la clave'],
  facepull: ['Polea a la altura de la cara, con cuerda', 'Tira hacia la frente separando las manos', 'Codos altos y aprieta la parte de atrás del hombro'],
  shrug: ['Brazos estirados, sube los hombros hacia las orejas', 'Aguanta un segundo arriba', 'Sin girar los hombros: solo arriba y abajo'],
  curl: ['Codos pegados al cuerpo y quietos', 'Sube sin balancear la espalda', 'Baja del todo, controlando'],
  dbcurl: ['Gira la muñeca hacia arriba al subir', 'Codos fijos a los lados', 'Sin impulso: si te balanceas, baja peso'],
  hammer: ['Agarre neutro, palmas mirándose', 'Sube sin mover los codos', 'Aprieta arriba y baja lento'],
  skull: ['Codos apuntando al techo y quietos', 'Baja la barra hacia la frente', 'Extiende solo los antebrazos'],
  pushdown: ['Codos pegados al costado', 'Estira los brazos del todo abajo', 'Sube solo hasta 90°, sin mover los hombros'],
  squat: ['Pies al ancho de los hombros, puntas algo abiertas', 'Baja con la espalda recta, al menos hasta el paralelo', 'Rodillas hacia las puntas y empuja con todo el pie'],
  legpress: ['Pies al ancho de los hombros en la plataforma', 'Baja hasta 90° sin despegar la lumbar', 'No bloquees las rodillas arriba'],
  lunge: ['Paso largo y torso recto', 'Baja hasta que la rodilla de atrás casi toque el suelo', 'Empuja con el talón de la pierna delantera'],
  legext: ['Rodillo justo encima de los tobillos', 'Estira del todo y aprieta el cuádriceps', 'Baja lento, sin dejar caer el peso'],
  dl: ['Barra pegada a las espinillas, espalda neutra', 'Empuja el suelo con las piernas y luego extiende la cadera', 'Barra siempre pegada al cuerpo; nunca redondees la espalda'],
  rdl: ['Rodillas un poco flexionadas y fijas', 'Lleva la cadera atrás bajando la barra por los muslos', 'Baja hasta notar los isquios, con la espalda recta'],
  legcurl: ['Rodilla alineada con el eje de la máquina', 'Flexiona del todo apretando los isquios', 'Baja controlando, sin rebotar'],
  hipthrust: ['Espalda alta apoyada en el banco', 'Empuja con los talones hasta alinear rodilla, cadera y hombro', 'Aprieta los glúteos arriba y mira al frente'],
  calf: ['Rango completo: baja estirando bien el gemelo', 'Sube de puntillas lo máximo posible', 'Pausa arriba, sin rebotar'],
  crunch: ['De rodillas, cuerda junto a la cabeza', 'Encorva el tronco llevando el pecho hacia la cadera', 'Que trabaje el abdomen, no los brazos'],
  legraise: ['Piernas casi rectas', 'Sube sin balanceo', 'Baja lento sin arquear la lumbar'],
  abwheel: ['Empieza de rodillas', 'Avanza con el abdomen apretado y la espalda un poco redonda', 'Vuelve tirando con el abdomen, no con la cadera'],
  incbench: ['Banco a 30–45°', 'Baja la barra a la parte alta del pecho', 'Escápulas juntas y codos a 45°'],
  dbbench: ['Mancuernas a los lados del pecho al bajar', 'Sube juntándolas en arco', 'Escápulas atrás y pies firmes'],
  declbench: ['Sujeta bien los pies', 'Baja la barra a la parte baja del pecho', 'Recorrido controlado, sin rebotar'],
  pecdeck: ['Agarres a la altura del pecho', 'Junta los brazos apretando el pecho', 'Abre lento hasta notar estiramiento'],
  dbfly: ['Codos un poco flexionados, como abrazando un árbol', 'Baja hasta la altura del pecho', 'Sube juntando las mancuernas con el pecho'],
  chinup: ['Palmas hacia ti, al ancho de los hombros', 'Tira llevando el pecho a la barra', 'Baja del todo y sin balanceo'],
  tbar: ['Espalda recta y pecho fuera', 'Tira hacia la parte baja del pecho', 'Junta las escápulas arriba'],
  closepull: ['Agarre estrecho o triángulo', 'Lleva el agarre al pecho con los codos pegados', 'Estira bien arriba sin encoger los hombros'],
  machrow: ['Pecho apoyado en el soporte', 'Tira llevando los codos hacia atrás', 'Aprieta la espalda y vuelve despacio'],
  straightpull: ['Brazos casi rectos todo el recorrido', 'Baja la barra hasta los muslos usando la espalda', 'Sube controlando hasta la altura de la cabeza'],
  hyper: ['Cadera en el borde del apoyo', 'Baja con la espalda recta', 'Sube hasta alinear el cuerpo, sin pasarte hacia atrás'],
  frontraise: ['Brazos casi rectos', 'Sube hasta la altura de los ojos', 'Sin balancear el cuerpo'],
  arnold: ['Empieza con las palmas hacia ti', 'Gira las muñecas mientras empujas hacia arriba', 'Baja deshaciendo el giro'],
  reardelt: ['Torso inclinado casi paralelo al suelo', 'Abre los brazos con los codos algo flexionados', 'Piensa en llevar las manos lejos, no hacia atrás'],
  uprow: ['Agarre al ancho de los hombros', 'Sube la barra pegada al cuerpo hasta el pecho', 'Codos por encima de las manos, sin pasar de los hombros'],
  machpress: ['Agarres a la altura de los hombros', 'Empuja hacia arriba sin arquear la espalda', 'Baja controlando hasta las orejas'],
  preacher: ['Axilas pegadas al borde del banco', 'Baja casi hasta estirar, sin bloquear', 'Sube sin despegar los brazos del apoyo'],
  cablecurl: ['Codos pegados y fijos', 'Tensión constante: no sueltes abajo', 'Aprieta arriba un segundo'],
  conccurl: ['Codo apoyado en la cara interna del muslo', 'Sube sin mover el brazo', 'Baja lento del todo'],
  inclcurl: ['Banco a 45°, brazos colgando', 'Sube sin adelantar los codos', 'Baja hasta estirar el bíceps'],
  closebench: ['Manos al ancho de los hombros', 'Codos pegados al cuerpo al bajar', 'Empuja con los tríceps hasta estirar'],
  ohext: ['Mancuerna con las dos manos detrás de la cabeza', 'Codos apuntando al techo y cerrados', 'Estira los brazos del todo arriba'],
  benchdip: ['Manos en el banco detrás de ti', 'Baja hasta que el codo forme 90°', 'Espalda cerca del banco; empuja con los tríceps'],
  kickback: ['Torso inclinado y brazo pegado al cuerpo', 'Estira el antebrazo hacia atrás', 'Solo se mueve el codo'],
  wristcurl: ['Antebrazos apoyados en los muslos', 'Mueve solo la muñeca', 'Recorrido completo y lento'],
  revcurl: ['Palmas hacia abajo', 'Codos pegados al cuerpo', 'Sube sin balanceo'],
  barshrug: ['Barra delante, brazos estirados', 'Sube los hombros hacia las orejas', 'Pausa arriba y baja lento'],
  frontsquat: ['Barra sobre la parte delantera de los hombros, codos altos', 'Torso muy vertical', 'Baja profundo con la espalda recta'],
  goblet: ['Mancuerna pegada al pecho', 'Baja entre las rodillas con el torso recto', 'Empuja con los talones'],
  bulgarian: ['Pie de atrás apoyado en un banco', 'Baja recto hasta que la rodilla casi toque el suelo', 'El peso, en la pierna de delante'],
  hack: ['Espalda pegada al respaldo', 'Baja hasta 90° o más', 'Empuja con todo el pie, sin bloquear las rodillas'],
  stepup: ['Cajón a la altura de la rodilla', 'Sube empujando con la pierna de arriba, sin impulsarte con la de abajo', 'Baja controlando'],
  sumo: ['Pies muy abiertos, puntas hacia fuera', 'Agarre entre las piernas, espalda recta', 'Empuja abriendo las rodillas y extiende la cadera'],
  goodmorning: ['Barra en la espalda alta, rodillas algo flexionadas', 'Lleva la cadera atrás inclinando el torso', 'Espalda recta siempre; empieza con poco peso'],
  seatcurl: ['Rodilla alineada con el eje', 'Flexiona hasta atrás del todo', 'Vuelve lento'],
  nordic: ['Talones bien sujetos', 'Baja lo más lento posible con el cuerpo recto', 'Ayúdate con las manos al final si hace falta'],
  glutebridge: ['Tumbado, pies cerca del culo', 'Empuja con los talones subiendo la cadera', 'Aprieta los glúteos arriba un segundo'],
  abductor: ['Espalda apoyada', 'Abre las piernas empujando con la parte de fuera', 'Vuelve lento, sin chocar el peso'],
  cablekick: ['Tobillera en la polea baja', 'Lleva la pierna atrás apretando el glúteo', 'Sin arquear la lumbar'],
  seatcalf: ['Rodillas bajo el apoyo', 'Baja el talón estirando', 'Sube de puntillas y aguanta'],
  standcalf: ['De pie en un escalón, talones fuera', 'Baja estirando y sube de puntillas', 'Lento y con pausa arriba'],
  crunchbw: ['Manos junto a la cabeza, sin tirar del cuello', 'Sube despegando los hombros del suelo', 'Suelta el aire al subir y baja lento'],
  russian: ['Sentado, torso inclinado hacia atrás', 'Gira el tronco de lado a lado', 'Pies en el suelo, o en el aire para más dificultad'],
  abmach: ['Ajusta el asiento y agarra las asas', 'Encorva el tronco apretando el abdomen', 'Vuelve lento sin soltar la tensión'],
  hangknee: ['Colgado de la barra, sin balanceo', 'Sube las rodillas al pecho', 'Baja controlando']
};
const TIP_DEF = ['Calienta con una serie ligera', 'Recorrido completo y controlado', 'Si notas dolor (no esfuerzo), para'];
const FRONT_M = ['pecho', 'hombros', 'biceps', 'antebrazo', 'abdomen', 'cuadriceps', 'gemelos'];
const ytUrl = (ex, shorts) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.n + (shorts ? ' técnica shorts' : ' técnica correcta')) + (shorts ? '' : '&sp=EgIYAQ%253D%253D');
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
ICON.tecnica = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10.5 9.5v5l4-2.5z" fill="currentColor"/></svg>';
S.tecM = null;

function tecRow(ex, sub) {
  return `<button class="pkrow" data-act="tec-open" data-id="${ex.id}"><span class="tecp">${ICON_PLAY}</span><div class="sp" style="min-width:0"><div class="b">${esc(ex.n)}</div><div class="xs mut">${sub || KIND[ex.k] + (ex.s && ex.s.length ? ' · también ' + ex.s.map(m => MUSCLES[m].toLowerCase()).join(', ') : '')}</div></div><span class="mut">${ICON.chev}</span></button>`;
}
function tecBody(q) {
  q = norm((q || '').trim());
  const all = allEx();
  if (q) {
    const f = all.filter(e => norm(e.n).includes(q) || e.m.concat(e.s || []).some(m => norm(MUSCLES[m]).includes(q)));
    return f.length ? `<div class="card">${f.map(e => tecRow(e, e.m.map(m => MUSCLES[m]).join(' · '))).join('')}</div>` : `<div class="empty">No encuentro «${esc(q)}».</div>`;
  }
  if (S.tecM) {
    const m = S.tecM, main = all.filter(e => e.m.includes(m)), sec = all.filter(e => !e.m.includes(m) && (e.s || []).includes(m));
    return `<button class="btn ghost" style="justify-content:flex-start;padding:0 2px;height:36px" data-act="tec-back">← Todos los grupos</button>
     <div class="row" style="margin:6px 2px 12px;gap:14px"><div class="tecbody">${bodySVG(FRONT_M.includes(m) ? FRONT : BACK, { [m]: 12 })}</div><div><div class="b" style="font-size:24px;letter-spacing:-.03em">${MUSCLES[m]}</div><div class="sm mut">${main.length} ejercicios</div></div></div>
     <div class="card">${main.map(e => tecRow(e)).join('')}</div>
     ${sec.length ? `<div class="card"><div class="ch"><span class="ct">También lo trabajan</span></div>${sec.map(e => tecRow(e, e.m.map(x => MUSCLES[x]).join(' · '))).join('')}</div>` : ''}`;
  }
  return `<div class="tecgrid">${Object.keys(MUSCLES).map(m => { const n = all.filter(e => e.m.includes(m)).length;
    return `<button class="tecg" data-act="tec-m" data-m="${m}"><div class="tecbody">${bodySVG(FRONT_M.includes(m) ? FRONT : BACK, { [m]: 12 })}</div><b>${MUSCLES[m]}</b><span>${n} ejercicios</span></button>`; }).join('')}</div>`;
}
function vTecnica() {
  return `<div class="top"><div><div class="eyebrow">${allEx().length} ejercicios</div><h1>Técnica</h1></div></div>
  <div class="search" style="background:var(--bg);top:0;margin:0 0 12px"><input class="inp" data-k="tec.q" data-input="tecq" placeholder="Buscar ejercicio o músculo" autocomplete="off"></div>
  <div id="tecbody">${tecBody(val('tec.q'))}</div>`;
}
I.tecq = el => { const b = document.getElementById('tecbody'); if (b) b.innerHTML = tecBody(el.value); };
SHEETS.tec = s => {
  const ex = exById(s.id), tips = TIPS[ex.id] || TIP_DEF, sg = suggest(ex), rk = rankOf(ex, bestVal(ex));
  const inDraft = S.draft && !S.draft.editId, has = inDraft && (S.draft.ex || []).some(e => e.id === ex.id);
  return `<div class="eyebrow">${KIND[ex.k]}</div><div class="sh-t">${esc(ex.n)}</div>
  <div class="tchips" style="margin:10px 0 14px">${ex.m.map(m => `<span class="tchip" style="background:rgba(212,255,58,.14);color:var(--acc)">${MUSCLES[m]}</span>`).join('')}${(ex.s || []).map(m => `<span class="tchip">${MUSCLES[m]}</span>`).join('')}</div>
  <div class="card" style="padding:16px"><div class="ct" style="margin-bottom:10px">Las 3 claves</div>${tips.map((t, i) => `<div class="tipr"><span class="ix num">${i + 1}</span><span>${esc(t)}</span></div>`).join('')}</div>
  <a class="btn" href="${ytUrl(ex)}" target="_blank" rel="noopener" style="text-decoration:none">${ICON_PLAY} Ver vídeos cortos en YouTube</a>
  <div style="height:8px"></div><a class="btn sec" href="${ytUrl(ex, true)}" target="_blank" rel="noopener" style="text-decoration:none">Ver Shorts</a>
  <div class="row" style="margin:16px 2px 4px;gap:10px">${rankBadge(rk, 30)}<div class="sm mut sp">${rk ? 'Tu rango: <b style="color:' + rk.col + '">' + rankLabel(rk) + '</b>' : 'Aún sin rango'}${sg.kg ? ' · Tu rango de peso: ' + kgR(sg.kg) + ' kg × ' + sg.reps[0] + '–' + sg.reps[1] : sg.bw ? ' · Objetivo: ' + sg.reps[0] + '–' + sg.reps[1] + ' reps' : ''}</div></div>
  ${inDraft && !has ? `<div style="height:10px"></div><button class="btn sec" data-act="tec-add" data-id="${ex.id}">${ICON.plus} Añadir al entreno de ahora</button>` : ''}`;
};
Object.assign(A, {
  'tec-m'(el) { S.tecM = el.dataset.m; setVal('tec.q', ''); render(); window.scrollTo(0, 0); },
  'tec-back'() { S.tecM = null; render(); window.scrollTo(0, 0); },
  'tec-open'(el) { openSheet({ type: 'tec', id: el.dataset.id }); },
  'tec-add'(el) { const d = clone(S.draft); d.ex.push({ id: el.dataset.id, uid: uid('e').replace(/-/g, ''), sets: [] }); d.cur = d.ex.length - 1; Store.putDraft(d); derive(); S.sheets = []; S.tab = 'entreno'; render(); window.scrollTo(0, 0); toast('Añadido al entreno'); }
});
