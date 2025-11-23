-- Add weekly_hours and pay_rate to contracts table
ALTER TABLE public.contracts 
ADD COLUMN weekly_hours numeric,
ADD COLUMN pay_rate numeric;

-- Update the contracts to have better defaults
ALTER TABLE public.contracts 
ALTER COLUMN weekly_hours SET DEFAULT 0,
ALTER COLUMN pay_rate SET DEFAULT 0;