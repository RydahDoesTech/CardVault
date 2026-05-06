/**
 * Google OAuth (future)
 *
 * 1. In Supabase Dashboard → Authentication → Providers, enable Google and add
 *    your Web / iOS / Android OAuth client IDs.
 * 2. Add platform-specific redirect URLs (e.g. `cardvault://auth` / Expo dev scheme).
 * 3. Call:
 *
 *    import { supabase } from '@/lib/supabase';
 *    await supabase.auth.signInWithOAuth({
 *      provider: 'google',
 *      options: { redirectTo: '<your-deep-link>' },
 *    });
 *
 * 4. Use `expo-linking` + `expo-web-browser` (or `openAuthSessionAsync`) to complete
 *    the loop in the dev client.
 *
 * For now, the login screen shows a copy block where this can be wired.
 */
export const GOOGLE_OAUTH_TODO = true;
