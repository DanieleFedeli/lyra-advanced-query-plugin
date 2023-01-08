import { PropertiesSchema, SearchParams } from '@lyrasearch/lyra';

import { allowedNumericComparison } from '../search';
import { SortedQueue } from '../sorted-queue';

export type NumericIndex = Map<string, SortedQueue<Set<string>>>;
export type BooleanIndex = Map<string, Set<string>>;

export type SupportedComparisons = typeof allowedNumericComparison[number];

export type NumberComparison = {
  [P in SupportedComparisons]?: number;
};

// If TSchema[Tkey] is a string, we do not include it
// If it is a nested schema, we call WhereParams with TSchema[TKey]
// If it is a standard type we handle it
export type WhereParams<TSchema extends PropertiesSchema> = {
  [TKey in keyof TSchema as TSchema[TKey] extends 'string'
    ? never
    : TKey]?: TSchema[TKey] extends PropertiesSchema
    ? WhereParams<TSchema[TKey]> extends [never] // If the nested WhereParams is empty we exclude it
      ? never
      : WhereParams<TSchema[TKey]>
    : TSchema[TKey] extends 'number'
    ? NumberComparison
    : TSchema[TKey] extends 'boolean'
    ? boolean
    : never;
};

export type AdvancedParams<S extends PropertiesSchema> = SearchParams<S> & {
  where: WhereParams<S>;
};
