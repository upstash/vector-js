---
title: "Cloudflare Workers Guide"
description: "Use the Cloudflare entrypoint and environment bindings to upsert and fetch data." 
---

This guide uses the Cloudflare Workers example from the repository. It demonstrates how to construct an `Index` using the Worker `env` bindings, upsert text, and fetch it back in a single request.

<Steps>
<Step>
### Configure environment variables

```bash examples/cloudflare-workers/.env.local.example
UPSTASH_VECTOR_REST_URL=""
UPSTASH_VECTOR_REST_TOKEN=""
```
</Step>

<Step>
### Define a simple payload

```ts examples/cloudflare-workers/src/constants.ts
export const ID = "my-id"
export const DATA = "foo"
```
</Step>

<Step>
### Implement the Worker handler

```ts examples/cloudflare-workers/src/index.ts
import { Index } from "@upstash/vector";
import { ID, DATA } from "./constants"

export default {
  async fetch(request, env, ctx): PromiseResponse> {

    const index = new Index({
      url: env.UPSTASH_VECTOR_REST_URL,
      token: env.UPSTASH_VECTOR_REST_TOKEN,
      cache: false,
    })
    
    await index.upsert({
      id: ID,
      data: DATA
    })
    
    // wait for indexing
    await new Promise(r => setTimeout(r, 1000));

    const result = await index.fetch([ID], { includeData: true })

    console.log(`length: ${result.length}`);
    const data = result[0]?.data
    console.log(`data: ${data}`);

    return new Response(
      JSON.stringify({ data, id: result[0]?.id }),
      { status: 200 }
    )
  },
} satisfies ExportedHandlerEnv>;
```
</Step>
</Steps>

**What to expect**
- The worker upserts `"foo"` under `"my-id"` and then fetches it back.
- The logs will include the length of the result array and the fetched data.
- The response body echoes the ID and data for simple verification.

<Callout type="info">The example sets `cache: false` to ensure each request is executed against the API. You can enable caching if your usage pattern allows it.</Callout>

Because Cloudflare Workers run in an edge runtime, the SDK avoids direct `process.env` access and instead accepts an `env` object or `IndexConfig` values. When you deploy, bind `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` as Worker secrets and use the same handler code above.

For configuration details like telemetry and retries, see [API Reference: Index](../api-reference/index).

This pattern is safe for demos and smoke tests.
