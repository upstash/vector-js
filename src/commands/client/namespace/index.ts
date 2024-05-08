import {
  DeleteCommand,
  FetchCommand,
  InfoCommand,
  QueryCommand,
  RangeCommand,
  ResetCommand,
  UpsertCommand,
} from "@commands/client";
import { Dict } from "@commands/client/types";
import { Requester } from "@http";
import { CommandArgs } from "../../../vector";

export class Namespace<TIndexMetadata extends Dict = Dict> {
  protected client: Requester;
  protected namespace: string;

  /**
   * Create a new index namespace client
   *
   * @example
   * ```typescript
   * const index = new Index({
   *  url: "<UPSTASH_VECTOR_REST_URL>",
   *  token: "<UPSTASH_VECTOR_REST_TOKEN>",
   * });
   *
   * const namespace = index.namespace("ns");
   * ```
   */
  constructor(client: Requester, namespace: string) {
    this.client = client;
    this.namespace = namespace;
  }

  /**
   * Queries an index namespace with specified parameters.
   * This method creates and executes a query command on an index based on the provided arguments.
   *
   * @example
   * ```js
   * await index.namespace("ns").query({
   *  topK: 3,
   *  vector: [ 0.22, 0.66 ],
   *  filter: "age >= 23 and (type = \'turtle\' OR type = \'cat\')"
   * });
   * ```
   *
   * @param {Object} args - The arguments for the query command.
   * @param {number[]} args.vector - An array of numbers representing the feature vector for the query.
   *                                This vector is utilized to find the most relevant items in the index.
   * @param {number} args.topK - The desired number of top results to be returned, based on relevance or similarity to the query vector.
   * @param {string} [args.filter] - An optional filter string to be used in the query. The filter string is used to narrow down the query results.
   * @param {boolean} [args.includeVectors=false] - When set to true, includes the feature vectors of the returned items in the response.
   * @param {boolean} [args.includeMetadata=false] - When set to true, includes additional metadata of the returned items in the response.
   *
   * @returns A promise that resolves with an array of query result objects when the request to query the index is completed.
   */
  upsert = <TMetadata extends Dict = TIndexMetadata>(
    args: CommandArgs<typeof UpsertCommand<TMetadata>>
  ) => new UpsertCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  /**
   * Upserts (Updates and Inserts) specific items into the index namespace.
   * It's used for adding new items to the index namespace or updating existing ones.
   *
   * @example
   * ```js
   * const upsertArgs = {
   *   id: '123',
   *   vector: [0.42, 0.87, ...],
   *   metadata: { property1: 'value1', property2: 'value2' }
   * };
   * const upsertResult = await index.namespace("ns").upsert(upsertArgs);
   * console.log(upsertResult); // Outputs the result of the upsert operation
   * ```
   *
   * @param {CommandArgs<typeof UpsertCommand>} args - The arguments for the upsert command.
   * @param {number|string} args.id - The unique identifier for the item being upserted.
   * @param {number[]} args.vector - The feature vector associated with the item.
   * @param {Dict} [args.metadata] - Optional metadata to be associated with the item.
   *
   * @returns {string} A promise that resolves with the result of the upsert operation after the command is executed.
   */
  fetch = <TMetadata extends Dict = TIndexMetadata>(...args: CommandArgs<typeof FetchCommand>) =>
    new FetchCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  /**
   * It's used for retrieving specific items from the index namespace, optionally including
   * their metadata and feature vectors.
   *
   * @example
   * ```js
   * const fetchIds = ['123', '456'];
   * const fetchOptions = { includeMetadata: true, includeVectors: false };
   * const fetchResults = await index.namespace("ns").fetch(fetchIds, fetchOptions);
   * console.log(fetchResults); // Outputs the fetched items
   * ```
   *
   * @param {...CommandArgs<typeof FetchCommand>} args - The arguments for the fetch command.
   * @param {(number[]|string[])} args[0] - An array of IDs of the items to be fetched.
   * @param {FetchCommandOptions} args[1] - Options for the fetch operation.
   * @param {boolean} [args[1].includeMetadata=false] - Optionally include metadata of the fetched items.
   * @param {boolean} [args[1].includeVectors=false] - Optionally include feature vectors of the fetched items.
   *
   * @returns {Promise<FetchReturnResponse<TMetadata>[]>} A promise that resolves with an array of fetched items or null if not found, after the command is executed.
   */
  query = <TMetadata extends Dict = TIndexMetadata>(args: CommandArgs<typeof QueryCommand>) =>
    new QueryCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  /**
   * Deletes a specific item or items from the index namespace by their ID(s).   *
   *
   * @example
   * ```js
   * await index.namespace("ns").delete('test-id')
   * ```
   *
   * @param id - List of ids or single id
   * @returns A promise that resolves when the request to delete the index is completed.
   */
  delete = (args: CommandArgs<typeof DeleteCommand>) =>
    new DeleteCommand(args, { namespace: this.namespace }).exec(this.client);

  /**
   * Retrieves a range of items from the index.
   *
   * @example
   * ```js
   * const rangeArgs = {
   *   cursor: 0,
   *   limit: 10,
   *   includeVectors: true,
   *   includeMetadata: false
   * };
   * const rangeResults = await index.namespace("ns").range(rangeArgs);
   * console.log(rangeResults); // Outputs the result of the range operation
   * ```
   *
   * @param {CommandArgs<typeof RangeCommand>} args - The arguments for the range command.
   * @param {number|string} args.cursor - The starting point (cursor) for the range query.
   * @param {number} args.limit - The maximum number of items to return in this range.
   * @param {boolean} [args.includeVectors=false] - Optionally include the feature vectors of the items in the response.
   * @param {boolean} [args.includeMetadata=false] - Optionally include additional metadata of the items in the response.
   *
   * @returns {Promise<RangeReturnResponse<TMetadata>>} A promise that resolves with the response containing the next cursor and an array of vectors, after the command is executed.
   */
  range = <TMetadata extends Dict = TIndexMetadata>(args: CommandArgs<typeof RangeCommand>) =>
    new RangeCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  /**
   * Retrieves info from the index space.
   *
   * @example
   * ```js
   * const infoResults = await index.namespace().info();
   * console.log(infoResults); // Outputs the result of the info operation
   * ```
   *
   * @returns {Promise<InfoResult>} A promise that resolves with the response containing the vectorCount, pendingVectorCount, indexSize, dimension count and similarity algorithm after the command is executed.
   */
  info = () => new InfoCommand({ namespace: this.namespace }).exec(this.client);

  /**
   * It's used for wiping all the vectors in a index namespace.
   *
   * @example
   * ```js
   * await index.namespace("ns").reset();
   * console.log('Index namespace has been reset');
   * ```
   *
   * @returns {Promise<string>} A promise that resolves with the result of the reset operation after the command is executed.
   */
  reset = () => new ResetCommand({ namespace: this.namespace }).exec(this.client);
}
