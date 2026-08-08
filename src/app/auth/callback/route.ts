import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/callback
 *
 * OAuth (PKCE) redirect target. After the user completes Google sign-in,
 * Supabase appends `?code=...` (PKCE) — never `#access_token=...` — to this
 * URL. This route:
 *   1. Reads the authorization code
 *   2. Exchanges it for a session (stored in Supabase auth cookies)
 *   3. Verifies the authenticated user via `getUser()`
 *   4. Redirects to an internal `next` path (default `/home`)
 *
 * Tokens are never exposed in the visible URL.
 */

const DEFAULT_NEXT_PATH = '/home'

/**
 * Restrict `next` to internal, relative paths only to prevent open redirects.
 * Anything else (absolute URLs, protocol-relative, backslash tricks) falls back
 * to `/home`.
 */
function safeNextPath(next: string | null): string {
  if (
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('://') &&
    !next.includes('\\')
  ) {
    return next
  }
  return DEFAULT_NEXT_PATH
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = safeNextPath(searchParams.get('next'))

  // Redirect back to the origin the user authenticated from. On Vercel (direct
  // deployment, no load balancer) `request.url` is already the public URL, so
  // `origin` is authoritative — never trust a client-supplied x-forwarded-host.
  const redirectWithError = (message: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)

  // OAuth provider reported a failure (e.g. user cancelled at Google).
  if (error) {
    return redirectWithError(errorDescription || 'Authentication failed. Please try again.')
  }

  // PKCE always delivers ?code= — anything else is an invalid callback.
  // (Implicit-flow callbacks arrive with #access_token= in the fragment, which
  // never reaches the server; this is exactly the broken flow we replaced.)
  if (!code) {
    return redirectWithError('Invalid authentication callback. Please try again.')
  }

  try {
    const supabase = await createClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return redirectWithError(exchangeError.message || 'Sign-in failed. Please try again.')
    }

    // Verify the session actually exists before redirecting.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return redirectWithError('Authentication failed. Please try again.')
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch {
    return redirectWithError('Something went wrong during authentication. Please try again.')
  }
}
