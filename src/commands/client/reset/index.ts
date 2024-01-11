import { Command } from "../../index";

export class ResetCommand extends Command<string> {
  constructor() {
    super([], "reset");
  }
}
