import { Command } from "@commands/command";
import type {
  QueryCommandOptions,
  QueryCommandPayload,
  QueryEndpointVariants,
  QueryResult,
} from "../types";
import { UpstashError } from "@error/index";

export class QueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
  constructor(payload: QueryCommandPayload, options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    if ("data" in payload) {
      endpoint = "query-data";
    } else if (!payload.vector && !payload.sparseVector) {
      throw new UpstashError("Either data, vector or sparseVector should be provided.");
    }

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
  }
}
