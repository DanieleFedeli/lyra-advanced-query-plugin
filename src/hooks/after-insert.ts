import { PropertiesSchema, Lyra } from '@lyrasearch/lyra';

import { indexDocument } from '../indexing';

export function afterInsertAdvancedQuery<S extends PropertiesSchema>(
  this: Lyra<S>,
  id: string
) {
  const doc = this.docs[id];
  if (!doc) return;

  return indexDocument(id, doc);
}
