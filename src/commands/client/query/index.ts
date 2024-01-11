import { Command } from "@commands/command";

/**
 * Payload Type Definition
 *
 * This type defines the structure of the payload used in a specific function or API call.
 *
 * Properties:
 *  - vector: An array of numbers representing a specific vector. This could be coordinates, data points, or any numerical representation depending on the context of the function or API.
 *
 *  - topK: A number indicating the 'top K' elements to be considered or returned. In many contexts, this refers to the top 'K' results, items, or entities based on certain criteria like highest score, most relevance, etc.
 *
 *  - includeVectors: A boolean value indicating whether to include the vector data in the response or output. Setting this to 'true' includes the vector data.
 *
 * Usage:
 * This type is typically used when sending or receiving data where a combination of a numerical vector, a limit on the number of elements to consider, and an option to include or exclude detailed vector data is required.
 */
type Payload = {
  vector: number[];
  topK: number;
  includeVectors: boolean;
};

type QueryReturnResponse<TMetadata> = {
  id: number | string;
  score: number;
  vector: number[];
  metadata?: TMetadata;
};

/**
 * QueryCommand Class
 * Example:
 *  ```
 *  const payload = { vector: [1, 2, 3], topK: 5, includeVectors: true };
 *  const queryCommand = new QueryCommand(payload);
 *  // Use queryCommand for further operations
 *  ```
 */
export class QueryCommand<TResult> extends Command<QueryReturnResponse<TResult>[]> {
  constructor(payload: Payload) {
    super({ ...payload }, "query");
  }
}
