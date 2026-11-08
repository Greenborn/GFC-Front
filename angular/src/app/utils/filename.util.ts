const FORBIDDEN_CHARS = /[<>:"/\\|?*\u0000-\u001f]/g;
const MAX_LENGTH = 150;

export function sanitizeFilenamePart(value: unknown): string {
  return String(value ?? '')
    .replace(FORBIDDEN_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Une las partes presentes con " - ", sin caracteres prohibidos en Windows, y agrega .jpeg */
export function buildPhotoFilename(parts: unknown[]): string {
  let name = parts
    .map(sanitizeFilenamePart)
    .filter(p => p.length > 0)
    .join(' - ')
    .slice(0, MAX_LENGTH)
    .replace(/[.\s]+$/, '');
  if (!name) name = 'imagen';
  return `${name}.jpeg`;
}
