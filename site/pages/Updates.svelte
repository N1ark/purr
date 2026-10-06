<script lang="ts">
  import {
    Banner,
    Button,
    CHECK_INTERVAL,
    Switch,
    createUpdater,
    dueForCheck,
    formatRelative,
    noteLines,
    noteSummary,
    toast,
    type UpdateInfo,
  } from "purr";
  import { ArrowDown } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const NOTES = `## Added

- Menus walk with the arrows
- A palette for everything,
  ranked as you type

## Fixed

- Tooltips no longer flicker
- The sheet settles on its stop`;

  let found = $state(true);
  let failDownload = $state(false);

  const make = () =>
    createUpdater({
      check: () =>
        new Promise<UpdateInfo | null>((resolve) =>
          setTimeout(() => resolve(found ? { version: "0.2.0", notes: NOTES } : null), 600),
        ),
      download: () =>
        new Promise<void>((resolve, reject) =>
          setTimeout(
            () => (failDownload ? reject(new Error("The network went away")) : resolve()),
            900,
          ),
        ),
      restart: async () => {
        toast("Restarting…");
      },
    });
  let updater = $state.raw(make());

  const busy = $derived(updater.stage === "checking" || updater.stage === "downloading");

  async function check() {
    const info = await updater.check(true);
    if (!info && !updater.error) toast("Up to date");
  }

  let hoursAgo = $state(4);
</script>

<PageHeader
  title="createUpdater"
  description="The self-update cycle as runes: check quietly, download, restart when asked. Native calls are passed in, so nothing imports Tauri."
  importLine={`import { createUpdater, noteSummary, Banner } from "purr";`}
  source="src/lib/updater.svelte.ts"
/>

<Section
  title="The cycle"
  description="`check(true)` is a manual check: it always runs and records its error. Once downloaded, the stage is `ready`."
  code={`const updater = createUpdater({
  check: () => invoke("check_update"),     // UpdateInfo | null
  download: (info) => invoke("download_update"),
  restart: () => invoke("restart"),
});
$effect(() => updater.start());           // automatic checks, every 6 hours

{#if updater.ready && !updater.dismissed && updater.info}
  <Banner
    title="Version {updater.info.version} is ready"
    lines={noteSummary(updater.info.notes ?? "")}
    ondismiss={() => updater.dismiss()}
  >
    {#snippet actions()}
      <Button variant="primary" size="sm" onclick={() => updater.restart()}>Restart</Button>
    {/snippet}
  </Banner>
{/if}`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <Button loading={busy} onclick={check}>Check for updates</Button>
      {#if updater.ready}
        <Button variant="ghost" onclick={() => (updater = make())}>Start over</Button>
      {/if}
      <Switch label="An update exists" bind:checked={found} />
      <span class="muted">an update exists</span>
      <Switch label="The download fails" bind:checked={failDownload} />
      <span class="muted">the download fails</span>
    </div>
    <div class="s-row">
      <span class="s-out">stage: {updater.stage}</span>
      <span class="s-out">error: {updater.error ?? "null"}</span>
      <span class="s-out"
        >checkedAt: {updater.checkedAt ? formatRelative(updater.checkedAt) : "never"}</span
      >
    </div>
    {#if updater.ready && !updater.dismissed && updater.info}
      <Banner
        placement="inline"
        icon={ArrowDown}
        title="Version {updater.info.version} is ready — restart to apply"
        lines={noteSummary(updater.info.notes ?? "")}
        ondismiss={() => updater.dismiss()}
        dismissLabel="Not now"
      >
        {#snippet actions()}
          <Button variant="primary" size="sm" onclick={() => updater.restart()}>Restart</Button>
        {/snippet}
      </Banner>
    {:else if updater.ready && updater.dismissed}
      <span class="muted">Dismissed: the update still waits in settings.</span>
    {/if}
  </div>
</Section>

<Section
  title="noteLines and noteSummary"
  description="Release notes flattened to plain lines; `noteSummary` drops headings and keeps the first few."
  code={`noteSummary(notes)    // ${JSON.stringify(noteSummary(NOTES))}`}
  block
>
  <div class="s-grid">
    <pre class="s-box notes">{NOTES}</pre>
    <div class="s-stack">
      <span class="s-label">noteLines</span>
      {#each noteLines(NOTES) as line, i (i)}
        <span class="s-out" class:heading={line.heading}
          >{line.heading ? "# " : "· "}{line.text}</span
        >
      {/each}
    </div>
  </div>
</Section>

<Section
  title="dueForCheck"
  description="Whether enough time has passed since the last check (a clock that went backwards counts as yes)."
  code={`dueForCheck(last, Date.now(), CHECK_INTERVAL) // CHECK_INTERVAL = ${CHECK_INTERVAL} (6 hours)`}
>
  <label class="s-row field"
    >last check <input
      class="field-input num"
      type="number"
      min="0"
      max="48"
      bind:value={hoursAgo}
    /> hours ago</label
  >
  <span class="s-out"
    >→ {dueForCheck(Date.now() - hoursAgo * 3_600_000, Date.now(), CHECK_INTERVAL)}</span
  >
</Section>

<style>
  .notes {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--fs-sm);
    white-space: pre-wrap;
  }
  .heading {
    font-weight: 600;
  }
  .field {
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .num {
    width: 72px;
  }
</style>
