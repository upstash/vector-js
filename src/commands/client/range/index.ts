import type { NAMESPACE, Vector } from "@commands/client/types";
import { Dict } from "@commands/client/types";
import { Command } from "@commands/command";

type RangeCommandPayload = {
  cursor: number | string;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
};

type RangeCommandOptions = { namespace?: string };

type RangeEndpointVariants = `range` | `range/${NAMESPACE}`;

export type RangeResult<TMetadata = Dict> = {
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
