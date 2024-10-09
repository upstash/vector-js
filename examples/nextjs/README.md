# Upstash Vector & Next.js Example

In this example, you can find how you can use Upstash Vector with Next.js.

The client is initialized in `/src/app/api/route.ts` folder like:

```ts
import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

export const GET = async () => {
  // ...
}
```

## Local Development

First, install the dependencies with:

```
npm install
```

Then, create a `.env.local` file and fill the environment variables:

```
UPSTASH_VECTOR_REST_URL="***"
UPSTASH_VECTOR_REST_TOKEN="***"
```

Finally, run:

```
npm run dev
```

## Deployment

You can deploy with:

```
npm run deploy
```

Then, set the environment variables in your project, redeploy and start using the app on Vercel!
