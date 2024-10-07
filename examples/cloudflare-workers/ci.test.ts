import { test, expect, } from "bun:test";

const deploymentURL = process.env.DEPLOYMENT_URL ?? "http://127.0.0.1:8787";
if (!deploymentURL) {
	throw new Error("DEPLOYMENT_URL not set");
}

test("the server is running", async () => {
	const res = await fetch(deploymentURL);

	if (res.status !== 200) {
		console.log(await res.text());
	}
	const body = await res.json() as { id: string };
	expect(res.status).toEqual(200);

	expect(body.id).toEqual("my-id");
}, { timeout: 10000 });


