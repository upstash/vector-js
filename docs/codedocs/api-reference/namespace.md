---
title: "Namespace"
description: "Reference for the Namespace client returned by index.namespace()."
---

A `Namespace` is a lightweight client scoped to a single namespace. It exposes the same read/write methods as `Index`, but you don't need to pass `{ namespace }` on each call.

**Constructor**

```ts src/commands/client/namespace/index.ts
constructor(client: Requester, namespace: string) {
  this.client = client;
  this.namespace = namespace;
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `client` | `Requester` | — | Internal requester from the parent index. |
| `namespace` | `string` | — | Namespace name to scope all operations. |

Example:

```ts README.md
const namespace = index.namespace("example-namespace");
```

**Methods**

### `upsert`

```ts src/commands/client/namespace/index.ts
upsert = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof UpsertCommand<TMetadata>>
) => new UpsertCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof UpsertCommand<TMetadata>>` | — | Vector or data payload(s). |

Example:

```ts src/commands/client/namespace/index.ts
const upsertArgs = {
  id: '123',
  vector: [0.42, 0.87, ...],
  metadata: { property1: 'value1', property2: 'value2' }
};
const upsertResult = await index.namespace("ns").upsert(upsertArgs);
console.log(upsertResult); // Outputs the result of the upsert operation
```

Returns: `Promise<string>`

### `update`

```ts src/commands/client/namespace/index.ts
update = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof UpdateCommand<TMetadata>>
) => new UpdateCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof UpdateCommand<TMetadata>>` | — | Metadata, vector, or data update. |

Example:

```ts src/commands/client/namespace/index.ts
const updateArgs = {
  id: '123',
  metadata: { updatedProperty: 'value1' }
};
const updateResult = await index.update(updateArgs);
console.log(updateResult); // Outputs the result of the update operation
```

Returns: `Promise<{ updated: number }>`

### `fetch`

```ts src/commands/client/namespace/index.ts
fetch = <TMetadata extends Dict = TIndexMetadata>(...args: CommandArgs<typeof FetchCommand>) => {
  if (args[1]) {
    args[1].namespace = this.namespace;
  } else {
    args[1] = { namespace: this.namespace };
  }

  return new FetchCommand<TMetadata>(args).exec(this.client);
};
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args[0]` | `string[] or number[] or { ids: ... } or { prefix: string }` | — | IDs or id prefix to fetch. |
| `args[1].includeMetadata` | `boolean` | `false` | Include metadata fields. |
| `args[1].includeVectors` | `boolean` | `false` | Include vectors. |
| `args[1].includeData` | `boolean` | `false` | Include stored text data. |

Example:

```ts src/commands/client/namespace/index.ts
// Using ids
await index.namespace("ns").fetch(["test-1", "test-2"], { includeMetadata: true });

// Using id prefix
await index.namespace("ns").fetch({ prefix: "test-" });
```

Returns: `Promise<FetchResult<TMetadata>[]>`

### `query`

```ts src/commands/client/namespace/index.ts
query = <TMetadata extends Dict = TIndexMetadata>(args: CommandArgs<typeof QueryCommand>) =>
  new QueryCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof QueryCommand>` | — | Query payload with `vector`, `sparseVector`, or `data`. |

Example:

```ts src/commands/client/namespace/index.ts
await index.namespace("ns").query({
 topK: 3,
 vector: [ 0.22, 0.66 ],
 filter: "age >= 23 and (type = \'turtle\' OR type = \'cat\')"
});
```

Returns: `Promise<QueryResult<TMetadata>[]>`

### `resumableQuery`

```ts src/commands/client/namespace/index.ts
resumableQuery = async <TMetadata extends Dict = TIndexMetadata>(args: ResumableQueryPayload) => {
  const resumableQuery = new ResumableQuery<TMetadata>(args, this.client, this.namespace);
  const initialQuery = await resumableQuery.start();
  const { fetchNext, stop } = resumableQuery;
  return { fetchNext, stop, result: initialQuery.scores };
};
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `ResumableQueryPayload` | — | Query payload plus `maxIdle`. |

Example:

```ts src/commands/client/namespace/index.ts
const { result, fetchNext, stop } = await index.namespace("ns").resumableQuery({
  maxIdle: 3600,
  topK: 50,
  vector: [0.1, 0.2, 0.3, ...],
  includeMetadata: true,
  includeVectors: true
}, { namespace: 'my-namespace' });

const firstBatch = await fetchNext(10);
const secondBatch = await fetchNext(10);
await stop(); // End the query session
```

Returns: `Promise<{ result: QueryResult<TMetadata>[]; fetchNext: (additionalK: number) => Promise<QueryResult<TMetadata>[]>; stop: () => Promise<string> }>`

### `delete`

```ts src/commands/client/namespace/index.ts
delete = (args: CommandArgs<typeof DeleteCommand>) =>
  new DeleteCommand(args, { namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof DeleteCommand>` | — | ID, array of IDs, prefix, or filter object. |

Example:

```ts src/commands/client/namespace/index.ts
// Delete by id
await index.namespace("ns").delete("test-id");

// Delete by ids
await index.namespace("ns").delete(["test-id1", "test-id2"]);

// Delete by id prefix
await index.namespace("ns").delete({ prefix: "test-" });

// Delete by filter
await index.namespace("ns").delete({ filter: "age >= 23" });
```

Returns: `Promise<{ deleted: number }>`

### `range`

```ts src/commands/client/namespace/index.ts
range = <TMetadata extends Dict = TIndexMetadata>(args: CommandArgs<typeof RangeCommand>) =>
  new RangeCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args.cursor` | `number | string` | — | Pagination cursor. |
| `args.limit` | `number` | — | Maximum number of items to return. |
| `args.prefix` | `string` | — | Optional id prefix filter. |
| `args.includeVectors` | `boolean` | `false` | Include vectors in the response. |
| `args.includeMetadata` | `boolean` | `false` | Include metadata. |
| `args.includeData` | `boolean` | `false` | Include stored text data. |

Example:

```ts src/commands/client/namespace/index.ts
const args = {
  limit: 10,
  includeVectors: true,
  includeMetadata: false
};
await index.namespace("ns").range(args);

// Use the cursor to get the next page of results
const nextPage = await index.namespace("ns").range({
  // You have to pass the arguments from the first call
  ...args,
  cursor: rangeResult.nextCursor,
});
```

Returns: `Promise<RangeResult<TMetadata>>`

### `reset`

```ts src/commands/client/namespace/index.ts
reset = () => new ResetCommand({ namespace: this.namespace }).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| — | — | — | This method takes no parameters. |

Example:

```ts src/commands/client/namespace/index.ts
await index.namespace("ns").reset();
console.log('Index namespace has been reset');
```

Returns: `Promise<string>`
