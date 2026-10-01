// The icons an "icon" control offers: a handful, imported up front. The icon browser loads the
// whole set lazily instead.
import type { Component } from "svelte";
import {
  ArrowsClockwise,
  Bell,
  Chat,
  Check,
  Copy,
  FloppyDisk,
  Folder,
  Gear,
  GitBranch,
  GitPullRequest,
  Hash,
  Heart,
  MagnifyingGlass,
  Note,
  PencilSimple,
  Plus,
  PushPin,
  Star,
  Trash,
  Tray,
  Warning,
  X,
} from "purr/icons";

export const ICONS: Record<string, Component<any>> = {
  ArrowsClockwise,
  Bell,
  Chat,
  Check,
  Copy,
  FloppyDisk,
  Folder,
  Gear,
  GitBranch,
  GitPullRequest,
  Hash,
  Heart,
  MagnifyingGlass,
  Note,
  PencilSimple,
  Plus,
  PushPin,
  Star,
  Trash,
  Tray,
  Warning,
  X,
};

export const ICON_NAMES = Object.keys(ICONS);
