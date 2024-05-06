import { Command } from "@commands/command";
import type { NAMESPACE } from "@commands/client/types";

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

type QueryCommandOptions = { namespace?: string };

type QueryEndpointVariants =
  | `query`
  | `query-data`
  | `query/${NAMESPACE}`
  | `query-data/${NAMESPACE}`;

export class QueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
  constructor(payload: QueryCommandPayload, options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    if ("data" in payload) {
      endpoint = "query-data";
    }

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
  }
}
