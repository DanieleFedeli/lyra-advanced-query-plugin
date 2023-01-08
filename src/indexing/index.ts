import { BooleanIndex, NumericIndex } from '../types';

export * from './build-index';
export * from './search-index';

export const numericIndex: NumericIndex = new Map();
export const booleanIndex: BooleanIndex = new Map();
