import { Command } from "../../index";

type Payload = {
  ids: number[] | string[];
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

type Vector<TMetadata> = {
  id: string;
  vector: number[];
  metadata?: TMetadata;
};

type FetchReturnResponse<TMetadata> = Vector<TMetadata> | null;

export class FetchCommand<TMetadata> extends Command<FetchReturnResponse<TMetadata>[]> {
  constructor(payload: Payload) {
    super({ ...payload }, "fetch");
  }
}
