// keeps ordering
export function eliminateDuplicates<O>(arr: O[], property: keyof O): O[] {
  const seenIds = new Set();
  return arr.filter(obj => {
    if (!seenIds.has(obj[property])) {
      seenIds.add(obj[property]);
      return true;
    }
    return false;
  });
}

// keeps ordering
export function groupBy<K, O>(arr: O[], keyFn: (obj: O) => K): Map<K, O[]> {
  return arr.reduce((acc, obj) => {
    const keyValue = keyFn(obj);
    if (!acc.has(keyValue)) {
      acc.set(keyValue, []);
    }
    acc.get(keyValue).push(obj);
    return acc;
  }, new Map());
}

export function sum(numbers: number[] | BigInt[]) {
  return (numbers as number[]).reduce((total, num) => (total as number) + num, typeof numbers[0] === 'number' ? 0 : BigInt(0));
}
