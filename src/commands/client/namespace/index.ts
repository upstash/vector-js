import {
  DeleteCommand,
  FetchCommand,
  InfoCommand,
  QueryCommand,
  RangeCommand,
  ResetCommand,
  UpsertCommand,
} from "@commands/client";
import { Requester } from "@http";
import { CommandArgs } from "../../../vector";

export class Namespace<TIndexMetadata extends Record<string, unknown> = Record<string, unknown>> {
  protected client: Requester;
  protected namespace: string;

  constructor(client: Requester, namespace: string) {
    this.client = client;
    this.namespace = namespace;
  }

  upsert = <TMetadata extends Record<string, unknown> = TIndexMetadata>(
    args: CommandArgs<typeof UpsertCommand<TMetadata>>
  ) => new UpsertCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  fetch = <TMetadata extends Record<string, unknown> = TIndexMetadata>(
    ...args: CommandArgs<typeof FetchCommand>
  ) => new FetchCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  query = <TMetadata extends Record<string, unknown> = TIndexMetadata>(
    args: CommandArgs<typeof QueryCommand>
  ) => new QueryCommand<TMetadata>(args, { namespace: this.namespace }).exec(this.client);

  delete = (args: CommandArgs<typeof DeleteCommand>) =>
    new DeleteCommand(args, { namespace: this.namespace }).exec(this.client);

  range = <TMetadata extends Record<string, unknown> = TIndexMetadata>(
    args: CommandArgs<typeof RangeCommand>
  ) => new RangeCommand<TMetadata>(args).exec(this.client);

  info = () => new InfoCommand({ namespace: this.namespace }).exec(this.client);

  reset = () => new ResetCommand().exec(this.client);
}
