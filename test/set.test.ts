import { setIntersection } from 'src/utils/set';
import t from 'tap';

t.test('Set intersection', (t) => {
  t.test('Should return the second set if the first one is nullish', (t) => {
    const a = new Set();
    const b = new Set();
    b.add(1);

    t.same(setIntersection(a, b).entries(), b.entries());
    t.end();
  });

  t.test('Should return the first set if the second one is nullish', (t) => {
    const b = new Set();
    const a = new Set();
    a.add(1);

    t.same(setIntersection(a, b).entries(), a.entries());
    t.end();
  });

  t.test('Should return the element in common', (t) => {
    const b = new Set([1, 2, 3, 7]);
    const a = new Set([2, 3, 4]);

    const result = setIntersection(a, b);
    const expected = [2, 3];
    t.same([...result], expected);
    t.end();
  });

  t.end();
});
