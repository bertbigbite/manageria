
-- Drop the existing check constraint
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_role_check;

-- Add a new check constraint with common role values
ALTER TABLE public.employees ADD CONSTRAINT employees_role_check 
CHECK (role IN (
  'Manager',
  'Assistant Manager', 
  'Team Leader',
  'Staff',
  'Supervisor',
  'Coordinator',
  'Administrator',
  'Director',
  'Chef',
  'Bartender',
  'Server',
  'Host',
  'Cleaner',
  'Maintenance',
  'Security',
  'Other'
));
