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