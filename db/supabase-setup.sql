-- Enable Row Level Security on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- App Users RLS Policies
-- Only allow users to read their own record
CREATE POLICY "Users can view own profile" ON app_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Only allow admins to read all users
CREATE POLICY "Admins can view all users" ON app_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Only allow admins to insert/update/delete users
CREATE POLICY "Admins can manage users" ON app_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Todos RLS Policies
-- All authenticated users can read todos
CREATE POLICY "Authenticated users can read todos" ON todos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage todos
CREATE POLICY "Admins can manage todos" ON todos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- News Items RLS Policies
-- All authenticated users can read news
CREATE POLICY "Authenticated users can read news" ON news_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage news
CREATE POLICY "Admins can manage news" ON news_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Urgent Tasks RLS Policies
-- All authenticated users can read urgent tasks
CREATE POLICY "Authenticated users can read urgent tasks" ON urgent_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage urgent tasks
CREATE POLICY "Admins can manage urgent tasks" ON urgent_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Photos RLS Policies
-- All authenticated users can read photos
CREATE POLICY "Authenticated users can read photos" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage photos
CREATE POLICY "Admins can manage photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Employees RLS Policies
-- All authenticated users can read employees
CREATE POLICY "Authenticated users can read employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage employees
CREATE POLICY "Admins can manage employees" ON employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Attendance RLS Policies
-- All authenticated users can read attendance
CREATE POLICY "Authenticated users can read attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage attendance
CREATE POLICY "Admins can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
ALTER PUBLICATION supabase_realtime ADD TABLE todos;
ALTER PUBLICATION supabase_realtime ADD TABLE news_items;
ALTER PUBLICATION supabase_realtime ADD TABLE urgent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create app_users entry when a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_todos_sort_order ON todos(sort_order);
CREATE INDEX idx_news_items_published_at ON news_items(published_at DESC);
CREATE INDEX idx_urgent_tasks_due_at ON urgent_tasks(due_at);
CREATE INDEX idx_urgent_tasks_severity ON urgent_tasks(severity);
CREATE INDEX idx_photos_sort_order ON photos(sort_order);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_for_date ON attendance(for_date);
CREATE INDEX idx_attendance_status ON attendance(status);