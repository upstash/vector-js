import { index } from "@/app/api/vector";
import { NextApiRequest, NextApiResponse } from "next";

// This is a test route to check if imports are working with pages router
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result = await index.query({ data: "test query", topK: 3, includeData: true })  

  res.status(200).json({ result })
}
