/**
 * Instant tooltip: `use:tooltip={"Automatic"}`, unlike `title`, which waits a second. One shared
 * element on `<body>` (styled in `overlays.css`), placed above the target or below it when
 * there is no room. Nothing on a phone: there is no hover, and a tap is not a question.
 */

import type { Action } from "svelte/action";

import { formatShortcut } from "../lib/keys";
import { usingKeyboard } from "../lib/modality";
import { place, toRect } from "../lib/position";

export interface TooltipOptions {
  text?: string;
  /** Must already be sanitised (DOMPurify output, rendered inline markdown). */
  html?: string;
  /** A shortcut hint shown after the text: `{ text: "Undo", hint: "⌘Z" }`. */
  hint?: string;
  placement?: "top" | "bottom";
}

export type TooltipContent = string | TooltipOptions | null | undefined | false;
/** Static content, or a function evaluated on each hover (e.g. only when the label overflows). */
export type TooltipSource = TooltipContent | ((node: HTMLElement) => TooltipContent);

let bubble: HTMLDivElement | null = null;
let owner: HTMLElement | null = null;

function ensure(): HTMLDivElement {
  if (bubble?.isConnected) return bubble;
  bubble = document.createElement("div");
  bubble.className = "tooltip";
  bubble.setAttribute("role", "tooltip");
  document.body.appendChild(bubble);
  return bubble;
}

function fill(el: HTMLElement, content: string | TooltipOptions) {
  if (typeof content === "string") {
    el.textContent = content;
    return;
  }
  if (content.html !== undefined) el.innerHTML = content.html;
  else el.textContent = content.text ?? "";
  if (content.hint) {
    const kbd = document.createElement("kbd");
    kbd.textContent = formatShortcut(content.hint);
    el.append(kbd);
  }
}

function show(target: HTMLElement, content: string | TooltipOptions) {
  if (document.body.classList.contains("mobile")) return;
  const el = ensure();
  owner = target;
  fill(el, content);
  el.classList.add("show");
  const size = { width: el.offsetWidth, height: el.offsetHeight };
  const side = typeof content === "string" ? "top" : (content.placement ?? "top");
  const at = place(
    toRect(target),
    size,
    { width: innerWidth, height: innerHeight },
    {
      placement: side,
      offset: 6,
      margin: 4,
    },
  );
  el.style.transform = `translate(${at.x}px, ${at.y}px)`;
  window.addEventListener("scroll", hideAny, { capture: true, passive: true, once: true });
}

function hideAny() {
  owner = null;
  bubble?.classList.remove("show");
}

function hide(target: HTMLElement) {
  if (owner === target) hideAny();
}

/** Every node with a tooltip, and how to read its content. */
const sources = new WeakMap<HTMLElement, () => TooltipContent>();
let listening = false;

function enter(e: Event) {
  const node = e.target as HTMLElement;
  const read = sources.get(node);
  const content = read?.();
  if (content) show(node, content);
}

// Only a keyboard focus asks: focus given back by a closing dialog is not a question.
function focus(e: Event) {
  // WebKit calls a script's focus visible, so check the input too.
  if (usingKeyboard() && (e.target as HTMLElement).matches?.(":focus-visible")) enter(e);
}

function leave(e: Event) {
  hide(e.target as HTMLElement);
}

/**
 * One set of capturing listeners on the document for every tooltip, rather than six on each node:
 * a row carrying a button would otherwise pay for them once per row. Capture sees `pointerenter`
 * and `focus` on every element even though neither bubbles.
 */
function listen() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("pointerenter", enter, true);
  document.addEventListener("pointerleave", leave, true);
  document.addEventListener("focus", focus, true);
  document.addEventListener("blur", leave, true);
  document.addEventListener("pointerdown", hideAny, true);
  document.addEventListener("keydown", hideAny, true);
}

export const tooltip: Action<HTMLElement, TooltipSource> = (node, source) => {
  let current = source;
  const resolve = () => {
    const got = typeof current === "function" ? current(node) : current;
    return got || null;
  };
  listen();
  sources.set(node, resolve);
  return {
    update(next) {
      current = next;
      if (owner !== node) return;
      const content = resolve();
      if (content) show(node, content);
      else hideAny();
    },
    destroy() {
      hide(node);
      sources.delete(node);
    },
  };
};
