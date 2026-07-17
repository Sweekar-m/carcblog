-- SQL Migration: Setup Profiles Table in Supabase
-- Run this in your Supabase SQL Editor (https://database.supabase.com)

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Maps to Clerk user ID
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow public read access to all profiles
CREATE POLICY "Allow public read access" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Allow all operations (insert, update, delete) to authenticated clients
-- For V1 testing, this policy is open. For production, restrict to matching user IDs.
CREATE POLICY "Allow all operations for anon and service role" 
  ON public.profiles 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
