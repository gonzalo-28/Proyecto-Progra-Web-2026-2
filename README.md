# Reserva UL

Aplicación web para **reservar espacios de la Universidad de Lima**: laboratorios, salas de estudio y auditorios. Los estudiantes buscan un espacio, revisan su disponibilidad y reservan un bloque horario. Los encargados de cada sede administran los espacios y operan las reservas del día.

Proyecto del curso **Programación Web** · Universidad de Lima · 2026-2 · Grupo 4.

## Integrantes

| Integrante | Código | Historia de usuario |
|---|---|---|
| Gonzalo Rodrigo Trujillo Alejos | 20243543 | HU-1 · Autenticación, registro y Mi cuenta |
| Dylan Alexander Salazar Camacho | 20245948 | HU-2 · Catálogo y gestión de espacios |
| Alexander Zevallos Quispe | 20243916 | HU-3 · Búsqueda y disponibilidad de espacios |
| Roberto Mauricio Puchuri Mayuri | 20232317 | HU-4 · Reservas del estudiante |
| Benjamin Mendoza Gutierrez | 20246405 | HU-5 · Operación diaria del encargado |
| André Laychet Abanto | 20234643 | HU-6 · Incidencias |

## Tecnologías

- **React 19** + **Vite 8**
- **React Router 7**: rutas públicas, privadas y protegidas por rol
- **CSS Modules** con tokens de diseño (`src/styles/tokens.css`)
- **ESLint**, con las reglas de `react-hooks` y `react-refresh`
- Persistencia simulada en `localStorage`. En esta entrega no hay backend: los servicios imitan las respuestas de una API y sus validaciones.

## Cómo ejecutarlo

Requisitos: **Node.js 20.19 o superior** (en la línea 22, la 22.13 o superior) y **Git**.

```bash
git clone https://github.com/gonzalo-28/Proyecto-Progra-Web-2026-2.git
cd Proyecto-Progra-Web-2026-2
npm install
npm run dev
```

Abre **http://localhost:5173** en el navegador.

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve la compilación de `dist/` |
| `npm run lint` | Revisa el código con ESLint |

### Datos de prueba

La primera vez que se abre, la app copia los datos de `src/data/` en `localStorage` (clave `app_db`). Si los datos de prueba cambiaron o quieres empezar de cero, abre la consola del navegador (F12 → **Console**), ejecuta lo siguiente y recarga la página con F5:

```js
localStorage.removeItem('app_db')
```

Usuarios de prueba (todos con la contraseña **`Aa1234`**):

| Rol | Correo |
|---|---|
| Estudiante | `agomez@ulima.edu.pe` |
| Estudiante | `camila.rojas@ulima.edu.pe` |
| Encargado (Sede Central) | `cruiz@ulima.edu.pe` |

## Funcionalidades por historia de usuario

| HU | Qué incluye |
|---|---|
| HU-1 | Inicio de sesión con límite de intentos, registro de estudiante y de encargado, recuperación de contraseña, Mi cuenta, redirección según el rol y vistas 403 y 404 |
| HU-2 | Listado de espacios de la sede con búsqueda y filtros. Registro de espacios y edición de sus datos generales, su equipamiento (con cantidades) y su horario de atención. Cambio de estado (disponible, en mantenimiento, de baja). Ficha pública del espacio |
| HU-3 | Búsqueda de espacios con filtros, orden y paginación. Disponibilidad semanal del espacio y reserva desde el calendario |
| HU-4 | Reserva de un bloque con invitados. Mis reservas con filtros, detalle con trazabilidad, confirmación y cancelación |
| HU-5 | Bandeja del día por sede con contadores. Registro de llegada e inasistencia según la tolerancia, cancelación con motivo, bloqueos por mantenimiento o evento, búsqueda de reservas e historial del día exportable a Excel |
| HU-6 | El estudiante reporta incidencias sobre un espacio y sigue su estado. El encargado las revisa con filtros, agrega seguimiento y cambia su estado (recibida, en atención, resuelta, desestimada) |

### Rutas principales

| Quién | Rutas |
|---|---|
| Visitante | `/landingpage`, `/espacios` (buscador), `/espacios/:id` (calendario semanal), `/espacios/:id/ficha` (ficha pública), `/login`, `/registro`, `/registro/encargado`, `/recuperar`, `/reglamento`, `/ayuda` (estas dos también las ve cualquier usuario con sesión) |
| Estudiante | `/espacios` (inicio), `/mis-reservas`, `/mis-reservas/:codigo`, `/mis-incidencias`, `/perfil` |
| Encargado | `/encargado/bandeja` (inicio), `/encargado/bloqueos`, `/encargado/reservas`, `/encargado/espacios`, `/encargado/incidencias`, `/perfil` |

En modo desarrollo, la bandeja del encargado acepta `?hora=HH:MM` para simular la hora actual y probar la tolerancia. Por ejemplo: `/encargado/bandeja?hora=10:08`.

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/          Componentes genéricos y reutilizables (Button, Modal, TextField…)
│   ├── features/    Componentes de cada funcionalidad (auth, spaces, search, reservations, operation…)
│   ├── layout/      Navbar, Footer y PageShell con sus presets por pantalla
│   └── routes/      AppRouter, rutas protegidas por rol y constantes de rutas
├── pages/           Una carpeta por pantalla: arma la vista con features y layout
├── context/         Estado compartido (Auth, búsqueda, disponibilidad, bandeja). Context y Provider van en archivos separados
├── hooks/           Hooks reutilizables (useDateParam, useNow)
├── services/        Lógica de datos y validaciones; solo storageService accede a app_db en localStorage
├── utils/           Funciones puras: fechas, reglas de negocio, validadores, exportación a CSV
├── data/            Base inicial y datos semilla
└── styles/          tokens.css (colores, espacios, tipografía) y global.css
```

Reglas que sigue el código:

- Los componentes no leen ni escriben la base `app_db`: piden y guardan los datos a través de `services/`, y solo `storageService` accede a ella.
- No hay prop-drilling: el estado compartido de una pantalla vive en un Context.
- Los estilos usan CSS Modules y solo los valores definidos en los tokens.
- El nombre de cada archivo de componente coincide exactamente, mayúsculas incluidas, con el componente y con sus imports (`TextField/TextField.jsx`).

## Flujo de trabajo con Git

1. Cada integrante trabaja en su propia rama (`feature/hu<N>-…`). Nadie trabaja directo en `main`.
2. Antes de abrir un Pull Request, se actualiza la rama con `git merge origin/main` y se revisa que pasen `npm run lint` y `npm run build`.
3. El Pull Request lo revisa y lo aprueba **otro integrante** antes de unirlo a `main`.