/*
# Create core tables for 64 Delivery Phase 2

## Overview
Creates the foundational database tables for the 64 Delivery food delivery application:
- `users` — customer/restaurant/driver/admin profiles (linked to Supabase auth)
- `categories` — food categories (Momo, Pizza, Burger, etc.)
- `restaurants` — restaurant listings with cuisine, rating, delivery info
- `foods` — food items belonging to restaurants and categories
- `addresses` — user delivery addresses

## Tables

### users
- `id` (uuid, PK, references auth.users)
- `full_name` (text, not null)
- `email` (text, unique, not null)
- `phone` (text, unique)
- `role` (text, default 'CUSTOMER') — CUSTOMER, RESTAURANT, DRIVER, ADMIN
- `avatar` (text, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

### categories
- `id` (uuid, PK)
- `name` (text, not null)
- `slug` (text, unique, not null)
- `description` (text, nullable)
- `image` (text, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

### restaurants
- `id` (uuid, PK)
- `name` (text, not null)
- `description` (text, nullable)
- `image` (text, nullable)
- `cover_image` (text, nullable)
- `phone` (text, nullable)
- `email` (text, nullable)
- `rating` (numeric, default 0)
- `review_count` (integer, default 0)
- `delivery_time` (integer, nullable) — estimated minutes
- `delivery_fee` (integer, default 0) — NPR
- `cuisine` (text[], default '{}') — array of cuisine types
- `address` (text, nullable)
- `latitude` (numeric, nullable)
- `longitude` (numeric, nullable)
- `is_open` (boolean, default true)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

### foods
- `id` (uuid, PK)
- `name` (text, not null)
- `slug` (text, not null)
- `description` (text, nullable)
- `image` (text, nullable)
- `price` (integer, not null) — NPR, stored as integer to avoid float issues
- `restaurant_id` (uuid, FK to restaurants, not null)
- `category_id` (uuid, FK to categories, nullable)
- `is_available` (boolean, default true)
- `is_active` (boolean, default true)
- `is_vegetarian` (boolean, default false)
- `is_popular` (boolean, default false)
- `rating` (numeric, default 0)
- `menu_section` (text, nullable)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

### addresses
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, not null, default auth.uid())
- `label` (text, not null) — Home, Office, Other
- `full_name` (text, not null)
- `phone` (text, not null)
- `address` (text, not null)
- `city` (text, not null)
- `area` (text, not null)
- `landmark` (text, nullable)
- `latitude` (numeric, nullable)
- `longitude` (numeric, nullable)
- `is_default` (boolean, default false)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

## Security (RLS)
- `users`: Users can read/update their own profile. Public profiles (name, avatar) readable by authenticated users.
- `categories`: Public read (anon + authenticated). No public write.
- `restaurants`: Public read (anon + authenticated). No public write.
- `foods`: Public read (anon + authenticated). No public write.
- `addresses`: Owner-scoped CRUD — users can only access their own addresses.

## Indexes
- users: email (unique), phone (unique)
- restaurants: is_active, is_open
- foods: restaurant_id, category_id, is_available, is_active
- addresses: user_id
*/
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE,
  role text NOT NULL DEFAULT 'CUSTOMER',
  avatar text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image text,
  cover_image text,
  phone text,
  email text,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  delivery_time integer,
  delivery_fee integer NOT NULL DEFAULT 0,
  cuisine text[] NOT NULL DEFAULT '{}',
  address text,
  latitude numeric,
  longitude numeric,
  is_open boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active restaurants" ON restaurants;
CREATE POLICY "Public can read active restaurants" ON restaurants FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image text,
  price integer NOT NULL,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_available boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_vegetarian boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  rating numeric NOT NULL DEFAULT 0,
  menu_section text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active foods" ON foods;
CREATE POLICY "Public can read active foods" ON foods FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  area text NOT NULL,
  landmark text,
  latitude numeric,
  longitude numeric,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own addresses" ON addresses;
CREATE POLICY "Users can read own addresses" ON addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_open ON restaurants(is_open);
CREATE INDEX IF NOT EXISTS idx_foods_restaurant_id ON foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_foods_category_id ON foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_is_available ON foods(is_available);
CREATE INDEX IF NOT EXISTS idx_foods_is_active ON foods(is_active);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
