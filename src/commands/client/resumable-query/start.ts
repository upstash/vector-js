import { Command } from "@commands/command";
import { ResumableQueryEndpointVariants, ResumableQueryPayload } from ".";


export type StartResumableQueryResult = { uuid: string, scores: number[] }
export class StartResumableQueryCommand extends Command<StartResumableQueryResult> {
	constructor(payload: ResumableQueryPayload, namespace?: string) {
		let endpoint: ResumableQueryEndpointVariants = 'resumable-query';

		if ('data' in payload) {
			endpoint = 'resumable-query-data'
		}

		if (namespace) {
			endpoint = `${endpoint}/${namespace}`;
		}

		super(payload, endpoint);
	}
}