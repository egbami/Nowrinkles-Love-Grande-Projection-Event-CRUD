const GHANAIAN_LIKE_PHONE = /^\s*(?:\+?229[\s.-]*)?(?:0?1)(\d{8})\s*$/;

export function normalizeWhatsAppNumber(input: string) {
  const value = String(input || '').trim();
  const match = value.match(GHANAIAN_LIKE_PHONE);

  if (!match) return null;

  const suffix = match[1];
  return `+229 01${suffix}`;
}

export function isValidWhatsAppNumber(input: string) {
  return normalizeWhatsAppNumber(input) !== null;
}

export function formatWhatsAppNumber(input: string) {
  return normalizeWhatsAppNumber(input) ?? String(input || '').trim();
}
