// src/services/api.js
//
// Puerta de entrada al API REST (como api.js de la práctica del profesor).
// Cada servicio deja de usar storageService (localStorage) y pide los datos por aquí.
//
// La URL del API viene de VITE_API_URL (en Vercel: Settings → Environment Variables).
// En local, si no está definida, usa http://localhost:3005.
//
// Si el API responde con error, lanza un Error con el `message` del backend y además
// `status`, `code` y `campos` (ver "Capas y errores" en el README del API), así los
// formularios pueden seguir marcando cada campo como hoy.

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3005').replace(/\/$/, '');

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('No se pudo conectar con el servidor. Inténtalo otra vez.'), {
      code: 'SIN_CONEXION',
    });
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw Object.assign(new Error(data?.message || `HTTP ${res.status}`), {
      status: res.status,
      code: data?.code ?? null,
      campos: data?.campos ?? null,
    });
  }

  return data;
};

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
