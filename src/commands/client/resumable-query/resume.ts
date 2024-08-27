import { Command } from "@commands/command";
import { QueryResult } from "@commands/types";

export type ResumeQueryCommandPayload = { uuid: string, additionalK: number };
export class ResumeQueryCommand<TMetadata> extends Command<QueryResult<TMetadata>[]> {
	constructor(payload: ResumeQueryCommandPayload) {
		super(payload, "resumable-query-next");
	}
}