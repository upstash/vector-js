import { Command } from "../../index";
import { Vector } from "../types";

type Payload = {
  ids: number[] | string[];
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

type FetchReturnResponse<TMetadata> = Vector<TMetadata> | null;

export class FetchCommand<TMetadata> extends Command<FetchReturnResponse<TMetadata>[]> {
  constructor(payload: Payload) {
    super({ ...payload }, "fetch");
  }
}
