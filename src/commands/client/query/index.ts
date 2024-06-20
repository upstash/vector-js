import type { NAMESPACE } from "@commands/client/types";
import { Dict } from "@commands/client/types";
import { Command } from "@commands/command";

type QueryCommandPayload = {
  topK: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
} & ({ vector: number[]; data?: never } | { data: string; vector?: never });

export type QueryResult<TMetadata = Dict> = {
  id: number | string;
  score: number;
  vector?: number[];
  metadata?: TMetadata;
  data?: string;
};

type QueryCommandOptions = { namespace?: string };

type QueryEndpointVariants =
  | `query`
  | `query-data`
  | `query/${NAMESPACE}`
  | `query-data/${NAMESPACE}`;

export class QueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
  constructor(payload: QueryCommandPayload[] | QueryCommandPayload, options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    if (Array.isArray(payload)) {
      const hasData = payload.some((p) => p.data);
      endpoint = hasData ? "query-data" : "query";
    }

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
  }
}
