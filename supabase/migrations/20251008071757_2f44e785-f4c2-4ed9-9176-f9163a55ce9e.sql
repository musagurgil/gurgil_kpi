-- Enable RLS on departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view departments
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage departments
CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  USING (has_role(auth.uid(), 'admin'));