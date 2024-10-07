import { Index } from "@upstash/vector";
import { NextResponse } from "next/server";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

const id = "my-id"

export const GET = async () => {
  await index.upsert({ id, vector: [1, 2, 3] })

  await new Promise(r => setTimeout(r, 1000));

  const result = await index.fetch([id], { includeData: true })

  const data = result[0]?.data


  return new NextResponse(
    JSON.stringify({ data, id: result[0]?.id }),
    { status: 200 }
  )
}