import { Command } from "@commands/command";

/**
 * Example:
 *  ```
 *  const resetCommand = new ResetCommand();
 *  // Use resetCommand to execute the reset operation
 *  ```
 */
export class ResetCommand extends Command<string> {
  constructor() {
    super([], "reset");
  }
}
