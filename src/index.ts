// The purr barrel. Each section is owned by one area; keep entries sorted within it.

// ---- styling primitives: components ----
export { default as Avatar } from "./components/Avatar.svelte";
export { default as AvatarStack } from "./components/AvatarStack.svelte";
export { default as Badge } from "./components/Badge.svelte";
export { default as Button } from "./components/Button.svelte";
export { default as Callout } from "./components/Callout.svelte";
export { default as Checkbox } from "./components/Checkbox.svelte";
export { default as Chip } from "./components/Chip.svelte";
export { default as ColorGrid } from "./components/ColorGrid.svelte";
export { default as ConfirmButton } from "./components/ConfirmButton.svelte";
export { default as EmptyState } from "./components/EmptyState.svelte";
export { default as Field } from "./components/Field.svelte";
export { default as Footnote } from "./components/Footnote.svelte";
export { default as FootnoteRef } from "./components/FootnoteRef.svelte";
export { default as Heading } from "./components/Heading.svelte";
export { default as IconButton } from "./components/IconButton.svelte";
export { default as LiveRegion } from "./components/LiveRegion.svelte";
export { default as PanelHeader } from "./components/PanelHeader.svelte";
export { default as PresenceDot } from "./components/PresenceDot.svelte";
export { default as ProgressRing } from "./components/ProgressRing.svelte";
export { default as SearchInput } from "./components/SearchInput.svelte";
export { default as Segmented } from "./components/Segmented.svelte";
export { default as SettingGroup } from "./components/SettingGroup.svelte";
export { default as SettingRow } from "./components/SettingRow.svelte";
export { default as Spinner } from "./components/Spinner.svelte";
export { default as Switch } from "./components/Switch.svelte";
export { default as Tag } from "./components/Tag.svelte";
export { default as TextArea } from "./components/TextArea.svelte";
export { default as TextField } from "./components/TextField.svelte";
export { default as Twisty } from "./components/Twisty.svelte";

// ---- behaviour: components ----
export { default as ActionSheet } from "./components/ActionSheet.svelte";
export { default as Banner } from "./components/Banner.svelte";
export { default as CommandPalette } from "./components/CommandPalette.svelte";
export { default as ContextMenuHost } from "./components/ContextMenuHost.svelte";
export { default as DialogHost } from "./components/DialogHost.svelte";
export { default as Highlight } from "./components/Highlight.svelte";
export { default as Kbd } from "./components/Kbd.svelte";
export { default as Lightbox } from "./components/Lightbox.svelte";
export { default as Masonry } from "./components/Masonry.svelte";
export { default as MonthGrid } from "./components/MonthGrid.svelte";
export { default as MonthScroller } from "./components/MonthScroller.svelte";
export { default as DatePicker } from "./components/DatePicker.svelte";
export { default as TimePicker } from "./components/TimePicker.svelte";
export { default as Menu } from "./components/Menu.svelte";
export { default as Modal } from "./components/Modal.svelte";
export { default as Popover } from "./components/Popover.svelte";
export { default as ResizeEdge } from "./components/ResizeEdge.svelte";
export { default as SettingsLayout } from "./components/SettingsLayout.svelte";
export { default as Sheet } from "./components/Sheet.svelte";
export { default as ShortcutList } from "./components/ShortcutList.svelte";
export { default as ShortcutsOverlay } from "./components/ShortcutsOverlay.svelte";
export { default as TableOfContents } from "./components/TableOfContents.svelte";
export { default as ThemeScript } from "./components/ThemeScript.svelte";
export { default as ToastHost } from "./components/ToastHost.svelte";
export { default as VirtualList } from "./components/VirtualList.svelte";
export type {
  LightboxItem,
  PaletteItem,
  Presence,
  RowState,
  SettingsGroup,
  SettingsSection,
} from "./components/types";

// ---- actions ----
export { dragList, dropIndex, type DragListParams } from "./actions/dragList";
export {
  autofocus,
  focusTrap,
  focusables,
  rememberFocus,
  type AutofocusOptions,
} from "./actions/focus";
export { draggedSize, resizer, type ResizeParams, type ResizeSide } from "./actions/resize";
export {
  tooltip,
  type TooltipContent,
  type TooltipOptions,
  type TooltipSource,
} from "./actions/tooltip";

// ---- utilities ----
export { copyText } from "./lib/clipboard";
export {
  AA_NON_TEXT,
  AA_TEXT,
  colorFromSeed,
  contrastRatio,
  hashString,
  initials,
  parseColor,
  readableOn,
  relativeLuminance,
  toHex,
  toOklch,
} from "./lib/color";
export {
  confirmAction,
  dialog,
  promptText,
  type DialogField,
  type DialogSpec,
  type DialogValues,
} from "./lib/dialog.svelte";
export { IS_BROWSER, IS_TAURI, detectMobile, isMobile } from "./lib/env";
export {
  EXACT,
  PREFIX,
  SUBSEQUENCE,
  SUBSTRING,
  WORD_START,
  byName,
  escapeRegExp,
  fuzzyMatch,
  highlightRuns,
  matchScore,
  matchTier,
  matchesAny,
  rank,
  type Match,
  type RankOptions,
  type Ranked,
  type Run,
  type Tier,
} from "./lib/fuzzy";
export { inlineCodeLang, type InlineCode } from "./lib/inlineCode";
export {
  accelerator,
  createKeymap,
  formatShortcut,
  helpGroups,
  isTyping,
  matches,
  onEscape,
  parseShortcut,
  resolveKey,
  shortcutParts,
  shortcutSteps,
  type Binding,
  type HelpEntry,
  type HelpGroup,
  type HelpOptions,
  type KeyContext,
  type KeyLike,
  type Keymap,
  type Resolution,
  type Shortcut,
} from "./lib/keys";
export {
  entries,
  isItem,
  menu,
  type MaybeEntry,
  type MenuAnchor,
  type MenuColors,
  type MenuControl,
  type MenuCustom,
  type MenuEntry,
  type MenuHeading,
  type MenuItem,
  type MenuSource,
} from "./lib/menu.svelte";
export {
  closeAllOverlays,
  closeTopOverlay,
  hasOverlay,
  registerOverlay,
  type OverlayOptions,
} from "./lib/overlays.svelte";
export { liveTheme } from "./lib/liveTheme.svelte";
export { columnCount, packColumns } from "./lib/masonry";
export { firstWeekday, monthGrid, type CalendarDay } from "./lib/calendar";
export { persisted, persistedFlag } from "./lib/persisted.svelte";
export { usingKeyboard } from "./lib/modality";
export {
  MOD,
  applyPlatform,
  detectOs,
  isMac,
  isMobileLayout,
  os,
  pinWindowScroll,
  trackKeyboard,
  type KeyboardSource,
  type OsName,
  type PlatformOptions,
} from "./lib/platform";
export { place, toRect, type Placement, type Point, type Rect, type Size } from "./lib/position";
export { lockScroll } from "./lib/scrollLock";
export {
  memoryStorage,
  readFlag,
  readJson,
  readString,
  writeFlag,
  writeJson,
  writeString,
} from "./lib/storage";
export {
  ACCENTS,
  DEFAULT_ACCENT,
  accentById,
  accentSwatch,
  accentVars,
  applyTheme,
  bootTheme,
  currentTheme,
  onThemeChange,
  readStoredTheme,
  resolveTheme,
  storedThemeMode,
  systemTheme,
  themeScript,
  type Accent,
  type Density,
  type ResolvedTheme,
  type ThemeMode,
  type ThemeOptions,
} from "./lib/theme";
export {
  addDays,
  dayKey,
  daysBetween,
  formatAbsolute,
  formatClock,
  formatClockIn,
  formatDate,
  formatDay,
  formatFull,
  formatMonth,
  formatRelative,
  formatWeekday,
  isSameDay,
  isoDate,
  parseTime,
  setTwentyFourHourClock,
  startOfDay,
  toDate,
  type DateOptions,
  type DateStyle,
  type DayLabels,
  type TimeInput,
} from "./lib/time";
export {
  headingsIn,
  tocRows,
  uniqueSlug,
  type HeadingsOptions,
  type TocItem,
  type TocRow,
} from "./lib/toc";
export { toast, toasts, type Toast, type ToastKind, type ToastOptions } from "./lib/toast.svelte";
export {
  Updater,
  createUpdater,
  type UpdateInfo,
  type UpdateStage,
  type UpdaterOptions,
} from "./lib/updater.svelte";
export { CHECK_INTERVAL, dueForCheck, noteLines, noteSummary } from "./lib/updates";
export { clamp, errorMessage, lruCache, moveItem, slugify, topK, type Lru } from "./lib/util";
export { fixedRange, offsets, rowAt, variableRange } from "./lib/virtual";
