-- Supabase Database Setup for Nostr Ad Marketplace
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema if it doesn't exist (it should already exist)
-- The auth.users table is automatically created by Supabase

-- Create public profiles table to store user role information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nostr_pubkey TEXT UNIQUE NOT NULL,
  current_role TEXT NOT NULL DEFAULT 'viewer',
  available_roles TEXT[] NOT NULL DEFAULT ARRAY['viewer'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nostr_pubkey, current_role, available_roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nostr_pubkey', ''),
    'viewer',
    ARRAY['viewer']
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
CREATE OR REPLACE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial admin user (optional - replace with your Nostr pubkey)
-- INSERT INTO auth.users (id, email, raw_user_meta_data) 
-- VALUES (
--   uuid_generate_v4(),
--   'admin@nostradmarketplace.com',
--   '{"nostr_pubkey": "your-admin-nostr-pubkey-here"}'
-- );

COMMENT ON TABLE public.user_profiles IS 'User profiles with Nostr keys and role management';
COMMENT ON COLUMN public.user_profiles.nostr_pubkey IS 'Nostr public key (npub format)';
COMMENT ON COLUMN public.user_profiles.current_role IS 'Current active role: viewer, advertiser, publisher, admin, stakeholder';
COMMENT ON COLUMN public.user_profiles.available_roles IS 'Array of roles this user can switch between';