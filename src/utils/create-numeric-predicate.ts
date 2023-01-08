import { NumberComparison } from '../types';

export function createNumericPredicate<TArray>(
  operator: keyof NumberComparison,
  index: number
) {
  switch (operator) {
    case '<':
      return (array: TArray[]) => array.slice(0, index);
    case '<=':
      return (array: TArray[]) => array.slice(0, index + 1);
    case '>':
      return (array: TArray[]) => array.slice(index + 1);
    case '>=':
      return (array: TArray[]) => array.slice(index);
    default:
      return (array: TArray[]) => array;
  }
}
