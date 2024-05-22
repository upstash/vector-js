import {
  DeleteCommand,
  FetchCommand,
  InfoCommand,
  Namespace,
  QueryCommand,
  RangeCommand,
  ResetCommand,
  UpdateCommand,
  UpsertCommand,
} from "@commands/client";
import { Dict } from "@commands/client/types";
import { DeleteNamespaceCommand, ListNamespacesCommand } from "@commands/management";
import { Requester } from "@http";

export type CommandArgs<TCommand extends new (_args: any) => any> =
  ConstructorParameters<TCommand>[0];

/**
 * Serverless vector client for upstash vector db.
 */
export class Index<TIndexMetadata extends Dict = Dict> {
  protected client: Requester;

  /**
   * Create a new vector db client
   *
   * @example
   * ```typescript
   * const index = new Index({
   *  url: "<UPSTASH_VECTOR_REST_URL>",
   *  token: "<UPSTASH_VECTOR_REST_TOKEN>",
   * });
   * ```
   */
  constructor(client: Requester) {
    this.client = client;
  }

  namespace = (namespace: string) => new Namespace<TIndexMetadata>(this.client, namespace);

  /**
   * Deletes a specific item or items from the index by their ID(s).   *
   *
   * @example
   * ```js
   * await index.delete('test-id')
   * ```
   *
   * @param id - List of ids or single id
   * @returns A promise that resolves when the request to delete the index is completed.
   */
  delete = (args: CommandArgs<typeof DeleteCommand>, options?: { namespace?: string }) =>
    new DeleteCommand(args, options).exec(this.client);

  /**
   * Queries an index with specified parameters.
   * This method creates and executes a query command on an index based on the provided arguments.
   *
   * @example
   * ```js
   * await index.query({
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
  query = <TMetadata extends Dict = TIndexMetadata>(
    args: CommandArgs<typeof QueryCommand>,
    options?: { namespace?: string }
  ) => new QueryCommand<TMetadata>(args, options).exec(this.client);

  /**
   * Upserts (Updates and Inserts) specific items into the index.
   * It's used for adding new items to the index or updating existing ones.
   *
   * @example
   * ```js
   * const upsertArgs = {
   *   id: '123',
   *   vector: [0.42, 0.87, ...],
   *   metadata: { property1: 'value1', property2: 'value2' }
   * };
   * const upsertResult = await index.upsert(upsertArgs);
   * console.log(upsertResult); // Outputs the result of the upsert operation
   * ```
   *
   * @param {CommandArgs<typeof UpsertCommand>} args - The arguments for the upsert command.
   * @param {number|string} args.id - The unique identifier for the item being upserted.
   * @param {number[]} args.vector - The feature vector associated with the item.
   * @param {Record<string, unknown>} [args.metadata] - Optional metadata to be associated with the item.
   *
   * @returns {string} A promise that resolves with the result of the upsert operation after the command is executed.
   */
  upsert = <TMetadata extends Dict = TIndexMetadata>(
    args: CommandArgs<typeof UpsertCommand<TMetadata>>,
    options?: { namespace?: string }
  ) => new UpsertCommand<TMetadata>(args, options).exec(this.client);

  /*
   * Updates specific items in the index.
   * It's used for updating existing items in the index.
   *
   * @example
   * ```js
   * const updateArgs = {
   *   id: '123',
   *   vector: [0.42, 0.87, ...],
   *   metadata: { property1: 'value1', property2: 'value2' }
   * };
   * const updateResult = await index.update(updateArgs);
   * console.log(updateResult); // Outputs the result of the update operation
   * ```
   *
   * @param {CommandArgs<typeof UpdateCommand>} args - The arguments for the update command.
   * @param {number|string} args.id - The unique identifier for the item being updated.
   * @param {number[]} args.vector - The feature vector associated with the item.
   * @param {Record<string, unknown>} [args.metadata] - Optional metadata to be associated with the item.
   * @param {string} [args.namespace] - The namespace to update the item in.
   *
   * @returns {Promise<{updated: number}>} A promise that resolves with the result of the update operation after the command is executed.
   */
  update = <TMetadata extends Dict = TIndexMetadata>(
    args: CommandArgs<typeof UpdateCommand<TMetadata>>,
    options?: { namespace?: string }
  ) => new UpdateCommand<TMetadata>(args, options).exec(this.client);

  /**
   * It's used for retrieving specific items from the index, optionally including
   * their metadata and feature vectors.
   *
   * @example
   * ```js
   * const fetchIds = ['123', '456'];
   * const fetchOptions = { includeMetadata: true, includeVectors: false };
   * const fetchResults = await index.fetch(fetchIds, fetchOptions);
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
  fetch = <TMetadata extends Dict = TIndexMetadata>(...args: CommandArgs<typeof FetchCommand>) =>
    new FetchCommand<TMetadata>(args).exec(this.client);

  /**
   * It's used for wiping an entire index.
   *
   * @example
   * ```js
   * await index.reset();
   * console.log('Index has been reset');
   * ```
   *
   * @returns {Promise<string>} A promise that resolves with the result of the reset operation after the command is executed.
   */
  reset = (options?: { namespace?: string }) => new ResetCommand(options).exec(this.client);

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
   * const rangeResults = await index.range(rangeArgs);
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
  range = <TMetadata extends Dict = TIndexMetadata>(
    args: CommandArgs<typeof RangeCommand>,
    options?: { namespace?: string }
  ) => new RangeCommand<TMetadata>(args, options).exec(this.client);

  /**
   * Retrieves info from the index.
   *
   * @example
   * ```js
   * const infoResults = await index.info();
   * console.log(infoResults); // Outputs the result of the info operation
   * ```
   *
   * @returns {Promise<InfoResult>} A promise that resolves with the response containing the vectorCount, pendingVectorCount, indexSize, dimension count and similarity algorithm after the command is executed.
   */
  info = () => new InfoCommand().exec(this.client);

  /**
   * List all namespaces in the vector database.
   *
   * @example
   * ```js
   * const namespaces = await index.listNamespaces();
   * console.log(namespaces); // Outputs the list of namespaces
   * ```
   *
   * @returns {Promise<string[]>} A promise that resolves with an array of namespaces after the command is executed.
   */
  listNamespaces = () => new ListNamespacesCommand().exec(this.client);

  /**
   * Deletes a namespace from the vector database.
   *
   * @example
   * ```js
   * await index.deleteNamespace('namespace');
   * console.log('Namespace has been deleted');
   * ```
   *
   * @param {string} namespace - The name of the namespace to be deleted.
   * @returns {Promise<string>} A promise that resolves with the result of the delete operation after the command is executed.
   */
  deleteNamespace = (namespace: string) => new DeleteNamespaceCommand(namespace).exec(this.client);
}
