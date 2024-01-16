import { Command } from "@commands/command";
import { Vector } from "../types";

type FetchCommandOptions = {
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

export type FetchReturnResponse<TMetadata> = Vector<TMetadata> | null;

export class FetchCommand<TMetadata> extends Command<FetchReturnResponse<TMetadata>[]> {
  constructor([ids, opts]: [ids: number[] | string[], opts: FetchCommandOptions]) {
    super({ ids, ...opts }, "fetch");
  }
}
