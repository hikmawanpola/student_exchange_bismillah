-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');

-- Create enum for step types
CREATE TYPE step_type AS ENUM ('form', 'upload', 'review', 'approval');

-- Create profiles table that extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create programs table (study programs)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create steps table (dynamic steps for recognition process)
CREATE TABLE IF NOT EXISTS public.steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  step_type step_type NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  form_fields JSONB, -- Store dynamic form configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_programs table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.user_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- Create user_step_progress table (track user progress through steps)
CREATE TABLE IF NOT EXISTS public.user_step_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, rejected
  data JSONB, -- Store step-specific data (form responses, file uploads, etc.)
  admin_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- Create landing_content table (dynamic content management)
CREATE TABLE IF NOT EXISTS public.landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE, -- hero, about, programs, etc.
  title TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_user_programs_user_id ON public.user_programs(user_id);
CREATE INDEX idx_user_programs_program_id ON public.user_programs(program_id);
CREATE INDEX idx_user_step_progress_user_id ON public.user_step_progress(user_id);
CREATE INDEX idx_user_step_progress_step_id ON public.user_step_progress(step_id);
CREATE INDEX idx_steps_order_index ON public.steps(order_index);
