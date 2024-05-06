import { Command } from "@commands/command";
import type { NAMESPACE, Vector } from "@commands/client/types";

type RangeCommandPayload = {
  cursor: number | string;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

type RangeCommandOptions = { namespace?: string };

type RangeEndpointVariants = `range` | `range/${NAMESPACE}`;

export type RangeResult<TMetadata = Record<string, unknown>> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};

export class RangeCommand<TMetadata> extends Command<RangeResult<TMetadata>> {
  constructor(payload: RangeCommandPayload, options?: RangeCommandOptions) {
    let endpoint: RangeEndpointVariants = "range";

    if (options?.namespace) {
      endpoint = `${endpoint}/${options.namespace}`;
    }

    super(payload, endpoint);
  }
}
