// All of Phosphor, plus purr's hand-drawn icons in the same style and with the same props
// (`size`, `color`, `weight`, `mirrored`, SVG attributes). Each is exported with and without the
// `Icon` suffix, as Phosphor's are. `purr()` rewrites imports from here into per-file ones.
export * from "phosphor-svelte";

import type { Component } from "svelte";
import type { IconComponentProps } from "phosphor-svelte";

/** Any icon from here, for a prop or a table that names one. */
export type IconComponent = Component<IconComponentProps>;

export { default as DistributeHorizontal } from "./DistributeHorizontal.svelte";
export { default as DistributeHorizontalIcon } from "./DistributeHorizontal.svelte";
export { default as DistributeVertical } from "./DistributeVertical.svelte";
export { default as DistributeVerticalIcon } from "./DistributeVertical.svelte";
export { default as GitPullRequestClosed } from "./GitPullRequestClosed.svelte";
export { default as GitPullRequestClosedIcon } from "./GitPullRequestClosed.svelte";
export { default as GitPullRequestUnknown } from "./GitPullRequestUnknown.svelte";
export { default as GitPullRequestUnknownIcon } from "./GitPullRequestUnknown.svelte";
export { default as IssueOpened } from "./IssueOpened.svelte";
export { default as IssueOpenedIcon } from "./IssueOpened.svelte";
