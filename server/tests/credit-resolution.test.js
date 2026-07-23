/**
 * Property test for credit resolution (Property 3)
 *
 * Validates: Requirements R6.1
 *
 * Property 3: Credit resolution never throws for any authorization header.
 *
 * Uses fast-check to test with various authorization header values:
 *   - undefined, empty string, random strings, and Bearer tokens
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { resolveUserCredits } from "../lib/ai-clients.js";

describe("Property 3: Credit resolution never throws", () => {
  it("should resolve without throwing for any authorization header", async () => {
    // Remove Supabase env vars to ensure fallback path is exercised
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(""),
          fc.string(),
          fc.string().map((s) => "Bearer " + s)
        ),
        async (authHeader) => {
          try {
            const result = await resolveUserCredits(authHeader);
            // With Supabase env vars missing, should return null
            expect(result).toBeNull();
          } catch (err) {
            // Should never throw
            expect.fail(
              `resolveUserCredits threw for authHeader "${authHeader}": ${err.message}`
            );
          }
        }
      ),
      { numRuns: 100 }
    );

    // Restore env vars
    if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });
});
