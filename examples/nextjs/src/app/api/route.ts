
import { NextResponse } from "next/server";
import { DATA, ID } from "../constants";
import { index } from "./vector";

export const GET = async () => {
    
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

  return new NextResponse(
    JSON.stringify({ data, id: result[0]?.id }),
    { status: 200 }
  )
}