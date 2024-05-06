import { Command } from "@commands/command";

type DeleteEndpointVariants = `delete` | `delete/${string}`;
export class DeleteCommand extends Command<{ deleted: number }> {
  constructor(id: (number[] | string[]) | number | string, options?: { namespace?: string }) {
    let endpoint: DeleteEndpointVariants = "delete";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    const finalArr = [];
    if (Array.isArray(id)) {
      finalArr.push(...id);
    } else {
      finalArr.push(id);
    }
    super(finalArr, endpoint);
  }
}
