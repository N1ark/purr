/**
 * The frontend half of self-updating, the same in every app: check quietly now and then, fetch
 * what was found, and restart only when the person says so. The native calls come in as
 * arguments, so nothing here imports Tauri.
 */

import { errorMessage } from "./util";
import { CHECK_INTERVAL, dueForCheck } from "./updates";

export interface UpdateInfo {
  version: string;
  /** The release notes, markdown; `noteSummary` makes banner lines of them. */
  notes?: string;
}

/** `ready` means downloaded and staged: restarting runs the new version. */
export type UpdateStage = "idle" | "checking" | "downloading" | "ready";

export interface UpdaterOptions<I extends UpdateInfo> {
  /** Finds an update, or null. May download it too, where the backend does both at once. */
  check: () => Promise<I | null>;
  /** Stages what `check` found; omit when `check` already did. */
  download?: (info: I) => Promise<void>;
  /** Installs and relaunches. */
  restart: (info: I) => Promise<void>;
  /** Runs before `restart`: flush saves, finish a sync. */
  beforeRestart?: () => Promise<void>;
  /** Between automatic checks (6 hours). */
  interval?: number;
  /** Before the first automatic check, so launch settles first (0). */
  delay?: number;
  /** Automatic checks are skipped while this says no (a preference); asked-for ones still run. */
  enabled?: () => boolean;
  /** When the last check ran, for an app that persists it across launches. */
  checkedAt?: number;
}

export class Updater<I extends UpdateInfo = UpdateInfo> {
  info = $state.raw<I | null>(null);
  stage = $state<UpdateStage>("idle");
  /** Set by a check somebody asked for, or by a failed download or restart. */
  error = $state<string | null>(null);
  checkedAt = $state(0);
  /** The banner was waved away; settings still knows, and so does the next start. */
  dismissed = $state(false);

  #options: UpdaterOptions<I>;

  constructor(options: UpdaterOptions<I>) {
    this.#options = options;
    this.checkedAt = options.checkedAt ?? 0;
  }

  /** Something is staged and waiting for a restart. */
  get ready(): boolean {
    return this.stage === "ready";
  }

  /**
   * Automatic checks are quiet; one somebody asked for (`manual`) records its error and always
   * runs. Resolves with what was found, so the caller can toast "up to date".
   */
  async check(manual = false): Promise<I | null> {
    if (this.stage === "checking" || this.stage === "downloading") return this.info;
    // Already staged: the next start is the new version, whoever asks again.
    if (this.stage === "ready") return this.info;
    const now = Date.now();
    const interval = this.#options.interval ?? CHECK_INTERVAL;
    if (
      !manual &&
      (this.#options.enabled?.() === false || !dueForCheck(this.checkedAt, now, interval))
    ) {
      return null;
    }

    this.stage = "checking";
    this.error = null;
    let found: I | null;
    try {
      found = await this.#options.check();
    } catch (e) {
      this.stage = "idle";
      this.checkedAt = Date.now();
      if (manual) this.error = errorMessage(e);
      return null;
    }
    this.checkedAt = Date.now();
    this.info = found;
    if (!found) {
      this.stage = "idle";
      return null;
    }
    this.dismissed = false;
    if (!this.#options.download) {
      this.stage = "ready";
      return found;
    }
    this.stage = "downloading";
    try {
      await this.#options.download(found);
      this.stage = "ready";
    } catch (e) {
      this.stage = "idle";
      this.error = errorMessage(e);
    }
    return found;
  }

  async restart(): Promise<void> {
    const info = this.info;
    if (!info || this.stage !== "ready") return;
    try {
      await this.#options.beforeRestart?.();
      await this.#options.restart(info);
    } catch (e) {
      this.error = errorMessage(e);
    }
  }

  dismiss(): void {
    this.dismissed = true;
  }

  /** Starts the automatic checks; call from the main window only. Returns the stop. */
  start(): () => void {
    const interval = this.#options.interval ?? CHECK_INTERVAL;
    const first = setTimeout(() => void this.check(), this.#options.delay ?? 0);
    // A machine left running for a week should not spend it on the version it launched with.
    const timer = setInterval(() => void this.check(), interval);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }
}

export function createUpdater<I extends UpdateInfo>(options: UpdaterOptions<I>): Updater<I> {
  return new Updater(options);
}
