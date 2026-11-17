/** Keep in sync with core/src/modules/rubric/lint.ts */
import type { LlmItem } from "./schema";

const LEGAL_CONTEXT =
  /\b(licen[cs]e|certif\w*|registration|legal(ly)? required|regulat\w*)\b/i;

export const FLAGGED_TERMS: ReadonlyArray<{ term: string; pattern: RegExp }> = [
  { term: "age", pattern: /\bage\b/i },
  { term: "gender", pattern: /\bgender\b/i },
  { term: "race", pattern: /\brace\b/i },
  { term: "religion", pattern: /\breligio\w*/i },
  { term: "disability", pattern: /\bdisabilit\w*/i },
  { term: "nationality", pattern: /\bnationality\b/i },
  { term: "culture fit", pattern: /\bculture fit\b/i },
  { term: "personality", pattern: /\bpersonality\b/i },
];

export type LintViolation = { label: string; reason: string };

function isRightToWorkException(field: string, term: string): boolean {
  if (term !== "nationality" && term !== "citizen") return false;
  return /\bright to work\b/i.test(field);
}

function isLegalLicenceException(
  item: LlmItem,
  field: string,
  term: string,
): boolean {
  const source = item.sourceText ?? "";
  if (!source.toLowerCase().includes(term.toLowerCase())) return false;
  return LEGAL_CONTEXT.test(field);
}

function fieldViolations(
  item: LlmItem,
  fieldName: string,
  text: string,
): LintViolation[] {
  const hits: LintViolation[] = [];
  for (const { term, pattern } of FLAGGED_TERMS) {
    if (!pattern.test(text)) continue;
    if (isRightToWorkException(text, term)) continue;
    if (isLegalLicenceException(item, text, term)) continue;
    hits.push({
      label: item.label,
      reason: `references ${term} in ${fieldName}`,
    });
    break;
  }
  return hits;
}

function lintItem(item: LlmItem): LintViolation[] {
  const violations: LintViolation[] = [];
  violations.push(...fieldViolations(item, "label", item.label));
  violations.push(...fieldViolations(item, "description", item.description));
  if (item.evidenceGuidance) {
    violations.push(
      ...fieldViolations(item, "evidenceGuidance", item.evidenceGuidance),
    );
  }
  for (const level of item.levels) {
    violations.push(
      ...fieldViolations(item, `level "${level.key}"`, level.description),
    );
  }
  return violations;
}

export function lintRubric(items: LlmItem[]): {
  clean: LlmItem[];
  violations: LintViolation[];
} {
  const clean: LlmItem[] = [];
  const violations: LintViolation[] = [];

  for (const item of items) {
    const itemViolations = lintItem(item);
    if (itemViolations.length === 0) {
      clean.push(item);
    } else {
      violations.push(itemViolations[0]);
    }
  }

  return { clean, violations };
}