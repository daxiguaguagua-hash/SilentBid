const UINT32_MAX = 2 ** 32 - 1;

export function parseBidAmount(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > UINT32_MAX) return null;
  return parsed;
}
