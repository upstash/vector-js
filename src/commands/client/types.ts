export type Vector<TMetadata = Dict> = {
  id: string;
  vector?: number[];
  metadata?: TMetadata;
  data?: string;
};

export type NAMESPACE = string;

export type Dict = Record<string, unknown>;
