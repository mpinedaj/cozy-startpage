export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!isValidUrl(trimmed)) return null;
  return trimmed;
}
