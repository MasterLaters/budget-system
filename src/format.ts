/**
 * 金额格式化：保留小数，最多两位，自动省略无意义的 0
 *   9.6    → "9.6"
 *   109    → "109"
 *   1234.5 → "1,234.5"
 */
export function money(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
