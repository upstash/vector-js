import type { NAMESPACE } from "@commands/client/types";
import { Command } from "@commands/command";

type DeleteNamespaceEndpointVariants = `delete-namespace/${NAMESPACE}`;

export class DeleteNamespaceCommand extends Command<string> {
  constructor(namespace: string) {
    const endpoint: DeleteNamespaceEndpointVariants = `delete-namespace/${namespace}`;

    super([], endpoint);
  }
}
