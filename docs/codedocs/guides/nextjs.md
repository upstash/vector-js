---
title: "Next.js API Guide"
description: "Use @upstash/vector in a Next.js App Router API route for text search and upserts."
---

This guide uses the bundled Next.js example to show how to create an index client once, then implement `upsert` and `query` endpoints. The code below is lifted directly from the example app so you can copy it into your project structure.

<Steps>
<Step>
### Configure environment variables

```bash examples/nextjs/.env.local.example
UPSTASH_VECTOR_REST_URL=""
UPSTASH_VECTOR_REST_TOKEN=""
```
</Step>

<Step>
### Create a shared client instance

```ts examples/nextjs/src/app/api/vector.ts
import { Index } from "@upstash/vector";

export const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})
```
</Step>

<Step>
### Add an upsert endpoint

```ts examples/nextjs/src/app/api/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UpsertPayload, UpsertResponse } from "./types";
import { index } from "../vector";

const ID_PREFIX = "vector-id"
const getId = (text: string) => {
  return `${ID_PREFIX}-${text.charCodeAt(0)}`
}

export const POST = async (request: NextRequest) => {
  const { texts } = await request.json() as UpsertPayload

  // upsert data
  const payload = texts.map(text => {
    return {
      id: getId(text),
      data: text,
    }
  })
  await index.upsert(payload)

  // return response
  const response: UpsertResponse = { result: payload }
  return new NextResponse(JSON.stringify(response), { status: 200 })
}
```
</Step>

<Step>
### Add a search endpoint

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
</Step>
</Steps>

**Why this pattern works**
- The shared `index` instance centralizes credentials and request settings.
- The upsert route uses text data (`data`) to let Upstash embed the content server-side.
- The search route returns `includeData` so the client can display the stored text.

If you need custom retry logic or caching, review [API Reference: Index (Node.js)](../api-reference/index) and [Types](../types).
