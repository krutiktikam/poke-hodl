/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: Please provide your Supabase Postgres connection string!");
  console.error("Usage: node scripts/init-db.js \"postgresql://postgres:password@db.xxxxxx.supabase.co:6543/postgres\"");
  console.error("Or set DATABASE_URL in your .env.local file.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase SSL connection
  }
});

const sql = `
-- Create the portfolio table if it doesn't exist
create table if not exists portfolio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  card_id text not null,
  card_name text not null,
  set_name text not null,
  image_url text not null,
  purchase_price numeric not null,
  purchase_date date not null,
  condition text not null,
  quantity integer default 1,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table portfolio enable row level security;

-- Drop existing policies if they exist to allow clean re-runs
drop policy if exists "Users can view their own portfolio" on portfolio;
drop policy if exists "Users can insert their own portfolio" on portfolio;
drop policy if exists "Users can update their own portfolio" on portfolio;
drop policy if exists "Users can delete their own portfolio" on portfolio;

-- Create secure policies (following Supabase CLI/MCP best practices)
create policy "Users can view their own portfolio" 
  on portfolio for select 
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolio" 
  on portfolio for insert 
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own portfolio" 
  on portfolio for update 
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own portfolio" 
  on portfolio for delete 
  to authenticated
  using (auth.uid() = user_id);
`;

async function init() {
  try {
    console.log("Connecting to Supabase database...");
    await client.connect();
    console.log("Connected successfully! Initializing schema...");
    
    await client.query(sql);
    
    console.log("--------------------------------------------------");
    console.log("✓ Success! 'portfolio' table created successfully.");
    console.log("✓ Success! Row Level Security (RLS) enabled.");
    console.log("✓ Success! Security policies configured for authenticated users.");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    await client.end();
  }
}

init();
