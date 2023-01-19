import { create, insertWithHooks } from '@lyrasearch/lyra';

import { afterInsertAdvancedQuery } from '../src/hooks/after-insert';
import { advancedSearch } from '../src/index';

async function init() {
  const db = await create({
    schema: {
      author: 'string',
      alive: 'boolean',
      age: 'number',
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery,
    },
  });

  const { id: danieleID } = await insertWithHooks(db, {
    author: 'Daniele',
    alive: true,
    age: 25,
  });
  await insertWithHooks(db, { author: 'Daniele', alive: false, age: 25 });

  // Retrieve only the first document.
  const result = await advancedSearch(db, {
    where: { alive: true },
    term: 'Daniele',
  });
}

init();
