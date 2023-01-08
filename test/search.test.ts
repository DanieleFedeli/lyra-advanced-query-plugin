import { create, insertWithHooks } from '@lyrasearch/lyra';
import { advancedSearch } from 'src';
import { afterInsertAdvancedQuery } from 'src/hooks/after-insert';
import t from 'tap';

t.test('Advanced search with right term', async (t) => {
  const lyra = create({
    schema: {
      author: 'string',
      alive: 'boolean',
      booksSold: 'number',
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery,
    },
  });

  const idDead = await insertWithHooks(lyra, {
    author: 'Dead',
    alive: false,
    booksSold: 1233,
  });
  const idAlive1 = await insertWithHooks(lyra, {
    author: 'Alive',
    alive: true,
    booksSold: 123,
  });
  const idAlive2 = await insertWithHooks(lyra, {
    author: 'Alive',
    alive: true,
    booksSold: 1234,
  });

  const resultsAlive = advancedSearch(lyra, {
    where: { alive: true },
    term: 'alive',
  });

  t.same(resultsAlive.hits.length, 2);
  t.same(resultsAlive.hits[0].id, idAlive1.id);

  const resultsDead = advancedSearch(lyra, {
    where: { alive: false },
    term: 'Dead',
  });
  t.same(resultsDead.hits.length, 1);
  t.same(resultsDead.hits[0].id, idDead.id);

  t.end();
});

t.test(
  'Advanced search with right term but where query produces 1 results',
  async (t) => {
    const lyra = create({
      schema: {
        author: 'string',
        alive: 'boolean',
        booksSold: 'number',
      },
      hooks: {
        afterInsert: afterInsertAdvancedQuery,
      },
    });

    await insertWithHooks(lyra, {
      author: 'Alive',
      alive: false,
      booksSold: 1233,
    });
    await insertWithHooks(lyra, {
      author: 'Alive',
      alive: true,
      booksSold: 123,
    });

    const resultsAlive = advancedSearch(lyra, {
      where: { alive: true },
      term: 'Alive',
    });

    t.same(resultsAlive.hits.length, 1);

    t.end();
  }
);

t.test('Advanced search with numbers', async (t) => {
  const lyra = create({
    schema: {
      author: 'string',
      alive: 'boolean',
      booksSold: 'number',
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery,
    },
  });

  await insertWithHooks(lyra, {
    author: 'Alive',
    alive: false,
    booksSold: 1233,
  });
  await insertWithHooks(lyra, { author: 'Alive', alive: true, booksSold: 123 });

  const resultsAlive = advancedSearch(lyra, {
    where: { booksSold: { '=': 1233 } },
    term: 'Alive',
  });

  t.same(resultsAlive.hits.length, 1);

  const resultAliveLE = advancedSearch(lyra, {
    where: { booksSold: { '<=': 1233 } },
    term: 'Alive',
  });

  t.same(resultAliveLE.hits.length, 2);

  const resultAliveL = advancedSearch(lyra, {
    where: { booksSold: { '<': 1233 } },
    term: 'Alive',
  });

  t.same(resultAliveL.hits.length, 1);

  const resultAliveG = advancedSearch(lyra, {
    where: { booksSold: { '>': 1233 } },
    term: 'Alive',
  });

  t.same(resultAliveG.hits.length, 0);

  const resultAliveGT = advancedSearch(lyra, {
    where: { booksSold: { '>=': 1233 } },
    term: 'Alive',
  });

  t.same(resultAliveGT.hits.length, 1);
  t.end();
});

t.test('Search with nested properties', async (t) => {
  const lyra = create({
    schema: {
      author: {
        name: 'string',
        age: 'number',
        alive: 'boolean',
      },
      booksSold: 'number',
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery,
    },
  });

  const { id: danieleID } = await insertWithHooks(lyra, {
    author: { name: 'Daniele', alive: true, age: 69 },
    booksSold: 1233,
  });
  const { id: antonioID } = await insertWithHooks(lyra, {
    author: { name: 'Antonio', alive: false, age: 103 },
    booksSold: 123,
  });

  const resultAlive = advancedSearch(lyra, {
    term: 'Daniele',
    where: { author: { alive: true } },
  });
  t.same(resultAlive.hits.length, 1);
  t.same(resultAlive.hits[0].id, danieleID);

  t.end();
});
