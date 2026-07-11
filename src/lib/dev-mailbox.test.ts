import { describe, it, expect, vi, afterEach } from "vitest";

import { recordMagicLink, readLastMagicLink } from "./dev-mailbox";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("dev mailbox (magic-link test hook)", () => {
  it("round-trips the last recorded magic link outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    recordMagicLink("user@example.com", "http://localhost:3000/magic?token=abc");
    expect(readLastMagicLink()).toEqual({
      email: "user@example.com",
      url: "http://localhost:3000/magic?token=abc",
    });
  });

  it("keeps one link per email so parallel sign-ins never race", () => {
    vi.stubEnv("NODE_ENV", "development");
    recordMagicLink("a@example.com", "http://localhost:3000/magic?token=aaa");
    recordMagicLink("b@example.com", "http://localhost:3000/magic?token=bbb");
    expect(readLastMagicLink("a@example.com")?.url).toContain("token=aaa");
    expect(readLastMagicLink("b@example.com")?.url).toContain("token=bbb");
    expect(readLastMagicLink("nobody@example.com")).toBeNull();
  });

  it("never records and never reads in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    recordMagicLink("user@example.com", "http://example.com/magic?token=leak");
    expect(readLastMagicLink()).toBeNull();
    expect(readLastMagicLink("user@example.com")).toBeNull();
  });
});
