import axios, { AxiosHeaders, type AxiosInstance } from 'axios';
import { Notify } from 'quasar';

// Single axios instance for app-wide usage
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
});

function translateToEs(input: string): string {
  const s = input.trim();
  const pairs: Array<[RegExp, string]> = [
    [/created( successfully)?/i, 'Creado correctamente'],
    [/updated( successfully)?/i, 'Actualizado correctamente'],
    [/deleted( successfully)?/i, 'Eliminado correctamente'],
    [/saved( successfully)?/i, 'Guardado correctamente'],
    [/login( successful(ly)?)?/i, 'Sesión iniciada'],
    [/invalid credentials/i, 'Credenciales inválidas'],
    [/unauthorized/i, 'No autorizado'],
    [/forbidden/i, 'Acceso denegado'],
    [/not found/i, 'No encontrado'],
    [/network error/i, 'Error de red'],
    [/timeout/i, 'Tiempo de espera agotado'],
    [/failed to fetch/i, 'No se pudo conectar con el servidor'],
    [/error/i, 'Error al procesar la solicitud'],
  ];
  for (const [re, es] of pairs) {
    if (re.test(s)) return es;
  }
  return s;
}

function normalizeHeaderVal(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    const arr = (val as unknown[])
      .filter((v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      .map((v) => String(v));
    return arr.length ? arr.join(',') : undefined;
  }
  return undefined;
}

// Request interceptor: solamente añade auth (se eliminó la lógica de mayúsculas)
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set('Authorization', `Bearer ${parsed.token}`);
        } else {
          const headers = new AxiosHeaders(config.headers);
          headers.set('Authorization', `Bearer ${parsed.token}`);
          config.headers = headers;
        }
      }
    }
  } catch {
    // ignore auth header errors
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      const method = response.config.method?.toUpperCase();
      if (!method) return response;
      const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
      if (!isMutation) return response;
      const headers = response.config.headers;
      let suppress: string | undefined;
      let overrideMessage: string | undefined;
      try {
        if (headers instanceof AxiosHeaders) {
          suppress = normalizeHeaderVal(headers.get('X-Suppress-Notify'));
          overrideMessage = normalizeHeaderVal(headers.get('X-Notify-Message'));
        } else if (headers) {
          const obj = headers as Record<string, unknown>;
          const key = Object.keys(obj).find((k) => k.toLowerCase() === 'x-suppress-notify');
          suppress = key ? normalizeHeaderVal(obj[key]) : undefined;
          const key2 = Object.keys(obj).find((k) => k.toLowerCase() === 'x-notify-message');
          overrideMessage = key2 ? normalizeHeaderVal(obj[key2]) : undefined;
        }
      } catch {
        // ignore header parsing errors
      }
      if (String(suppress).toLowerCase() === 'true') return response;
      const url = String(response.config.url || '');
      const defaults: Record<string, string> = {
        POST: 'Creado correctamente',
        PUT: 'Actualizado correctamente',
        PATCH: 'Actualizado correctamente',
        DELETE: 'Eliminado correctamente',
      };
      let message = defaults[method] || 'Operación exitosa';
      if (/\/auth\/login(\b|$)/.test(url) && method === 'POST') message = 'Sesión iniciada';
      if (overrideMessage) message = overrideMessage;
      Notify.create({ type: 'positive', message });
    } catch {
      // ignore response success notify errors
    }
    return response;
  },
  (error) => {
    try {
      const method = error?.config?.method?.toUpperCase();
      if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const headers = error.config?.headers;
        let suppress: string | undefined;
        let overrideMessage: string | undefined;
        try {
          if (headers instanceof AxiosHeaders) {
            suppress = normalizeHeaderVal(headers.get('X-Suppress-Notify'));
            overrideMessage = normalizeHeaderVal(headers.get('X-Notify-Message'));
          } else if (headers) {
            const obj = headers as Record<string, unknown>;
            const key = Object.keys(obj).find((k) => k.toLowerCase() === 'x-suppress-notify');
            suppress = key ? normalizeHeaderVal(obj[key]) : undefined;
            const key2 = Object.keys(obj).find((k) => k.toLowerCase() === 'x-notify-message');
            overrideMessage = key2 ? normalizeHeaderVal(obj[key2]) : undefined;
          }
        } catch {
          // ignore header parsing errors
        }
        if (String(suppress).toLowerCase() !== 'true') {
          const url = String(error?.config?.url || '');
          let msg =
            (error?.response?.data?.message as string | undefined) ||
            (error?.message as string | undefined) ||
            'Error al procesar la solicitud';
          if (/\/auth\/login(\b|$)/.test(url)) {
            const code = Number(error?.response?.status || 0);
            if (code === 401 || code === 400) msg = 'Credenciales inválidas';
          }
          msg = translateToEs(msg);
          if (overrideMessage) msg = overrideMessage;
          Notify.create({ type: 'negative', message: msg });
        }
      }
    } catch {
      // ignore response error notify errors
    }
    const reason =
      error instanceof Error ? error : new Error(String(error?.message ?? 'Request failed'));
    return Promise.reject(reason);
  },
);

export { api };
