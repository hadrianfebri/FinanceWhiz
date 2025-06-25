import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced connection configuration for better reliability
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});

export const db = drizzle({ client: pool, schema });

// Test database connection and handle endpoint disabled errors
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (error: any) {
    if (error.message?.includes('endpoint is disabled')) {
      console.warn('Database endpoint is disabled. The database may need to be reactivated.');
      return false;
    }
    console.error('Database connection error:', error);
    return false;
  }
}