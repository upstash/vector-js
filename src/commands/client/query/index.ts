import { Command } from "@commands/command";

type QueryCommandPayload = {
  topK: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
} & ({ vector: number[]; data?: never } | { data: string; vector?: never });

export type QueryResult<TMetadata = Record<string, unknown>> = {
  id: number | string;
  score: number;
  vector: number[];
  metadata?: TMetadata;
};

export class QueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
  constructor(payload: QueryCommandPayload) {
    let endpoint: "query" | "query-data" = "query";

    if ("data" in payload) {
      endpoint = "query-data";
    }
    super(payload, endpoint);
  }
}
