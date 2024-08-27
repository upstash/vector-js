import { Command } from "@commands/command";
import { QueryResult } from "@commands/types";
import { QueryCommandPayload } from "../query/types";
import { Requester } from "@http";
import { ResumeQueryCommand } from "./resume";
import { StartResumableQueryResult, StartResumableQueryCommand } from "./start";
import { StopResumableQueryCommand } from "./stop";

type NAMESPACE = string;
export type ResumableQueryEndpointVariants =
	| `resumable-query`
	| `resumable-query-data`
	| `resumable-query/${NAMESPACE}`
	| `resumable-query-data/${NAMESPACE}`;


export type ResumableQueryPayload = { maxIdle: number } & QueryCommandPayload;


export class ResumableQuery<TMetadata extends Dict<unknown>> {
	private uuid?: string;

	start: () => Promise<StartResumableQueryResult>;
	fetchNext: (additionalK: number) => Promise<QueryResult[]>;
	stop: () => Promise<string>;

	constructor(
		payload: ResumableQueryPayload,
		client: Requester,
		namespace?: string
	) {
		this.start = async (): Promise<StartResumableQueryResult> => {
			const result = await new StartResumableQueryCommand(payload, namespace).exec(client);
			this.uuid = result.uuid;
			return result;
		}

		this.fetchNext = async (additionalK: number): Promise<QueryResult<TMetadata>[]> => {
			if (!this.uuid) {
				throw new Error("Resumable query has not been started. Call start() first.");
			}
			return new ResumeQueryCommand<TMetadata>({ uuid: this.uuid, additionalK }).exec(client);
		};

		this.stop = async (): Promise<string> => {
			if (!this.uuid) {
				throw new Error("Resumable query has not been started. Call start() first.");
			}
			const result = await new StopResumableQueryCommand({ uuid: this.uuid }).exec(client);
			this.uuid = '';
			return result;
		};
	}
}