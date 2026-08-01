export function extractErrorMessage(err: any, fallback = 'Ocurrió un error'): string {
  if (!err) return fallback;

  const candidates: any[] = [
    err?.response?.data?.message,
    err?.response?.data?.['error-info']?.[2],
    err?.response?.data,
    err?.error?.message,
    err?.error?.['error-info']?.[2],
    err?.error,
    err?.message,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return errorFilter(c);
    if (Array.isArray(c) && c.length > 0 && typeof c[0] === 'string' && c[0].trim()) return errorFilter(c[0]);
    if (c && typeof c === 'object' && typeof c.message === 'string' && c.message.trim()) return errorFilter(c.message);
  }

  return fallback;
}

export function errorFilter(e: string): string {
  e = e.replace('ERROR:', '');
  const i: number = e.indexOf('CONTEXT') - 1;

  if (i === -2) return e;

  let aux = '';
  for (let c = 0; c < i; c++) {
    aux += e[c];
  }
  aux += '.';
  return aux;
}
