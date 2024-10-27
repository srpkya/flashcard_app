import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_TURSO_DATABASE_URL) {
  throw new Error('NEXT_PUBLIC_TURSO_DATABASE_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN) {
  throw new Error('NEXT_PUBLIC_TURSO_AUTH_TOKEN is not defined');
}

export default {
  schema: './lib/schema.ts',
  out: './migrations',
  driver: 'turso',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
} satisfies Config;