import t from 'tap'
import { binarySearch } from "../src/utils/binary-search";

t.test('binary search', t => {

  t.test('If array is empty should return -1', t => {
    t.same(binarySearch([], (a => a - 1)), -1)
    t.end()
  })

  t.test('Should return -1 if the element is not present', t => {
    t.same(binarySearch([1, 2, 3 ,4], _ => -1), -1)
    t.end()
  })

  t.test('Should return the index if the element is present', t => {
    t.same(binarySearch([1, 2, 3, 4], value => value - 2), 1)
    t.end()
  })

  t.end()
})
