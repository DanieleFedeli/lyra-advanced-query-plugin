import { PropertiesSchema, Lyra, search } from '@lyrasearch/lyra';

import { booleanIndex, numericIndex, getUsedIndexes } from './indexing';
import { QueueNode } from './sorted-queue';
import { AdvancedParams, NumberComparison } from './types';
import { createNumericPredicate } from './utils/create-numeric-predicate';
import { setIntersection } from './utils/set';

export const allowedNumericComparison = ['>=', '>', '=', '<', '<='] as const;

export function advancedSearch<S extends PropertiesSchema>(
  lyra: Lyra<S>,
  params: AdvancedParams<S>
) {
  const { where } = params;
  const { schema } = lyra;

  const retrievedBoolean = new Set<string>();
  const retrievedNumeric = new Set<string>();
  const indexes = getUsedIndexes(lyra, schema, where as any);

  for (const usedBoolean of indexes.usedBooleanIndex) {
    const documents = booleanIndex.get(usedBoolean);
    if (!documents?.size) continue;

    for (const document of documents) {
      retrievedBoolean.add(document);
    }
  }

  for (const virtualIndex of indexes.usedNumericIndex) {
    const rawIndex = virtualIndex.split('.');
    const numericKey = rawIndex.slice(0, -2).join('.');
    const operator = rawIndex[rawIndex.length - 2] as keyof NumberComparison;
    const valueSearched = Number(rawIndex[rawIndex.length - 1]);
    if (!numericIndex.has(numericKey)) continue;

    const current = numericIndex.get(numericKey)!;
    const nodeIndex = current.search(valueSearched);
    if (nodeIndex === -1) continue;

    const node = current.queue[nodeIndex];
    if (operator === '=') node.payload.forEach((v) => retrievedNumeric.add(v));
    else {
      const predicate = createNumericPredicate<QueueNode<Set<string>>>(
        operator,
        nodeIndex
      );

      const results = predicate(current.queue);

      for (const result of results) {
        result.payload.forEach((v) => retrievedNumeric.add(v));
      }
    }
  }

  const retrievedDoc = setIntersection(retrievedBoolean, retrievedNumeric);
  const finalResult: ReturnType<typeof search> = {
    elapsed: BigInt(0),
    hits: [],
    // Find a way to retrieve the exact number of count
    count: 0,
  };

  params.offset ??= 0;
  params.limit ??= 10;

  while (finalResult.hits.length < params.limit) {
    const result = search(lyra, params);

    // No more documents to retrieve
    if (!result.hits.length) break;
    finalResult.hits.push(
      ...result.hits.filter((hit) => retrievedDoc.has(hit.id))
    );
    finalResult.elapsed += result.elapsed;

    params.offset += params.limit;
  }

  return finalResult;
}
