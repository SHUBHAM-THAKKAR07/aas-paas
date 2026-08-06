import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth redirect from Supabase after Google sign-in.
 * Exchanges the authorization code for a session, then redirects
 * the user to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors from the provider
  if (error) {
    const message = encodeURIComponent(
      errorDescription || "Authentication failed. Please try again."
    );
    return NextResponse.redirect(
      new URL(`/login?error=${message}`, origin)
    );
  }

  // No code present — invalid callback
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20authorization%20code", origin)
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const message = encodeURIComponent(exchangeError.message);
      return NextResponse.redirect(
        new URL(`/login?error=${message}`, origin)
      );
    }

    // Session established — redirect to app
    return NextResponse.redirect(new URL("/home", origin));
  } catch {
    return NextResponse.redirect(
      new URL(
        "/login?error=Something%20went%20wrong%20during%20authentication",
        origin
      )
    );
  }
}
