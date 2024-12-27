export type Vector<TMetadata = Dict> = {
  id: string;
  vector?: number[];
  sparseVector?: SparseVector;
  metadata?: TMetadata;
  data?: string;
};

export type NAMESPACE = string;

export type Dict = Record<string, unknown>;

export type SparseVector = {
  indices: number[];
  values: number[];
};
