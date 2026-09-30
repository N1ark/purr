/**
 * Where a floating box goes. A box at a point flips away from the edge it would cross (a menu
 * that runs off swallows the next click); a box beside an anchor flips to the other side when
 * that side has more room, then slides along the edge to stay on screen.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";
export type Placement = "point" | Side | `${Side}-${"start" | "end"}`;

export interface PlaceOptions {
  placement?: Placement;
  /** Gap between the anchor and the box. */
  offset?: number;
  /** How close to the viewport edge the box may come. */
  margin?: number;
  /** Flip to the opposite side when it fits better (default true). */
  flip?: boolean;
}

export interface Placed extends Point {
  /** The placement actually used, after any flip: pass it back with `flip: false` to hold it. */
  placement: Placement;
}

export function toRect(anchor: Element | DOMRect | Rect | Point): Rect {
  if (typeof Element !== "undefined" && anchor instanceof Element) {
    const r = anchor.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }
  const a = anchor as Partial<Rect> & Point;
  return { x: a.x, y: a.y, width: a.width ?? 0, height: a.height ?? 0 };
}

function clampAxis(start: number, extent: number, available: number, margin: number): number {
  return Math.max(margin, Math.min(start, available - extent - margin));
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

function split(placement: Exclude<Placement, "point">): [Side, Align] {
  const [side, align] = placement.split("-") as [Side, "start" | "end" | undefined];
  return [side, align ?? "center"];
}

/** The top-left corner for a box of `size` hung off `anchor`. Pure. */
export function place(
  anchor: Rect,
  size: Size,
  viewport: Size,
  options: PlaceOptions = {},
): Placed {
  const { placement = "bottom-start", offset = 4, margin = 8, flip = true } = options;

  if (placement === "point") {
    const fit = (start: number, extent: number, available: number) => {
      const flipped =
        flip && start + extent + margin > available ? Math.max(margin, start - extent) : start;
      return clampAxis(flipped, extent, available, margin);
    };
    return {
      x: fit(anchor.x, size.width, viewport.width),
      y: fit(anchor.y, size.height, viewport.height),
      placement,
    };
  }

  let [side, align] = split(placement);
  const vertical = side === "top" || side === "bottom";
  const room: Record<Side, number> = {
    top: anchor.y - offset - margin,
    bottom: viewport.height - (anchor.y + anchor.height) - offset - margin,
    left: anchor.x - offset - margin,
    right: viewport.width - (anchor.x + anchor.width) - offset - margin,
  };
  const need = vertical ? size.height : size.width;
  if (flip && room[side] < need && room[OPPOSITE[side]] > room[side]) side = OPPOSITE[side];

  let x: number;
  let y: number;
  if (vertical) {
    y = side === "bottom" ? anchor.y + anchor.height + offset : anchor.y - offset - size.height;
    x =
      align === "start"
        ? anchor.x
        : align === "end"
          ? anchor.x + anchor.width - size.width
          : anchor.x + (anchor.width - size.width) / 2;
    x = clampAxis(x, size.width, viewport.width, margin);
    y = clampAxis(y, size.height, viewport.height, margin);
  } else {
    x = side === "right" ? anchor.x + anchor.width + offset : anchor.x - offset - size.width;
    y =
      align === "start"
        ? anchor.y
        : align === "end"
          ? anchor.y + anchor.height - size.height
          : anchor.y + (anchor.height - size.height) / 2;
    x = clampAxis(x, size.width, viewport.width, margin);
    y = clampAxis(y, size.height, viewport.height, margin);
  }
  const used = (align === "center" ? side : `${side}-${align}`) as Placement;
  return { x: Math.round(x), y: Math.round(y), placement: used };
}
