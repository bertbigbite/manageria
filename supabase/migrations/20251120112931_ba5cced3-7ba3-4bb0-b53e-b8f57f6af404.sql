-- Step 1: Remove all invoice-related tables and their dependencies
-- First drop the foreign key constraints and triggers
DROP TRIGGER IF EXISTS update_invoices_stats ON public.invoices;
DROP TRIGGER IF EXISTS update_client_stats_invoices ON public.invoices;
DROP TRIGGER IF EXISTS update_client_stats_payments ON public.payment_transactions;

-- Drop invoice-related tables
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.invoice_line_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;

-- Drop invoice-related enums
DROP TYPE IF EXISTS public.invoice_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;

-- Drop invoice-related functions
DROP FUNCTION IF EXISTS public.generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS public.set_invoice_number() CASCADE;

-- Update client table to remove invoice-related fields
ALTER TABLE public.clients
DROP COLUMN IF EXISTS outstanding_balance,
DROP COLUMN IF EXISTS total_spent;

-- Remove invoice references from bookings table
ALTER TABLE public.bookings
DROP COLUMN IF EXISTS invoice_id;

-- Step 2: Update role system for new platform structure
-- First, store existing roles in a temp column
ALTER TABLE public.user_roles ADD COLUMN temp_role TEXT;
UPDATE public.user_roles SET temp_role = role::TEXT;

-- Drop the role column
ALTER TABLE public.user_roles DROP COLUMN role;

-- Drop and recreate the enum
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('super_admin', 'staff', 'trainer');

-- Add role column back with new enum
ALTER TABLE public.user_roles ADD COLUMN role app_role NOT NULL DEFAULT 'staff';

-- Migrate old roles to new ones
UPDATE public.user_roles SET role = 'super_admin' WHERE temp_role = 'admin';
UPDATE public.user_roles SET role = 'staff' WHERE temp_role = 'user';
UPDATE public.user_roles SET role = 'trainer' WHERE temp_role = 'moderator';

-- Drop temp column
ALTER TABLE public.user_roles DROP COLUMN temp_role;

-- Step 3: Create HR Module tables
-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  bank_details_encrypted TEXT,
  national_insurance_number TEXT,
  start_date DATE NOT NULL,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive')),
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'trainer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Employee Documents table
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Step 4: Create Training Module tables
-- Training Modules table
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  estimated_time INTEGER,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Training Progress table
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete')),
  completion_date TIMESTAMPTZ,
  score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, module_id)
);

-- Policies table
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 5: Create updated has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 6: Add triggers for updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON public.training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Step 7: Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for HR (Super Admin only)
CREATE POLICY "Super admins can manage employees"
  ON public.employees FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage contracts"
  ON public.contracts FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage employee documents"
  ON public.employee_documents FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Training policies - different access levels
CREATE POLICY "Super admins and trainers can manage training modules"
  ON public.training_modules FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'trainer'));

CREATE POLICY "Staff can view active training modules"
  ON public.training_modules FOR SELECT
  USING (status = 'active');

CREATE POLICY "Super admins and trainers can manage training progress"
  ON public.training_progress FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'trainer'));

CREATE POLICY "Staff can view their own training progress"
  ON public.training_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = training_progress.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update their own training progress"
  ON public.training_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = training_progress.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins and trainers can manage policies"
  ON public.policies FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'trainer'));

CREATE POLICY "Staff can view active policies"
  ON public.policies FOR SELECT
  USING (status = 'active');

-- Step 9: Update existing RLS policies for booking system
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can insert activity" ON public.activity_log;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all wedding planners" ON public.wedding_planners;
DROP POLICY IF EXISTS "Admins can insert wedding planners" ON public.wedding_planners;
DROP POLICY IF EXISTS "Admins can update wedding planners" ON public.wedding_planners;
DROP POLICY IF EXISTS "Admins can delete wedding planners" ON public.wedding_planners;

CREATE POLICY "Super admins can view all activity"
  ON public.activity_log FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage bookings"
  ON public.bookings FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage clients"
  ON public.clients FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage pricing rules"
  ON public.pricing_rules FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage user roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage wedding planners"
  ON public.wedding_planners FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));