import { describe, it, expect } from "vitest";

import { withConnectRetry } from "./fetch-retry";

function connectError(code: string) {
  const err = new TypeError("fetch failed");
  (err as TypeError & { cause: { code: string } }).cause = { code };
  return err;
}

describe("withConnectRetry", () => {
  it("retries a connect-phase failure and succeeds", async () => {
    let calls = 0;
    const fetcher = withConnectRetry(async () => {
      calls += 1;
      if (calls === 1) throw connectError("ETIMEDOUT");
      return new Response("ok");
    }, { delayMs: 0 });
    const res = await fetcher("https://example.test/sql", {});
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });

  it("never retries once a response was received — even a 500", async () => {
    let calls = 0;
    const fetcher = withConnectRetry(async () => {
      calls += 1;
      return new Response("boom", { status: 500 });
    }, { delayMs: 0 });
    const res = await fetcher("https://example.test/sql", {});
    expect(res.status).toBe(500);
    expect(calls).toBe(1);
  });

  it("does not retry non-connect errors (request may have been sent)", async () => {
    let calls = 0;
    const fetcher = withConnectRetry(async () => {
      calls += 1;
      throw new Error("socket hang up mid-response");
    }, { delayMs: 0 });
    await expect(fetcher("https://example.test/sql", {})).rejects.toThrow(
      "socket hang up",
    );
    expect(calls).toBe(1);
  });

  it("gives up after 3 attempts", async () => {
    let calls = 0;
    const fetcher = withConnectRetry(async () => {
      calls += 1;
      throw connectError("ETIMEDOUT");
    }, { delayMs: 0 });
    await expect(fetcher("https://example.test/sql", {})).rejects.toThrow();
    expect(calls).toBe(3);
  });
});
