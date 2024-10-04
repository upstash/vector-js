import { Index } from "@upstash/vector";

const id = "my-id"

export default {
  async fetch(request, env, ctx): Promise<Response> {

    const index = new Index({
      url: env.UPSTASH_VECTOR_REST_URL,
      token: env.UPSTASH_VECTOR_REST_TOKEN,
      cache: false,
    })

    await new Promise(r => setTimeout(r, 1000));

    const result = await index.fetch([id], { includeData: true })

    console.log(`length: ${result.length}`);
    const data = result[0]?.data
    console.log(`data: ${data}`);

    return new Response(
      JSON.stringify({ data, id: result[0]?.id }),
      { status: 200 }
    )
  },
} satisfies ExportedHandler<Env>;
