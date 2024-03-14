import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(name, sql, params, logMode: 'short' | 'long' = null): Promise<any[]> {
  try {
    if ((logMode ?? process.env.DB_LOG_MODE) === 'long')
      console.log(sql)
    const a = performance.now()
    const rows = (await pool.query(sql, params)).rows
    const b = performance.now()
    if (process.env.NODE_ENV === 'development')
      console.info(`Query ${name}[${params}] executed in ${((b - a)/1000).toFixed(3)}s, ${rows.length} rows fetched.`)
    if ((logMode ?? process.env.DB_LOG_MODE) === 'long')
      console.log(rows)
    return rows
  } catch (error) {
    throw `Error on query ${name}: ${error}`
  }
}
