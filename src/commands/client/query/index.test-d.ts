import { Dict } from "@commands/client/types";
import { Index } from "@utils/test-utils";
import { expectTypeOf, test } from "vitest";
type Metadata = { genre: string; year: number };

test("case 1: no metadata is provided, any object should be expected", () => {
  const index = new Index();

  type RetrievedQueryVector = Awaited<ReturnType<typeof index.query>>[number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedQueryVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Dict>();
});

test("case 2: index-level metadata is provided, index-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  type RetrievedQueryVector = Awaited<ReturnType<typeof index.query<Metadata>>>[number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedQueryVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Metadata>();
});

test("case 3: index-level and command-level metadata are provided, command-level metadata should be expected", () => {
  const index = new Index<Metadata>();

  type OverrideMetadata = { director: string };

  type RetrievedQueryVector = Awaited<ReturnType<typeof index.query<OverrideMetadata>>>[number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedQueryVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<OverrideMetadata>();
});

test("case 4: command-level metadata is provided, command-level metadata should be expected", () => {
  const index = new Index();

  type RetrievedQueryVector = Awaited<ReturnType<typeof index.query<Metadata>>>[number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedQueryVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Metadata>();
});
