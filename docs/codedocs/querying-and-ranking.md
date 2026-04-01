---
title: "Querying and Ranking"
description: "Learn how to query dense, sparse, or hybrid indexes and control scoring." 
---

Queries return the most relevant vectors for a given payload. You can query with vectors, sparse vectors, or raw text, and optionally include metadata and data in the result set.

**Vector query with filters**

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

**Text query in a Next.js API route**

```ts examples/nextjs/src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { index } from "../vector";
import { SearchPayload, SearchResponse } from "./types";

export const POST = async (request: NextRequest) => {
  const { query } = await request.json() as SearchPayload

  const result = await index.query({ data: query, topK: 3, includeData: true })  
  const response: SearchResponse = { result } as SearchResponse
  return new NextResponse(JSON.stringify(response), { status: 200 })
}
```

**Scoring controls for hybrid indexes**
Hybrid indexes can fuse dense and sparse scores. The SDK exposes enums to control weighting and fusion when the backend supports it:
- `WeightingStrategy` for sparse vector weighting.
- `FusionAlgorithm` for merging dense and sparse scores.
- `QueryMode` to force dense, sparse, or hybrid execution.

See [Types](./types) for the enum definitions and [API Reference: Index](./api-reference/index) for the full query payload.

<Callout type="warn">If you set `includeVectors` or `includeMetadata`, the payload size can grow quickly. Use these flags only when you need the data on the client.</Callout>

<Accordions>
  <Accordion title="Trade-offs and alternatives">
    When you already have embeddings, query with `vector` or `sparseVector` for full control. When you only have raw text, query with `data` and let the server handle embedding, at the cost of extra compute on each request.
  </Accordion>
</Accordions>
