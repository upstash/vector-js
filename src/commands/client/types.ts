export type Vector<TMetadata = Dict> = {
  id: string;
  vector?: number[];
  sparseVector?: RawSparseVector;
  metadata?: TMetadata;
  data?: string;
};

export type NAMESPACE = string;

export type Dict = Record<string, unknown>;

export type RawSparseVector = [index: number[], factors: number[]];
