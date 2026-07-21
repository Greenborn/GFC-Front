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
