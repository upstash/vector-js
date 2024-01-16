import { Command } from "@commands/command";

export class ResetCommand extends Command<string> {
  constructor() {
    super([], "reset");
  }
}
