import type { NAMESPACE } from "@commands/client/types";
import { Command, withNamespace } from "@commands/command";

type DeleteNamespaceEndpointVariants = `delete-namespace/${NAMESPACE}`;

export class DeleteNamespaceCommand extends Command<string> {
  constructor(namespace: string) {
    const endpoint: DeleteNamespaceEndpointVariants = withNamespace("delete-namespace", namespace);

    super([], endpoint);
  }
}
