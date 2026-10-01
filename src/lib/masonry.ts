/**
 * Deals items into columns, each to the shortest so far (the leftmost on a tie), so reading
 * across stays close to the list's order and the columns end level. Heights are in any one
 * unit: an item's height over its width suits columns of equal width.
 */
export function packColumns(heights: readonly number[], columns: number): number[][] {
  const count = Math.max(1, Math.floor(columns));
  const cols: number[][] = Array.from({ length: count }, () => []);
  const filled = new Array<number>(count).fill(0);
  heights.forEach((height, i) => {
    let shortest = 0;
    for (let c = 1; c < count; c++) if (filled[c] < filled[shortest] - 1e-9) shortest = c;
    cols[shortest].push(i);
    filled[shortest] += Math.max(0, height);
  });
  return cols;
}

/** How many columns of at least `minWidth` fit in `width` with `gap` between them. */
export function columnCount(width: number, minWidth: number, gap = 0): number {
  if (!(width > 0) || !(minWidth > 0)) return 1;
  return Math.max(1, Math.floor((width + gap) / (minWidth + gap)));
}
