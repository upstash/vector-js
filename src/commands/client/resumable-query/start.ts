import { Command } from "@commands/command";
import type { ResumableQueryEndpointVariants, ResumableQueryPayload } from ".";
import { QueryResult } from "@commands/types";

export type StartResumableQueryResult<TMetadata> = { uuid: string; scores: QueryResult[] };
export class StartResumableQueryCommand<TMetadata> extends Command<StartResumableQueryResult<TMetadata>> {
  constructor(payload: ResumableQueryPayload, namespace?: string) {
    let endpoint: ResumableQueryEndpointVariants = "resumable-query";

    if ("data" in payload) {
      endpoint = "resumable-query-data";
    }

    if (namespace) {
      endpoint = `${endpoint}/${namespace}`;
    }

    super(payload, endpoint);
  }
}
