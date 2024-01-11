import { Command } from "../../index";
import { Vector } from "../types";

type Payload = {
  cursor: number;
  limit: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
};

type RangeReturnResponse<TMetadata> = {
  nextCursor: string;
  vectors: Vector<TMetadata>[];
};

export class RangeCommand<TResult> extends Command<RangeReturnResponse<TResult>> {
  constructor(payload: Payload) {
    super(payload, "range");
  }
}
