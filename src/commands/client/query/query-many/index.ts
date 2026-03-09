import { Command } from "@commands/command";
import type { Requester } from "@http";
import type {
  QueryCommandOptions,
  QueryCommandPayload,
  QueryEndpointVariants,
  QueryResult,
} from "../types";

export class QueryManyCommand<TMetadata> extends Command<QueryResult<TMetadata>[][]> {
  private queryCount: number;

  constructor(payload: QueryCommandPayload[], options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    const hasData = payload.some((p) => p.data);
    endpoint = hasData ? "query-data" : "query";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
    this.queryCount = payload.length;
  }

  /**
   * Override exec to normalize the API response.
   *
   * When a single query is sent via queryMany, the API returns a flat
   * array of results instead of a nested array. This ensures the return
   * type is always QueryResult<TMetadata>[][] regardless of query count.
   */
  public async exec(client: Requester): Promise<QueryResult<TMetadata>[][]> {
    const result = await super.exec(client);

    // When only one query is provided, the API returns a flat array
    // (QueryResult[]) instead of a nested array (QueryResult[][]).
    // Detect this by checking if the first element is a plain result
    // object rather than an array.
    if (this.queryCount === 1 && result.length > 0 && !Array.isArray(result[0])) {
      return [result as unknown as QueryResult<TMetadata>[]];
    }

    return result;
  }
}
