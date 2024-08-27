import { Command } from "@commands/command";
import type {
  QueryCommandOptions,
  QueryCommandPayload,
  QueryEndpointVariants,
  QueryResult,
} from "../types";

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
