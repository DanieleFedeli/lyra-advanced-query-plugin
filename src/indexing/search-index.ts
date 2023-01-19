import { PropertiesSchema, Lyra } from '@lyrasearch/lyra';

import { allowedNumericComparison } from '../search';
import { NumberComparison, WhereParams } from '../types';

export function getUsedIndexes<S extends PropertiesSchema>(
  lyra: Lyra<S>,
  schema: S,
  where: WhereParams<S>,
  prefix = ''
) {
  const usedBooleanIndex: string[] = [];
  const usedNumericIndex: string[] = [];

  if (typeof where === 'undefined')
    return { usedBooleanIndex, usedNumericIndex };

  for (const key of Object.keys(where)) {
    const propName = `${prefix}${String(key)}`;
    const propValue = (where as any)[key];
    if (schema[key] === 'boolean')
      usedBooleanIndex.push(_handleBoolean(propValue, propName));
    else if (schema[key] === 'number')
      usedNumericIndex.push(_handleNumber(propValue, propName));
    else if (schema[key] === 'string') continue;
    else {
      const result = getUsedIndexes(
        lyra,
        schema[key] as S,
        propValue,
        `${propName}.`
      );
      usedBooleanIndex.push(...result.usedBooleanIndex);
      usedNumericIndex.push(...result.usedNumericIndex);
    }
  }

  return { usedBooleanIndex, usedNumericIndex };
}

function _handleBoolean(propValue: boolean, propName: string) {
  if (typeof propValue !== 'boolean')
    throw new Error(
      `Expected a boolean value for ${propName} but got ${propValue}`
    );

  return `${propName}_${propValue}`;
}

function _handleNumber(propValue: NumberComparison, propName: string) {
  const numericKeys = Object.keys(propValue);
  if (numericKeys.length > 1)
    throw new Error('Only one numeric comparison is supported.');

  const key = numericKeys[0] as keyof NumberComparison;

  if (!allowedNumericComparison.includes(key))
    throw new Error(
      `Invalid comparison detected, received: ${key} expected: ${allowedNumericComparison}`
    );

  if (typeof propValue[key] !== 'number')
    throw new Error(
      `Expected a number for comparison but got ${propValue[key]}`
    );

  return `${propName}.${key}.${propValue[key]}`;
}
