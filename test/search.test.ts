import { create, insertWithHooks } from '@lyrasearch/lyra'
import { advancedSearch } from 'src'
import { afterInsertAdvancedQuery } from 'src/hooks/after-insert'
import t from 'tap' 

t.test('Advanced search' , async t => {
  const lyra = create({
    schema: {
      'author': 'string',
      'alive': 'boolean',
      'booksSold': 'number'
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery
    }
  })

  const idDead = await insertWithHooks(lyra, { author: 'Dead', 'alive': false, booksSold: 1233 })
  const idAlive = await insertWithHooks(lyra, {author: 'Alive', 'alive': true, booksSold: 123}) 
  
  const ids = advancedSearch(lyra, {
    where: { alive: true },
    term: 'alive'
  })

  t.same(ids.size, 1)
  t.ok(ids.has(idAlive.id))
  t.end()
})