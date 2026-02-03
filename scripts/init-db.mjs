#!/usr/bin/env node
// Initialize Supabase DB schema via direct pg connection
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force IPv4 
dns.setDefaultResultOrder('ipv4first');

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.fhrszauuowtahqfbfjxa',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');
    
    const sql = readFileSync(resolve(__dirname, '../src/lib/supabase-schema.sql'), 'utf-8');
    console.log('Executing schema SQL...');
    await client.query(sql);
    console.log('✅ Schema created successfully!');
    
    // Verify
    const res = await client.query('SELECT id, name, balance, status FROM economy_agents ORDER BY id');
    console.log('\nAgents initialized:');
    res.rows.forEach(r => console.log(`  ${r.id}: ${r.name} ($${r.balance}) [${r.status}]`));
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
