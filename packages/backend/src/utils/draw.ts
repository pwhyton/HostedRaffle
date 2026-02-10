import { randomInt } from 'crypto';

/**
 * Fisher-Yates shuffle using cryptographically secure random.
 * Returns the first `count` items from the shuffled array.
 */
export function secureDrawWinners<T>(items: T[], count: number): T[] {
  if (count > items.length) {
    throw new Error(`Cannot draw ${count} winners from ${items.length} tickets`);
  }

  const arr = [...items];

  // Fisher-Yates shuffle (partial - only need `count` positions)
  for (let i = arr.length - 1; i > arr.length - 1 - count && i > 0; i--) {
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(arr.length - count).reverse();
}
