[![codecov](https://codecov.io/gh/DanieleFedeli/lyra-advanced-query-plugin/branch/main/graph/badge.svg?token=BAGG76Q4YQ)](https://codecov.io/gh/DanieleFedeli/lyra-advanced-query-plugin) [![Test CI](https://github.com/DanieleFedeli/lyra-advanced-query-plugin/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/DanieleFedeli/lyra-advanced-query-plugin/actions/workflows/test.yml) [![Lint CI](https://github.com/DanieleFedeli/lyra-advanced-query-plugin/actions/workflows/lint.yml/badge.svg)](https://github.com/DanieleFedeli/lyra-advanced-query-plugin/actions/workflows/lint.yml)

# Lyra's advanced query plugin

This package is a plugin (experimental) for [Lyra](https://lyrajs.io/) that aims to enhance lyra retrieval possibility.

## Usage

### Initialize Lyra

```typescript
import lyra from '@lyrasearch/lyra';
import {
  advancedSearch,
  afterInstertAdvancedQuery,
} from 'lyra-advanced-query-plugin';

const db = lyra.create({
  schema: {
    author: 'string',
    alive: 'boolean',
    age: 'number',
  },
  hooks: {
    afterInsert: afterInstertAdvancedQuery,
  },
});

await insertWithHooks(lyrs, {
  alive: false,
  author: 'Daniele Fedeli',
  age: 25,
});

const result = advancedSearch(lyra, {
  where: { alive: true, age: { '=': 25 } },
  term: 'Daniele',
});
```
