import { Command } from "@commands/command";

type ListNamespacesEndpointVariants = "list-namespaces";

export class ListNamespacesCommand extends Command<string[]> {
  constructor() {
    const endpoint: ListNamespacesEndpointVariants = "list-namespaces";

    super([], endpoint);
  }
}
