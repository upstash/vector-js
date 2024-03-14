import { Command } from "@commands/command";

type QueryCommandPayload = {
  vector: number[];
  topK: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

export type QueryResult<TMetadata = Record<string, unknown>> = {
  id: number | string;
  score: number;
  vector: number[];
  metadata?: TMetadata;
};

export class QueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
  constructor(payload: QueryCommandPayload) {
    super(payload, "query");
  }
}
