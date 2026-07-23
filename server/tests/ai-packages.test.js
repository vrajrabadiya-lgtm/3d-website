/**
 * Unit test — verify server/package.json lists all five AI packages
 *
 * Validates: Requirements R7
 *
 * Parses server/package.json and asserts all five AI package names
 * are present in the "dependencies" field.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_JSON_PATH = path.resolve(__dirname, "..", "package.json");

describe("AI packages in server/package.json", () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  const deps = pkg.dependencies || {};

  const requiredPackages = [
    "@anthropic-ai/sdk",
    "@google/genai",
    "google-auth-library",
    "groq-sdk",
    "@supabase/supabase-js",
  ];

  for (const pkgName of requiredPackages) {
    it(`should have "${pkgName}" in dependencies`, () => {
      expect(
        deps,
        `Expected "${pkgName}" to be in server/package.json dependencies`
      ).toHaveProperty(pkgName);
    });
  }

  it("should have all five AI packages listed", () => {
    for (const pkgName of requiredPackages) {
      expect(deps).toHaveProperty(pkgName);
    }
  });
});
