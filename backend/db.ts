
import * as mariadb from 'mariadb';

// DEBUG: Print DB connection config at startup
console.log('[DEBUG] DB config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: process.env.DB_CONNECTION_LIMIT
});

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: toPositiveInteger(process.env.DB_PORT, 3306),
  user: getRequiredEnv('DB_USER'),
  password: getRequiredEnv('DB_PASSWORD'),
  database: getRequiredEnv('DB_NAME'),
  connectionLimit: toPositiveInteger(process.env.DB_CONNECTION_LIMIT, 5),
});

export async function query(sql: string, params?: any[]) {
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } finally {
    if (conn) conn.release();
  }
}

export async function runInTransaction<T>(
  operation: (txQuery: (sql: string, params?: any[]) => Promise<any[]>) => Promise<T>
): Promise<T> {
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    const txConn = conn;
    await conn.beginTransaction();

    const txQuery = async (sql: string, params?: any[]) => txConn.query(sql, params) as Promise<any[]>;
    const result = await operation(txQuery);

    await conn.commit();
    return result;
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
}
