import { InfoCommand } from "@commands/client";
import { sleep } from "bun";
import { ResetCommand } from "../commands/client/reset";
import { HttpClient, RetryConfig } from "../http";

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
    s.push(String.fromCharCode(bytes[i]));
  }
  return btoa(s.join(""));
}

export const randomFloat = () => parseFloat((Math.random() * 10).toFixed(1));

export const resetIndexes = async () => await new ResetCommand().exec(newHttpClient());

export const range = (start: number, end: number, step = 1) => {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

export const awaitUntilIndexed = async (
  client: HttpClient,
  namespace: string | null = null,
  timeoutMillis = 10_000
) => {
  const start = performance.now();

  do {
    const info = await new InfoCommand().exec(client);

    if (namespace === null) {
      // check the total pending count if no namespace is provided
      if (info.pendingVectorCount === 0) {
        // OK, nothing more to index.
        return;
      }
    } else {
      const nsInfo = info.namespaces[namespace];
      if (nsInfo === undefined) {
        throw new Error(`Index does not have a namespace called '${namespace}'`);
      }

      if (nsInfo.pendingVectorCount === 0) {
        // OK, nothing more to index.
        return;
      }
    }

    // Not indexed yet, sleep a bit and check again if the timeout is not passed.
    await sleep(1000);
  } while (performance.now() < start + timeoutMillis);

  throw new Error(`Indexing is not completed in ${timeoutMillis} ms.`);
};
