# Forja

App de gym para iPhone (PWA): rutina semanal, registro de series, rangos sugeridos, marcas, mapa muscular, fotos de progreso, aviso diario y Cazamonstruos (reto de flexiones con la cámara).

- App: https://darkmdg91-cloud.github.io/Forja-app-gym/
- Instalar: abrir en Safari → Compartir → Añadir a pantalla de inicio.
- Aviso diario: GitHub Actions (`.github/workflows/aviso-diario.yml`) a las 8:30 (Madrid). Secretos: `VAPID_PRIVATE` y `FORJA_SUB`.

Los datos se guardan solo en el iPhone (IndexedDB).

- Cazamonstruos usa MediaPipe Pose Landmarker (se descarga la primera vez y queda en caché).
