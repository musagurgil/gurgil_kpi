-- Create enums
CREATE TYPE app_role AS ENUM ('admin', 'department_manager', 'employee');
CREATE TYPE kpi_period AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE kpi_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE kpi_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_category AS ENUM ('kpi', 'ticket', 'calendar', 'system', 'user');

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  department TEXT NOT NULL REFERENCES departments(name),
  avatar TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- KPI tables
CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL REFERENCES departments(name),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  period kpi_period NOT NULL,
  priority kpi_priority NOT NULL,
  status kpi_status DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kpi_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES kpi_targets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kpi_id, user_id)
);

CREATE TABLE kpi_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES kpi_targets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  value NUMERIC NOT NULL,
  note TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE kpi_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES kpi_targets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets tables
CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority NOT NULL,
  status ticket_status DEFAULT 'open',
  source_department TEXT NOT NULL REFERENCES departments(name),
  target_department TEXT NOT NULL REFERENCES departments(name),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE TABLE ticket_comments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar tables
CREATE TABLE calendar_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calendar_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL,
  category_id UUID REFERENCES calendar_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category notification_category NOT NULL,
  priority notification_priority NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial departments
INSERT INTO departments (name) VALUES 
  ('Yönetim'), ('Satış'), ('Pazarlama'), 
  ('İnsan Kaynakları'), ('IT'), ('Finans'), 
  ('Operasyon'), ('Müşteri Hizmetleri');

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', 'IT')
  );
  
  -- Assign default employee role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- KPI targets RLS policies
CREATE POLICY "Admins can view all KPIs"
  ON kpi_targets FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Department managers can view department KPIs"
  ON kpi_targets FOR SELECT
  USING (
    has_role(auth.uid(), 'department_manager') AND
    department IN (SELECT department FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view assigned KPIs"
  ON kpi_targets FOR SELECT
  USING (
    id IN (SELECT kpi_id FROM kpi_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage KPIs"
  ON kpi_targets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Department managers can create KPIs"
  ON kpi_targets FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'department_manager') AND
    department IN (SELECT department FROM profiles WHERE id = auth.uid())
  );

-- KPI assignments RLS policies
CREATE POLICY "Users can view own assignments"
  ON kpi_assignments FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_role(auth.uid(), 'admin') OR
    (has_role(auth.uid(), 'department_manager') AND
     kpi_id IN (SELECT id FROM kpi_targets WHERE department IN (SELECT department FROM profiles WHERE id = auth.uid())))
  );

CREATE POLICY "Managers can manage assignments"
  ON kpi_assignments FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR
    (has_role(auth.uid(), 'department_manager') AND
     kpi_id IN (SELECT id FROM kpi_targets WHERE department IN (SELECT department FROM profiles WHERE id = auth.uid())))
  );

-- KPI progress RLS policies
CREATE POLICY "Users can view relevant progress"
  ON kpi_progress FOR SELECT
  USING (
    user_id = auth.uid() OR
    recorded_by = auth.uid() OR
    has_role(auth.uid(), 'admin') OR
    (has_role(auth.uid(), 'department_manager') AND
     kpi_id IN (SELECT id FROM kpi_targets WHERE department IN (SELECT department FROM profiles WHERE id = auth.uid())))
  );

CREATE POLICY "Users can record progress"
  ON kpi_progress FOR INSERT
  WITH CHECK (
    kpi_id IN (SELECT kpi_id FROM kpi_assignments WHERE user_id = auth.uid()) OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'department_manager')
  );

-- KPI comments RLS policies
CREATE POLICY "Users can view comments"
  ON kpi_comments FOR SELECT
  USING (
    kpi_id IN (SELECT id FROM kpi_targets WHERE id IN (SELECT kpi_id FROM kpi_assignments WHERE user_id = auth.uid())) OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'department_manager')
  );

CREATE POLICY "Users can add comments"
  ON kpi_comments FOR INSERT
  WITH CHECK (
    kpi_id IN (SELECT kpi_id FROM kpi_assignments WHERE user_id = auth.uid()) OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'department_manager')
  );

-- Tickets RLS policies
CREATE POLICY "Users can view relevant tickets"
  ON tickets FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    source_department IN (SELECT department FROM profiles WHERE id = auth.uid()) OR
    target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (
    source_department IN (SELECT department FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update relevant tickets"
  ON tickets FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    assigned_to = auth.uid() OR
    target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
  );

-- Ticket comments RLS policies
CREATE POLICY "Users can view ticket comments"
  ON ticket_comments FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM tickets WHERE 
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      source_department IN (SELECT department FROM profiles WHERE id = auth.uid()) OR
      target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can add ticket comments"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    ticket_id IN (SELECT id FROM tickets WHERE 
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
    )
  );

-- Calendar categories RLS (public read)
CREATE POLICY "Everyone can view categories"
  ON calendar_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON calendar_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Calendar activities RLS policies
CREATE POLICY "Users can manage own activities"
  ON calendar_activities FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities"
  ON calendar_activities FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Notifications RLS policies
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_kpi_department ON kpi_targets(department);
CREATE INDEX idx_kpi_status ON kpi_targets(status);
CREATE INDEX idx_kpi_created_by ON kpi_targets(created_by);
CREATE INDEX idx_kpi_assignments_user ON kpi_assignments(user_id);
CREATE INDEX idx_kpi_assignments_kpi ON kpi_assignments(kpi_id);
CREATE INDEX idx_tickets_department ON tickets(source_department, target_department);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_created ON tickets(created_by);
CREATE INDEX idx_activities_user_date ON calendar_activities(user_id, date);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);