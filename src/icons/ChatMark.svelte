<script lang="ts" module>
  /** What a chat bubble can hold. */
  export type ChatMarkName = "question" | "exclamation" | "check" | "x" | "heart" | "code";
</script>

<script lang="ts">
  // Phosphor's chat-circle with a mark inside, drawn at the bubble's own line weight: the shared
  // body of the ChatCircle* icons Phosphor lacks. The bubble is Phosphor's centre line (its duotone
  // shape) stroked at Phosphor's width per weight, so it matches ChatCircle and ChatCircleDots.
  import type { IconComponentProps } from "phosphor-svelte";
  import { STROKE, circle } from "./weights";

  let {
    mark,
    children,
    weight = "regular",
    color = "currentColor",
    size = "1em",
    mirrored = false,
    ...rest
  }: IconComponentProps & { mark: ChatMarkName } = $props();

  const BUBBLE =
    "M224,128A96,96,0,0,1,79.93,211.11L42.54,223.58a8,8,0,0,1-10.12-10.12l12.47-37.39A96,96,0,1,1,224,128Z";
  const BUBBLE_FILL =
    "M232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Z";

  const stroke = $derived(STROKE[weight]);
  /** A dot reads as the same weight as the lines around it when it is a little wider than they are. */
  const dot = $derived(stroke / 2 + 4);

  /** Each mark as lines (stroked) and dots (filled), centred in the bubble. */
  const lines = $derived(
    {
      question: "M108,102a20,20,0,1,1,20,20v12",
      exclamation: "M128,84V136",
      check: "M92,130l24,24l48-48",
      x: "M100,100L156,156M156,100L100,156",
      heart:
        "M128,162C128,162,88,140,88,112a20,20,0,0,1,40,0a20,20,0,0,1,40,0C168,140,128,162,128,162Z",
      code: "M106,100L84,128L106,156M150,100L172,128L150,156",
    }[mark],
  );
  const dots = $derived(
    mark === "question" ? [[128, 168]] : mark === "exclamation" ? [[128, 168]] : [],
  );
  const holes = $derived(dots.map(([x, y]) => circle(x, y, dot)).join(""));
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  width={size}
  height={size}
  fill={color}
  transform={mirrored ? "scale(-1, 1)" : undefined}
  viewBox="0 0 256 256"
  {...rest}
>
  {@render children?.()}
  <rect width="256" height="256" fill="none" />
  {#if weight === "fill"}
    <!-- The bubble filled, the mark punched out of it, as Phosphor's filled icons do. -->
    <mask id="chat-mark-{mark}" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
      <path d={BUBBLE_FILL} fill="#fff" />
      <path
        d={lines}
        fill="none"
        stroke="#000"
        stroke-width={STROKE.regular}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d={holes} fill="#000" />
    </mask>
    <path d={BUBBLE_FILL} mask="url(#chat-mark-{mark})" />
  {:else}
    {#if weight === "duotone"}
      <path d={BUBBLE} opacity="0.2" />
    {/if}
    <g
      fill="none"
      stroke={color}
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d={BUBBLE} />
      <path d={lines} />
    </g>
    <path d={holes} />
  {/if}
</svg>
