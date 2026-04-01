---
title: "Types"
description: "Exported TypeScript types and enums from the SDK."
---

This page collects the TypeScript types and enums exported by the SDK entrypoints. All definitions below are copied from the source code.

**Vector shapes**

```ts src/commands/client/types.ts
export type SparseVector = {
  indices: number[];
  values: number[];
};
```

```ts src/commands/client/types.ts
export type Vector<TMetadata = Dict> = {
  id: string;
  vector?: number[];
  sparseVector?: SparseVector;
  metadata?: TMetadata;
  data?: string;
};
```

**Query results**

```ts src/commands/client/query/types.ts
export type QueryResult<TMetadata = Dict> = {
  id: number | string;
  score: number;
  vector?: number[];
  sparseVector?: SparseVector;
  metadata?: TMetadata;
  data?: string;
};
```

**Fetch results**

```ts src/commands/client/fetch/index.ts
export type FetchResult<TMetadata = Dict> = Vector<TMetadata> | null;
```

**Range results**

```ts src/commands/client/range/index.ts
export type RangeResult<TMetadata = Dict> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};
```

**Index info**

```ts src/commands/client/info/index.ts
export type InfoResult = {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: SimilarityFunction;
  denseIndex?: DenseIndexInfo;
  sparseIndex?: SparseIndexInfo;
  namespaces: Record<NamespaceTitle, NamespaceInfo>;
};
```

**Query enums**

```ts src/commands/client/query/types.ts
export enum WeightingStrategy {
  IDF = "IDF",
}
```

```ts src/commands/client/query/types.ts
export enum FusionAlgorithm {
  RRF = "RRF",
  DBSF = "DBSF",
}
```

```ts src/commands/client/query/types.ts
export enum QueryMode {
  HYBRID = "HYBRID",
  DENSE = "DENSE",
  SPARSE = "SPARSE",
}
```

**Requester and HTTP types**

```ts src/http/index.ts
export type UpstashRequest = {
  path?: string[];
  /**
   * Request body will be serialized to json
   */
  body?: unknown;
};
```

```ts src/http/index.ts
export type UpstashResponseTResult> = {
  result?: TResult;
  error?: string;
};
```

```ts src/http/index.ts
export type Requester = {
  request: TResult = unknown>(req: UpstashRequest) => PromiseUpstashResponseTResult>>;
};
```

**Retry and cache configuration (used by IndexConfig)**

```ts src/http/index.ts
type CacheSetting =
  | "default"
  | "force-cache"
  | "no-cache"
  | "no-store"
  | "only-if-cached"
  | "reload"
  | false;
```

```ts src/http/index.ts
export type RetryConfig =
  | false
  | {
      /**
       * The number of retries to attempt before giving up.
       *
       * @default 5
       */
      retries?: number;
      /**
       * A backoff function receives the current retry cound and returns a number in milliseconds to wait before retrying.
       *
       * @default
       * ```ts
       * Math.exp(retryCount) * 50
       * ```
       */
      backoff?: (retryCount: number) => number;
    };
```

```ts src/http/index.ts
export type RequesterConfig = {
  /**
   * Configure the retry behaviour in case of network errors
   */
  retry?: RetryConfig;

  /**
   * Configure the cache behaviour
   * @default "no-store"
   */
  cache?: CacheSetting;
};
```

**IndexConfig (Node.js and Cloudflare)**

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
