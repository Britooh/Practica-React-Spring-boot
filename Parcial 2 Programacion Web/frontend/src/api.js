async function request(url, options = {}) {
  const res = await fetch('/api' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Error en la petición');
  return data;
}

export const api = {
  get:   (url)       => request(url),
  post:  (url, body) => request(url, { method: 'POST', body }),
  put:   (url, body) => request(url, { method: 'PUT', body }),
  patch: (url, body) => request(url, { method: 'PATCH', body }),
  del:   (url)       => request(url, { method: 'DELETE' }),
};

// Fecha de hoy en formato YYYY-MM-DD (hora local)
export const hoy = () => new Date().toLocaleDateString('en-CA');

// Fecha legible en español
export const fechaLarga = () =>
  new Date().toLocaleDateString('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// Iniciales de un nombre
export function iniciales(nombre = '', apellido = '') {
  const a = (nombre || '').trim()[0] || '';
  const b = (apellido || '').trim()[0] || (nombre || '').trim().split(' ')[1]?.[0] || '';
  return (a + b).toUpperCase() || '👤';
}

// Edad a partir de 'YYYY-MM-DD'
export function edad(fecha) {
  if (!fecha) return '—';
  const n = new Date(fecha + 'T00:00:00');
  const h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--;
  return `${e} años`;
}

// Convierte null -> '' para usar los datos en inputs controlados
export const limpiarNulos = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? '']));
