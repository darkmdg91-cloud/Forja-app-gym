/* Frases de Forja — compartidas por la app y por el aviso diario */
self.FORJA_FRASES = [
  'Hoy no se negocia. Se entrena.',
  'El sofá no te va a poner fuerte, crack.',
  'Tú contra el tú de ayer. Gánale.',
  'Nadie se acuerda del día que se quedó en casa.',
  'Las excusas no levantan peso.',
  'Hoy duele, mañana presumes.',
  'El espejo no se gana solo.',
  'Modo bestia: activado.',
  'La motivación va y viene. La disciplina se queda.',
  'Venga, que la barra no se levanta sola.',
  'Hoy entrenas tú o entrenan tus excusas. Elige.',
  'Constancia de loco, resultados de loco.',
  'Lo difícil es ir. Lo demás es repetir.',
  'Ni frío, ni sueño, ni pereza. Gym.',
  'Tu yo de dentro de seis meses te está mirando. No le falles.',
  'Pequeñas mejoras todos los días. Así se construye un cuerpo.',
  'Las agujetas son el recibo de que fuiste.',
  'No vienes a ser perfecto, vienes a ser mejor que ayer.',
  'Primero se entrena, luego se presume.',
  'Nadie va a hacer tus series por ti.',
  'Ese récord no se va a batir solo.',
  'Lo que hoy pesa, mañana calienta.',
  'Una serie más. Siempre una más.',
  'Si fuera fácil, lo haría todo el mundo. Y no lo hace.',
  'Pon la música a tope y que tiemble el gym.',
  'Hoy toca romperse un poquito. Mañana, más fuerte.',
  'No pienses. Ve. Ya pensarás en la ducha.',
  'Cada kilo cuenta. Cada día también.',
  'Entrena como si alguien te estuviera adelantando. Porque lo está.',
  'El cansancio se va. El progreso se queda.',
  'Hoy vas a mover hierro como si te debiera dinero.',
  'Que el gym sepa que has llegado.',
  'Ganas o no ganas, se va igual. Y luego vienen las ganas.',
  'Tu única competencia está en el espejo. Y hoy le ganas.',
  'Menos stories, más series.',
  'El que la sigue la consigue. El que no, sigue igual.',
  'Calienta bien, aprieta mejor.',
  'Hoy se suda. Mañana se nota.',
  'Lento también es progreso. Parado no.',
  'Locura controlada: a entrenar.'
];
self.FORJA_DESCANSO = [
  'Hoy toca descanso. El músculo crece cuando paras.',
  'Descansar también es entrenar. Come bien y duerme.',
  'Día libre. Mañana vuelves con más hambre.',
  'Recupera, que mañana hay guerra.',
  'Hoy se crece en el sofá. Literalmente.',
  'Estira, camina, hidrátate. Mañana a tope.',
  'Las bestias también duermen.'
];
self.forjaPhrase = function (rest, date) {
  var L = rest ? self.FORJA_DESCANSO : self.FORJA_FRASES;
  var d = date || new Date();
  var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
  return L[n % L.length];
};
/* Texto del aviso diario a partir del perfil guardado */
self.forjaDaily = function (profile, date) {
  var d = date || new Date();
  var r = profile && Array.isArray(profile.routine) ? profile.routine : null;
  var day = r ? r[(d.getDay() + 6) % 7] : null;
  var any = r && r.some(function (x) { return x && x.ex && x.ex.length; });
  if (!any) return { title: 'Hoy toca entrenar', body: self.forjaPhrase(false, d) };
  if (day && day.ex && day.ex.length) {
    return { title: 'Hoy toca: ' + (day.label || day.name || 'entreno'), body: self.forjaPhrase(false, d) };
  }
  return { title: 'Hoy toca descanso', body: self.forjaPhrase(true, d) };
};
