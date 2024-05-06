import { Command } from "@commands/command";
import type { NAMESPACE } from "@commands/client/types";

type ResetEndpointVariants = `reset` | `reset/${NAMESPACE}`;

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
