import { describe, expect, it } from "vitest";
import { rebalanceWeights } from "../weights";

/** Mirrors core/src/modules/rubric/__tests__/weights.test.ts fixtures. */
describe("rebalanceWeights parity", () => {
  it("sums to 100 for three items", () => {
    const items = rebalanceWeights(
      [
        { weight: 50, label: "a" },
        { weight: 30, label: "b" },
        { weight: 20, label: "c" },
      ],
      100,
    );
    expect(items.reduce((s, i) => s + i.weight, 0)).toBe(100);
  });
});