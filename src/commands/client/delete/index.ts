import { Command } from "../../index";

/**
 * Payload Type Definition for DeleteCommand
 *
 * This type defines the structure of the payload specifically used in the DeleteCommand.
 *
 * Properties:
 *  - ids: An array of numbers or strings representing the unique identifiers of the records to be deleted. These could be database IDs, unique keys, or any identifier used to uniquely refer to records in a specific context.
 *
 * Usage:
 * This type is typically used in scenarios where a batch deletion of records is required. The `ids` array allows specifying multiple records for deletion in a single command, thereby facilitating efficient bulk operations.
 */
type Payload = {
  ids: number[] | string[];
};

/**
 * DeleteCommand Class
 *
 * This class extends the generic Command class to implement the deletion functionality.
 *
 * Example:
 *  ```
 *  const deletionIds = [123, 456, 789];
 *  const deleteCommand = new DeleteCommand({ ids: deletionIds });
 *  // Use deleteCommand to execute the deletion operation
 *  ```
 *
 * The DeleteCommand takes a payload containing the IDs of the records to be deleted and performs the deletion operation when executed.
 */
export class DeleteCommand<TResult = "Success"> extends Command<TResult> {
  constructor(payload: Payload) {
    super(payload.ids, "delete");
  }
}
