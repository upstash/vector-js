---
title: "Vectors, Metadata, and Data"
description: "Understand the vector payload formats and how metadata and raw text are handled."
---

Upstash Vector supports three primary payload shapes: dense vectors, sparse vectors, and hybrid vectors. The SDK models these shapes as a discriminated union, so you always send a valid combination of `vector`, `sparseVector`, and `data`.

**Dense, sparse, and hybrid upserts**

```ts README.md
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

// Upsert to sparse index
await index.upsert([{
  id: 'upstash-rocks',
  sparseVector: { // sparse embedding
    indices: [2, 3],
    values: [0.13, 0.87],
  },
  metadata: {
    title: 'Lord of The Rings',
    genre: 'fantasy',
    category: 'classic'
  }
}])

// Upsert to hybrid index
await index.upsert([{
  id: 'upstash-rocks',
  vector: [
    0.13, 0.87, ... // dense embedding
  ],
  sparseVector: {   // sparse embedding
    indices: [2, 3],
    values: [0.13, 0.87],
  },
  metadata: {
    title: 'Lord of The Rings',
    genre: 'fantasy',
    category: 'classic'
  }
}])
```

**Text-first payloads**

```ts README.md
// Upsert data as plain text.
await index.upsert([{
  id: 'tokyo',
  data: "Tokyo is the capital of Japan.",
}])

// Upsert data alongside with your embedding
await index.upsert([{
  id: 'tokyo',
  data: "Tokyo is the capital of Japan.",
  vector: [......]
}])
```

**How the SDK models vectors**
- `vector`: dense numeric embeddings.
- `sparseVector`: an object with `indices` and `values` arrays.
- `metadata`: any JSON-serializable object you want to filter on later.
- `data`: raw text stored and optionally returned by queries.

<Callout type="warn">For sparse vectors, `indices` and `values` must be the same length, and `indices` should match the non-zero dimensions of your embedding model.</Callout>

<Accordions>
  <Accordion title="Trade-offs and alternatives">
    If you always have precomputed dense embeddings, send `vector` directly to skip server-side embedding. If you want Upstash to embed text, use the `data` field, which lets the API handle the embedding step based on your index configuration.
  </Accordion>
</Accordions>

Next: [Querying and Ranking](./querying-and-ranking).
