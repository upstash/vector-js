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
      // Check if more than one key is present
      const keysCount = Object.keys(payload)
        .map((key) => ["ids", "prefix", "filter"].includes(key))
        .filter(Boolean).length;
      if (keysCount > 1) {
        throw new Error("Only one of ids, prefix or filter should be provided.");
      }

      if ("ids" in payload) {
        super(
          {
            ids: payload.ids,
          },
          endpoint
        );
      } else if ("prefix" in payload) {
        super(
          {
            prefix: payload.prefix,
          },
          endpoint
        );
      } else if ("filter" in payload) {
        super(
          {
            filter: payload.filter,
          },
          endpoint
        );
      }
    }
  }
}
