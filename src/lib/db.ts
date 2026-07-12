import mysql from 'mysql2/promise';

export interface MySQLEnv {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function getMySQLEnv(): MySQLEnv {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !database) {
    throw new Error(
      'Missing MySQL environment variables. Add MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and optionally MYSQL_PASSWORD, MYSQL_PORT) to .env.local.'
    );
  }

  return {
    host,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    user,
    password: process.env.MYSQL_PASSWORD ?? '',
    database,
  };
}

const globalForDb = globalThis as unknown as { __mysqlPool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!globalForDb.__mysqlPool) {
    const env = getMySQLEnv();
    globalForDb.__mysqlPool = mysql.createPool({
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      database: env.database,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    });
  }
  return globalForDb.__mysqlPool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}

export interface ResultSetHeader {
  affectedRows: number;
  insertId: number | string;
  warningStatus: number;
}

export async function insert(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as unknown as ResultSetHeader;
}

// Bulk insert using the `INSERT ... VALUES ?` syntax (mysql2 formats nested arrays safely).
export async function bulkInsert(
  sql: string,
  rows: any[][]
): Promise<ResultSetHeader> {
  if (rows.length === 0) {
    return { affectedRows: 0, insertId: 0, warningStatus: 0 } as ResultSetHeader;
  }
  const [result] = await getPool().query(sql, [rows]);
  return result as unknown as ResultSetHeader;
}
