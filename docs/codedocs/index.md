---
title: "Getting Started"
description: "Learn what @upstash/vector is, why it exists, and how to run your first query."
---

@upstash/vector is an HTTP/REST client for Upstash Vector that lets you upsert and query dense, sparse, or hybrid vectors from serverless and edge runtimes.

**The Problem**
- Vector databases usually assume long-lived TCP connections, which do not fit serverless and edge environments.
- Shipping embeddings alongside metadata and text creates mismatched payloads and ad-hoc schemas.
- Querying hybrid indexes often requires extra client-side glue for scoring and fusion.
- Pagination for large similarity searches is hard to implement without cursor or session support.

**The Solution**
The client wraps Upstash Vector’s REST API in a small, typed command surface and supports data-first, vector-first, or hybrid workflows.

```ts README.md
import { Index } from "@upstash/vector";

type Metadata = {
  title: string,
  genre: 'sci-fi' | 'fantasy' | 'horror' | 'action'
  category: "classic" | "modern"
}

const index = new Index<Metadata>({
  url: "<UPSTASH_VECTOR_REST_URL>",
  token: "<UPSTASH_VECTOR_REST_TOKEN>",
});

// Upsert to dense index
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

**Installation**
<Callout type="info">The repository only documents the npm install command. Use the equivalent command for your package manager if needed.</Callout>

<Tabs>
<Tab value="npm">
```bash README.md
npm install @upstash/vector
```
</Tab>
<Tab value="pnpm">
```bash README.md
npm install @upstash/vector
```
</Tab>
<Tab value="yarn">
```bash README.md
npm install @upstash/vector
```
</Tab>
<Tab value="bun">
```bash README.md
npm install @upstash/vector
```
</Tab>
</Tabs>

**Quick Start**
Below is the smallest end-to-end flow pulled directly from the README: initialize the client, upsert a record, and query it.

```ts README.md
// Upsert data as plain text.
await index.upsert([{
  id: 'tokyo',
  data: "Tokyo is the capital of Japan.",
}])

// Query with your data
const results = await index.query(
  {
    data: "Where is the capital of Japan",
    topK: 1,
  },
)
```

Expected output shape (values depend on your index):

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

**Key Features**
- Connectionless HTTP client designed for serverless, edge, and browser runtimes.
- Works with dense, sparse, and hybrid vectors, plus text-first workflows.
- Namespaces for logical isolation within one index.
- Resumable queries for large result sets.
- Built-in retries and optional telemetry headers.

<Cards>
  <Card title="Architecture" href="/docs/architecture">How modules and commands fit together.</Card>
  <Card title="Core Concepts" href="/docs/index-and-namespaces">Indexes, namespaces, vectors, and queries.</Card>
  <Card title="API Reference" href="/docs/api-reference/index">Full reference for Index and Namespace.</Card>
</Cards>
