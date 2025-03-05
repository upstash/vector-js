import type { NAMESPACE } from "@commands/client/types";
import { Command } from "@commands/command";
import type { DeleteCommandPayload } from "./types";

type DeleteEndpointVariants = `delete` | `delete/${NAMESPACE}`;

export class DeleteCommand extends Command<{ deleted: number }> {
  constructor(payload: DeleteCommandPayload, options?: { namespace?: string }) {
    let endpoint: DeleteEndpointVariants = "delete";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }
    if (typeof payload === "string" || typeof payload === "number") {
      super(
        {
          ids: [payload],
        },
        endpoint
      );
    } else if (Array.isArray(payload)) {
      super(
        {
          ids: payload,
        },
        endpoint
      );
    } else if (typeof payload === "object") {
      super(payload, endpoint);
    }
  }
}
