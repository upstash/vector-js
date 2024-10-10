import { NextRequest, NextResponse } from "next/server";
import { index } from "../vector";
import { SearchPayload, SearchResponse } from "./types";

export const POST = async (request: NextRequest) => {
  const { query } = await request.json() as SearchPayload

  const result = await index.query({ data: query, topK: 3, includeData: true })  
  const response: SearchResponse = { result } as SearchResponse
  return new NextResponse(JSON.stringify(response), { status: 200 })
}