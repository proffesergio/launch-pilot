import { describe, it, expect } from "vitest";

import { getOrCreateCorrelationId } from "./correlation";

describe("getOrCreateCorrelationId", () => {
  it("propagates an incoming x-correlation-id header", () => {
    const headers = new Headers({ "x-correlation-id": "abc-123" });
    expect(getOrCreateCorrelationId(headers)).toBe("abc-123");
  });

  it("generates a UUID when the header is absent", () => {
    const id = getOrCreateCorrelationId(new Headers());
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("rejects header values that could pollute logs", () => {
    // Anything beyond a short token id is replaced, not trusted.
    const headers = new Headers({ "x-correlation-id": "x".repeat(200) });
    const id = getOrCreateCorrelationId(headers);
    expect(id).not.toBe("x".repeat(200));
  });
});
