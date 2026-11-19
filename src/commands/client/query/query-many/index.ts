import { Command } from "@commands/command";
import type { Requester } from "@http";
import type {
  QueryCommandOptions,
  QueryCommandPayload,
  QueryEndpointVariants,
  QueryResult,
} from "../types";
import { UpstashError } from "@error/index";

export class QueryManyCommand<TMetadata> extends Command<QueryResult<TMetadata>[][]> {
  private queryCount: number;

  constructor(payload: QueryCommandPayload[], options?: QueryCommandOptions) {
    let endpoint: QueryEndpointVariants = "query";

    // Data queries and vector queries are served by different endpoints, and
    // an endpoint only accepts its own kind, so a batch can't contain both.
    const dataCount = payload.filter((p) => "data" in p && p.data !== undefined).length;
    if (dataCount > 0 && dataCount < payload.length) {
      throw new UpstashError(
        "data and vector/sparseVector queries cannot be mixed in the same queryMany call."
      );
    }
    endpoint = dataCount > 0 ? "query-data" : "query";

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
   * array of results instead of a nested array, and when the namespace does
   * not exist it returns an empty array for any number of queries. This
   * ensures the result always has one array of matches per query.
   */
  public async exec(client: Requester): Promise<QueryResult<TMetadata>[][]> {
    const result = await super.exec(client);

    // When the namespace does not exist, the API returns a single empty
    // array regardless of how many queries were sent. A batch of several
    // queries otherwise always gets one entry per query, so an empty result
    // means that no query matched anything.
    if (result.length === 0) {
      return Array.from({ length: this.queryCount }, () => []);
    }

    // When only one query is provided, the API returns a flat array
    // (QueryResult[]) instead of a nested array (QueryResult[][]). An empty
    // flat array is handled above; detect a non-empty one by checking that
    // the first element is a plain result object rather than an array.
    if (this.queryCount === 1 && !Array.isArray(result[0])) {
      return [result as unknown as QueryResult<TMetadata>[]];
    }

    return result;
  }
}
