import { afterEach, describe, expect, it } from "vitest";

import { applyPlatform, detectOs, trackKeyboard } from "./platform";

describe("detectOs", () => {
  it("reads the desktop platforms", () => {
    expect(detectOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("macos");
    expect(detectOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
    expect(detectOs("Mozilla/5.0 (X11; Linux x86_64)")).toBe("linux");
  });

  it("tells a phone from the Mac its user agent also names", () => {
    expect(detectOs("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
    expect(detectOs("Mozilla/5.0 (Linux; Android 14)")).toBe("android");
  });
});

describe("applyPlatform", () => {
  afterEach(() => {
    document.body.className = "";
    document.documentElement.removeAttribute("data-os");
  });

  it("marks the document and leaves the desktop layout alone by default", () => {
    applyPlatform();
    expect(document.documentElement.dataset.os).toBeTruthy();
    expect(document.body.classList.contains("mobile")).toBe(false);
  });

  it("turns the phone layout on, and off again on teardown", () => {
    const stop = applyPlatform({ mobile: true, keyboard: () => () => {} });
    expect(document.body.classList.contains("mobile")).toBe(true);
    stop();
    expect(document.body.classList.contains("mobile")).toBe(false);
  });
});

describe("trackKeyboard", () => {
  it("writes what a native source reports into --kb and body.keyboard", () => {
    let report: (px: number) => void = () => {};
    const stop = trackKeyboard((cb) => {
      report = cb;
    });
    report(301.6);
    expect(document.documentElement.style.getPropertyValue("--kb")).toBe("302px");
    expect(document.body.classList.contains("keyboard")).toBe(true);
    report(-4);
    expect(document.documentElement.style.getPropertyValue("--kb")).toBe("0px");
    expect(document.body.classList.contains("keyboard")).toBe(false);
    stop();
  });

  it("unsubscribes from an async source that resolves after the stop", async () => {
    let unsubscribed = false;
    const stop = trackKeyboard(async () => () => (unsubscribed = true));
    stop();
    await Promise.resolve();
    await Promise.resolve();
    expect(unsubscribed).toBe(true);
  });
});
