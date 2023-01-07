import { create, insert, insertWithHooks } from "@lyrasearch/lyra";
import { booleanIndex, numericIndex } from "src";
import { afterInsertAdvancedQuery } from "src/hooks/after-insert";
import t from "tap";

t.test("After insert hook", t => {

  t.test('Should index the new inserted documents', async t => {
    const lyra = create({
      schema: {
        author: 'string',
        booksSold: 'number',
        alive: 'boolean'
      },
      hooks: { afterInsert: afterInsertAdvancedQuery },
    })

    const res = await insertWithHooks(lyra, { 'alive': false, booksSold: 123, 'author': "Random name" })

    const resultNumber = numericIndex.get('booksSold_123')
    const resultBoolean = booleanIndex.get('alive_false')

    t.ok(resultNumber)
    t.ok(resultBoolean)

    t.ok(resultBoolean?.has(res.id))
    t.end()
  })
  t.end()
})