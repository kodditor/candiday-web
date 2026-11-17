/** Keep in sync with core/src/modules/rubric/weights.ts */
export function rebalanceWeights<T extends { weight: number }>(
  items: T[],
  targetTotal = 100,
): T[] {
  const n = items.length;
  if (n === 0) {
    throw new Error("rebalanceWeights: no items");
  }
  if (n > targetTotal) {
    throw new Error(
      `rebalanceWeights: ${n} items cannot each be at least 1 with target ${targetTotal}`,
    );
  }

  const surplus = targetTotal - n;
  const weightSum = items.reduce((s, i) => s + i.weight, 0);
  const useEqual = weightSum <= 0;

  type Slot = { idx: number; floor: number; frac: number };
  const slots: Slot[] = items.map((item, idx) => {
    const proportion = useEqual ? 1 / n : item.weight / weightSum;
    const exact = proportion * surplus;
    const floor = Math.floor(exact);
    return { idx, floor, frac: exact - floor };
  });

  let distributed = slots.reduce((s, slot) => s + slot.floor, 0);
  const remainder = surplus - distributed;

  const order = [...slots].sort((a, b) => {
    if (b.frac !== a.frac) return b.frac - a.frac;
    return a.idx - b.idx;
  });

  const bonus = new Map<number, number>();
  for (let i = 0; i < remainder; i++) {
    const slot = order[i % order.length];
    bonus.set(slot.idx, (bonus.get(slot.idx) ?? 0) + 1);
  }

  return items.map((item, idx) => {
    const slot = slots[idx];
    const weight = 1 + slot.floor + (bonus.get(idx) ?? 0);
    return { ...item, weight };
  });
}