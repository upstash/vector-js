export const expectType = <T>(_: T) => {
  // Do nothing, the TypeScript compiler handles this for us
};

export type TypeEqual<Target, Value> = (<T>() => T extends Target ? 1 : 2) extends <
  T,
>() => T extends Value ? 1 : 2
  ? true
  : false;

export type NonArrayType<T> = T extends Array<infer U> ? U : T;

export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * because typescript is removed at build-time, this function's sole purpose
 * is to avoid namespace collisions in the definition test files.
 */
export function test(_: string, __: () => void) {}
