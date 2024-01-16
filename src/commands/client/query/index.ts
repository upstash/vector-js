import { Command } from "@commands/command";

type QueryCommandPayload = {
  vector: number[];
  topK: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

export type QueryReturnResponse<TMetadata> = {
  id: number | string;
  score: number;
  vector: number[];
  metadata?: TMetadata;
};

export class QueryCommand<TMetadata> extends Command<QueryReturnResponse<TMetadata>[]> {
  constructor(payload: QueryCommandPayload) {
    super(payload, "query");
  }
}
