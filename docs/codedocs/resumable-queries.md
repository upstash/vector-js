---
title: "Resumable Queries"
description: "Run long-running similarity searches in chunks using resumable query sessions."
---

Resumable queries let you paginate large similarity searches without re-running the full query each time. The SDK starts a session, returns initial scores, and gives you `fetchNext` and `stop` helpers.

**Start a resumable query on an index**

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

**Resumable query inside a namespace**

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

**How it works**
- The first call creates a server-side session and returns a `uuid` plus initial results.
- Subsequent calls use `fetchNext(additionalK)` to request more results.
- `stop()` ends the session and releases server resources.

`maxIdle` is expressed in seconds and defines how long the server keeps the session open if you pause between fetches. The `additionalK` parameter lets you incrementally pull more results without re-embedding or re-ranking the full query, which is especially useful for infinite scroll or batched retrieval pipelines.

<Callout type="warn">Always call `stop()` after you finish pagination. Leaving sessions open can consume backend resources until `maxIdle` expires.</Callout>

If you hit timeouts, reduce `topK` and pull more results with smaller `additionalK` steps.

<Accordions>
  <Accordion title="Trade-offs and alternatives">
    Resumable queries are ideal for large result sets. For smaller, fixed-size results, a normal `query` call is simpler and avoids session lifecycle management.
  </Accordion>
</Accordions>

Related: [Querying and Ranking](./querying-and-ranking), [API Reference: Index](./api-reference/index).
