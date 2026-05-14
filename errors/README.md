# Error Log & Fixes

This directory tracks encountered errors, their summaries, and how they were resolved.

## Error Index

| Error ID | Summary | Status |
|----------|---------|--------|
| ERR-001 | TypeScript error: Invalid identifier for keys starting with numbers. | Resolved |
| ERR-002 | React Hook Lint: Calling setState synchronously within an effect. | Resolved |
| ERR-003 | Browser 'TypeError: Failed to fetch' when calling TCG API. | In Progress |
| ERR-004 | Supabase Auth: 400 Bad Request during Sign In/Up. | Resolved |
| ERR-005 | PostgREST Error (PGRST205): Table 'portfolio' not found in schema cache. | In Progress |

---

### Format for new entries:
#### [ERR-001]: TypeScript error: Invalid identifier for keys starting with numbers
- **Description:** Parsing error in `types/pokemon.ts` where properties like `1stEditionHolofoil` were used.
- **Root Cause:** TypeScript identifiers cannot start with a number unless they are wrapped in quotes (as string literals).
- **Fix:** Wrapped the property names in double quotes: `"1stEditionHolofoil": CardPrice;`.
- **Files Affected:** `types/pokemon.ts`

#### [ERR-002]: React Hook Lint: Calling setState synchronously within an effect
- **Description:** `react-hooks/set-state-in-effect` error in `app/page.tsx`.
- **Root Cause:** Calling a function that updates state directly inside `useEffect` without proper dependencies or memoization can trigger unnecessary re-renders.
- **Fix:** Wrapped `performSearch` in `useCallback` and added it to the `useEffect` dependency array.
- **Files Affected:** `app/page.tsx`

#### [ERR-003]: Browser 'TypeError: Failed to fetch'
- **Description:** Browser console shows `TypeError: Failed to fetch` at `lib/api.ts:20`.
- **Root Cause:** Likely a CORS issue when calling the API directly from the client-side.
- **Fix:** Transitioning to server-side fetching or the new Pokeprice API.

#### [ERR-004]: Supabase Auth: 400 Bad Request
- **Description:** Server responds with 400 status when attempting to sign in or sign up.
- **Possible Causes:** Invalid credentials or missing account.
- **Fix:** Switched to "Sign Up" mode and ensured password length > 6.

#### [ERR-005]: PostgREST Error (PGRST205)
- **Description:** Server responds with "Could not find the table 'public.portfolio' in the schema cache".
- **Root Cause:** The `portfolio` table does not exist in the Supabase database.
- **Fix:** Run the initialization SQL in the Supabase SQL Editor.
