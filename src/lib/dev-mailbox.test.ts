import { describe, it, expect, vi, afterEach } from "vitest";

import {
  readLastMagicLink,
  readOtp,
  recordMagicLink,
  recordOtp,
} from "./dev-mailbox";

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

  it("survives a fresh module instance (Next dev recycles workers)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    recordMagicLink("worker-a@example.com", "http://localhost:3000/magic?token=xyz");
    recordOtp("+8801512345678", "111222");

    // Simulate the write and the read landing in different dev-server
    // workers: a re-imported module must still see the recorded values.
    vi.resetModules();
    const fresh = await import("./dev-mailbox");
    expect(fresh.readLastMagicLink("worker-a@example.com")?.url).toContain("token=xyz");
    expect(fresh.readOtp("+8801512345678")).toBe("111222");
  });

  it("stores OTPs per phone outside production, never in production", () => {
    vi.stubEnv("NODE_ENV", "development");
    recordOtp("+8801712345678", "123456");
    recordOtp("+8801912345678", "654321");
    expect(readOtp("+8801712345678")).toBe("123456");
    expect(readOtp("+8801912345678")).toBe("654321");

    vi.stubEnv("NODE_ENV", "production");
    recordOtp("+8801712345678", "999999");
    expect(readOtp("+8801712345678")).toBeNull();
  });
});
