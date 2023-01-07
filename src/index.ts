import { Lyra, PropertiesSchema, search } from "@lyrasearch/lyra";
import { QueueNode } from "./sorted-queue";
import { AdvancedParams, BooleanIndex, NumberComparison, NumericIndex, WhereParams } from "./types";
import { binarySearch } from "./utils/binary-search";
import { setIntersection } from "./utils/set";

export const numericIndex: NumericIndex = new Map();
export const booleanIndex: BooleanIndex = new Map();

export const allowedNumericComparison = [">=", ">", "=", "<", "<="] as const;

export function advancedSearch<S extends PropertiesSchema>(lyra: Lyra<S>, params: AdvancedParams<S>) {
  const { where } = params;
  const schema = lyra.schema;

  const retrievedBoolean = new Set<string>();
  const retrievedNumeric = new Set<string>();
  const indexes = getUsedIndexes(lyra, schema, where as any)

  for (const usedBoolean of indexes.usedBooleanIndex) {
    const documents = booleanIndex.get(usedBoolean);
    if (!documents?.size) continue;

    for(const document of documents) {
      retrievedBoolean.add(document)
    }

  }

  for (const virtualIndex of indexes.usedNumericIndex) {
    const rawIndex = virtualIndex.split('.');
    const numericKey = rawIndex.slice(0, -2).join(".");
    const operator = rawIndex[rawIndex.length - 2] as keyof NumberComparison;
    const valueSearched = Number(rawIndex[rawIndex.length - 1]);

    if (!numericIndex.has(numericKey)) continue;

    const current = numericIndex.get(numericKey)!;
    const nodeIndex = binarySearch(current.queue, element => element.priority - valueSearched);
    if (nodeIndex === -1) continue;

    const node = current.queue[nodeIndex];
    if (operator === '=') node.payload.forEach(v => retrievedNumeric.add(v));
    else {
      const predicate = createNumericPredicate<QueueNode<Set<string>>>(operator, nodeIndex);
      const results = predicate(current.queue);

      for (const result of results) {
        result.payload.forEach(v => retrievedNumeric.add(v));
      }
    }
  }

  const oldDoc = lyra.docs;
  setIntersection(retrievedBoolean, retrievedNumeric)
  const result = search(lyra, params);

  lyra.docs = oldDoc;

  return result;
}

function createNumericPredicate<TArray>(operator: keyof NumberComparison, index: number) {
  switch (operator) {
    case "<":
      return (array: TArray[]) => array.slice(0, index);
    case "<=":
      return (array: TArray[]) => array.slice(0, index + 1);
    case ">":
      return (array: TArray[]) => array.slice(index + 1);
    case ">=":
      return (array: TArray[]) => array.slice(index);
    default:
      return (array: TArray[]) => array;
  }
}

function getUsedIndexes<S extends PropertiesSchema>(lyra: Lyra<S>, schema: S, where: WhereParams<S>, prefix = '') {
  const usedBooleanIndex: string[] = []
  const usedNumericIndex: string[] = []

  if (typeof where === 'undefined') return { usedBooleanIndex, usedNumericIndex };

  for (const key of Object.keys(where)) {
    const propName = `${prefix}${String(key)}`
    const propValue = (where as any)[key];
    if (lyra.schema[key] === 'boolean') usedBooleanIndex.push(_handleBoolean(propValue, propName));
    else if (lyra.schema[key] === 'number') usedNumericIndex.push(_handleNumber(propValue, propName));
    else if (lyra.schema[key] === 'string') continue;
    else {
      const result = getUsedIndexes(lyra, schema[key] as S, propValue, `${propName}.`)
      usedBooleanIndex.push(...result.usedBooleanIndex);
      usedNumericIndex.push(...result.usedNumericIndex);
    }

  }

  return { usedBooleanIndex, usedNumericIndex }
}

function _handleBoolean(propValue: boolean, propName: string) {
  if (typeof propValue !== 'boolean') throw new Error(`Expected a boolean value for ${propName} but got ${propValue}`);

  return `${propName}_${propValue}`
}

function _handleNumber(propValue: NumberComparison, propName: string) {
  if (typeof propValue !== 'number') throw new Error(`Expected a number value for ${propName} but got ${propValue}`);

  const numericKeys = Object.keys(propValue);
  if (numericKeys.length > 1) throw new Error('Only one numeric comparison is supported.');

  const key = numericKeys[0] as keyof NumberComparison;
  if (!allowedNumericComparison.includes(key))
    throw new Error(`Invalid comparison detected, received: ${key} expected: ${allowedNumericComparison}`)

  return `${propName}.${key}.${propValue[key]}`;
}
