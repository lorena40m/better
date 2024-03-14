// keeps ordering
export function eliminateDuplicates<O>(arr: O[], property: keyof O = null): O[] {
  const seenIds = new Set();
  return arr.filter(obj => {
    const item = property ? obj[property] : obj;
    if (!seenIds.has(item)) {
      seenIds.add(item);
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

export function sum<N extends number | BigInt>(numbers: N[]): N {
  return numbers.reduce(
    (total, num) => (total as number) + (num as number) as N,
    (typeof numbers[0] === 'number' ? 0 : BigInt(0)) as N
  );
}
