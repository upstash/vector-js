

type IdsPayload = (number[] | string[]) | number | string;

type ObjectPayload =
  | {
      ids: number[] | string[];
    }
  | {
      prefix: string;
    }
  | {
      filter: string;
    };

export type DeleteCommandPayload = IdsPayload | ObjectPayload;