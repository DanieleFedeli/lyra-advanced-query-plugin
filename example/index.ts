import lyra, { insertWithHooks } from '@lyrasearch/lyra';

import { afterInsertAdvancedQuery } from '../src/hooks/after-insert';
import { advancedSearch } from '../src/index';

async function init() {
  const db = lyra.create({
    schema: {
      author: 'string',
      alive: 'boolean',
      age: 'number',
    },
    hooks: {
      afterInsert: afterInsertAdvancedQuery,
    },
  });

  await insertWithHooks(db, { author: 'Daniele', alive: true, age: 25 });
  await insertWithHooks(db, { author: 'Daniele', alive: false, age: 25 });

  const result = advancedSearch(db, {
    where: { alive: true },
    term: 'Daniele',
  });
  // Retrieve only the first document.
}

init();
