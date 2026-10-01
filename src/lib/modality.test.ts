import { describe, expect, it } from "vitest";

import { usingKeyboard } from "./modality";

describe("usingKeyboard", () => {
  it("follows the last kind of input", () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    expect(usingKeyboard()).toBe(true);
    document.dispatchEvent(new Event("pointerdown"));
    expect(usingKeyboard()).toBe(false);
  });
});
