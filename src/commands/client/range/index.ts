import { Command } from "@commands/command";
import { Vector } from "../types";

type RangeCommandPayload = {
  cursor: number | string;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

export type RangeReturnResponse<TMetadata> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};

export class RangeCommand<TMetadata> extends Command<RangeReturnResponse<TMetadata>> {
  constructor(payload: RangeCommandPayload) {
    super(payload, "range");
  }
}
