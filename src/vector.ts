import { DeleteCommand } from "./commands/client/delete";
import { QueryCommand } from "./commands/client/query";
import { UpsertCommand } from "./commands/client/upsert";
import { Requester } from "./http";

export type CommandArgs<TCommand extends new (_args: any) => any> =
  ConstructorParameters<TCommand>[0];

/**
 * Serverless vector client for upstash vector db.
 */
export class Vector {
  protected client: Requester;

  /**
   * Create a new vector db client
   *
   * @example
   * ```typescript
   * const redis = new Vector({
   *  url: "<UPSTASH_REDIS_REST_URL>",
   *  token: "<UPSTASH_REDIS_REST_TOKEN>",
   * });
   * ```
   */
  constructor(client: Requester) {
    this.client = client;
  }

  delete = (args: CommandArgs<typeof DeleteCommand>) => new DeleteCommand(args).exec(this.client);
  query = (args: CommandArgs<typeof QueryCommand>) => new QueryCommand(args).exec(this.client);
  upsert = (args: CommandArgs<typeof UpsertCommand>) => new UpsertCommand(args).exec(this.client);
}
