import type { NAMESPACE } from "@commands/client/types";
import { Command } from "@commands/command";

type ResetEndpointVariants = `reset` | `reset/${NAMESPACE}` | `reset?all`;

export type ResetCommandOptions =
  | { namespace?: string; all?: never }
  | { namespace?: never; all?: true };
export class ResetCommand extends Command<string> {
  constructor(options?: ResetCommandOptions) {
    let endpoint: ResetEndpointVariants = "reset";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    } else if (options?.all) {
      endpoint = `${endpoint}?all`;
    }

    super([], endpoint);
  }
}
