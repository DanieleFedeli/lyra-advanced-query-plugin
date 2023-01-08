import { PropertiesSchema, Lyra } from '@lyrasearch/lyra';
import { ResolveSchema } from '@lyrasearch/lyra/dist/esm/src/types';
import { booleanIndex, numericIndex } from 'src';
import { SortedQueue, QueueNode } from 'src/sorted-queue';
import { binarySearch } from 'src/utils/binary-search';

export function afterInsertAdvancedQuery<S extends PropertiesSchema>(
  this: Lyra<S>,
  id: string
) {
  const doc = this.docs[id];
  if (!doc) return;

  return indexDocument(id, doc);
}

function indexDocument<S extends PropertiesSchema>(
  docId: string,
  doc: ResolveSchema<S>,
  prefix = ''
) {
  for (const key of Object.keys(doc)) {
    const newPrefix = prefix === '' ? key : `${prefix}.${key}`;
    const field = doc[key];
    if (typeof field === 'string') continue;
    else if (typeof field === 'number')
      indexNumericField(docId, newPrefix, field);
    else if (typeof field === 'boolean')
      indexBooleanField(docId, newPrefix, field);
    else if (typeof field === 'object') indexDocument(docId, field, newPrefix);
  }
}

function indexBooleanField(docId: string, key: string, field: boolean) {
  // Propname nested _ {{boolean value}}
  const indexKey = `${key}_${field}`;
  let set = booleanIndex.get(indexKey);
  const alreadyExists = typeof set !== 'undefined';
  set ??= new Set();
  set.add(docId);

  if (!alreadyExists) booleanIndex.set(indexKey, set);
}

function indexNumericField(docId: string, key: string, field: number) {
  let queue = numericIndex.get(key);
  const alreadyExists = typeof queue !== 'undefined';
  queue ??= new SortedQueue<Set<string>>();

  const index = binarySearch(
    queue.queue,
    (current) => current.priority - field
  );

  if (index === -1) {
    const set = new Set<string>();
    set.add(docId);
    queue.enqueue(new QueueNode(field, set));
  } else {
    queue.queue[index].payload.add(docId);
  }

  if (!alreadyExists) numericIndex.set(key, queue);
}
