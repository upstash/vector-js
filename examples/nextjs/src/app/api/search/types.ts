
export type SearchPayload = {
  query: string
}

export type SearchResponse = {
  result: {
    id: string,
    data: string
  }[]
}