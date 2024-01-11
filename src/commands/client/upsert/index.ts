import { Command } from "@commands/command";

/**
 * Payload Type Definition for UpsertCommand
 *
 * This type defines the structure of the payload used in the UpsertCommand.
 *
 * Properties:
 *  - id: A number or string representing the unique identifier of the record to be upserted (inserted or updated).
 *  - vector: An array of numbers representing a specific vector. This could be coordinates, data points, or any numerical representation depending on the context.
 *  - metadata (optional): An object with key-value pairs, where the keys are strings and the values are of unknown type. This allows for flexible and additional data to be associated with the record being upserted.
 *
 * Usage:
 * This type is primarily used in scenarios where a record needs to be inserted into a database if it does not already exist, or updated if it does. The flexibility of the metadata field allows for various additional information to be passed along with the primary data.
 */
type Payload = {
  id: number | string;
  vector: number[];
  metadata?: Record<string, unknown>;
};

/**
 * UpsertCommand Class
 *
 * Extends the generic Command class to implement an upsert (insert or update) operation.
 *
 * Example:
 *  ```
 *  const upsertPayload = { id: 123, vector: [1.1, 2.2, 3.3], metadata: { key: "value" } };
 *  const upsertCommand = new UpsertCommand(upsertPayload);
 *  // Use upsertCommand to execute the upsert operation
 *  ```
 *
 * The UpsertCommand takes a payload containing the necessary data for the upsert operation. It supports handling both insertion and update of records based on the provided identifier.
 */
export class UpsertCommand extends Command<string> {
  constructor(payload: Payload) {
    super({ ...payload }, "upsert");
  }
}
