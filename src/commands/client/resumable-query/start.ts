import { Command } from "@commands/command";
import type { QueryResult } from "@commands/types";
import type { ResumableQueryEndpointVariants, ResumableQueryPayload } from ".";

export type StartResumableQueryResult<TMetadata> = {
  uuid: string;
  scores: QueryResult<TMetadata>[];
};
export class StartResumableQueryCommand<TMetadata> extends Command<
  StartResumableQueryResult<TMetadata>
> {
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
