export const STANDARD_ERROR_MESSAGE = 'Ocurrió un error inesperado.';

function firstString(candidates: any[]): string | undefined {
  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === 'string' && c.trim()) return c;
    if (Array.isArray(c) && c.length > 0) {
      for (const item of c) {
        if (typeof item === 'string' && item.trim()) return item;
        if (item && typeof item === 'object' && typeof item.message === 'string' && item.message.trim()) return item.message;
      }
    }
    if (c && typeof c === 'object') {
      const msg = c.message ?? c.error;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
  }
  return undefined;
}

export function extractErrorMessage(err: any, fallback = STANDARD_ERROR_MESSAGE): string {
  if (!err) return fallback;

  const responseData = err?.response?.data;

  const candidates: any[] = [
    responseData?.message,
    responseData?.error,
    responseData?.errors,
    err?.error?.message,
    err?.error?.['error-info']?.[2],
    err?.error?.['error-info'],
    err?.data?.message,
    err?.data?.error,
    err?.data?.errors,
    err?.error,
    err?.message,
  ];

  const msg = firstString(candidates);
  return msg ? errorFilter(msg) : fallback;
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
