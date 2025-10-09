// app/games/utils/serialize.ts
/** 키 순서와 상관없이 항상 동일한 문자열을 만들기 위한 안정 직렬화 */
export function stableSerialize(obj: unknown) {
  if (obj == null) return "null";
  const keys: string[] = [];
  JSON.stringify(obj as any, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj as any, keys);
}
