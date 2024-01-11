import { Command } from "@commands/command";
import { Vector } from "../types";

/**
 * Type definition for RangeCommand payload
 *
 * This type specifies the structure of the payload used in the RangeCommand.
 *
 * Properties:
 *  - cursor: A number indicating the starting point for the range query.
 *  - limit: A number specifying the maximum number of records to be returned.
 *  - includeVectors (optional): A boolean flag indicating whether to include vector data in the response.
 *  - includeMetadata (optional): A boolean flag indicating whether to include metadata in the response.
 *
 * This payload type is used for range queries, where a set of records is retrieved based on the specified cursor
 * and limit. The optional inclusion of vectors and metadata allows for flexible and detailed data retrieval.
 */
type Payload = {
  cursor: number;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

/**
 * Type definition for the response returned by RangeCommand
 *
 * This type outlines the structure of the response from a RangeCommand.
 *
 * Properties:
 *  - nextCursor: A string that indicates the cursor to be used for the next range query, facilitating pagination.
 *  - vectors: An array of Vector objects, each containing TMetadata, representing the data retrieved in the range query.
 *
 * The RangeReturnResponse type is crucial for operations that involve retrieving a range of records,
 * providing both the data (in the form of vectors) and the means to continue fetching subsequent ranges (via nextCursor).
 */
type RangeReturnResponse<TMetadata> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};

/**
 * RangeCommand Class
 * Example:
 *  ```
 *  const rangePayload = { cursor: 0, limit: 10, includeVectors: true };
 *  const rangeCommand = new RangeCommand(rangePayload);
 *  // Use rangeCommand to execute the range query and retrieve data
 *  ```
 */
export class RangeCommand<TResult> extends Command<
  RangeReturnResponse<TResult>
> {
  constructor(payload: Payload) {
    super(payload, "range");
  }
}
