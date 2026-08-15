import { Client } from "pg";

const ref = new URL(process.env.SUPABASE_PROJECT_URL).hostname.split(".")[0];
const password = process.env.POSTGRES_PASSWORD;

const candidates = [
  { label: "direct", host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
  { label: "pooler-aws-0-us-east-1", host: "aws-0-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { label: "pooler-aws-1-us-east-1", host: "aws-1-us-east-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { label: "pooler-aws-0-us-west-1", host: "aws-0-us-west-1.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
  { label: "pooler-aws-0-us-east-2", host: "aws-0-us-east-2.pooler.supabase.com", port: 5432, user: `postgres.${ref}` },
];

for (const candidate of candidates) {
  const client = new Client({
    host: candidate.host,
    port: candidate.port,
    user: candidate.user,
    database: "postgres",
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
  });

  try {
    await client.connect();
    const { rows } = await client.query("select current_database() as db");
    console.log(`${candidate.label}: OK ${JSON.stringify(rows[0])}`);
    await client.end();
    break;
  } catch (error) {
    console.log(`${candidate.label}: ${error.message}`);
    await client.end().catch(() => {});
  }
}
