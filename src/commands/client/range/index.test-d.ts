import type { Dict } from "@commands/client/types";
import { Index } from "@utils/test-utils";
import { expectTypeOf, test } from "vitest";

type Metadata = { genre: string; year: number };

test("case 1: no metadata is provided, any object should be expected", () => {
  const _index = new Index();

  type RetrievedRangeVector = Awaited<ReturnType<typeof _index.range>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Dict>();
});

test("case 2: index-level metadata is provided, index-level metadata should be expected", () => {
  const _index = new Index<Metadata>();

  type RetrievedRangeVector = Awaited<ReturnType<typeof _index.range<Metadata>>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Metadata>();
});

test("case 3: index-level and command-level metadata are provided, command-level metadata should be expected", () => {
  const _index = new Index<Metadata>();

  type OverrideMetadata = { director: string };

  type RetrievedRangeVector = Awaited<
    ReturnType<typeof _index.range<OverrideMetadata>>
  >["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<OverrideMetadata>();
});

test("case 4: command-level metadata is provided, command-level metadata should be expected", () => {
  const _index = new Index();

  type RetrievedRangeVector = Awaited<ReturnType<typeof _index.range<Metadata>>>["vectors"][number];

  type RetrievedMetadata = NonNullable<NonNullable<RetrievedRangeVector>["metadata"]>;

  expectTypeOf<RetrievedMetadata>().toEqualTypeOf<Metadata>();
});
