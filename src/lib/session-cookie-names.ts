// Kept dependency-free (no prisma, no next/headers) so proxy.ts — which
// only needs to check cookie presence, not validity — can import it without
// pulling the DB layer into the proxy's request path.
export const SESSION_COOKIE = "session";
export const ADMIN_SESSION_COOKIE = "admin_session";
