/**
 * Unit test — verify root package.json scripts
 *
 * Validates: Requirements R9
 *
 * Parses the root package.json and asserts the "scripts" field
 * contains "dev", "dev:client", and "dev:server".
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_PACKAGE_JSON_PATH = path.resolve(__dirname, "..", "..", "package.json");

describe("Root package.json scripts", () => {
  const pkg = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, "utf-8"));
  const scripts = pkg.scripts || {};

  const requiredScripts = ["dev", "dev:client", "dev:server"];

  for (const scriptName of requiredScripts) {
    it(`should have "${scriptName}" script defined`, () => {
      expect(
        scripts,
        `Expected root package.json to have a "${scriptName}" script`
      ).toHaveProperty(scriptName);
    });
  }

  it("should have all three required scripts", () => {
    for (const scriptName of requiredScripts) {
      expect(
        scripts,
        `Missing required script: "${scriptName}"`
      ).toHaveProperty(scriptName);
    }
  });
});
