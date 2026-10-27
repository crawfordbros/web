import { describe, expect, it } from "vitest";
import { fitWithin } from "./images";

describe("fitWithin", () => {
  it("keeps images that already fit", () => {
    expect(fitWithin(1200, 900, 1600)).toEqual({ width: 1200, height: 900 });
  });

  it("scales the longest side down to the limit, keeping the aspect ratio", () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });
});
