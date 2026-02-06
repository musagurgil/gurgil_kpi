-- Ensure musagurgil@gmail.com has admin role
INSERT INTO user_roles (user_id, role)
SELECT p.id, 'admin'::app_role
FROM profiles p
WHERE p.email = 'musagurgil@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Backfill existing tickets with creator information
UPDATE tickets t
SET created_by_name = p.first_name || ' ' || p.last_name,
    created_by_email = p.email
FROM profiles p
WHERE p.id = t.created_by 
  AND (t.created_by_name IS NULL OR t.created_by_email IS NULL);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;