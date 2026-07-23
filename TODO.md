# Migration Plan: Supabase → MongoDB

## Steps

- [x] 1. Create `.env` file with all API keys and MongoDB URI
- [x] 2. Update `server/models/User.js` — Add credit fields (plan, builds_used, builds_limit, etc.)
- [x] 3. Update `server/lib/ai-clients.js` — Remove Supabase, replace with MongoDB-based credit resolution
- [x] 4. Update `server/routes/ai.js` — Use MongoDB credit system (no changes needed, already compatible)
- [x] 5. Update `server/package.json` — Remove @supabase/supabase-js dependency
- [x] 6. Install dependencies and verify server starts
