// Toma solo los campos permitidos del body (seguridad) y convierte '' en NULL
export function pick(body, campos) {
  const datos = {};
  for (const c of campos) {
    if (body[c] !== undefined) datos[c] = body[c] === '' ? null : body[c];
  }
  return datos;
}
