export function setIntersection<T = unknown>(a: Set<T>, b: Set<T>): Set<T> {
  if (!a.size) return b;
  if (!b.size) return a;

  const smallerSet = a.size > b.size ? b : a;
  const biggerSet = a.size > b.size ? a : b;
  const insersection = new Set<T>();
  for (const element of smallerSet) {
    if (biggerSet.has(element)) insersection.add(element);
  }
  return insersection;
}
