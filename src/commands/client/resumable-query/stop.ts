import { Command } from "@commands/command";

export type StopResumableQueryCommandPayload = { uuid: string };
export class StopResumableQueryCommand extends Command<string> {
	constructor(payload: StopResumableQueryCommandPayload) {
		super(payload, "resumable-query-end");
	}
}