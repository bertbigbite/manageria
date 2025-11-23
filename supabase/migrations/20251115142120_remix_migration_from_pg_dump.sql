--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: activity_entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_entity_type AS ENUM (
    'booking',
    'invoice',
    'client',
    'payment'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'customer'
);


--
-- Name: invoice_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_status AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'cash',
    'card',
    'bank_transfer',
    'other'
);


--
-- Name: generate_invoice_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_invoice_number() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  year TEXT;
  next_num INTEGER;
  invoice_num TEXT;
BEGIN
  year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year || '-%';
  
  invoice_num := 'INV-' || year || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN invoice_num;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: set_invoice_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_invoice_number() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_client_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_client_stats() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF TG_TABLE_NAME = 'bookings' THEN
    IF NEW.client_id IS NOT NULL THEN
      UPDATE public.clients
      SET total_bookings = (
        SELECT COUNT(*) FROM public.bookings WHERE client_id = NEW.client_id
      )
      WHERE id = NEW.client_id;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'invoices' THEN
    UPDATE public.clients
    SET 
      total_spent = COALESCE((
        SELECT SUM(amount_paid) FROM public.invoices WHERE client_id = NEW.client_id
      ), 0),
      outstanding_balance = COALESCE((
        SELECT SUM(amount_owed) FROM public.invoices WHERE client_id = NEW.client_id
      ), 0)
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type public.activity_entity_type NOT NULL,
    entity_id uuid NOT NULL,
    action character varying NOT NULL,
    description text,
    performed_by uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_reference character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    surname character varying(100) NOT NULL,
    forename character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    event_date date NOT NULL,
    room_choice character varying(100) NOT NULL,
    late_bar boolean DEFAULT false NOT NULL,
    event_types text[] NOT NULL,
    further_details character varying(2000),
    guests integer NOT NULL,
    resident_dj boolean DEFAULT false NOT NULL,
    food_required boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'Provisional'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    package character varying(100),
    confirmation_token uuid DEFAULT gen_random_uuid() NOT NULL,
    notes text,
    updated_by uuid,
    client_id uuid,
    total_amount numeric DEFAULT 0,
    deposit_amount numeric DEFAULT 0,
    deposit_paid boolean DEFAULT false,
    invoice_id uuid,
    CONSTRAINT bookings_room_choice_check CHECK (((room_choice)::text = ANY (ARRAY['Function Room'::text, 'Lounge'::text]))),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY (ARRAY['Provisional'::text, 'Confirmed'::text, 'Cancelled'::text]))),
    CONSTRAINT email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT event_types_limit CHECK ((array_length(event_types, 1) <= 10)),
    CONSTRAINT phone_format CHECK (((phone)::text ~* '^\+?[0-9\s\-()]{7,20}$'::text))
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    forename character varying NOT NULL,
    surname character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    company_name character varying,
    address_line1 character varying,
    address_line2 character varying,
    city character varying,
    postcode character varying,
    tags text[] DEFAULT ARRAY[]::text[],
    total_bookings integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    outstanding_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description character varying NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric NOT NULL,
    line_total numeric GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying NOT NULL,
    booking_id uuid,
    client_id uuid NOT NULL,
    status public.invoice_status DEFAULT 'draft'::public.invoice_status,
    subtotal numeric DEFAULT 0 NOT NULL,
    tax_amount numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    total_amount numeric GENERATED ALWAYS AS (((subtotal + tax_amount) - discount_amount)) STORED,
    amount_paid numeric DEFAULT 0,
    amount_owed numeric GENERATED ALWAYS AS ((((subtotal + tax_amount) - discount_amount) - amount_paid)) STORED,
    due_date date,
    issue_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    amount numeric NOT NULL,
    payment_method public.payment_method DEFAULT 'other'::public.payment_method,
    payment_date date DEFAULT CURRENT_DATE,
    reference_number character varying,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pricing_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    room_choice character varying NOT NULL,
    package character varying,
    base_price numeric NOT NULL,
    per_guest_price numeric,
    add_on_late_bar numeric DEFAULT 0,
    add_on_resident_dj numeric DEFAULT 0,
    add_on_food_price numeric,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: wedding_planners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_planners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    couple_names text NOT NULL,
    wedding_date date NOT NULL,
    venue_name text DEFAULT 'Moline Events'::text NOT NULL,
    guests_count integer DEFAULT 0 NOT NULL,
    tables_count integer DEFAULT 0 NOT NULL,
    room_decorations text,
    entertainment jsonb DEFAULT '[]'::jsonb,
    schedule jsonb DEFAULT '[]'::jsonb,
    food_options jsonb DEFAULT '[]'::jsonb,
    kids_meals text,
    welcome_drinks text,
    color_theme text DEFAULT 'blush'::text NOT NULL,
    font_style text DEFAULT 'romantic'::text NOT NULL,
    logo_url text,
    version integer DEFAULT 1 NOT NULL,
    public_token uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_booking_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: pricing_rules pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_rules
    ADD CONSTRAINT pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: wedding_planners wedding_planners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_planners
    ADD CONSTRAINT wedding_planners_pkey PRIMARY KEY (id);


--
-- Name: wedding_planners wedding_planners_public_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_planners
    ADD CONSTRAINT wedding_planners_public_token_key UNIQUE (public_token);


--
-- Name: idx_bookings_booking_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_bookings_booking_reference ON public.bookings USING btree (booking_reference);


--
-- Name: idx_bookings_confirmation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_bookings_confirmation_token ON public.bookings USING btree (confirmation_token);


--
-- Name: idx_bookings_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_created_at ON public.bookings USING btree (created_at DESC);


--
-- Name: idx_bookings_event_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_event_date ON public.bookings USING btree (event_date);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: invoices auto_generate_invoice_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auto_generate_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: bookings update_client_stats_on_booking; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_stats_on_booking AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_client_stats();


--
-- Name: invoices update_client_stats_on_invoice; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_stats_on_invoice AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_client_stats();


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: pricing_rules update_pricing_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: wedding_planners update_wedding_planners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_wedding_planners_updated_at BEFORE UPDATE ON public.wedding_planners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: activity_log activity_log_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id);


--
-- Name: bookings bookings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: bookings bookings_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: bookings bookings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: payment_transactions payment_transactions_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wedding_planners wedding_planners_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_planners
    ADD CONSTRAINT wedding_planners_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: bookings Admins can delete bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clients Admins can delete clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_line_items Admins can delete invoice line items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete invoice line items" ON public.invoice_line_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can delete invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete invoices" ON public.invoices FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can delete payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete payments" ON public.payment_transactions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_planners Admins can delete wedding planners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete wedding planners" ON public.wedding_planners FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: activity_log Admins can insert activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert activity" ON public.activity_log FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clients Admins can insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_line_items Admins can insert invoice line items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert invoice line items" ON public.invoice_line_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can insert invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert invoices" ON public.invoices FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can insert payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert payments" ON public.payment_transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_planners Admins can insert wedding planners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert wedding planners" ON public.wedding_planners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: pricing_rules Admins can manage pricing rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins can update bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clients Admins can update clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_line_items Admins can update invoice line items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update invoice line items" ON public.invoice_line_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can update invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update invoices" ON public.invoices FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can update payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update payments" ON public.payment_transactions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update user roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_planners Admins can update wedding planners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update wedding planners" ON public.wedding_planners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: activity_log Admins can view all activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all activity" ON public.activity_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Admins can view all bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: clients Admins can view all clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all clients" ON public.clients FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoice_line_items Admins can view all invoice line items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all invoice line items" ON public.invoice_line_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: invoices Admins can view all invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: payment_transactions Admins can view all payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all payments" ON public.payment_transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: wedding_planners Admins can view all wedding planners; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all wedding planners" ON public.wedding_planners FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: bookings Allow public to insert bookings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public to insert bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);


--
-- Name: bookings Allow public to view booking by confirmation token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public to view booking by confirmation token" ON public.bookings FOR SELECT USING (true);


--
-- Name: pricing_rules Anyone can view active pricing rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active pricing rules" ON public.pricing_rules FOR SELECT USING ((active = true));


--
-- Name: wedding_planners Anyone can view wedding planner by public token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view wedding planner by public token" ON public.wedding_planners FOR SELECT USING (true);


--
-- Name: clients Public can insert clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can insert clients" ON public.clients FOR INSERT WITH CHECK (true);


--
-- Name: activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_line_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: pricing_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: wedding_planners; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wedding_planners ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


