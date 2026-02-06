-- Step 1: Add category_key to calendar_activities for UI category storage
ALTER TABLE calendar_activities ADD COLUMN IF NOT EXISTS category_key text;

-- Step 2: Add denormalized creator fields to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by_name text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_by_email text;

-- Step 3: Backfill existing tickets with creator info
UPDATE tickets t 
SET 
  created_by_name = p.first_name || ' ' || p.last_name,
  created_by_email = p.email
FROM profiles p 
WHERE p.id = t.created_by AND t.created_by_name IS NULL;

-- Step 4: Create trigger to auto-populate creator info on ticket insert
CREATE OR REPLACE FUNCTION populate_ticket_creator()
RETURNS TRIGGER AS $$
BEGIN
  SELECT 
    first_name || ' ' || last_name,
    email
  INTO 
    NEW.created_by_name,
    NEW.created_by_email
  FROM profiles 
  WHERE id = NEW.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER before_ticket_insert_populate_creator
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION populate_ticket_creator();

-- Step 5: Create trigger to send notifications to target department on ticket creation
CREATE OR REPLACE FUNCTION notify_department_on_ticket()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, category, priority, link)
  SELECT 
    p.id,
    'Yeni Ticket: ' || NEW.title,
    NEW.source_department || ' departmanından yeni bir ticket geldi',
    'ticket'::notification_category,
    'medium'::notification_priority,
    '/tickets'
  FROM profiles p
  WHERE p.department = NEW.target_department;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER after_ticket_insert_notify_department
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_department_on_ticket();

-- Step 6: Update RLS policies for tickets - allow source_department to update
DROP POLICY IF EXISTS "Users can update relevant tickets" ON tickets;
CREATE POLICY "Users can update relevant tickets"
ON tickets
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR assigned_to = auth.uid() 
  OR target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
  OR source_department IN (SELECT department FROM profiles WHERE id = auth.uid())
);

-- Step 7: Update RLS policies for ticket_comments - allow source_department to comment
DROP POLICY IF EXISTS "Users can add ticket comments" ON ticket_comments;
CREATE POLICY "Users can add ticket comments"
ON ticket_comments
FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT id FROM tickets 
    WHERE created_by = auth.uid() 
    OR assigned_to = auth.uid() 
    OR target_department IN (SELECT department FROM profiles WHERE id = auth.uid())
    OR source_department IN (SELECT department FROM profiles WHERE id = auth.uid())
  )
);