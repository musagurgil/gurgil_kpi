-- Fix 1: Add missing columns to calendar_activities
ALTER TABLE calendar_activities 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Fix 4: Ensure musagurgil@gmail.com has admin role
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user ID for musagurgil@gmail.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'musagurgil@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Delete any existing roles for this user
    DELETE FROM user_roles WHERE user_id = admin_user_id;
    
    -- Insert admin role
    INSERT INTO user_roles (user_id, role) 
    VALUES (admin_user_id, 'admin');
  END IF;
END $$;

-- Ensure all users in auth.users have at least one role (employee by default)
INSERT INTO user_roles (user_id, role)
SELECT au.id, 'employee'::app_role
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;