/**
 * Turns raw backend/auth error strings into clear, user-facing messages.
 * Shared by every sign-in / sign-up screen so behaviour stays consistent.
 */
export function friendlyAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (!m) return 'Something went wrong — please try again.';
  if (m.includes('invalid email or password') || m.includes('invalid_credentials'))
    return 'Email or password is incorrect.';
  if (m.includes('already exists') || m.includes('user_exists'))
    return 'An account with this email already exists — switch to Sign In.';
  if (m.includes('not verified'))
    return 'Confirm your email first — you can resend the link below.';
  if (m.includes('rate') || m.includes('too many') || m.includes('429'))
    return 'Too many attempts — wait a minute and try again.';
  if (m.includes('fetch') || m.includes('network') || m.includes('load failed'))
    return 'Could not reach the server — check your connection and try again.';
  if (m.includes('google_not_configured'))
    return 'Google Sign-In is not configured on the server yet. Please use email and password.';
  if (m.includes('invalid_client') || m.includes('redirect_uri') || m.includes('redirect uri'))
    return 'Google Sign-In is misconfigured (redirect URI). Please contact support or use email and password.';
  if (m.includes('access_denied') || m.includes('cancelled'))
    return 'Google sign-in was cancelled.';
  if (m.includes('google') && m.includes('email'))
    return 'Google did not return an email address. Try a different Google account or use email and password.';
  if (m.includes('email_not_configured'))
    return 'Email delivery is not configured on the server yet. Please contact support.';
  if (m.includes('email_failed'))
    return 'The email could not be sent right now. Please try again later or contact support.';
  return message as string;
}
