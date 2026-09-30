<script lang="ts">
  // A count in a capsule, a circle at one digit. Rendered once per row: keep it bare.
  interface Props {
    count: number;
    /** `accent` unread, `danger` a direct mention or an error, `soft` a count that is not news. */
    tone?: "accent" | "danger" | "soft";
    /** A floor rather than a total: drawn with the "+" the cap also uses. */
    partial?: boolean;
    /** Counts above this are drawn as `max+`. */
    max?: number;
  }

  const { count, tone = "accent", partial = false, max = 999 }: Props = $props();
</script>

<span class="badge {tone}">{count > max ? max : count}{count > max || partial ? "+" : ""}</span>

<style>
  .badge {
    display: inline-block;
    flex: none;
    min-width: var(--badge);
    height: var(--badge);
    padding: 0 var(--gap-1);
    border-radius: var(--radius-pill);
    background: var(--theme);
    font-size: var(--fs-nano);
    font-weight: 600;
    line-height: var(--badge);
    font-variant-numeric: tabular-nums;
    text-align: center;
    color: var(--on-accent);
  }
  .danger {
    background: var(--danger);
    color: var(--on-danger);
  }
  .soft {
    background: var(--bg3);
    color: var(--muted);
  }
</style>
