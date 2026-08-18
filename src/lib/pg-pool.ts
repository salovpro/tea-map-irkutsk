import { Pool, type PoolConfig } from "pg";

/**
 * pg v8 treats sslmode=require as verify-full, which breaks Supabase pooler
 * connections from Amvera ("self-signed certificate in certificate chain").
 * Strip sslmode from the URL and set Pool.ssl explicitly instead.
 */
function sanitizeConnectionString(connectionString: string) {
  const needsSsl = !/sslmode=disable/i.test(connectionString);

  const withoutSslMode = connectionString
    .replace(/([?&])sslmode=[^&]*/gi, "$1")
    .replace(/([?&])uselibpqcompat=[^&]*/gi, "$1")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");

  return { connectionString: withoutSslMode, needsSsl };
}

export function createPgPool(connectionString: string) {
  const { connectionString: sanitized, needsSsl } =
    sanitizeConnectionString(connectionString);

  const config: PoolConfig = { connectionString: sanitized };

  if (needsSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}
