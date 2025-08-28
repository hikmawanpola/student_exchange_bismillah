-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Programs policies (public read, admin write)
CREATE POLICY "Anyone can view active programs" ON public.programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage programs" ON public.programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Steps policies (public read, admin write)
CREATE POLICY "Anyone can view active steps" ON public.steps
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage steps" ON public.steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- User programs policies
CREATE POLICY "Users can view their own programs" ON public.user_programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs" ON public.user_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user programs" ON public.user_programs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- User step progress policies
CREATE POLICY "Users can view their own progress" ON public.user_step_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_step_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_step_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update all progress" ON public.user_step_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Landing content policies (public read, super admin write)
CREATE POLICY "Anyone can view active landing content" ON public.landing_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage landing content" ON public.landing_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
