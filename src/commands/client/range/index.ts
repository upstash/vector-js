import { Command } from "@commands/command";
import { Vector } from "../types";

type RangeCommandPayload = {
  cursor: number | string;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

export type RangeResult<TMetadata = Record<string, unknown>> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};

export class RangeCommand<TMetadata> extends Command<RangeResult<TMetadata>> {
  constructor(payload: RangeCommandPayload) {
    super(payload, "range");
  }
}
