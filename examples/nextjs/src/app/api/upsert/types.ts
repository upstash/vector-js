export type UpsertPayload = {
  texts: string[]
}

export type UpsertResponse = {
  result: {
    data: string,
    id: string
  }[]
}