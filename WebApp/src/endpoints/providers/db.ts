import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(name, sql, params): Promise<any[]> {
  try {
    const a = performance.now()
    const rows = (await pool.query(sql, params)).rows
    const b = performance.now()
    if (process.env.NODE_ENV === 'development')
      console.info(`Query ${name} executed in ${(b - a)/1000}s, ${rows.length} rows fetched.`)
    console.log(rows)
    return rows
  } catch (error) {
    throw `Error on query ${name}: ${error}`
  }
}
