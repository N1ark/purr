<script lang="ts">
  // Something is still on its way. Under reduced motion it stops, and the ring remains.
  interface Props {
    /** Diameter; a number is pixels. `1em` sits in a line of text or a button. */
    size?: number | string;
    /** What is being waited for; announced, never drawn. */
    label?: string;
  }

  const { size = "1em", label = "Loading" }: Props = $props();
</script>

<span
  class="spinner"
  role="status"
  aria-label={label}
  style:--spinner-size={typeof size === "number" ? `${size}px` : size}
></span>

<style>
  .spinner {
    display: inline-block;
    flex: none;
    width: var(--spinner-size);
    height: var(--spinner-size);
    border: max(1px, calc(var(--spinner-size) / 8)) solid var(--border-strong);
    /* A ring of one colour spins without appearing to. */
    border-top-color: var(--theme2);
    border-radius: var(--radius-pill);
    vertical-align: -0.125em;
    animation: spin 0.8s linear infinite;
  }
</style>
