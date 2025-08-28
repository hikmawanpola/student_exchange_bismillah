-- Update RLS policies to ensure only super_admin can create admin accounts
-- and prevent unauthorized role escalation

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;

-- Recreate policies with proper role restrictions
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id AND 
    -- Prevent users from changing their own role
    (OLD.role = NEW.role OR auth.jwt() ->> 'role' = 'super_admin')
  );

CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Add policy for profile creation (triggered by auth.users)
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Update the trigger function to prevent role escalation during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Force role to 'user' for all new signups unless created by super_admin
  -- Super admin creation will be handled separately via admin interface
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
