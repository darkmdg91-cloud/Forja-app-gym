// Envía el aviso diario de Forja al iPhone. Lo ejecuta GitHub Actions cada mañana.
// El texto (lo que toca hoy + frase) lo genera el propio iPhone con tu rutina guardada.
import webpush from 'web-push';

const VAPID_PUBLIC = 'BKJcWjyfWY3dzH7K96tdvZ6aOWvMONFAeNKydVNmu7ufbCxWKal2W1OWdCfGkmadvAUVxkhYOHI_D1zEt3aWPjI';
const { VAPID_PRIVATE, FORJA_SUB, EVENT, SCHEDULE } = process.env;

// Dos horarios en UTC para que sean las 8:30 en Madrid tanto en invierno como en verano.
if (EVENT === 'schedule') {
  const now = new Date();
  const madridHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hourCycle: 'h23' }).format(now));
  const offset = (madridHour - now.getUTCHours() + 24) % 24; // 1 en invierno, 2 en verano
  const wanted = offset === 2 ? '30 6 * * *' : '30 7 * * *';
  if (SCHEDULE !== wanted) {
    console.log(`Horario ${SCHEDULE} no toca hoy (Madrid UTC+${offset}).`);
    process.exit(0);
  }
}

if (!FORJA_SUB) {
  console.log('Falta el secreto FORJA_SUB: activa los avisos en la app y pega el código en GitHub.');
  process.exit(0);
}
if (!VAPID_PRIVATE) {
  console.error('Falta el secreto VAPID_PRIVATE.');
  process.exit(1);
}

webpush.setVapidDetails('https://github.com/darkmdg91-cloud/Forja-app-gym', VAPID_PUBLIC, VAPID_PRIVATE);

try {
  const sub = JSON.parse(FORJA_SUB);
  const res = await webpush.sendNotification(sub, JSON.stringify({ t: 'daily' }), { TTL: 6 * 3600, urgency: 'high' });
  console.log('Aviso enviado:', res.statusCode);
} catch (err) {
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.error('La suscripción ha caducado. Vuelve a activar los avisos en la app y actualiza FORJA_SUB.');
  } else {
    console.error('Error al enviar:', err.statusCode || '', err.body || err.message);
  }
  process.exit(1);
}
