# Aas-Paas — Security

## Environment Variables

| Variable | Exposure | Rule |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser) | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (browser) | Safe to expose — only permits RLS-allowed operations |
| `SUPABASE_SERVICE_ROLE_KEY` | **SERVER ONLY** | **NEVER** expose to browser. Rotate immediately if leaked. |
| `GOOGLE_CLIENT_SECRET` | **SERVER ONLY** | Never expose |

## Service Role Key Protection

The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security.

Rules:
1. Never import `lib/supabase/admin.ts` in Client Components or any browser bundle
2. Never log the service role key in server output
3. Never include it in API responses
4. Never commit it to version control (`.env.local` is in `.gitignore`)
5. Only use in Route Handlers, Server Actions, and Edge Functions

## Location Privacy

User location is private by design:

- Exact coordinates are stored in Supabase but never returned in public API responses
- The public UI displays only approximate distance labels:
  - "200m away", "400m away", "800m away", "1.5km away", "~5km away"
- The `neighbourhood` and `locality` fields are public
- The exact `lat/lng` of a user's home is server-only

## Row Level Security

All Supabase tables must have RLS enabled before production data is inserted.

Policies enforce:
- Users can only read their own private data
- Users can only update their own profile
- Posts are readable by all authenticated users within radius
- Post creation requires authentication

## Authorization Principles

1. **Never trust browser-provided identity** for security decisions
2. **Verify session server-side** on every protected request (via the middleware proxy)
3. **Admin operations use the service role client** — never the anon client
4. **RLS is the database-level enforcement** — application checks are secondary

## Free-MVP Security Notes

- No paid WAF required for MVP (Vercel edge provides basic protection)
- Rate limiting is enforced via Supabase RLS policies + application-level checks
- No phone verification in MVP — trust is built through email + community signals
- Phone OTP can be added in V1.1 without changing the trust architecture
