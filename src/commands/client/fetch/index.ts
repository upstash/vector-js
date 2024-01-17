import { Command } from "@commands/command";
import { Vector } from "../types";

type FetchCommandOptions = {
  includeMetadata?: boolean;
  includeVectors?: boolean;
};

export type FetchResult<TMetadata = Record<string, unknown>> = Vector<TMetadata> | null;

export class FetchCommand<TMetadata> extends Command<FetchResult<TMetadata>[]> {
  constructor([ids, opts]: [ids: number[] | string[], opts: FetchCommandOptions]) {
    super({ ids, ...opts }, "fetch");
  }
}
