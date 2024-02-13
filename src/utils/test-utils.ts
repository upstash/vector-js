import { ResetCommand } from "../commands/client/reset";
import { HttpClient, RetryConfig } from "../http";

export type NonArrayType<T> = T extends Array<infer U> ? U : T;

export const newHttpClient = (retry?: RetryConfig | undefined) => {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  if (!url) {
    throw new Error("Could not find url");
  }
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
  if (!token) {
    throw new Error("Could not find token");
  }

  return new HttpClient({
    baseUrl: url,
    headers: { authorization: `Bearer ${token}` },
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
