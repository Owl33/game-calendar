export function stableStringify(o: unknown) {
  return JSON.stringify(o, Object.keys(o as any).sort());
}

export function normalizeSearchKey(searchParams: URLSearchParams) {
  const pairs = Array.from(searchParams.entries()).sort(([a],[b]) => a.localeCompare(b));
  return pairs.map(([k,v]) => `${k}=${v}`).join("&");
}