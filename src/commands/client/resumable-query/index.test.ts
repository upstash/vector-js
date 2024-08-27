import { afterAll, describe, expect, test } from "bun:test";
import { QueryCommand, UpsertCommand } from "@commands/index";
import { Index, awaitUntilIndexed, newHttpClient, randomID, range } from "@utils/test-utils";
import { sleep } from "bun";

const client = newHttpClient();

describe("RESUMABLE QUERY", () => {
	const index = new Index();
	test("should start query successfully", async () => {
		const { start } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		})

		const res = await start();

		expect(res.uuid).toBeDefined();
	});
	test("should stop query successfully", async () => {
		const { fetchNext, stop } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		})

		const res = await stop();

		expect(res).toBe("Success");

		await expect(async () => {
			await fetchNext(5);
		}).toThrow("Resumable query has not been started. Call start() first.");
	});

	test("should resume query", async () => {
		for (let i = 0; i < 5; i++) {
			await index.upsert({ id: randomID(), vector: range(0, 384) });
		}

		await awaitUntilIndexed(index);

		const { fetchNext, stop } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			vector: range(0, 384),
			includeMetadata: true,
			includeVectors: true,
		})

		const res1 = await fetchNext(2);
		const res2 = await fetchNext(2);

		expect(res1.length).toBe(2);
		expect(res2.length).toBe(2);

		expect(res1).not.toEqual(res2);
		await stop()
	});

	test("should start resumable query with data", async () => {
		for (let i = 0; i < 5; i++) {
			await index.upsert({ id: randomID(), vector: range(0, 384) });
		}

		await awaitUntilIndexed(index);
		const { fetchNext } = await index.resumableQuery({
			maxIdle: 3600,
			topK: 50,
			data: "testing it",
			includeMetadata: true,
			includeVectors: true,
		})

		const res = await fetchNext(2);

		expect(res.length).toBe(2);
	})

});
