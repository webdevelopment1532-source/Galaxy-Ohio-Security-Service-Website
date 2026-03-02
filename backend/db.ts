import * as mariadb from 'mariadb';

export const pool = mariadb.createPool({
  host: 'localhost',
  user: 'galaxyapp',
  password: 'Red3ak1',
  database: 'galaxysecuritydb',
  connectionLimit: 5,
});

export async function query(sql: string, params?: any[]) {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    return res;
  } finally {
    if (conn) conn.release();
  }
}
