/**
 * Unit test — verify original routes are registered on the Express app.
 *
 * Validates: Requirements R2.2
 *
 * Checks that app._router.stack contains middleware layers whose regexp
 * matches each of the four original route prefixes:
 *   /api/auth, /api/designs, /api/projects, /api/contact
 */

import { describe, it, expect, beforeAll } from "vitest";

// Set NODE_ENV=test before importing the app so the mongoose connect/listen
// guard is skipped — we only need the configured Express instance.
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

describe("Original routes are registered", () => {
  it("should have /api/auth route registered", () => {
    const regexps = collectRouterRegexps(app);
    const found = regexps.some((r) => r.includes("api/auth") || r.includes("\\/api\\/auth"));
    expect(found, `Expected /api/auth in router stack. Stack: ${regexps.join(", ")}`).toBe(true);
  });

  it("should have /api/designs route registered", () => {
    const regexps = collectRouterRegexps(app);
    const found = regexps.some((r) => r.includes("api/designs") || r.includes("\\/api\\/designs"));
    expect(found, `Expected /api/designs in router stack. Stack: ${regexps.join(", ")}`).toBe(true);
  });

  it("should have /api/projects route registered", () => {
    const regexps = collectRouterRegexps(app);
    const found = regexps.some((r) => r.includes("api/projects") || r.includes("\\/api\\/projects"));
    expect(found, `Expected /api/projects in router stack. Stack: ${regexps.join(", ")}`).toBe(true);
  });

  it("should have /api/contact route registered", () => {
    const regexps = collectRouterRegexps(app);
    const found = regexps.some((r) => r.includes("api/contact") || r.includes("\\/api\\/contact"));
    expect(found, `Expected /api/contact in router stack. Stack: ${regexps.join(", ")}`).toBe(true);
  });

  it("should have all four original routes registered", () => {
    const regexps = collectRouterRegexps(app);
    const routes = ["auth", "designs", "projects", "contact"];
    for (const route of routes) {
      const found = regexps.some((r) => r.includes(`api/${route}`) || r.includes(`\\/api\\/${route}`));
      expect(found, `Expected /api/${route} in router stack`).toBe(true);
    }
  });
});
