/*
  SUPABASE DATABASE SCHEMA

  Table: portfolio
  - id: uuid (Primary Key, default: gen_random_uuid())
  - user_id: uuid (Foreign Key to auth.users)
  - card_id: text (Pokémon TCG API card ID)
  - card_name: text
  - set_name: text
  - image_url: text
  - purchase_price: numeric
  - purchase_date: date
  - condition: text
  - quantity: integer (default: 1)
  - created_at: timestamp with time zone (default: now())

  Row Level Security (RLS) Policies:
  1. Users can only see their own portfolio items.
  2. Users can only insert their own portfolio items.
  3. Users can only update/delete their own portfolio items.
*/

export interface PortfolioItem {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  set_name: string;
  image_url: string;
  purchase_price: number;
  purchase_date: string;
  condition: string;
  quantity: number;
  created_at: string;
}
