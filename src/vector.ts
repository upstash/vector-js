import {
  DeleteCommand,
  FetchCommand,
  QueryCommand,
  RangeCommand,
  ResetCommand,
  UpsertCommand,
} from "@commands/client";
import { Requester } from "@http/index";

export type CommandArgs<TCommand extends new (_args: any) => any> =
  ConstructorParameters<TCommand>[0];

/**
 * Serverless vector client for upstash vector db.
 */
export class Index {
  protected client: Requester;

  /**
   * Create a new vector db client
   *
   * @example
   * ```typescript
   * const index = new Index({
   *  url: "<UPSTASH_VECTOR_REST_URL>",
   *  token: "<UPSTASH_VECTOR_REST_TOKEN>",
   * });
   * ```
   */
  constructor(client: Requester) {
    this.client = client;
  }

  delete = (args: CommandArgs<typeof DeleteCommand>) => new DeleteCommand(args).exec(this.client);
  query = (args: CommandArgs<typeof QueryCommand>) => new QueryCommand(args).exec(this.client);
  upsert = (args: CommandArgs<typeof UpsertCommand>) => new UpsertCommand(args).exec(this.client);
  fetch = (args: CommandArgs<typeof FetchCommand>) => new FetchCommand(args).exec(this.client);
  reset = () => new ResetCommand().exec(this.client);
  range = (args: CommandArgs<typeof RangeCommand>) => new RangeCommand(args).exec(this.client);
}
