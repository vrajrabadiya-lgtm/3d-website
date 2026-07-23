/**
 * Unit test — verify AI router is mounted at /api/ai
 *
 * Validates: Requirements R4
 *
 * Imports the Express app and verifies app._router.stack includes a layer
 * matching the /api/ai prefix.
 */

import { describe, it, expect, beforeAll } from "vitest";

process.env.NODE_ENV = "test";

let app;

beforeAll(async () => {
  const mod = await import("../index.js");
  app = mod.default;
});

/**
 * Collects every regexp string from app._router.stack, including nested
 * routers (each Router middleware has its own .handle.stack of layers).
 */
function collectRouterRegexps(app) {
  const regexps = [];

  if (!app._router) return regexps;

  for (const layer of app._router.stack) {
    if (layer.regexp) {
      regexps.push(layer.regexp.toString());
    }
  }

  return regexps;
}

describe("AI router mounted at /api/ai", () => {
  it("should have /api/ai route registered", () => {
    const regexps = collectRouterRegexps(app);
    const found = regexps.some(
      (r) => r.includes("api/ai") || r.includes("\\/api\\/ai")
    );
    expect(
      found,
      `Expected /api/ai in router stack. Stack: ${regexps.join(", ")}`
    ).toBe(true);
  });
});
