import { Command } from "@commands/command";
import { Vector } from "../types";

/**
 * Type definition for FetchCommand payload
 *
 * Properties:
 *  - ids: An array of numbers or strings, representing the unique identifiers of the records to be fetched.
 *  - includeMetadata (optional): A boolean flag indicating whether to include metadata in the response.
 *  - includeVectors (optional): A boolean flag indicating whether to include vector data in the response.
 *
 * The Payload type is used in the FetchCommand to specify the data required to fetch specific records.
 * The optional flags allow for more detailed responses depending on the requirements.
 */
type Payload = {
  ids: number[] | string[];
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

/**
 * Generic response type for FetchCommand
 *
 * This type represents the possible return type of a FetchCommand. It can be either a Vector
 * containing metadata or null, depending on whether the fetch operation was successful or not.
 */
type FetchReturnResponse<TMetadata> = Vector<TMetadata> | null;

/**
 * FetchCommand Class
 *
 * Extends the generic Command class to implement a fetch operation.
 *
 * Example:
 *  ```
 *  const fetchPayload = { ids: [1, 2, 3], includeMetadata: true };
 *  const fetchCommand = new FetchCommand(fetchPayload);
 *  // Use fetchCommand to execute the fetch operation
 *  ```
 */
export class FetchCommand<TMetadata> extends Command<
  FetchReturnResponse<TMetadata>[]
> {
  constructor(payload: Payload) {
    super({ ...payload }, "fetch");
  }
}
