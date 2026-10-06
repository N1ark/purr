/**
 * The windowing arithmetic behind `VirtualList`, pure so a hand-rolled virtual view (a diff,
 * with files of known heights and rows inside them) can share it.
 */

/** `[first, end)` of the rows of fixed `rowHeight` overlapping `[top, top + height)`, plus `overscan` rows. */
export function fixedRange(
  count: number,
  rowHeight: number,
  top: number,
  height: number,
  overscan = 0,
): [number, number] {
  if (count <= 0 || rowHeight <= 0) return [0, 0];
  const first = Math.max(0, Math.floor(top / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((top + height) / rowHeight) + overscan);
  return [Math.min(first, end), end];
}

/** `tops[i]` is where row `i` starts and `tops[count]` the total height. */
export function offsets(count: number, heightOf: (index: number) => number): Float64Array {
  const tops = new Float64Array(count + 1);
  let y = 0;
  for (let i = 0; i < count; i++) {
    tops[i] = y;
    y += Math.max(0, heightOf(i));
  }
  tops[count] = y;
  return tops;
}

/** The first row whose bottom is below `y`, by binary search over `tops`. */
export function rowAt(tops: ArrayLike<number>, y: number): number {
  const count = tops.length - 1;
  let lo = 0;
  let hi = count;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tops[mid + 1] <= y) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(lo, Math.max(0, count));
}

/** `[first, end)` of the rows of varying height overlapping `[top, top + height)`, `overscan` px beyond. */
export function variableRange(
  tops: ArrayLike<number>,
  top: number,
  height: number,
  overscan = 0,
): [number, number] {
  const count = tops.length - 1;
  if (count <= 0) return [0, 0];
  const first = rowAt(tops, top - overscan);
  let end = first;
  const bottom = top + height + overscan;
  while (end < count && tops[end] < bottom) end++;
  return [first, end];
}
