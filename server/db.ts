import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import * as schema from '@shared/schema';
import { log } from './vite';

// PostgreSQL client setup
let queryClient: ReturnType<typeof postgres>;
let db: PostgresJsDatabase<typeof schema>;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  // For database queries
  queryClient = postgres(process.env.DATABASE_URL);
  db = drizzle(queryClient, { schema });

  // Run migrations (this will create tables if they don't exist)
  log('Running database migrations', 'db');
  migrate(db, { migrationsFolder: './migrations' })
    .then(() => {
      log('Database migrations completed successfully', 'db');
    })
    .catch((err: Error) => {
      log(`Database migration error: ${err.message}`, 'db');
      console.error('Migration error:', err);
    });
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  log(`Database initialization error: ${errorMessage}`, 'db');
  console.error('Database connection error:', error);
}

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  log('Supabase client initialized', 'db');
} else {
  log('Supabase URL or key not provided, functionality will be limited', 'db');
}

export { db, supabase };