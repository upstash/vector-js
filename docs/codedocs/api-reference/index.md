---
title: "Index"
description: "Reference for the Index class and all public methods shared across Node.js and Cloudflare entrypoints."
---

The `Index` class is the main client for Upstash Vector. It is exported from the Node.js entrypoint (`@upstash/vector`) and the Cloudflare entrypoint (`@upstash/vector/cloudflare`). Both share the same public methods; only credential handling and environment access differ.

**Constructor**

```ts src/platforms/nodejs.ts
constructor(config?: IndexConfig);

constructor(requesters?: Requester);
```

Node.js `IndexConfig` definition:

```ts src/platforms/nodejs.ts
export type IndexConfig = {
  /**
   * UPSTASH_VECTOR_REST_URL
   */
  url?: string;
  /**
   * UPSTASH_VECTOR_REST_TOKEN
   */
  token?: string;

  /**
   * The signal will allow aborting requests on the fly.
   * For more check: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: HttpClientConfig["signal"];

  /**
   * Enable telemetry to help us improve the SDK.
   * The sdk will send the sdk version, platform and node version as telemetry headers.
   *
   * @default true
   */
  enableTelemetry?: boolean;
} & RequesterConfig;
```

Cloudflare `IndexConfig` definition:

```ts src/platforms/cloudflare.ts
export type IndexConfig = {
  /**
   * UPSTASH_VECTOR_REST_URL
   */
  url?: string;
  /**
   * UPSTASH_VECTOR_REST_TOKEN
   */
  token?: string;

  /**
   * The signal will allow aborting requests on the fly.
   * For more check: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal?: HttpClientConfig["signal"];

  /**
   * Enable telemetry to help us improve the SDK.
   * The sdk will send the sdk version, platform and node version as telemetry headers.
   *
   * @default true
   */
  enableTelemetry?: boolean;
} & RequesterConfig;
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string` | — | REST URL for your Upstash Vector index. |
| `token` | `string` | — | REST token for your Upstash Vector index. |
| `signal` | `AbortSignal` or function | — | Abort fetch requests when the signal is canceled. |
| `enableTelemetry` | `boolean` | `true` | Adds telemetry headers unless `UPSTASH_DISABLE_TELEMETRY` is set. |
| `retry` | `RetryConfig` or `false` | `5` attempts | Configure retry attempts and backoff for network errors. |
| `cache` | `CacheSetting` | `"no-store"` | Controls request caching behavior. |

Constructor example:

```ts README.md
const index = new Index<Metadata>({
  url: "<UPSTASH_VECTOR_REST_URL>",
  token: "<UPSTASH_VECTOR_REST_TOKEN>",
});
```

**Static fromEnv (Node.js)**

```ts src/platforms/nodejs.ts
static fromEnv(
  env?: { UPSTASH_VECTOR_REST_URL: string; UPSTASH_VECTOR_REST_TOKEN: string },
  config?: Omit<IndexConfig, "url" | "token">
): Index {
  const url = env?.UPSTASH_VECTOR_REST_URL || process?.env.UPSTASH_VECTOR_REST_URL;
  const token = env?.UPSTASH_VECTOR_REST_TOKEN || process?.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url) {
    throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`");
  }

  if (!token) {
    throw new Error("Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`");
  }

  return new Index({ ...config, url, token });
}
```

**Static fromEnv (Cloudflare)**

```ts src/platforms/cloudflare.ts
static fromEnv(
  env?: { UPSTASH_VECTOR_REST_URL: string; UPSTASH_VECTOR_REST_TOKEN: string },
  config?: Omit<IndexConfig, "url" | "token">
): Index {
  let url: string | undefined;
  let token: string | undefined;

  // "env" is for the cloudflare environment
  if (env) {
    url = env.UPSTASH_VECTOR_REST_URL;
    if (!url) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_URL`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_URL`"
      );
    }

    token = env.UPSTASH_VECTOR_REST_TOKEN;
    if (!token) {
      throw new Error(
        "Unable to find environment variable: `UPSTASH_VECTOR_REST_TOKEN`. Please add it via `wrangler secret put UPSTASH_VECTOR_REST_TOKEN`"
      );
    }
  }

  return new Index({
    // @ts-expect-error We don't need to type this in the cf env type
    enableTelemetry: env?.UPSTASH_DISABLE_TELEMETRY ? false : undefined,
    ...config,
    url,
    token,
  });
}
```

**Methods**

### `namespace`

```ts src/vector.ts
namespace = (namespace: string) => new Namespace<TIndexMetadata>(this.client, namespace);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `namespace` | `string` | — | Namespace name to scope all operations. |

Example:

```ts README.md
const namespace = index.namespace("example-namespace");
```

Returns: `Namespace<TIndexMetadata>`

### `delete`

```ts src/vector.ts
delete = (args: CommandArgs<typeof DeleteCommand>, options?: { namespace?: string }) =>
  new DeleteCommand(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof DeleteCommand>` | — | ID, array of IDs, prefix, or filter object. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts README.md
// Delete record
await index.delete("upstash-rocks", {namespace: "example-namespace"});
```

Returns: `Promise<{ deleted: number }>`

### `query`

```ts src/vector.ts
query = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof QueryCommand>,
  options?: { namespace?: string }
) => new QueryCommand<TMetadata>(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof QueryCommand>` | — | Query payload with `vector`, `sparseVector`, or `data`. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts README.md
const results = await index.query<Metadata>(
  {
    vector: [
      ... // query embedding
    ],
    includeVectors: true,
    includeMetadata: true,
    topK: 1,
    filter: "genre = 'fantasy' and title = 'Lord of the Rings'"
  },
  {
    namespace: "example-namespace"
  }
)
```

Returns: `Promise<QueryResult<TMetadata>[]>`

### `queryMany`

```ts src/vector.ts
queryMany = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof QueryManyCommand>,
  options?: { namespace?: string }
) => new QueryManyCommand<TMetadata>(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof QueryManyCommand>` | — | Array of query payloads. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts src/vector.ts
await index.queryMany([
{
    topK: 3,
    vector: [0.22, 0.66],
    filter: "age >= 23 and (type = 'turtle' OR type = 'cat')",
},
{
    topK: 3,
    vector: [0.45, 0.52],
    filter: "age >= 27 and (type = 'rabbit' OR type = 'dog')",
},
]);
```

Returns: `Promise<QueryResult<TMetadata>[][]>`

### `resumableQuery`

```ts src/vector.ts
resumableQuery = async <TMetadata extends Dict = TIndexMetadata>(
  args: ResumableQueryPayload,
  options?: { namespace?: string }
) => {
  const resumableQuery = new ResumableQuery<TMetadata>(args, this.client, options?.namespace);
  const initialQuery = await resumableQuery.start();
  const { fetchNext, stop } = resumableQuery;
  return { fetchNext, stop, result: initialQuery.scores };
};
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `ResumableQueryPayload` | — | Query payload plus `maxIdle`. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts src/vector.ts
const { result, fetchNext, stop } = await index.resumableQuery({
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

### `upsert`

```ts src/vector.ts
upsert = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof UpsertCommand<TMetadata>>,
  options?: { namespace?: string }
) => new UpsertCommand<TMetadata>(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof UpsertCommand<TMetadata>>` | — | Vector or data payload(s). |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts README.md
await index.upsert([{
  id: 'upstash-rocks',
  vector: [
    0.13, 0.87, ... // dense embedding
  ],
  metadata: {
    title: 'Lord of The Rings',
    genre: 'fantasy',
    category: 'classic'
  }
}])
```

Returns: `Promise<string>`

### `update`

```ts src/vector.ts
update = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof UpdateCommand<TMetadata>>,
  options?: { namespace?: string }
) => new UpdateCommand<TMetadata>(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args` | `CommandArgs<typeof UpdateCommand<TMetadata>>` | — | Metadata, vector, or data update. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts src/vector.ts
const updateArgs = {
  id: '123',
  vector: [0.42, 0.87, ...],
  metadata: { property1: 'value1', property2: 'value2' }
};
const updateResult = await index.update(updateArgs);
console.log(updateResult); // Outputs the result of the update operation
```

Returns: `Promise<{ updated: number }>`

### `fetch`

```ts src/vector.ts
fetch = <TMetadata extends Dict = TIndexMetadata>(...args: CommandArgs<typeof FetchCommand>) =>
  new FetchCommand<TMetadata>(args).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args[0]` | `string[] or number[] or { ids: ... } or { prefix: string }` | — | IDs or id prefix to fetch. |
| `args[1].includeMetadata` | `boolean` | `false` | Include metadata fields. |
| `args[1].includeVectors` | `boolean` | `false` | Include vectors. |
| `args[1].includeData` | `boolean` | `false` | Include stored text data. |
| `args[1].namespace` | `string` | — | Optional namespace override. |

Example:

```ts README.md
await index.fetch(["id-1", "id-2"], {namespace: "example-namespace"});
```

Returns: `Promise<FetchResult<TMetadata>[]>`

### `reset`

```ts src/vector.ts
reset = (options?: ResetCommandOptions) => new ResetCommand(options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.namespace` | `string` | — | Reset a single namespace. |
| `options.all` | `true` | — | Reset all namespaces. |

Example:

```ts README.md
await index.reset();
```

Returns: `Promise<string>`

### `range`

```ts src/vector.ts
range = <TMetadata extends Dict = TIndexMetadata>(
  args: CommandArgs<typeof RangeCommand>,
  options?: { namespace?: string }
) => new RangeCommand<TMetadata>(args, options).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `args.cursor` | `number | string` | — | Pagination cursor. |
| `args.limit` | `number` | — | Maximum number of items to return. |
| `args.prefix` | `string` | — | Optional id prefix filter. |
| `args.includeVectors` | `boolean` | `false` | Include vectors in the response. |
| `args.includeMetadata` | `boolean` | `false` | Include metadata. |
| `args.includeData` | `boolean` | `false` | Include stored text data. |
| `options.namespace` | `string` | — | Optional namespace override. |

Example:

```ts README.md
await index.range(
  {
    cursor: 0,
    limit: 5,
    includeVectors: true,
  },
  {
    namespace: "example-namespace"
  }
);
```

Returns: `Promise<RangeResult<TMetadata>>`

### `info`

```ts src/vector.ts
info = () => new InfoCommand().exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| — | — | — | This method takes no parameters. |

Example:

```ts README.md
await index.info();
```

Returns: `Promise<InfoResult>`

### `listNamespaces`

```ts src/vector.ts
listNamespaces = () => new ListNamespacesCommand().exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| — | — | — | This method takes no parameters. |

Example:

```ts README.md
await index.listNamespaces();
```

Returns: `Promise<string[]>`

### `deleteNamespace`

```ts src/vector.ts
deleteNamespace = (namespace: string) => new DeleteNamespaceCommand(namespace).exec(this.client);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `namespace` | `string` | — | Namespace name to delete. |

Example:

```ts README.md
await index.deleteNamespace("namespace-to-be-deleted");
```

Returns: `Promise<string>`
