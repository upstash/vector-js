import { sleep } from "bun";
import { InfoCommand } from "../commands/client/info";
import { ResetCommand } from "../commands/client/reset";
import { HttpClient, type RetryConfig } from "../http";
import type { Index } from "../vector";
import { UpsertCommand } from "@commands/client";
export * from "../platforms/nodejs";

export type NonArrayType<T> = T extends Array<infer U> ? U : T;

export const newHttpClient = (
  retry?: RetryConfig | undefined,
  altToken?: { url: string; token: string }
) => {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  if (!url) {
    throw new Error("Could not find url");
  }
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!token) {
    throw new Error("Could not find token");
  }

  return new HttpClient({
    baseUrl: altToken?.url ?? url,
    headers: { authorization: `Bearer ${altToken?.token ?? token}` },
    retry,
  });
};

export function keygen(): {
  newKey: () => string;
} {
  const keys: string[] = [];
  return {
    newKey: () => {
      const key = randomID();
      keys.push(key);
      return key;
    },
  };
}

export function randomID(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  const s: string[] = [];
  for (let i = 0; i < bytes.byteLength; i++) {
    s.push(String.fromCodePoint(bytes[i]));
  }
  return btoa(s.join(""));
}

export const randomFloat = () => Number.parseFloat((Math.random() * 10).toFixed(1));

export const resetIndexes = async () =>
  await Promise.all([
    new ResetCommand({ all: true }).exec(newHttpClient()),
    new ResetCommand({ all: true }).exec(
      newHttpClient(undefined, {
        token: process.env.SPARSE_UPSTASH_VECTOR_REST_TOKEN!,
        url: process.env.SPARSE_UPSTASH_VECTOR_REST_URL!,
      })
    ),
    new ResetCommand({ all: true }).exec(
      newHttpClient(undefined, {
        token: process.env.HYBRID_UPSTASH_VECTOR_REST_TOKEN!,
        url: process.env.HYBRID_UPSTASH_VECTOR_REST_URL!,
      })
    ),
  ]);

export const range = (start: number, end: number, step = 1) => {
  const result = [];
  for (let i = start; i < end; i += step) {
    const randomNum = Math.floor(Math.random() * (end - start + 1)) + start;
    result.push(randomNum);
  }
  return result;
};

export const awaitUntilIndexed = async (client: HttpClient | Index, timeoutMillis = 10_000) => {
  const start = performance.now();

  const getInfo = async () => {
    if (client instanceof HttpClient) {
      const cmd = new InfoCommand();
      return await cmd.exec(client);
    }

    return await client.info();
  };

  do {
    const info = await getInfo();
    if (info.pendingVectorCount === 0) {
      // OK, nothing more to index.
      return;
    }

    // Not indexed yet, sleep a bit and check again if the timeout is not passed.
    await sleep(1000);
  } while (performance.now() < start + timeoutMillis);

  throw new Error(`Indexing is not completed in ${timeoutMillis} ms.`);
};

export const populateSparseIndex = async (index: Index, namespace: string) => {
  const mockData: ConstructorParameters<typeof UpsertCommand>[0] = [
    {
      id: "id0",
      sparseVector: [
        [0, 1],
        [0.1, 0.2],
      ],
    },
    {
      id: "id1",
      sparseVector: [
        [1, 2],
        [0.2, 0.3],
      ],
      metadata: { key: "value" },
    },
  ];
  mockData.push({
    id: "id2",
    sparseVector: [
      [2, 3],
      [0.3, 0.4],
    ],
    metadata: { key: "value" },
    // @ts-expect-error data field isn't allowed because this is
    // a vector payload. but we allow it for the test purposes
    data: "data",
  });
  await index.upsert(mockData, { namespace });
  await awaitUntilIndexed(index);
  return mockData;
};

export const populateHybridIndex = async (index: Index, namespace: string) => {
  const mockData: ConstructorParameters<typeof UpsertCommand>[0] = [
    {
      id: "id0",
      vector: [0.1, 0.2],
      sparseVector: [
        [0, 1],
        [0.1, 0.2],
      ],
    },
    {
      id: "id1",
      vector: [0.2, 0.3],
      sparseVector: [
        [1, 2],
        [0.2, 0.3],
      ],
      metadata: { key: "value" },
    },
  ];
  mockData.push({
    id: "id2",
    vector: [0.3, 0.4],
    sparseVector: [
      [2, 3],
      [0.3, 0.4],
    ],
    metadata: { key: "value" },
    // @ts-expect-error data field isn't allowed because this is
    // a vector payload. but we allow it for the test purposes
    data: "data",
  });
  await index.upsert(mockData, { namespace });
  await awaitUntilIndexed(index);
  return mockData;
};
