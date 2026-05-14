# Supabase Setup Guide for PokéHODL

Follow these steps to enable the "Personal Vault" and persist your card collection.

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Create a new project named `poke-hodl`.
3. Set a secure Database Password (save this somewhere).

### 2. Configure Environment Variables
1. In your Supabase Dashboard, go to **Project Settings > API**.
2. Copy the `Project URL` and `anon public` key.
3. In your local project, create a `.env.local` file (if you haven't already) and paste them:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Initialize the Database Schema
1. Go to **SQL Editor** in the Supabase Sidebar.
2. Click **New Query** and paste the following SQL to create your portfolio table:

```sql
-- Create the portfolio table
create table portfolio (
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

-- Create policies so users can only access their own data
create policy "Users can view their own portfolio" 
  on portfolio for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolio" 
  on portfolio for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own portfolio" 
  on portfolio for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own portfolio" 
  on portfolio for delete 
  using (auth.uid() = user_id);
```
3. Click **Run**.

### 4. Enable Authentication
1. Go to **Authentication > Providers**.
2. Ensure **Email** is enabled.
3. You can now use Supabase Auth to let users sign in and save their "Vault" cards securely.
