import { NextRequest, NextResponse } from "next/server";
import { UpsertPayload, UpsertResponse } from "./types";
import { index } from "../vector";

const ID_PREFIX = "vector-id"
const getRandomId = () => {
  return `${ID_PREFIX}-${Math.ceil(Math.random() * 1000)}`
}

export const POST = async (request: NextRequest) => {
  const { texts } = await request.json() as UpsertPayload

  // upsert data
  const payload = texts.map(text => {
    return {
      id: getRandomId(),
      data: text,
    }
  })
  await index.upsert(payload)

  // return response
  const response: UpsertResponse = { result: payload }
  return new NextResponse(JSON.stringify(response), { status: 200 })
}