import { Command } from "@commands/command";

type ResetEndpointVariants = `reset` | `reset/${string}`;

type ResetCommandOptions = { namespace?: string };
export class ResetCommand extends Command<string> {
  constructor(options?: ResetCommandOptions) {

    let endpoint: ResetEndpointVariants = "reset";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }
    super([], endpoint);
  }
}
