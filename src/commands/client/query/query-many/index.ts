import { Command } from "@commands/command";
import type {
  QueryCommandOptions,
  QueryCommandPayload,
  QueryEndpointVariants,
  QueryResult,
} from "../types";

export class QueryManyCommand<TMetadata> extends Command<QueryResult<TMetadata>[][]> {
  constructor(payload: QueryCommandPayload[], options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    const hasData = payload.some((p) => p.data);
    endpoint = hasData ? "query-data" : "query";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
  }
}
