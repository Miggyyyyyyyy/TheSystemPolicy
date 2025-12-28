-- Run this in Supabase SQL Editor to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Hunter',
  archetype TEXT CHECK (archetype IN ('yujiro', 'baki', 'ohma', 'jack')),
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  discipline INTEGER NOT NULL DEFAULT 10,
  vitality INTEGER NOT NULL DEFAULT 10,
  intellect INTEGER NOT NULL DEFAULT 10,
  spirit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  intent TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  xp INTEGER NOT NULL DEFAULT 25,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  failed BOOLEAN NOT NULL DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  instructions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calibrations table
CREATE TABLE IF NOT EXISTS calibrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wake_time TEXT NOT NULL DEFAULT '06:00',
  sleep_time TEXT NOT NULL DEFAULT '22:00',
  work_hours TEXT NOT NULL DEFAULT '9-17',
  training_access TEXT[] DEFAULT ARRAY['home'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibrations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks: Users can only see/edit their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Calibrations: Users can only see/edit their own calibration
CREATE POLICY "Users can view own calibration" ON calibrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calibration" ON calibrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calibration" ON calibrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster task queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
