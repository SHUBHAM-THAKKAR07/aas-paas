# Aas-Paas — Data Model

> **Status: Placeholder**
> The full database schema will be defined in the Stage 1 product implementation prompt.

## Planned Tables

The following is the intended schema architecture. Migration files will be created in `supabase/migrations/` during Stage 1.

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile, trust score, location (extends Supabase `auth.users`) |
| `posts` | All three module posts (nearby / help / need) via `module` discriminator |
| `post_confirmations` | Community confirmations for Nearby and Help posts |
| `trust_records` | Trust signal records per user (email_verified, admin_verified, etc.) |
| `notifications` | In-app notification records |
| `moderation_reports` | User-reported content |

### PostGIS

All geographic columns use PostGIS `GEOGRAPHY(POINT, 4326)`.
Spatial indexes on post location for fast radius queries.

### RLS Policies

Every table will have Row Level Security enabled before data is inserted.

### Regenerating Types

After applying migrations, regenerate TypeScript types:

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

Never manually maintain `database.types.ts` column types long-term.
