# CITEIN (Expo) - Aplicación para la convención

Proyecto creado para el examen final. Implementa:

- Pantalla de bienvenida con logos.
- Lista de actividades cargada desde `src/data/events.json`.
- Detalle de actividad.
- Favoritos (persistidos con AsyncStorage).
- Perfil de usuario (nombre, carnet, carrera) persistido.
- Generador de QR con los datos del perfil.

Cómo ejecutar localmente

1. Instalar dependencias

```powershell
cd C:\Users\nicke\AndroidStudioProjects\app_expo
npm install
```

2. Iniciar Expo (PowerShell)

```powershell
npx expo start
# o con limpieza de caché
npx expo start -c
```

3. Abrir en Expo Go (escanea el QR) o en un emulador con `a` para Android.

Notas para entregar a GitHub

- Asegúrate de tener un repositorio remoto (GitHub). Sigue las instrucciones en la carpeta raíz para `git init`, `git add .`, `git commit` y `git push`.

Contacto

Proyecto preparado por el estudiante (ajusta el `README.md` antes de entregar si quieres añadir nombre y carnet).

---

Instrucciones para la app móvil (integración con backend local)

- Puerto por defecto del backend: `3000`.
- Si ejecutas el emulador Android estándar usa la URL base `http://10.0.2.2:3000` (ya configurada en `src/services/api.js`).
- Para usar en web o si ejecutas el backend en la misma máquina con Expo web, cambia `API_URL` en `src/services/api.js` a `http://localhost:3000`.

Ejecutar:

```powershell
cd C:\Users\nicke\AndroidStudioProjects\ProyectoFInal\FP
npm install
npx expo start
```

Endpoints principales usados:
- `POST /auth/login` -> iniciar sesión (body: `{ correo, contrasena }`).
- `GET /productos`, `POST/PUT/DELETE /productos` -> productos (POST/PUT/DELETE requieren token).
- `GET/POST/PUT/DELETE /categorias` -> categorías.
- `GET /logs` -> logs (solo consumir).
- `GET/POST/PATCH /usuario` -> usuarios.

Si quieres, puedo:
- Mejorar UX y estilos para que coincidan exactamente con `ecommerce-front`.
- Añadir subida de imágenes, manejo de errores más robusto y validaciones.

