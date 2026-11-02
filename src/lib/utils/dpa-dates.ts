const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

export function parseDateInputValue(value: string): Date | null {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getSignedDateMax(): string {
  return toDateInputValue(new Date());
}

export function getReviewDateMin(): string {
  return toDateInputValue(new Date());
}

export function validateDpaDates(input: {
  signedDate?: string | null;
  reviewDate?: string | null;
}): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (input.signedDate) {
    const signed = parseDateInputValue(input.signedDate);

    if (!signed) {
      return "Signed date is invalid.";
    }

    signed.setHours(0, 0, 0, 0);

    if (signed.getTime() > today.getTime()) {
      return "Signed date cannot be in the future.";
    }
  }

  if (input.reviewDate) {
    const review = parseDateInputValue(input.reviewDate);

    if (!review) {
      return "Review date is invalid.";
    }

    review.setHours(0, 0, 0, 0);

    if (review.getTime() < today.getTime()) {
      return "Review date cannot be in the past.";
    }
  }

  return null;
}

export function isDpaReviewDue(reviewDate: string | null): boolean {
  if (!reviewDate) {
    return true;
  }

  const review = parseDateInputValue(reviewDate);

  if (!review) {
    return true;
  }

  review.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return review.getTime() <= today.getTime();
}

export function toDateInputValueFromIso(iso: string | null): string {
  if (!iso) {
    return "";
  }

  const parsed = parseDateInputValue(iso);

  if (!parsed) {
    return "";
  }

  return toDateInputValue(parsed);
}
