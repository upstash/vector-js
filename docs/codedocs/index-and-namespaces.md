---
title: "Index and Namespaces"
description: "Learn how an Index maps to a single vector database and how namespaces partition it."
---

An `Index` is the main client you interact with. It represents a single Upstash Vector index and exposes methods like `upsert`, `query`, and `range`. A **namespace** is an isolated partition inside that index, useful for multi-tenant datasets or environment separation.

The SDK deliberately keeps namespaces lightweight: you can either pass a `namespace` option per call or create a namespace-specific client via `index.namespace("...")`.

**Index creation and first upsert**

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

**Namespace-scoped client**

```ts README.md
import { Index } from "@upstash/vector";

type Metadata = {
  title: string;
  genre: "sci-fi" | "fantasy" | "horror" | "action";
  category: "classic" | "modern";
};

const index = new Index<Metadata>({
  url: "<UPSTASH_VECTOR_REST_URL>",
  token: "<UPSTASH_VECTOR_REST_TOKEN>",
});

const namespace = index.namespace("example-namespace");

// Upsert Data
await namespace.upsert([{
  id: 'upstash-rocks',
  vector: [
    .... // embedding values
  ],
  metadata: {
    title: 'Lord of The Rings',
    genre: 'fantasy',
    category: 'classic'
  }
}])

// Query Vector
const results = await namespace.query<Metadata>(
  {
    vector: [
      ... // query embedding
    ],
    includeVectors: true,
    includeMetadata: true,
    topK: 1,
    filter: "genre = 'fantasy' and title = 'Lord of the Rings'"
  },
)

// Delete Record
await namespace.delete("upstash-rocks");

// Fetch records by their IDs
await namespace.fetch(["id-1", "id-2"]);
```

**Why namespaces exist**
- Multi-tenant apps can isolate customer data without creating separate indexes.
- You can keep staging and production data in one index.
- Namespace resets are faster and safer than full index resets.

<Callout type="warn">Namespace operations are fully isolated. A query in one namespace will never return vectors from another, even if IDs overlap.</Callout>

<Accordions>
  <Accordion title="Trade-offs and alternatives">
    Namespaces are lighter than creating multiple indexes, but they still share the same index-level configuration such as dimension and similarity function. If you need different index settings, use separate Upstash Vector indexes instead of namespaces.
  </Accordion>
</Accordions>

Related reading: [Vectors and Metadata](./vectors-and-metadata), [API Reference: Namespace](./api-reference/namespace).
