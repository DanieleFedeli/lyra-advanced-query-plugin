type ComparePredicate<TArrayElement> = (current: TArrayElement) => number;

// Assume the array is sorted
export function binarySearch<TArrayElement>(
  array: TArrayElement[],
  comparePredicate: ComparePredicate<TArrayElement>
): number {
  if (array.length === 0) return -1;

  let start = 0;
  let end = array.length - 1;

  while (start <= end) {
    const mIndex = Math.floor((start + end) / 2);
    const compareResult = comparePredicate(array[mIndex]);
    if (compareResult === 0) return mIndex;
    else if (compareResult < 0) start = mIndex + 1;
    else end = mIndex - 1;
  }

  return -1;
}
