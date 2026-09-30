<script lang="ts">
  // Read out after whatever the reader is saying; never visible. Pass a rising `seq`: the same
  // text written twice is no change, so the two slots are written in turn.
  interface Props {
    text: string;
    seq?: number;
    /** Interrupts instead of waiting; for errors only. */
    assertive?: boolean;
  }

  const { text, seq = 0, assertive = false }: Props = $props();

  const even = $derived(seq % 2 === 0);
</script>

<div
  class="sr-only"
  role={assertive ? "alert" : "status"}
  aria-live={assertive ? "assertive" : "polite"}
  aria-atomic="true"
>
  <span>{even ? text : ""}</span>
  <span>{even ? "" : text}</span>
</div>
