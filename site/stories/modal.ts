import { Modal } from "purr";
import ModalPreview from "../previews/ModalPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Modal",
  group: "Overlays & menus",
  component: Modal,
  description:
    "A panel over a scrim that keeps focus inside; Escape and a click outside close only the topmost. On a phone it fills the screen.",
  controls: {
    children: { type: "text", value: "Tab stays inside; Escape closes." },
    label: {
      type: "text",
      value: "Settings",
      note: "Announced; the header's text without a title",
    },
    title: { type: "text", optional: true, value: "Settings" },
    align: { type: "select", options: ["center", "top"], default: "center" },
    offset: { type: "text", default: "10vh", note: "From the top with align top" },
    width: { type: "text", optional: true, value: "420px" },
    height: { type: "text", optional: true, value: "" },
    scrim: { type: "select", options: ["normal", "strong", "frosted", "none"], default: "normal" },
    layer: { type: "select", options: ["modal", "dialog", "lightbox"], default: "modal" },
    padded: { type: "boolean", default: false, value: true },
    bare: { type: "boolean", default: false, note: "Opaque, edge to edge" },
    mobile: { type: "select", options: ["fullscreen", "sheet", "keep"], default: "fullscreen" },
    initialFocus: { type: "select", options: ["auto", "panel", "none"], default: "auto" },
    closeLabel: { type: "text", default: "Close" },
    footer: { type: "boolean", pseudo: true, value: true, note: "Cancel and Save buttons" },
    field: { type: "boolean", pseudo: true, value: true, note: "A field, focused on open" },
  },
  children: { text: "children", tag: "p" },
  overlay: { close: "onclose", open: "Open the modal" },
  events: { onclose: true, onkeydown: true },
  inner: (args) =>
    [
      args.field ? `<input class="field-input" placeholder="Focused on open" />` : "",
      args.footer
        ? `{#snippet footer()}\n  <Button onclick={() => (open = false)}>Cancel</Button>\n  <Button variant="primary" onclick={save}>Save</Button>\n{/snippet}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  uses: ["Button"],
  preview: ModalPreview,
});
