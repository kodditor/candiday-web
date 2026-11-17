import { describe, expect, it } from "vitest";
import {
  canApprove,
  derivePanelPhase,
  shouldPollRubric,
} from "../machine";
import type { RubricView } from "@/lib/types/rubric.type";

const baseView: RubricView = {
  id: "r1",
  roleId: "role1",
  version: 1,
  status: "draft",
  origin: "generated",
  revision: 0,
  items: null,
  generationError: null,
  createdAt: new Date().toISOString(),
  hasUserEdits: false,
  roleChangedSinceGeneration: false,
  validation: {
    weightTotal: 100,
    errors: [],
    lintViolations: [],
  },
};

describe("rubric panel machine", () => {
  it("derives failed while role can be Draft", () => {
    expect(derivePanelPhase({ ...baseView, status: "failed" })).toBe("failed");
  });

  it("polls only while generating", () => {
    expect(shouldPollRubric({ ...baseView, status: "generating" })).toBe(true);
    expect(shouldPollRubric({ ...baseView, status: "draft" })).toBe(false);
  });

  it("gates approve on server validation", () => {
    expect(canApprove(baseView)).toBe(false);
    expect(
      canApprove({
        ...baseView,
        items: [
          {
            id: "i1",
            position: 0,
            itemHash: "a".repeat(64),
            label: "Skill",
            description: "x".repeat(20),
            requirement: "essential",
            weight: 100,
            origin: "suggested",
            levels: [
              {
                key: "meets",
                score: 1,
                description: "meets the requirement clearly",
              },
              {
                key: "partial",
                score: 0.5,
                description: "partially meets requirements",
              },
              {
                key: "not_evidenced",
                score: 0,
                description: "not evidenced in materials",
              },
            ],
          },
        ],
      }),
    ).toBe(true);
  });
});