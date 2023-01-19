import { Lyra, PropertiesSchema } from "@lyrasearch/lyra/dist/types";

import { indexDocument } from '../indexing';

export function afterInsertAdvancedQuery<S extends PropertiesSchema>(
  this: Lyra<S>,
  id: string
) {
  const doc = this.docs[id];
  if (!doc) return;

  return indexDocument(id, doc);
}
