/**
 * Database bootstrap script.
 *
 *   npm run db:setup
 *
 * Connects to PostgreSQL, creates the `vex_db` database (if missing), then runs
 * schema.sql to create all tables, indexes, and the progress trigger.
 *
 * Requires PostgreSQL to be installed and running, and the connection string in
 * .env (DATABASE_URL) to point at a valid superuser/account.
 */
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vex_db'

function parseConnString(url) {
    // postgresql://user:password@host:port/dbname
    const m = url.match(/^postgresql?:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)$/)
    if (!m) throw new Error('Could not parse DATABASE_URL: ' + url)
    return { user: m[1], password: m[2], host: m[3], port: m[4], database: m[5] }
}

async function main() {
    const cfg = parseConnString(DATABASE_URL)
    console.log(`\n  Connecting to PostgreSQL as "${cfg.user}" @ ${cfg.host}:${cfg.port}`)

    // 1. Connect to the default "postgres" DB to create vex_db if it doesn't exist
    const adminPool = new Pool({
        user: cfg.user,
        password: cfg.password,
        host: cfg.host,
        port: Number(cfg.port),
        database: 'postgres',
    })

    try {
        const exists = await adminPool.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [cfg.database]
        )
        if (exists.rowCount === 0) {
            await adminPool.query(`CREATE DATABASE ${cfg.database}`)
            console.log(`  ✓ Created database "${cfg.database}"`)
        } else {
            console.log(`  • Database "${cfg.database}" already exists`)
        }
    } catch (err) {
        console.error('\n  ✗ Could not connect to PostgreSQL.')
        console.error('    Make sure PostgreSQL is installed and running, and that the')
        console.error('    DATABASE_URL in .env has the correct user/password.\n')
        console.error('    Error:', err.message, '\n')
        process.exit(1)
    } finally {
        await adminPool.end()
    }

    // 2. Connect to vex_db and run schema.sql
    const dbPool = new Pool({
        user: cfg.user,
        password: cfg.password,
        host: cfg.host,
        port: Number(cfg.port),
        database: cfg.database,
    })

    try {
        const schemaPath = path.join(__dirname, 'schema.sql')
        const sql = fs.readFileSync(schemaPath, 'utf8')
        await dbPool.query(sql)
        console.log('  ✓ Schema applied (tables, indexes, trigger)\n')
        console.log('  Database ready! You can now run: npm run dev\n')
    } catch (err) {
        console.error('\n  ✗ Failed to apply schema:', err.message, '\n')
        process.exit(1)
    } finally {
        await dbPool.end()
    }
}

main()
