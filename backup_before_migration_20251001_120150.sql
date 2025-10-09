--
-- PostgreSQL database dump
--

\restrict 8cvkHmJo22z6X7bJYkVu9MFUKQPe66WFxdCcd6hTQf9vUxOkvLEPQtlkkXpbzVP

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: alert_severity_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_severity_enum AS ENUM (
    'info',
    'warning',
    'error',
    'critical',
    'emergency'
);


--
-- Name: audit_action_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_action_enum AS ENUM (
    'insert',
    'update',
    'delete',
    'login',
    'logout',
    'permission_change',
    'export',
    'import',
    'backup',
    'restore'
);


--
-- Name: bid_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bid_status_enum AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'rejected',
    'withdrawn',
    'expired'
);


--
-- Name: certification_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.certification_status_enum AS ENUM (
    'active',
    'expired',
    'pending_renewal',
    'suspended',
    'revoked'
);


--
-- Name: customer_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.customer_type_enum AS ENUM (
    'residential',
    'commercial',
    'industrial',
    'government'
);


--
-- Name: document_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_type_enum AS ENUM (
    'quote',
    'invoice',
    'receipt',
    'contract',
    'permit',
    'warranty',
    'photo',
    'other'
);


--
-- Name: employee_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employee_status_enum AS ENUM (
    'probation',
    'active',
    'inactive',
    'suspended',
    'terminated',
    'on_leave',
    'retired'
);


--
-- Name: escrow_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.escrow_status_enum AS ENUM (
    'pending',
    'funded',
    'held',
    'released_to_contractor',
    'refunded_to_customer',
    'disputed'
);


--
-- Name: expense_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.expense_type_enum AS ENUM (
    'labor',
    'material',
    'equipment',
    'subcontractor',
    'permit',
    'travel',
    'fuel',
    'insurance',
    'overhead',
    'training',
    'other'
);


--
-- Name: inventory_movement_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.inventory_movement_type_enum AS ENUM (
    'purchase',
    'sale',
    'transfer',
    'adjustment',
    'return',
    'waste',
    'theft',
    'damage',
    'warranty_replacement'
);


--
-- Name: invoice_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_status_enum AS ENUM (
    'draft',
    'sent',
    'viewed',
    'partially_paid',
    'paid',
    'overdue',
    'disputed',
    'written_off',
    'cancelled'
);


--
-- Name: job_template_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_template_type_enum AS ENUM (
    'installation',
    'repair',
    'maintenance',
    'inspection',
    'diagnostic',
    'emergency',
    'warranty',
    'upgrade'
);


--
-- Name: marketplace_request_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.marketplace_request_status_enum AS ENUM (
    'draft',
    'posted',
    'bidding_open',
    'bidding_closed',
    'contractor_selected',
    'work_in_progress',
    'completed',
    'cancelled',
    'disputed'
);


--
-- Name: message_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_type_enum AS ENUM (
    'email',
    'sms',
    'in_app',
    'system',
    'webhook'
);


--
-- Name: notification_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status_enum AS ENUM (
    'pending',
    'sent',
    'delivered',
    'read',
    'clicked',
    'failed',
    'bounced',
    'unsubscribed'
);


--
-- Name: notification_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type_enum AS ENUM (
    'email',
    'sms',
    'in_app',
    'push',
    'webhook',
    'slack',
    'teams'
);


--
-- Name: optimization_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.optimization_type_enum AS ENUM (
    'distance',
    'time',
    'cost',
    'customer_priority',
    'ai_hybrid'
);


--
-- Name: payment_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'partially_completed',
    'failed',
    'cancelled',
    'refunded',
    'disputed'
);


--
-- Name: payroll_run_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payroll_run_status_enum AS ENUM (
    'draft',
    'calculating',
    'pending_approval',
    'approved',
    'processing',
    'completed',
    'failed',
    'cancelled'
);


--
-- Name: performance_rating_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.performance_rating_enum AS ENUM (
    'excellent',
    'good',
    'satisfactory',
    'needs_improvement',
    'unsatisfactory'
);


--
-- Name: pricing_model_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pricing_model_enum AS ENUM (
    'TIME_MATERIALS',
    'FLAT_RATE',
    'UNIT',
    'PERCENTAGE',
    'RECURRING'
);


--
-- Name: rate_card_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rate_card_type_enum AS ENUM (
    'hourly',
    'flat_fee',
    'per_unit',
    'tiered',
    'time_and_materials',
    'value_based',
    'subscription'
);


--
-- Name: schedule_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.schedule_status_enum AS ENUM (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'rescheduled'
);


--
-- Name: sensor_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sensor_status_enum AS ENUM (
    'active',
    'inactive',
    'maintenance',
    'error',
    'calibrating'
);


--
-- Name: service_category_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_category_enum AS ENUM (
    'HVAC',
    'PLUMBING',
    'ELECTRICAL',
    'GENERAL_REPAIR',
    'APPLIANCE_REPAIR',
    'LANDSCAPING',
    'CLEANING',
    'PEST_CONTROL',
    'ROOFING',
    'FLOORING',
    'PAINTING',
    'CARPENTRY',
    'OTHER'
);


--
-- Name: sla_priority_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sla_priority_enum AS ENUM (
    'critical',
    'high',
    'medium',
    'low',
    'scheduled'
);


--
-- Name: subscription_plan_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_plan_enum AS ENUM (
    'starter',
    'professional',
    'enterprise',
    'custom'
);


--
-- Name: subscription_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status_enum AS ENUM (
    'trial',
    'active',
    'past_due',
    'cancelled',
    'suspended'
);


--
-- Name: tax_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tax_type_enum AS ENUM (
    'vat',
    'sales_tax',
    'gst',
    'hst',
    'pst',
    'excise',
    'import_duty',
    'none'
);


--
-- Name: timesheet_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.timesheet_status_enum AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'requires_correction',
    'paid'
);


--
-- Name: tool_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tool_status_enum AS ENUM (
    'available',
    'assigned',
    'in_use',
    'maintenance',
    'repair',
    'calibration',
    'lost',
    'stolen',
    'retired'
);


--
-- Name: unit_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.unit_type_enum AS ENUM (
    'HOUR',
    'FLAT_FEE',
    'SQFT',
    'LINEAR_FOOT',
    'UNIT',
    'CUBIC_YARD',
    'GALLON'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'owner',
    'admin',
    'manager',
    'dispatcher',
    'supervisor',
    'lead_technician',
    'technician',
    'apprentice',
    'helper',
    'accountant',
    'sales_rep',
    'customer_service',
    'customer_portal',
    'vendor_portal',
    'APP_OWNER',
    'EMPLOYEE'
);


--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status_enum AS ENUM (
    'active',
    'inactive',
    'suspended',
    'terminated',
    'pending'
);


--
-- Name: vendor_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vendor_type_enum AS ENUM (
    'supplier',
    'subcontractor',
    'manufacturer',
    'distributor',
    'service_provider',
    'rental_company'
);


--
-- Name: work_order_line_item_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_line_item_type_enum AS ENUM (
    'labor',
    'material',
    'equipment',
    'service',
    'permit',
    'disposal',
    'travel',
    'fee',
    'discount',
    'tax'
);


--
-- Name: work_order_priority_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_priority_enum AS ENUM (
    'low',
    'normal',
    'high',
    'urgent',
    'emergency',
    'seasonal_peak'
);


--
-- Name: work_order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_status_enum AS ENUM (
    'draft',
    'quote',
    'approved',
    'scheduled',
    'parts_ordered',
    'on_hold',
    'in_progress',
    'requires_approval',
    'rework_needed',
    'completed',
    'invoiced',
    'cancelled',
    'sent',
    'rejected',
    'paid',
    'closed',
    'DRAFT',
    'QUOTE',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'INVOICED',
    'PAID',
    'CLOSED',
    'presented',
    'changes_requested',
    'follow_up',
    'expired'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: auto_format_contact_phones(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_format_contact_phones() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.phone := format_phone_e164(NEW.phone);
    RETURN NEW;
END;
$$;


--
-- Name: auto_format_customer_phones(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_format_customer_phones() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Format phone numbers on insert/update
    NEW.phone := format_phone_e164(NEW.phone);
    NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    
    RETURN NEW;
END;
$$;


--
-- Name: auto_generate_customer_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_customer_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: auto_generate_invoice_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_invoice_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number(NEW.company_id);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: calculate_deposit_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_deposit_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If deposit_percentage is set, calculate deposit_amount
    IF NEW.deposit_percentage IS NOT NULL AND NEW.total_amount IS NOT NULL THEN
        NEW.deposit_amount := ROUND((NEW.total_amount * NEW.deposit_percentage / 100), 2);
    END IF;
    
    -- If deposit_amount is set, calculate deposit_percentage
    IF NEW.deposit_amount IS NOT NULL AND NEW.deposit_amount > 0 AND NEW.total_amount IS NOT NULL AND NEW.total_amount > 0 THEN
        NEW.deposit_percentage := ROUND((NEW.deposit_amount / NEW.total_amount * 100), 2);
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: calculate_discount_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_discount_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If discount_percentage is set, calculate discount_amount from subtotal
    IF NEW.discount_percentage IS NOT NULL AND NEW.subtotal IS NOT NULL THEN
        NEW.discount_amount := ROUND((NEW.subtotal * NEW.discount_percentage / 100), 2);
    END IF;
    
    -- If discount_amount is set, calculate discount_percentage
    IF NEW.discount_amount IS NOT NULL AND NEW.discount_amount > 0 AND NEW.subtotal IS NOT NULL AND NEW.subtotal > 0 THEN
        NEW.discount_percentage := ROUND((NEW.discount_amount / NEW.subtotal * 100), 2);
    END IF;
    
    -- Recalculate total_amount with discount
    IF NEW.discount_amount IS NOT NULL AND NEW.discount_amount > 0 THEN
        NEW.total_amount := (NEW.subtotal - NEW.discount_amount) + COALESCE(NEW.tax_amount, 0);
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: calculate_invoice_balance(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_invoice_balance(p_invoice_id uuid) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total_amount DECIMAL(10,2);
    v_amount_paid DECIMAL(10,2);
    v_balance DECIMAL(10,2);
BEGIN
    -- Get invoice total
    SELECT total_amount INTO v_total_amount
    FROM invoices 
    WHERE id = p_invoice_id;
    
    IF v_total_amount IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate total payments
    SELECT COALESCE(SUM(amount), 0) INTO v_amount_paid
    FROM payments 
    WHERE invoice_id = p_invoice_id 
      AND status = 'completed';
    
    -- Calculate balance
    v_balance := v_total_amount - v_amount_paid;
    
    -- Update invoice record
    UPDATE invoices 
    SET 
        amount_paid = v_amount_paid,
        balance_due = v_balance,
        status = CASE 
            WHEN v_balance <= 0 THEN 'paid'::invoice_status_enum
            WHEN v_amount_paid > 0 THEN 'partial_payment'::invoice_status_enum
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;
    
    RETURN v_balance;
END;
$$;


--
-- Name: calculate_invoice_balance_advanced(uuid, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_invoice_balance_advanced(p_invoice_id uuid, p_update_customer_balance boolean DEFAULT true) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    invoice_rec RECORD;
    payment_total NUMERIC := 0;
    balance_due NUMERIC;
    new_status invoice_status_enum;
    result JSONB;
BEGIN
    SELECT * INTO invoice_rec FROM invoices WHERE id = p_invoice_id;

    SELECT COALESCE(SUM(amount), 0) INTO payment_total
    FROM payments 
    WHERE invoice_id = p_invoice_id AND status = 'completed';

    balance_due := GREATEST(invoice_rec.total_amount - payment_total, 0);

    new_status := CASE
        WHEN payment_total >= invoice_rec.total_amount THEN 'paid'
        WHEN payment_total > 0 THEN 'partially_paid'
        WHEN invoice_rec.due_date < CURRENT_DATE AND balance_due > 0 THEN 'overdue'
        ELSE invoice_rec.status
    END;

    UPDATE invoices
    SET amount_paid = payment_total,
        status = new_status,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    result := jsonb_build_object(
        'invoice_id', p_invoice_id,
        'total_amount', invoice_rec.total_amount,
        'amount_paid', payment_total,
        'balance_due', balance_due,
        'status', new_status,
        'is_overdue', (invoice_rec.due_date < CURRENT_DATE AND balance_due > 0)
    );

    RETURN result;
END;
$$;


--
-- Name: calculate_invoice_totals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_invoice_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE invoices
    SET
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM invoice_line_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price * tax_rate), 0)
            FROM invoice_line_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        )
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Update total_amount
    UPDATE invoices
    SET total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: FUNCTION calculate_invoice_totals(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.calculate_invoice_totals() IS 'DISABLED: This trigger was recalculating invoice totals incorrectly (same bug as work_orders). 
Frontend calculates totals correctly before saving. 
Modern SaaS architecture: frontend calculates, backend stores.';


--
-- Name: calculate_work_order_totals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_work_order_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE work_orders
    SET
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM work_order_line_items
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price * tax_rate), 0)
            FROM work_order_line_items
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        )
    WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);

    -- Update total_amount
    UPDATE work_orders
    SET total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: FUNCTION calculate_work_order_totals(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.calculate_work_order_totals() IS 'DISABLED: This trigger was recalculating totals incorrectly (double-taxing). 
Frontend calculates totals correctly before saving. 
If re-enabled, must fix the tax calculation logic.';


--
-- Name: calculate_work_order_totals_with_tax(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_work_order_totals_with_tax(p_work_order_id uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    subtotal NUMERIC := 0;
    tax_amount NUMERIC := 0;
    total_amount NUMERIC := 0;
    company_tax_rate NUMERIC := 0;
    result JSONB;
BEGIN
    -- Get company default tax rate
    SELECT cs.default_tax_rate INTO company_tax_rate
    FROM work_orders wo
    JOIN companies c ON wo.company_id = c.id
    JOIN company_settings cs ON c.id = cs.company_id
    WHERE wo.id = p_work_order_id;

    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total_price), 0) INTO subtotal
    FROM work_order_line_items
    WHERE work_order_id = p_work_order_id;

    -- Calculate tax (using line item tax rates or company default)
    SELECT COALESCE(SUM(total_price * COALESCE(tax_rate, company_tax_rate)), 0) INTO tax_amount
    FROM work_order_line_items
    WHERE work_order_id = p_work_order_id;

    total_amount := subtotal + tax_amount;

    -- Update work order
    UPDATE work_orders
    SET subtotal = subtotal,
        tax_amount = tax_amount,
        total_amount = total_amount,
        updated_at = NOW()
    WHERE id = p_work_order_id;

    result := jsonb_build_object(
        'work_order_id', p_work_order_id,
        'subtotal', subtotal,
        'tax_amount', tax_amount,
        'total_amount', total_amount
    );

    RETURN result;
END;
$$;


--
-- Name: create_audit_log(uuid, uuid, public.audit_action_enum, text, uuid, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_audit_log(p_company_id uuid, p_user_id uuid, p_action public.audit_action_enum, p_table_name text, p_record_id uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        company_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        p_company_id,
        p_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        NOW()
    ) RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$;


--
-- Name: create_complete_user(uuid, uuid, public.user_role_enum, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_complete_user(p_auth_user_id uuid, p_company_id uuid, p_role public.user_role_enum DEFAULT 'technician'::public.user_role_enum, p_first_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text, p_phone text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Insert into users table
    INSERT INTO users (auth_user_id, company_id, role, status)
    VALUES (p_auth_user_id, p_company_id, p_role, 'active')
    RETURNING id INTO new_user_id;
    
    -- Insert into profiles table
    INSERT INTO profiles (user_id, first_name, last_name, phone)
    VALUES (new_user_id, p_first_name, p_last_name, p_phone);
    
    RETURN new_user_id;
END;
$$;


--
-- Name: create_default_rate_cards(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_rate_cards(p_company_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_industry TEXT;
BEGIN
    -- Look up the company's industry
    SELECT industry INTO v_industry
    FROM companies
    WHERE id = p_company_id;

    -- Only seed if company has no rate cards
    IF NOT EXISTS (SELECT 1 FROM rate_cards WHERE company_id = p_company_id) THEN

        -- Universal defaults (always added, 0.00 placeholder)
        INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
        VALUES
        (p_company_id, 'General Labor', 'Standard labor rate', 'OTHER', 'HOUR', 0.00, true, 1),
        (p_company_id, 'Service Call', 'Basic service call / dispatch', 'OTHER', 'FLAT_FEE', 0.00, false, 2),
        (p_company_id, 'Emergency Service', 'After-hours / urgent response', 'OTHER', 'HOUR', 0.00, false, 3),
        (p_company_id, 'Parts & Materials', 'Parts and consumables', 'OTHER', 'UNIT', 0.00, false, 4);

        -- Optional trade-specific placeholders
        IF v_industry = 'HVAC' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'HVAC Repair', 'General HVAC repair work', 'HVAC', 'HOUR', 0.00, false, 10),
            (p_company_id, 'System Tune-up', 'Annual maintenance and tune-up', 'HVAC', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'PLUMBING' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Plumbing Repair', 'General plumbing repair work', 'PLUMBING', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Drain Cleaning', 'Standard drain cleaning service', 'PLUMBING', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'ELECTRICAL' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Electrical Repair', 'General electrical repair work', 'ELECTRICAL', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Outlet Installation', 'Install new electrical outlet', 'ELECTRICAL', 'UNIT', 0.00, false, 11);

        END IF;
    END IF;
END;
$$;


--
-- Name: create_default_rate_cards(uuid, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_rate_cards(p_company_id uuid, p_hourly_rate numeric DEFAULT 75.00) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_base_rate NUMERIC := COALESCE(p_hourly_rate, 75.00);
BEGIN
    IF NOT EXISTS (SELECT 1 FROM rate_cards WHERE company_id = p_company_id) THEN
        INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
        VALUES
        (p_company_id, 'Service Call', 'Basic service call and diagnostic', 'HVAC', 'FLAT_FEE', v_base_rate * 2, true, 1),
        (p_company_id, 'HVAC Repair', 'General HVAC repair work', 'HVAC', 'HOUR', v_base_rate, false, 2),
        (p_company_id, 'System Tune-up', 'Annual maintenance and tune-up', 'HVAC', 'FLAT_FEE', v_base_rate * 1.5, false, 3),

        (p_company_id, 'Plumbing Service Call', 'Basic plumbing service call', 'PLUMBING', 'FLAT_FEE', v_base_rate * 2, true, 1),
        (p_company_id, 'Plumbing Repair', 'General plumbing repair work', 'PLUMBING', 'HOUR', v_base_rate, false, 2),
        (p_company_id, 'Drain Cleaning', 'Standard drain cleaning service', 'PLUMBING', 'FLAT_FEE', v_base_rate * 1.8, false, 3),

        (p_company_id, 'Electrical Service Call', 'Basic electrical service call', 'ELECTRICAL', 'FLAT_FEE', v_base_rate * 2, true, 1),
        (p_company_id, 'Electrical Repair', 'General electrical repair work', 'ELECTRICAL', 'HOUR', v_base_rate, false, 2),
        (p_company_id, 'Outlet Installation', 'Install new electrical outlet', 'ELECTRICAL', 'UNIT', v_base_rate * 0.8, false, 3),

        (p_company_id, 'General Labor', 'General handyman labor', 'GENERAL_REPAIR', 'HOUR', v_base_rate, true, 1),
        (p_company_id, 'Emergency Service', 'After-hours emergency service', 'GENERAL_REPAIR', 'HOUR', v_base_rate * 2, false, 2);
    END IF;
END;
$$;


--
-- Name: create_sample_customer(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_sample_customer(p_company_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_customer_id UUID;
  v_customer_number TEXT;
BEGIN
  -- Generate customer number
  v_customer_number := generate_customer_number(p_company_id);
  
  -- Create sample customer
  INSERT INTO customers (
    id,
    company_id,
    customer_number,
    first_name,
    last_name,
    email,
    phone,
    customer_type,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_company_id,
    v_customer_number,
    'John',
    'Sample Customer',
    'john.sample@example.com',
    '(555) 123-4567',
    'residential',
    NOW(),
    NOW()
  ) RETURNING id INTO v_customer_id;
  
  -- Create sample address
  INSERT INTO customer_addresses (
    id,
    customer_id,
    company_id,
    address_type,
    address_line1,
    city,
    state,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_customer_id,
    p_company_id,
    'service',
    '123 Main Street',
    'Anytown',
    'CA',
    '90210',
    'United States',
    true,
    NOW(),
    NOW()
  );
  
  RETURN v_customer_id;
END;
$$;


--
-- Name: create_sample_work_order(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_sample_work_order(p_company_id uuid, p_customer_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_work_order_id UUID;
  v_work_order_number TEXT;
  v_service_type_id UUID;
BEGIN
  -- Get work order number
  v_work_order_number := generate_work_order_number(p_company_id);
  
  -- Get first available service type
  SELECT st.id INTO v_service_type_id
  FROM service_types st
  JOIN service_categories sc ON st.category_id = sc.id
  WHERE st.company_id = p_company_id
  LIMIT 1;
  
  -- Create sample work order
  INSERT INTO work_orders (
    id,
    company_id,
    customer_id,
    work_order_number,
    title,
    description,
    status,
    priority,
    service_type_id,
    subtotal,
    tax_amount,
    total_amount,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_company_id,
    p_customer_id,
    v_work_order_number,
    'Sample Service Quote',
    'This is a sample quote created during onboarding to demonstrate the system.',
    'quote',
    'normal',
    v_service_type_id,
    500.00,
    45.00,
    545.00,
    NOW(),
    NOW()
  ) RETURNING id INTO v_work_order_id;
  
  -- Add sample line items
  INSERT INTO work_order_line_items (
    id,
    work_order_id,
    company_id,
    item_type,
    description,
    quantity,
    unit_price,
    total_price,
    created_at,
    updated_at
  ) VALUES 
  (
    gen_random_uuid(),
    v_work_order_id,
    p_company_id,
    'labor',
    'Sample Labor - 2 hours',
    2.00,
    75.00,
    150.00,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    v_work_order_id,
    p_company_id,
    'material',
    'Sample Materials',
    1.00,
    350.00,
    350.00,
    NOW(),
    NOW()
  );
  
  RETURN v_work_order_id;
END;
$$;


--
-- Name: enforce_work_order_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_work_order_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- ✅ If NEW.status is NULL, keep OLD.status
    IF NEW.status IS NULL AND OLD.status IS NOT NULL THEN
        NEW.status := OLD.status;
    END IF;

    -- ✅ REMOVED: Status validation - frontend controls workflow
    -- No validation, just allow all status changes

    RETURN NEW;
END;
$$;


--
-- Name: format_phone_e164(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.format_phone_e164(input_phone text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
BEGIN
    -- Return null for empty input
    IF input_phone IS NULL OR trim(input_phone) = '' THEN
        RETURN NULL;
    END IF;
    
    -- If already in E.164 format, return as-is
    IF input_phone ~ '^\+[1-9]\d{1,14}$' THEN
        RETURN input_phone;
    END IF;
    
    -- Remove all non-digits except leading +
    DECLARE
        cleaned TEXT := regexp_replace(input_phone, '[^\d+]', '', 'g');
        digits TEXT;
    BEGIN
        -- Extract digits only
        digits := regexp_replace(cleaned, '[^\d]', '', 'g');
        
        -- If no digits, return null
        IF length(digits) = 0 THEN
            RETURN NULL;
        END IF;
        
        -- Handle common cases
        CASE
            -- 10 digits: assume US/Canada
            WHEN length(digits) = 10 THEN
                RETURN '+1' || digits;
            
            -- 11 digits starting with 1: US/Canada with country code
            WHEN length(digits) = 11 AND left(digits, 1) = '1' THEN
                RETURN '+' || digits;
            
            -- Other valid lengths (7-15 digits)
            WHEN length(digits) BETWEEN 7 AND 15 AND left(digits, 1) != '0' THEN
                -- If input had +, preserve it; otherwise add +
                IF left(ltrim(input_phone), 1) = '+' THEN
                    RETURN '+' || digits;
                ELSE
                    -- For international numbers without +, user should specify country code
                    -- Default to +1 for backwards compatibility if it looks like NANP
                    IF length(digits) = 10 OR (length(digits) = 11 AND left(digits, 1) = '1') THEN
                        RETURN '+1' || right(digits, 10);
                    ELSE
                        RETURN '+' || digits;
                    END IF;
                END IF;
            
            ELSE
                -- Invalid format
                RETURN NULL;
        END CASE;
    END;
END;
$_$;


--
-- Name: FUNCTION format_phone_e164(input_phone text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.format_phone_e164(input_phone text) IS 'Formats phone numbers to E.164 international standard. Handles US/Canada (10-11 digits) and international formats.';


--
-- Name: generate_change_order_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_change_order_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM change_orders
  WHERE company_id = p_company_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  v_number := 'CO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
  RETURN v_number;
END;
$$;


--
-- Name: FUNCTION generate_change_order_number(p_company_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_change_order_number(p_company_id uuid) IS 'Generates sequential change order numbers like CO-2025-0001';


--
-- Name: generate_company_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_company_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate a 6-digit number
        new_number := 'C-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM companies WHERE company_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        IF counter >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique company number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;


--
-- Name: generate_customer_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_customer_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    seq_val BIGINT;
BEGIN
    seq_val := nextval('customer_number_seq');
    RETURN 'CUST-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$;


--
-- Name: generate_invoice_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_invoice_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN generate_smart_reference_number(p_company_id, 'invoice');
END;
$$;


--
-- Name: generate_quote_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_quote_number(company_uuid uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num INTEGER;
    year_month TEXT;
    prefix TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    prefix := 'QT-' || year_month || '-';
    
    -- Find the highest number for this month
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(work_order_number FROM LENGTH(prefix) + 1) 
                AS INTEGER
            )
        ), 
        0
    ) + 1
    INTO next_num
    FROM work_orders
    WHERE company_id = company_uuid
    AND work_order_number LIKE prefix || '%'
    AND status IN ('draft', 'quote', 'approved');
    
    RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_service_agreement_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_service_agreement_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN generate_smart_reference_number(p_company_id, 'service_agreement');
END;
$$;


--
-- Name: generate_smart_reference_number(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_smart_reference_number(p_company_id uuid, p_type text, p_prefix text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_prefix TEXT;
    v_sequence INTEGER;
    v_reference_number TEXT;
    v_max_attempts INTEGER := 10;
    v_attempt INTEGER := 0;
BEGIN
    -- Set default prefix based on type
    v_prefix := COALESCE(p_prefix, 
        CASE p_type
            WHEN 'work_order' THEN 'WO'
            WHEN 'invoice' THEN 'INV'
            WHEN 'customer' THEN 'CUST'
            WHEN 'payment' THEN 'PAY'
            ELSE 'REF'
        END
    );
    
    -- Generate reference number with collision avoidance
    LOOP
        v_attempt := v_attempt + 1;
        
        -- Get next sequence number
        SELECT COALESCE(MAX(
            CASE 
                WHEN p_type = 'work_order' THEN 
                    CAST(SUBSTRING(work_order_number FROM '[0-9]+$') AS INTEGER)
                WHEN p_type = 'invoice' THEN 
                    CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
                WHEN p_type = 'customer' THEN 
                    CAST(SUBSTRING(customer_number FROM '[0-9]+$') AS INTEGER)
                ELSE 0
            END
        ), 0) + 1 INTO v_sequence
        FROM (
            SELECT work_order_number FROM work_orders WHERE company_id = p_company_id
            UNION ALL
            SELECT invoice_number FROM invoices WHERE company_id = p_company_id
            UNION ALL
            SELECT customer_number FROM customers WHERE company_id = p_company_id
        ) AS all_numbers;
        
        -- Format reference number
        v_reference_number := v_prefix || '-' || TO_CHAR(v_sequence, 'FM00000');
        
        -- Check for collision
        IF NOT EXISTS (
            SELECT 1 FROM work_orders 
            WHERE company_id = p_company_id AND work_order_number = v_reference_number
            UNION ALL
            SELECT 1 FROM invoices 
            WHERE company_id = p_company_id AND invoice_number = v_reference_number
            UNION ALL
            SELECT 1 FROM customers 
            WHERE company_id = p_company_id AND customer_number = v_reference_number
        ) THEN
            EXIT; -- No collision, we're good
        END IF;
        
        -- Prevent infinite loop
        IF v_attempt >= v_max_attempts THEN
            v_reference_number := v_prefix || '-' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM99999999');
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_reference_number;
END;
$_$;


--
-- Name: generate_work_order_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_work_order_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN generate_smart_reference_number(p_company_id, 'work_order');
END;
$$;


--
-- Name: get_browse_requests(uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_browse_requests(p_company_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, title text, description text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Return empty result for now - this is just to fix the missing function error
    RETURN QUERY
    SELECT 
        gen_random_uuid() as id,
        'Sample Request' as title,
        'This is a placeholder function' as description,
        NOW() as created_at
    WHERE FALSE; -- Return no rows
END;
$$;


--
-- Name: get_display_name(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_display_name(p_first_name text, p_last_name text, p_email text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    IF p_first_name IS NOT NULL AND p_last_name IS NOT NULL THEN
        RETURN p_first_name || ' ' || p_last_name;
    ELSIF p_first_name IS NOT NULL THEN
        RETURN p_first_name;
    ELSIF p_last_name IS NOT NULL THEN
        RETURN p_last_name;
    ELSIF p_email IS NOT NULL THEN
        RETURN split_part(p_email, '@', 1);  -- Use email username as fallback
    ELSE
        RETURN 'Unknown User';
    END IF;
END;
$$;


--
-- Name: FUNCTION get_display_name(p_first_name text, p_last_name text, p_email text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_display_name(p_first_name text, p_last_name text, p_email text) IS 'Helper function to get display name with fallbacks';


--
-- Name: get_enum_values(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enum_values(enum_name text) RETURNS TABLE(value text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT unnest(enum_range(NULL::%I))::text',
    enum_name
  );
END;
$$;


--
-- Name: FUNCTION get_enum_values(enum_name text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_enum_values(enum_name text) IS 'Returns all values for a given enum type. Used by EnumCacheService for offline support.';


--
-- Name: get_marketplace_stats(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_marketplace_stats(p_company_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Return basic stats structure
    RETURN json_build_object(
        'total_requests', 0,
        'open_requests', 0,
        'my_responses', 0,
        'accepted_responses', 0,
        'acceptance_rate', 0,
        'avg_response_time_hours', NULL
    );
END;
$$;


--
-- Name: get_quote_defaults(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_quote_defaults(p_company_id uuid) RETURNS TABLE(tax_rate numeric, payment_terms text, deposit_percentage numeric, terms_and_conditions text, warranty_info text, cancellation_policy text, quote_expiration_days integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qd.default_tax_rate,
        qd.default_payment_terms,
        qd.default_deposit_percentage,
        qd.default_terms_and_conditions,
        qd.default_warranty_info,
        qd.default_cancellation_policy,
        qd.default_quote_expiration_days
    FROM quote_defaults qd
    WHERE qd.company_id = p_company_id;
    
    -- If no defaults exist, return sensible defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            0.00::NUMERIC as tax_rate,
            'Net 30'::TEXT as payment_terms,
            NULL::NUMERIC as deposit_percentage,
            NULL::TEXT as terms_and_conditions,
            NULL::TEXT as warranty_info,
            NULL::TEXT as cancellation_policy,
            30::INTEGER as quote_expiration_days;
    END IF;
END;
$$;


--
-- Name: get_user_by_auth_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_by_auth_id(auth_id uuid) RETURNS TABLE(user_id uuid, company_id uuid, role public.user_role_enum, status public.user_status_enum, first_name text, last_name text, phone text, avatar_url text, company_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.company_id,
        u.role,
        u.status,
        p.first_name,
        p.last_name,
        p.phone,
        p.avatar_url,
        c.name as company_name
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.auth_user_id = auth_id
    AND u.status = 'active';
END;
$$;


--
-- Name: get_user_dashboard_data(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_dashboard_data(p_user_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSON;
    v_company_id UUID;
BEGIN
    -- Get user's company
    SELECT company_id INTO v_company_id
    FROM users 
    WHERE id = p_user_id;
    
    IF v_company_id IS NULL THEN
        RETURN '{"error": "User not found"}'::JSON;
    END IF;
    
    -- Build dashboard data
    SELECT json_build_object(
        'user_id', p_user_id,
        'company_id', v_company_id,
        
        -- Work order metrics
        'active_work_orders', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status IN ('scheduled', 'dispatched', 'in_progress')
        ),
        'completed_today', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        'total_revenue_today', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM work_orders 
            WHERE assigned_to = p_user_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        
        -- Company-wide metrics (for managers/admins)
        'company_active_work_orders', (
            SELECT COUNT(*) 
            FROM work_orders 
            WHERE company_id = v_company_id 
              AND status IN ('scheduled', 'dispatched', 'in_progress')
        ),
        'company_revenue_today', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM work_orders 
            WHERE company_id = v_company_id 
              AND status = 'completed'
              AND DATE(actual_end) = CURRENT_DATE
        ),
        
        -- Invoice metrics
        'pending_invoices', (
            SELECT COUNT(*)
            FROM invoices i
            JOIN work_orders wo ON i.work_order_id = wo.id
            WHERE wo.assigned_to = p_user_id
              AND i.status IN ('draft', 'sent')
        ),
        'overdue_invoices', (
            SELECT COUNT(*)
            FROM invoices i
            JOIN work_orders wo ON i.work_order_id = wo.id
            WHERE wo.company_id = v_company_id
              AND i.status NOT IN ('paid', 'cancelled')
              AND i.due_date < CURRENT_DATE
        ),
        
        -- Notification count
        'unread_notifications', (
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = p_user_id
              AND status = 'sent'
              AND read_at IS NULL
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;


--
-- Name: handle_customer_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_customer_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Auto-generate customer number if missing
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    
    -- Normalize status to lowercase (industry standard)
    IF NEW.status IS NOT NULL THEN
        NEW.status := LOWER(NEW.status);
    ELSE
        NEW.status := 'active';
    END IF;
    
    -- Sync is_active from status (for backward compatibility)
    NEW.is_active := (NEW.status = 'active');
    
    -- Normalize type to lowercase (industry standard)
    IF NEW.type IS NOT NULL THEN
        NEW.type := LOWER(NEW.type);
    ELSE
        NEW.type := 'residential';
    END IF;
    
    -- Format phone numbers (if function exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'format_phone_e164') THEN
        NEW.phone := format_phone_e164(NEW.phone);
        NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    END IF;
    
    -- Ensure customer_since is set
    IF NEW.customer_since IS NULL THEN
        NEW.customer_since := CURRENT_DATE;
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$;


--
-- Name: handle_customer_changes_final(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_customer_changes_final() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Auto-generate customer number if missing
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    
    -- CRITICAL: Normalize status to lowercase FIRST
    IF NEW.status IS NOT NULL THEN
        NEW.status := LOWER(NEW.status);
    END IF;
    
    -- Sync is_active from status (lowercase comparison)
    IF NEW.status IS NOT NULL THEN
        NEW.is_active := (NEW.status = 'active');
    ELSIF NEW.is_active IS NOT NULL THEN
        -- If only is_active is set, derive status from it
        NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
    ELSE
        -- Default to active if neither is set
        NEW.status := 'active';
        NEW.is_active := true;
    END IF;
    
    -- Update display_name
    NEW.display_name := CASE 
        WHEN NEW.company_name IS NOT NULL AND trim(NEW.company_name) != '' THEN NEW.company_name
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
            trim(NEW.first_name || ' ' || NEW.last_name)
        WHEN NEW.first_name IS NOT NULL AND trim(NEW.first_name) != '' THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL AND trim(NEW.last_name) != '' THEN NEW.last_name
        ELSE 'Unnamed Customer'
    END;
    
    -- Ensure customer_since is set
    IF NEW.customer_since IS NULL THEN
        NEW.customer_since := CURRENT_DATE;
    END IF;
    
    -- Format phone numbers using the E.164 function (if it exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'format_phone_e164') THEN
        NEW.phone := format_phone_e164(NEW.phone);
        NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    END IF;
    
    -- Ensure customer_type and type are in sync (lowercase)
    IF NEW.customer_type IS NOT NULL THEN
        NEW.type := LOWER(NEW.customer_type::text);
    ELSIF NEW.type IS NOT NULL THEN
        NEW.customer_type := LOWER(NEW.type)::customer_type_enum;
    ELSE
        -- Default to residential
        NEW.customer_type := 'residential'::customer_type_enum;
        NEW.type := 'residential';
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$;


--
-- Name: is_onboarding_complete(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_onboarding_complete(p_company_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_progress JSONB;
BEGIN
  SELECT onboarding_progress INTO v_progress
  FROM company_settings
  WHERE company_id = p_company_id;
  
  RETURN (v_progress->>'completed_at') IS NOT NULL;
END;
$$;


--
-- Name: log_audit_event(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_audit_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Map TG_OP to audit_action_enum values
    DECLARE
        audit_action audit_action_enum;
    BEGIN
        audit_action := CASE TG_OP
            WHEN 'INSERT' THEN 'insert'::audit_action_enum
            WHEN 'UPDATE' THEN 'update'::audit_action_enum
            WHEN 'DELETE' THEN 'delete'::audit_action_enum
            ELSE 'update'::audit_action_enum  -- fallback
        END;
        
        INSERT INTO audit_logs (
            company_id, 
            user_id, 
            table_name, 
            record_id,
            action, 
            old_values, 
            new_values,
            ip_address, 
            user_agent, 
            created_at
        )
        VALUES (
            COALESCE(NEW.company_id, OLD.company_id),
            -- Try multiple ways to get user ID, with fallbacks
            COALESCE(
                -- Try app setting first
                NULLIF(current_setting('app.current_user_id', true), '')::uuid,
                -- Try auth.uid() mapped to profiles
                (SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1),
                -- Try direct auth.uid() if it's a UUID
                CASE 
                    WHEN auth.uid() IS NOT NULL THEN auth.uid()
                    ELSE NULL
                END
            ),
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            audit_action,  -- Use the mapped enum value
            CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
            -- Handle missing app settings gracefully
            CASE 
                WHEN current_setting('app.current_user_ip', true) != '' 
                THEN current_setting('app.current_user_ip', true)::inet
                ELSE NULL
            END,
            NULLIF(current_setting('app.current_user_agent', true), ''),
            NOW()
        );
        
        RETURN COALESCE(NEW, OLD);
    EXCEPTION
        WHEN OTHERS THEN
            -- If audit logging fails, don't block the main operation
            -- Log the error but continue
            RAISE WARNING 'Audit logging failed for table %: %', TG_TABLE_NAME, SQLERRM;
            RETURN COALESCE(NEW, OLD);
    END;
END;
$$;


--
-- Name: log_customer_creation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_customer_creation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO customer_history (customer_id, event_type, event_description, created_by)
    VALUES (NEW.id, 'created', 'Customer record created', NULL);
    RETURN NEW;
END;
$$;


--
-- Name: log_customer_event(uuid, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_customer_event(p_customer_id uuid, p_event_type text, p_event_description text, p_event_data jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_history_id UUID;
BEGIN
    INSERT INTO customer_history (
        customer_id, 
        event_type, 
        event_description, 
        event_data, 
        created_by
    ) VALUES (
        p_customer_id,
        p_event_type,
        p_event_description,
        p_event_data,
        auth.uid()
    ) RETURNING id INTO v_history_id;
    
    RETURN v_history_id;
END;
$$;


--
-- Name: log_customer_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_customer_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Log is_active changes
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        INSERT INTO customer_history (customer_id, event_type, event_description, event_data)
        VALUES (NEW.id, 'status_changed',
                'Status changed from ' || CASE WHEN OLD.is_active THEN 'active' ELSE 'inactive' END || ' to ' || CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
                jsonb_build_object('old_is_active', OLD.is_active, 'new_is_active', NEW.is_active));
    END IF;

    -- Log other significant changes
    IF OLD.email IS DISTINCT FROM NEW.email OR
       OLD.phone IS DISTINCT FROM NEW.phone OR
       OLD.company_name IS DISTINCT FROM NEW.company_name OR
       OLD.first_name IS DISTINCT FROM NEW.first_name OR
       OLD.last_name IS DISTINCT FROM NEW.last_name THEN
        INSERT INTO customer_history (customer_id, event_type, event_description)
        VALUES (NEW.id, 'updated', 'Customer information updated');
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: log_user_activity(uuid, text, text, inet, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_user_activity(p_user_id uuid, p_action_type text, p_description text DEFAULT NULL::text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_company_id UUID;
  v_log_id UUID;
BEGIN
  -- Get company_id from user
  SELECT company_id INTO v_company_id
  FROM users
  WHERE id = p_user_id;

  -- Insert activity log
  INSERT INTO user_activity_log (
    user_id,
    company_id,
    action_type,
    description,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    v_company_id,
    p_action_type,
    p_description,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;


--
-- Name: safe_upsert_company_settings(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.safe_upsert_company_settings(p_company_id uuid, p_settings jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    result_id UUID;
BEGIN
    -- Try to update first
    UPDATE company_settings 
    SET 
        business_hours = COALESCE((p_settings->>'business_hours')::JSONB, business_hours),
        default_tax_rate = COALESCE((p_settings->>'default_tax_rate')::NUMERIC, default_tax_rate),
        invoice_terms = COALESCE(p_settings->>'invoice_terms', invoice_terms),
        auto_invoice = COALESCE((p_settings->>'auto_invoice')::BOOLEAN, auto_invoice),
        require_signatures = COALESCE((p_settings->>'require_signatures')::BOOLEAN, require_signatures),
        allow_online_payments = COALESCE((p_settings->>'allow_online_payments')::BOOLEAN, allow_online_payments),
        emergency_rate_multiplier = COALESCE((p_settings->>'emergency_rate_multiplier')::NUMERIC, emergency_rate_multiplier),
        travel_charge_per_mile = COALESCE((p_settings->>'travel_charge_per_mile')::NUMERIC, travel_charge_per_mile),
        minimum_travel_charge = COALESCE((p_settings->>'minimum_travel_charge')::NUMERIC, minimum_travel_charge),
        cancellation_fee = COALESCE((p_settings->>'cancellation_fee')::NUMERIC, cancellation_fee),
        transparency_mode = COALESCE((p_settings->>'transparency_mode')::BOOLEAN, transparency_mode),
        onboarding_progress = COALESCE((p_settings->>'onboarding_progress')::JSONB, onboarding_progress),
        updated_at = NOW()
    WHERE company_id = p_company_id
    RETURNING id INTO result_id;
    
    -- If no rows were updated, insert a new record
    IF result_id IS NULL THEN
        INSERT INTO company_settings (
            company_id,
            business_hours,
            default_tax_rate,
            invoice_terms,
            auto_invoice,
            require_signatures,
            allow_online_payments,
            emergency_rate_multiplier,
            travel_charge_per_mile,
            minimum_travel_charge,
            cancellation_fee,
            transparency_mode,
            onboarding_progress,
            created_at,
            updated_at
        ) VALUES (
            p_company_id,
            COALESCE((p_settings->>'business_hours')::JSONB, '{"monday": {"open": "08:00", "close": "17:00"}}'::JSONB),
            COALESCE((p_settings->>'default_tax_rate')::NUMERIC, 0.0000),
            COALESCE(p_settings->>'invoice_terms', 'NET30'),
            COALESCE((p_settings->>'auto_invoice')::BOOLEAN, FALSE),
            COALESCE((p_settings->>'require_signatures')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'allow_online_payments')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'emergency_rate_multiplier')::NUMERIC, 1.50),
            COALESCE((p_settings->>'travel_charge_per_mile')::NUMERIC, 0.65),
            COALESCE((p_settings->>'minimum_travel_charge')::NUMERIC, 25.00),
            COALESCE((p_settings->>'cancellation_fee')::NUMERIC, 50.00),
            COALESCE((p_settings->>'transparency_mode')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'onboarding_progress')::JSONB, '{}'::JSONB),
            NOW(),
            NOW()
        )
        RETURNING id INTO result_id;
    END IF;
    
    RETURN result_id;
END;
$$;


--
-- Name: seed_onboarding_sample_data(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seed_onboarding_sample_data(p_company_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_customer_id UUID;
  v_work_order_id UUID;
  v_result JSONB;
BEGIN
  -- Create sample customer
  v_customer_id := create_sample_customer(p_company_id);
  
  -- Create sample work order
  v_work_order_id := create_sample_work_order(p_company_id, v_customer_id);
  
  -- Return created IDs
  v_result := jsonb_build_object(
    'success', true,
    'customer_id', v_customer_id,
    'work_order_id', v_work_order_id,
    'message', 'Sample data created successfully'
  );
  
  RETURN v_result;
END;
$$;


--
-- Name: set_company_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_company_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Only generate if company_number is NULL or empty
    IF NEW.company_number IS NULL OR NEW.company_number = '' THEN
        NEW.company_number := generate_company_number();
        RAISE NOTICE 'Auto-generated company_number: %', NEW.company_number;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: set_quote_expiration(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_quote_expiration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When quote_sent_at is set and quote_expires_at is not set
    IF NEW.quote_sent_at IS NOT NULL AND OLD.quote_sent_at IS NULL AND NEW.quote_expires_at IS NULL THEN
        -- Set expiration to 30 days from sent date (industry standard)
        NEW.quote_expires_at := NEW.quote_sent_at + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: sync_customer_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_customer_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Sync status with is_active
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.is_active := (NEW.status = 'ACTIVE');
    END IF;
    
    IF TG_OP = 'INSERT' OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        NEW.status := CASE WHEN NEW.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
    END IF;
    
    -- Update display_name when name fields change
    NEW.display_name := CASE 
        WHEN NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN NEW.company_name
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
            CONCAT(NEW.first_name, ' ', NEW.last_name)
        WHEN NEW.first_name IS NOT NULL THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL THEN NEW.last_name
        ELSE 'Unnamed Customer'
    END;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_invoice_amount_paid(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_invoice_amount_paid() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE invoices
    SET amount_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        AND status = 'completed'
    )
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_onboarding_progress(uuid, integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_onboarding_progress(p_company_id uuid, p_step integer, p_completed boolean DEFAULT true) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_current_progress JSONB;
  v_new_progress JSONB;
  v_step_key TEXT := p_step::text;
BEGIN
  -- Get current progress
  SELECT onboarding_progress INTO v_current_progress
  FROM company_settings
  WHERE company_id = p_company_id;
  
  -- Initialize if null
  IF v_current_progress IS NULL THEN
    v_current_progress := '{
      "current_step": 1,
      "completed_steps": [],
      "started_at": null,
      "completed_at": null,
      "skipped": false,
      "steps": {
        "1": {"name": "Company Basics", "completed": false, "completed_at": null},
        "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
        "3": {"name": "Team Setup", "completed": false, "completed_at": null},
        "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
        "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
        "6": {"name": "Go Live", "completed": false, "completed_at": null}
      }
    }'::jsonb;
  END IF;
  
  -- Set started_at if first step
  IF (v_current_progress->>'started_at') IS NULL THEN
    v_current_progress := jsonb_set(v_current_progress, '{started_at}', to_jsonb(NOW()));
  END IF;
  
  -- Update step completion
  v_new_progress := jsonb_set(
    v_current_progress,
    array['steps', v_step_key, 'completed'],
    to_jsonb(p_completed)
  );
  
  IF p_completed THEN
    v_new_progress := jsonb_set(
      v_new_progress,
      array['steps', v_step_key, 'completed_at'],
      to_jsonb(NOW())
    );
    
    -- Update current step to next step
    IF p_step < 6 THEN
      v_new_progress := jsonb_set(v_new_progress, '{current_step}', to_jsonb(p_step + 1));
    ELSE
      -- All steps completed
      v_new_progress := jsonb_set(v_new_progress, '{completed_at}', to_jsonb(NOW()));
      v_new_progress := jsonb_set(v_new_progress, '{current_step}', to_jsonb(6));
    END IF;
  END IF;
  
  -- Update database
  UPDATE company_settings 
  SET onboarding_progress = v_new_progress,
      updated_at = NOW()
  WHERE company_id = p_company_id;
  
  RETURN v_new_progress;
END;
$$;


--
-- Name: update_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_profiles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: update_quote_analytics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_quote_analytics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    analytics_record quote_analytics%ROWTYPE;
BEGIN
    -- Only process for quote-stage work orders
    IF NEW.status NOT IN ('draft', 'quote', 'approved') THEN
        RETURN NEW;
    END IF;
    
    -- Get or create analytics record
    SELECT * INTO analytics_record
    FROM quote_analytics
    WHERE work_order_id = NEW.id;
    
    IF NOT FOUND THEN
        -- Create new analytics record
        INSERT INTO quote_analytics (
            work_order_id,
            company_id,
            quote_created_at,
            quote_value,
            quote_version
        ) VALUES (
            NEW.id,
            NEW.company_id,
            NEW.created_at,
            NEW.total_amount,
            COALESCE(NEW.quote_version, 1)
        );
    ELSE
        -- Update existing analytics
        UPDATE quote_analytics SET
            quote_sent_at = NEW.quote_sent_at,
            quote_viewed_at = NEW.quote_viewed_at,
            quote_accepted_at = NEW.quote_accepted_at,
            quote_rejected_at = NEW.quote_rejected_at,
            quote_value = NEW.total_amount,
            quote_version = COALESCE(NEW.quote_version, 1),
            
            -- Calculate time metrics
            time_to_send_hours = CASE 
                WHEN NEW.quote_sent_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (NEW.quote_sent_at - NEW.created_at)) / 3600
                ELSE NULL
            END,
            time_to_view_hours = CASE 
                WHEN NEW.quote_viewed_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_viewed_at - NEW.quote_sent_at)) / 3600
                ELSE NULL
            END,
            time_to_decision_hours = CASE 
                WHEN NEW.quote_accepted_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_accepted_at - NEW.quote_sent_at)) / 3600
                WHEN NEW.quote_rejected_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_rejected_at - NEW.quote_sent_at)) / 3600
                ELSE NULL
            END,
            conversion_rate = CASE 
                WHEN NEW.quote_accepted_at IS NOT NULL THEN 1.0
                WHEN NEW.quote_rejected_at IS NOT NULL THEN 0.0
                ELSE NULL
            END,
            updated_at = NOW()
        WHERE work_order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_user_dashboard_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_dashboard_settings_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_work_order_on_change_order_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_work_order_on_change_order_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE work_orders
    SET 
      has_change_orders = true,
      change_orders_total = COALESCE(change_orders_total, 0) + NEW.total_amount,
      total_amount = COALESCE(total_amount, 0) + NEW.total_amount,
      updated_at = NOW()
    WHERE id = NEW.work_order_id;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: FUNCTION update_work_order_on_change_order_approval(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_work_order_on_change_order_approval() IS 'Automatically updates work order totals when change order is approved';


--
-- Name: update_work_order_totals(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_work_order_totals(p_work_order_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_tax_rate DECIMAL(5,4) := 0.0875; -- Default 8.75% tax rate
    v_tax_amount DECIMAL(10,2);
    v_total_amount DECIMAL(10,2);
BEGIN
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
    FROM work_order_line_items 
    WHERE work_order_id = p_work_order_id;
    
    -- Calculate tax (you might want to get this from company settings)
    v_tax_amount := v_subtotal * v_tax_rate;
    v_total_amount := v_subtotal + v_tax_amount;
    
    -- Update work order
    UPDATE work_orders 
    SET 
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total_amount = v_total_amount,
        updated_at = NOW()
    WHERE id = p_work_order_id;
END;
$$;


--
-- Name: validate_company_rates(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_company_rates(p_company_id uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM rate_cards
        WHERE company_id = p_company_id
          AND active = true
          AND rate > 0
    ) THEN
        RETURN true;
    ELSE
        RAISE EXCEPTION 'Company % must configure at least one rate before proceeding', p_company_id;
    END IF;
END;
$$;


--
-- Name: validate_onboarding_step(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_onboarding_step(p_company_id uuid, p_step integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_result JSONB := '{"valid": false, "errors": [], "warnings": []}'::jsonb;
  v_company_record RECORD;
  v_service_count INTEGER;
  v_employee_count INTEGER;
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
BEGIN
  -- Get company data
  SELECT * INTO v_company_record
  FROM companies
  WHERE id = p_company_id;

  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Company not found');
    RETURN jsonb_build_object(
      'valid', false,
      'errors', v_errors,
      'warnings', v_warnings
    );
  END IF;

  -- Step 1: Company Basics validation
  IF p_step = 1 THEN
    IF v_company_record.name IS NULL OR trim(v_company_record.name) = '' THEN
      v_errors := array_append(v_errors, 'Company name is required');
    END IF;

    IF v_company_record.phone IS NULL OR trim(v_company_record.phone) = '' THEN
      v_warnings := array_append(v_warnings, 'Phone number recommended for customer contact');
    END IF;

    IF v_company_record.address_line1 IS NULL OR trim(v_company_record.address_line1) = '' THEN
      v_warnings := array_append(v_warnings, 'Business address recommended for professional appearance');
    END IF;
  END IF;

  -- Step 2: Services/Pricing validation (mode-dependent)
  IF p_step = 2 THEN
    DECLARE
      v_mode TEXT;
    BEGIN
      -- Get onboarding mode from company_settings
      SELECT (onboarding_progress->>'mode') INTO v_mode
      FROM company_settings
      WHERE company_id = p_company_id;

      -- QUICK START: Skip service validation (pricing setup instead)
      IF v_mode = 'quick' THEN
        -- Quick start uses pricing setup - always valid
        v_warnings := array_append(v_warnings, 'Quick Start mode - services can be added later');
      ELSE
        -- ADVANCED: Check for services in company-specific OR global categories
        SELECT COUNT(*) INTO v_service_count
        FROM service_types st
        INNER JOIN service_categories sc ON st.category_id = sc.id
        WHERE (sc.company_id = p_company_id OR sc.company_id IS NULL);

        IF v_service_count = 0 THEN
          v_errors := array_append(v_errors, 'At least one service must be defined before creating quotes');
        END IF;
      END IF;
    END;
  END IF;

  -- Step 3: Team validation
  IF p_step = 3 THEN
    SELECT COUNT(*) INTO v_employee_count
    FROM users
    WHERE company_id = p_company_id
    AND role IN ('owner', 'admin', 'manager', 'technician');

    IF v_employee_count = 0 THEN
      v_warnings := array_append(v_warnings, 'Consider adding team members to assign work orders');
    END IF;
  END IF;

  -- Return validation result
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', v_errors,
    'warnings', v_warnings
  );
END;
$$;


--
-- Name: validate_work_order_status_transition(public.work_order_status_enum, public.work_order_status_enum); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_work_order_status_transition(p_current_status public.work_order_status_enum, p_new_status public.work_order_status_enum) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    -- ✅ Allow same status (no transition)
    IF p_current_status = p_new_status THEN
        RETURN TRUE;
    END IF;

    -- ✅ Allow NULL transitions
    IF p_current_status IS NULL OR p_new_status IS NULL THEN
        RETURN TRUE;
    END IF;

    -- ✅ Allow all transitions for now (frontend controls workflow)
    -- Industry standard: Frontend = source of truth, Backend = validation only
    RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION validate_work_order_status_transition(p_current_status public.work_order_status_enum, p_new_status public.work_order_status_enum); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.validate_work_order_status_transition(p_current_status public.work_order_status_enum, p_new_status public.work_order_status_enum) IS 'Validates work_order_status transitions. Currently allows all transitions. Frontend controls workflow logic.';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    table_name text NOT NULL,
    record_id uuid,
    action public.audit_action_enum NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: billing_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    price_monthly numeric(8,2) NOT NULL,
    price_yearly numeric(8,2),
    features jsonb DEFAULT '{}'::jsonb,
    max_users integer DEFAULT 1,
    max_work_orders integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: change_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    change_order_id uuid NOT NULL,
    item_type text NOT NULL,
    description text NOT NULL,
    category text,
    quantity numeric(10,2) DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT change_order_items_category_check CHECK ((category = ANY (ARRAY['labor'::text, 'material'::text, 'equipment'::text, 'service'::text, 'other'::text]))),
    CONSTRAINT change_order_items_item_type_check CHECK ((item_type = ANY (ARRAY['addition'::text, 'deletion'::text, 'modification'::text])))
);


--
-- Name: TABLE change_order_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.change_order_items IS 'Line items for change orders - additions, deletions, or modifications';


--
-- Name: change_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    change_order_number text NOT NULL,
    title text NOT NULL,
    description text,
    reason text,
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    requested_by uuid,
    approved_by_name text,
    approved_by_email text,
    signature_id uuid,
    signature_data text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT change_orders_reason_check CHECK ((reason = ANY (ARRAY['customer_request'::text, 'scope_change'::text, 'unforeseen_work'::text, 'code_requirement'::text, 'other'::text]))),
    CONSTRAINT change_orders_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_approval'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])))
);


--
-- Name: TABLE change_orders; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.change_orders IS 'Change orders for approved quotes - tracks scope changes and additional work';


--
-- Name: COLUMN change_orders.change_order_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.change_orders.change_order_number IS 'Unique identifier like CO-2025-001';


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_number text DEFAULT public.generate_company_number() NOT NULL,
    name text NOT NULL,
    legal_name text,
    tax_id text,
    phone text,
    email text,
    website text,
    address_line1 text,
    address_line2 text,
    city text,
    state_province text,
    postal_code text,
    country text DEFAULT 'US'::text,
    time_zone text DEFAULT 'UTC'::text,
    currency text DEFAULT 'USD'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    default_tax_rate numeric(5,4) DEFAULT 0.0875,
    created_by uuid,
    tagline text,
    logo_url text,
    industry text,
    industry_tags text[],
    CONSTRAINT chk_companies_email_format CHECK (((email IS NULL) OR (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT chk_company_postal_code CHECK ((postal_code ~ '^[0-9A-Za-z -]{3,10}$'::text)),
    CONSTRAINT companies_company_number_check CHECK ((company_number ~ '^C-[0-9]{6}$'::text)),
    CONSTRAINT companies_email_check CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text)),
    CONSTRAINT companies_name_check CHECK ((length(name) >= 2)),
    CONSTRAINT companies_phone_check CHECK ((phone ~ '^\+[1-9]\d{1,14}$'::text)),
    CONSTRAINT companies_tax_id_check CHECK ((tax_id ~ '^[0-9]{2}-[0-9]{7}$'::text)),
    CONSTRAINT companies_website_check CHECK ((website ~ '^https?://'::text))
);


--
-- Name: COLUMN companies.tax_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.tax_id IS 'Tax identification number';


--
-- Name: COLUMN companies.default_tax_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.default_tax_rate IS 'Default tax rate as decimal (e.g., 0.0875 for 8.75%)';


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    business_hours jsonb DEFAULT '{"monday": {"open": "08:00", "close": "17:00"}}'::jsonb,
    default_tax_rate numeric(5,4) DEFAULT 0.0000,
    invoice_terms text DEFAULT 'NET30'::text,
    auto_invoice boolean DEFAULT false,
    require_signatures boolean DEFAULT true,
    allow_online_payments boolean DEFAULT true,
    emergency_rate_multiplier numeric(3,2) DEFAULT 1.50,
    travel_charge_per_mile numeric(5,2) DEFAULT 0.65,
    minimum_travel_charge numeric(8,2) DEFAULT 25.00,
    cancellation_fee numeric(8,2) DEFAULT 50.00,
    transparency_mode boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    onboarding_progress jsonb DEFAULT '{"steps": {"1": {"name": "Company Basics", "completed": false, "completed_at": null}, "2": {"name": "Services & Pricing", "completed": false, "completed_at": null}, "3": {"name": "Team Setup", "completed": false, "completed_at": null}, "4": {"name": "Business Preferences", "completed": false, "completed_at": null}, "5": {"name": "Financial Setup", "completed": false, "completed_at": null}, "6": {"name": "Go Live", "completed": false, "completed_at": null}}, "skipped": false, "started_at": null, "completed_at": null, "current_step": 1, "completed_steps": []}'::jsonb,
    timezone text DEFAULT 'America/New_York'::text,
    display_name text,
    labor_rate numeric(10,2) DEFAULT 75.00,
    overtime_multiplier numeric(3,2) DEFAULT 1.5,
    parts_markup numeric(5,2) DEFAULT 25.00,
    CONSTRAINT chk_default_tax_rate CHECK (((default_tax_rate >= (0)::numeric) AND (default_tax_rate <= (50)::numeric)))
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    address_type text DEFAULT 'SERVICE'::text,
    address_line_1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text DEFAULT 'US'::text,
    is_primary boolean DEFAULT false,
    latitude numeric(10,8),
    longitude numeric(11,8),
    access_notes text,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    address_name text,
    CONSTRAINT address_type_check CHECK ((address_type = ANY (ARRAY['SERVICE'::text, 'BILLING'::text, 'SHIPPING'::text, 'MAILING'::text]))),
    CONSTRAINT customer_addresses_type_check CHECK ((address_type = ANY (ARRAY['billing'::text, 'service'::text, 'mailing'::text])))
);


--
-- Name: customer_equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    customer_address_id uuid,
    equipment_type text,
    manufacturer text,
    model_number text,
    serial_number text,
    install_date date,
    installed_by uuid,
    warranty_start_date date,
    warranty_end_date date,
    warranty_provider text,
    location_description text,
    status text DEFAULT 'active'::text,
    notes text,
    photos text[],
    documents text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_service_date date,
    CONSTRAINT customer_equipment_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'retired'::text, 'replaced'::text])))
);


--
-- Name: customer_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    overall_rating integer,
    quality_rating integer,
    timeliness_rating integer,
    professionalism_rating integer,
    value_rating integer,
    comments text,
    would_recommend boolean,
    review_posted boolean DEFAULT false,
    review_platform text,
    review_url text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT customer_feedback_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT customer_feedback_professionalism_rating_check CHECK (((professionalism_rating >= 1) AND (professionalism_rating <= 5))),
    CONSTRAINT customer_feedback_quality_rating_check CHECK (((quality_rating >= 1) AND (quality_rating <= 5))),
    CONSTRAINT customer_feedback_review_platform_check CHECK ((review_platform = ANY (ARRAY['google'::text, 'yelp'::text, 'facebook'::text, 'internal'::text, 'other'::text]))),
    CONSTRAINT customer_feedback_timeliness_rating_check CHECK (((timeliness_rating >= 1) AND (timeliness_rating <= 5))),
    CONSTRAINT customer_feedback_value_rating_check CHECK (((value_rating >= 1) AND (value_rating <= 5)))
);


--
-- Name: TABLE customer_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.customer_feedback IS 'Customer satisfaction surveys and reviews';


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_number text NOT NULL,
    type text DEFAULT 'residential'::text,
    first_name text,
    last_name text,
    company_name text,
    email text,
    phone text,
    mobile_phone text,
    preferred_contact text DEFAULT 'phone'::text,
    source text,
    notes text,
    credit_limit numeric(12,2) DEFAULT 0.00,
    payment_terms text DEFAULT 'NET30'::text,
    tax_exempt boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    customer_since date DEFAULT CURRENT_DATE,
    status text DEFAULT 'active'::text,
    billing_address_line_1 text,
    billing_address_line_2 text,
    billing_city text,
    billing_state text,
    billing_zip_code text,
    billing_country text DEFAULT 'United States'::text,
    primary_contact_name text,
    primary_contact_phone text,
    primary_contact_email text,
    preferred_contact_method text DEFAULT 'email'::text,
    preferred_contact_time text,
    communication_preferences jsonb DEFAULT '{"marketing_emails": false, "sms_notifications": false, "email_notifications": true}'::jsonb,
    name text GENERATED ALWAYS AS (COALESCE(company_name,
CASE
    WHEN ((first_name IS NOT NULL) AND (last_name IS NOT NULL)) THEN ((first_name || ' '::text) || last_name)
    WHEN (first_name IS NOT NULL) THEN first_name
    WHEN (last_name IS NOT NULL) THEN last_name
    ELSE 'Unnamed Customer'::text
END)) STORED,
    CONSTRAINT chk_credit_limit CHECK ((credit_limit >= (0)::numeric)),
    CONSTRAINT chk_customer_name CHECK ((((first_name IS NOT NULL) AND (TRIM(BOTH FROM first_name) <> ''::text)) OR ((last_name IS NOT NULL) AND (TRIM(BOTH FROM last_name) <> ''::text)) OR ((company_name IS NOT NULL) AND (TRIM(BOTH FROM company_name) <> ''::text)))),
    CONSTRAINT chk_customer_number CHECK (((customer_number IS NULL) OR (customer_number ~ '^CUST-[0-9]{6}$'::text))),
    CONSTRAINT chk_customers_email_format CHECK (((email IS NULL) OR (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT customers_preferred_contact_check CHECK ((preferred_contact = ANY (ARRAY['phone'::text, 'email'::text, 'text'::text]))),
    CONSTRAINT customers_preferred_contact_method_check CHECK ((preferred_contact_method = ANY (ARRAY['email'::text, 'phone'::text, 'sms'::text, 'portal'::text]))),
    CONSTRAINT customers_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text, 'archived'::text]))),
    CONSTRAINT customers_type_check CHECK ((type = ANY (ARRAY['residential'::text, 'commercial'::text, 'industrial'::text, 'government'::text])))
);


--
-- Name: COLUMN customers.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customers.notes IS 'General notes about the customer';


--
-- Name: COLUMN customers.credit_limit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customers.credit_limit IS 'Customer credit limit for invoicing';


--
-- Name: COLUMN customers.payment_terms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customers.payment_terms IS 'Payment terms in days (e.g., 30 for Net 30)';


--
-- Name: COLUMN customers.customer_since; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customers.customer_since IS 'Date customer was first added to system';


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_number text NOT NULL,
    customer_id uuid,
    customer_address_id uuid,
    service_category_id uuid,
    service_type_id uuid,
    status public.work_order_status_enum DEFAULT 'draft'::public.work_order_status_enum,
    priority public.work_order_priority_enum DEFAULT 'normal'::public.work_order_priority_enum,
    title text NOT NULL,
    description text,
    scheduled_start timestamp with time zone,
    scheduled_end timestamp with time zone,
    actual_start timestamp with time zone,
    actual_end timestamp with time zone,
    assigned_to uuid,
    created_by uuid,
    subtotal numeric(12,2) DEFAULT 0.00,
    tax_amount numeric(12,2) DEFAULT 0.00,
    total_amount numeric(12,2) DEFAULT 0.00,
    notes text,
    internal_notes text,
    requires_signature boolean DEFAULT true,
    customer_signature_url text,
    technician_signature_url text,
    completion_photos text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    customer_feedback text,
    quote_sent_at timestamp with time zone,
    quote_viewed_at timestamp with time zone,
    quote_expires_at timestamp with time zone,
    quote_accepted_at timestamp with time zone,
    quote_rejected_at timestamp with time zone,
    quote_rejection_reason text,
    quote_terms text DEFAULT 'Net 30'::text,
    quote_notes text,
    quote_version integer DEFAULT 1,
    quote_parent_id uuid,
    deposit_amount numeric(12,2) DEFAULT 0.00,
    deposit_percentage numeric(5,2),
    payment_schedule jsonb,
    discount_amount numeric(12,2) DEFAULT 0.00,
    discount_percentage numeric(5,2),
    payment_terms text DEFAULT 'Net 30'::text,
    estimated_duration_hours numeric(10,2),
    requires_site_visit boolean DEFAULT false,
    urgency_level text DEFAULT 'routine'::text,
    service_location_type text DEFAULT 'residential'::text,
    terms_and_conditions text,
    warranty_info text,
    cancellation_policy text,
    special_instructions text,
    preferred_start_date date,
    estimated_completion_date date,
    assigned_technician_id uuid,
    attachment_urls text[],
    photo_urls text[],
    document_urls text[],
    customer_approved_at timestamp with time zone,
    customer_signature_data text,
    customer_ip_address inet,
    approval_method text,
    estimated_duration integer,
    actual_duration integer,
    service_location_lat numeric(10,8),
    service_location_lng numeric(11,8),
    time_window_start time without time zone,
    time_window_end time without time zone,
    customer_equipment_id uuid,
    pricing_model public.pricing_model_enum DEFAULT 'TIME_MATERIALS'::public.pricing_model_enum,
    labor_summary jsonb,
    flat_rate_amount numeric(10,2),
    unit_count integer,
    unit_price numeric(10,2),
    percentage numeric(5,2),
    percentage_base_amount numeric(10,2),
    recurring_interval text,
    service_address_line_1 text,
    service_address_line_2 text,
    service_city text,
    service_state text,
    service_zip_code text,
    tax_rate numeric(5,2) DEFAULT 0.00,
    quote_number text,
    customer_notes text,
    has_change_orders boolean DEFAULT false,
    change_orders_total numeric(10,2) DEFAULT 0,
    invoice_sent_at timestamp with time zone,
    invoice_viewed_at timestamp with time zone,
    paid_at timestamp with time zone,
    closed_at timestamp with time zone,
    service_address_id uuid,
    tax_jurisdiction_ids uuid[],
    tax_exempt boolean DEFAULT false,
    tax_exemption_id uuid,
    CONSTRAINT chk_actual_times CHECK (((actual_end IS NULL) OR (actual_end > actual_start))),
    CONSTRAINT chk_scheduled_times CHECK (((scheduled_end IS NULL) OR (scheduled_end > scheduled_start))),
    CONSTRAINT chk_work_orders_actual_dates CHECK (((actual_end IS NULL) OR (actual_start IS NULL) OR (actual_end >= actual_start))),
    CONSTRAINT chk_work_orders_amounts_positive CHECK (((subtotal >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (total_amount >= (0)::numeric))),
    CONSTRAINT chk_work_orders_scheduled_dates CHECK (((scheduled_end IS NULL) OR (scheduled_start IS NULL) OR (scheduled_end >= scheduled_start))),
    CONSTRAINT chk_work_orders_total_calculation CHECK ((total_amount = (subtotal + tax_amount))),
    CONSTRAINT work_orders_approval_method_check CHECK ((approval_method = ANY (ARRAY['esign'::text, 'email'::text, 'phone'::text, 'in_person'::text]))),
    CONSTRAINT work_orders_service_location_type_check CHECK ((service_location_type = ANY (ARRAY['residential'::text, 'commercial'::text, 'industrial'::text]))),
    CONSTRAINT work_orders_urgency_level_check CHECK ((urgency_level = ANY (ARRAY['routine'::text, 'urgent'::text, 'emergency'::text])))
);


--
-- Name: COLUMN work_orders.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.notes IS 'Internal notes - NOT visible to customer (industry standard like Jobber)';


--
-- Name: COLUMN work_orders.internal_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.internal_notes IS 'DEPRECATED - Use notes instead. Will be removed in future migration.';


--
-- Name: COLUMN work_orders.requires_signature; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.requires_signature IS 'Whether work order requires customer signature';


--
-- Name: COLUMN work_orders.customer_signature_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_signature_url IS 'URL to customer signature image';


--
-- Name: COLUMN work_orders.technician_signature_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.technician_signature_url IS 'URL to technician signature image';


--
-- Name: COLUMN work_orders.completion_photos; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.completion_photos IS 'Array of URLs to completion photos';


--
-- Name: COLUMN work_orders.customer_feedback; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_feedback IS 'Customer feedback text';


--
-- Name: COLUMN work_orders.deposit_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.deposit_amount IS 'Deposit amount required upfront';


--
-- Name: COLUMN work_orders.deposit_percentage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.deposit_percentage IS 'Deposit percentage of total (auto-calculated)';


--
-- Name: COLUMN work_orders.payment_schedule; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.payment_schedule IS 'Payment schedule for large jobs: [{date, amount, description, paid}]';


--
-- Name: COLUMN work_orders.discount_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.discount_amount IS 'Discount amount applied';


--
-- Name: COLUMN work_orders.discount_percentage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.discount_percentage IS 'Discount percentage applied';


--
-- Name: COLUMN work_orders.payment_terms; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.payment_terms IS 'Payment terms: Net 30, Net 60, 50% deposit, etc.';


--
-- Name: COLUMN work_orders.estimated_duration_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.estimated_duration_hours IS 'Estimated time to complete job in hours';


--
-- Name: COLUMN work_orders.requires_site_visit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.requires_site_visit IS 'Whether site visit is required before quote';


--
-- Name: COLUMN work_orders.urgency_level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.urgency_level IS 'Urgency: routine, urgent (48hrs), emergency (same day)';


--
-- Name: COLUMN work_orders.service_location_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.service_location_type IS 'Type of service location';


--
-- Name: COLUMN work_orders.terms_and_conditions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.terms_and_conditions IS 'Terms and conditions for this quote/job';


--
-- Name: COLUMN work_orders.warranty_info; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.warranty_info IS 'Warranty information for customer';


--
-- Name: COLUMN work_orders.cancellation_policy; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.cancellation_policy IS 'Cancellation policy for this job';


--
-- Name: COLUMN work_orders.special_instructions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.special_instructions IS 'Special instructions from customer';


--
-- Name: COLUMN work_orders.preferred_start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.preferred_start_date IS 'Customer preferred start date';


--
-- Name: COLUMN work_orders.estimated_completion_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.estimated_completion_date IS 'Estimated completion date';


--
-- Name: COLUMN work_orders.assigned_technician_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.assigned_technician_id IS 'Assigned technician/crew lead';


--
-- Name: COLUMN work_orders.attachment_urls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.attachment_urls IS 'Array of attachment URLs';


--
-- Name: COLUMN work_orders.photo_urls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.photo_urls IS 'Array of photo URLs (before/after, site photos)';


--
-- Name: COLUMN work_orders.document_urls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.document_urls IS 'Array of document URLs (permits, specs, diagrams)';


--
-- Name: COLUMN work_orders.customer_approved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_approved_at IS 'When customer approved/signed quote';


--
-- Name: COLUMN work_orders.customer_signature_data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_signature_data IS 'Customer signature (base64 image)';


--
-- Name: COLUMN work_orders.customer_ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_ip_address IS 'Customer IP address when approved';


--
-- Name: COLUMN work_orders.approval_method; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.approval_method IS 'How customer approved: esign, email, phone, in_person';


--
-- Name: COLUMN work_orders.customer_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.customer_notes IS 'Notes visible to customer on quote/invoice PDF (industry standard like Jobber)';


--
-- Name: COLUMN work_orders.service_address_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.service_address_id IS 'Link to cached service address tax rate';


--
-- Name: COLUMN work_orders.tax_jurisdiction_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.tax_jurisdiction_ids IS 'Array of tax jurisdiction IDs that apply to this work order';


--
-- Name: COLUMN work_orders.tax_exempt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.tax_exempt IS 'Whether this work order is tax exempt';


--
-- Name: COLUMN work_orders.tax_exemption_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.tax_exemption_id IS 'Link to tax exemption certificate if applicable';


--
-- Name: customer_financial_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.customer_financial_summary AS
 SELECT c.id AS customer_id,
    COALESCE(sum(
        CASE
            WHEN (wo.status = ANY (ARRAY['completed'::public.work_order_status_enum, 'invoiced'::public.work_order_status_enum])) THEN wo.total_amount
            ELSE (0)::numeric
        END), (0)::numeric) AS lifetime_revenue,
    COALESCE(sum(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN wo.total_amount
            ELSE (0)::numeric
        END), (0)::numeric) AS total_paid,
    COALESCE(sum(
        CASE
            WHEN (wo.status = 'invoiced'::public.work_order_status_enum) THEN wo.total_amount
            ELSE (0)::numeric
        END), (0)::numeric) AS outstanding_balance,
    count(
        CASE
            WHEN (wo.status = ANY (ARRAY['completed'::public.work_order_status_enum, 'invoiced'::public.work_order_status_enum])) THEN 1
            ELSE NULL::integer
        END) AS total_jobs,
    max(wo.updated_at) AS last_service_date,
    COALESCE(avg(
        CASE
            WHEN (wo.status = ANY (ARRAY['completed'::public.work_order_status_enum, 'invoiced'::public.work_order_status_enum])) THEN wo.total_amount
            ELSE NULL::numeric
        END), (0)::numeric) AS average_job_value
   FROM (public.customers c
     LEFT JOIN public.work_orders wo ON ((wo.customer_id = c.id)))
  GROUP BY c.id;


--
-- Name: customer_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_tag_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_tag_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    tag_id uuid,
    assigned_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6b7280'::text,
    priority integer DEFAULT 50,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    customer_id uuid NOT NULL,
    invoice_number text NOT NULL,
    status public.invoice_status_enum DEFAULT 'draft'::public.invoice_status_enum,
    issue_date date DEFAULT CURRENT_DATE,
    due_date date,
    subtotal numeric(12,2) DEFAULT 0.00,
    tax_amount numeric(12,2) DEFAULT 0.00,
    total_amount numeric(12,2) DEFAULT 0.00,
    amount_paid numeric(12,2) DEFAULT 0.00,
    balance_due numeric(12,2) GENERATED ALWAYS AS ((total_amount - amount_paid)) STORED,
    terms text DEFAULT 'NET30'::text,
    notes text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    discount_percentage numeric(5,2) DEFAULT 0,
    late_fee_amount numeric(10,2) DEFAULT 0,
    pdf_url text,
    customer_name_snapshot text,
    customer_address_snapshot text,
    customer_tax_id_snapshot text,
    company_name_snapshot text,
    company_address_snapshot text,
    company_tax_id_snapshot text,
    CONSTRAINT chk_due_date_after_issue CHECK ((due_date >= issue_date)),
    CONSTRAINT chk_invoices_balance_calculation CHECK ((balance_due = (total_amount - amount_paid))),
    CONSTRAINT chk_invoices_due_date_after_issue CHECK (((due_date IS NULL) OR (due_date >= issue_date))),
    CONSTRAINT chk_invoices_total_calculation CHECK ((total_amount = (subtotal + COALESCE(tax_amount, (0)::numeric))))
);


--
-- Name: COLUMN invoices.discount_percentage; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.discount_percentage IS 'Percentage discount applied';


--
-- Name: COLUMN invoices.late_fee_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.late_fee_amount IS 'Late fee amount if overdue';


--
-- Name: COLUMN invoices.pdf_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.pdf_url IS 'URL to generated PDF invoice';


--
-- Name: customers_financial_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.customers_financial_summary AS
 SELECT c.id,
    c.customer_number,
    c.type,
        CASE
            WHEN (c.company_name IS NOT NULL) THEN c.company_name
            ELSE ((c.first_name || ' '::text) || c.last_name)
        END AS display_name,
    c.email,
    c.phone,
    c.credit_limit,
    c.payment_terms,
    c.created_at,
    ((((ca.address_line_1 || ', '::text) || ca.city) || ', '::text) || ca.state) AS primary_address,
    count(wo.id) AS total_work_orders,
    count(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END) AS completed_work_orders,
    count(
        CASE
            WHEN (wo.status = ANY (ARRAY['scheduled'::public.work_order_status_enum, 'in_progress'::public.work_order_status_enum])) THEN 1
            ELSE NULL::integer
        END) AS active_work_orders,
    COALESCE(sum(wo.total_amount), (0)::numeric) AS total_work_value,
    COALESCE(sum(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN wo.total_amount
            ELSE NULL::numeric
        END), (0)::numeric) AS completed_work_value,
    count(i.id) AS total_invoices,
    COALESCE(sum(i.total_amount), (0)::numeric) AS total_invoiced,
    COALESCE(sum(i.amount_paid), (0)::numeric) AS total_paid,
    COALESCE(sum((i.total_amount - i.amount_paid)), (0)::numeric) AS outstanding_balance,
    max(wo.created_at) AS last_service_date,
    min(wo.created_at) AS first_service_date,
        CASE
            WHEN (count(wo.id) = 0) THEN 'new'::text
            WHEN (count(wo.id) = 1) THEN 'first_time'::text
            WHEN ((count(wo.id) >= 2) AND (count(wo.id) <= 5)) THEN 'regular'::text
            WHEN (count(wo.id) > 5) THEN 'frequent'::text
            ELSE NULL::text
        END AS customer_tier,
        CASE
            WHEN (COALESCE(sum((i.total_amount - i.amount_paid)), (0)::numeric) > c.credit_limit) THEN 'over_limit'::text
            WHEN (EXISTS ( SELECT 1
               FROM public.invoices i2
              WHERE ((i2.customer_id = c.id) AND (i2.status = 'overdue'::public.invoice_status_enum)))) THEN 'overdue'::text
            ELSE 'good_standing'::text
        END AS payment_status
   FROM (((public.customers c
     LEFT JOIN public.customer_addresses ca ON (((c.id = ca.customer_id) AND (ca.is_primary = true))))
     LEFT JOIN public.work_orders wo ON ((c.id = wo.customer_id)))
     LEFT JOIN public.invoices i ON ((c.id = i.customer_id)))
  GROUP BY c.id, c.customer_number, c.type, c.company_name, c.first_name, c.last_name, c.email, c.phone, c.credit_limit, c.payment_terms, c.created_at, ca.address_line_1, ca.city, ca.state;


--
-- Name: customers_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.customers_summary AS
SELECT
    NULL::uuid AS id,
    NULL::text AS customer_number,
    NULL::text AS type,
    NULL::text AS display_name,
    NULL::text AS email,
    NULL::text AS phone,
    NULL::text AS primary_address,
    NULL::bigint AS total_work_orders,
    NULL::numeric AS total_revenue,
    NULL::timestamp with time zone AS last_service_date,
    NULL::timestamp with time zone AS created_at,
    NULL::boolean AS is_active;


--
-- Name: customers_with_tags; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.customers_with_tags AS
 SELECT c.id,
    c.company_id,
    c.customer_number,
    c.type,
    c.first_name,
    c.last_name,
    c.company_name,
    COALESCE(c.company_name, TRIM(BOTH FROM concat(c.first_name, ' ', c.last_name)), 'Unnamed Customer'::text) AS display_name,
    c.email,
    c.phone,
    c.mobile_phone,
    c.preferred_contact,
    c.source,
    c.notes,
    c.credit_limit,
    c.payment_terms,
    c.tax_exempt,
    c.is_active,
    c.customer_since,
    c.created_at,
    c.updated_at,
    COALESCE(json_agg(json_build_object('id', ct.id, 'name', ct.name, 'color', ct.color, 'description', ct.description)) FILTER (WHERE (ct.id IS NOT NULL)), '[]'::json) AS customer_tags,
    count(ct.id) FILTER (WHERE (ct.id IS NOT NULL)) AS tag_count,
    array_agg(ct.name ORDER BY ct.name) FILTER (WHERE (ct.name IS NOT NULL)) AS tag_names
   FROM ((public.customers c
     LEFT JOIN public.customer_tag_assignments cta ON ((c.id = cta.customer_id)))
     LEFT JOIN public.customer_tags ct ON ((cta.tag_id = ct.id)))
  GROUP BY c.id, c.company_id, c.customer_number, c.type, c.first_name, c.last_name, c.company_name, c.email, c.phone, c.mobile_phone, c.preferred_contact, c.source, c.notes, c.credit_limit, c.payment_terms, c.tax_exempt, c.is_active, c.customer_since, c.created_at, c.updated_at;


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    header_text text,
    footer_text text,
    terms text,
    logo_url text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_templates_type_check CHECK ((type = ANY (ARRAY['QUOTE'::text, 'INVOICE'::text, 'WORK_ORDER'::text, 'ESTIMATE'::text])))
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    customer_id uuid,
    document_type text NOT NULL,
    title text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT documents_document_type_check CHECK ((document_type = ANY (ARRAY['quote'::text, 'invoice'::text, 'receipt'::text, 'contract'::text, 'permit'::text, 'warranty'::text, 'photo'::text, 'other'::text])))
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    employee_number text NOT NULL,
    hire_date date DEFAULT CURRENT_DATE,
    termination_date date,
    job_title text,
    department text,
    hourly_rate numeric(8,2) DEFAULT 0.00,
    overtime_rate numeric(8,2),
    emergency_contact_name text,
    emergency_contact_phone text,
    certifications text[],
    skills text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    employee_type text,
    pay_type text,
    CONSTRAINT chk_termination_after_hire CHECK (((termination_date IS NULL) OR (termination_date >= hire_date))),
    CONSTRAINT employees_employee_type_check CHECK ((employee_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contractor'::text, 'seasonal'::text]))),
    CONSTRAINT employees_pay_type_check CHECK ((pay_type = ANY (ARRAY['hourly'::text, 'salary'::text, 'commission'::text, 'per_job'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar_url text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status public.employee_status_enum DEFAULT 'active'::public.employee_status_enum,
    emergency_contact_phone text,
    hire_date date,
    company_id uuid,
    email text,
    role public.user_role_enum DEFAULT 'technician'::public.user_role_enum,
    date_of_birth date,
    bio text,
    address_line_1 text,
    address_line_2 text,
    city text,
    state_province text,
    postal_code text,
    country text DEFAULT 'US'::text,
    emergency_contact_name text,
    emergency_contact_relationship text,
    timezone text DEFAULT 'America/Los_Angeles'::text,
    language text DEFAULT 'en'::text,
    date_format text DEFAULT 'MM/DD/YYYY'::text,
    time_format text DEFAULT '12h'::text,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret text,
    notification_preferences jsonb DEFAULT '{"sms": false, "push": true, "email": true, "job_updates": true, "pto_updates": true, "schedule_changes": true, "timesheet_reminders": true}'::jsonb,
    name text GENERATED ALWAYS AS (
CASE
    WHEN ((first_name IS NOT NULL) AND (last_name IS NOT NULL)) THEN ((first_name || ' '::text) || last_name)
    WHEN (first_name IS NOT NULL) THEN first_name
    WHEN (last_name IS NOT NULL) THEN last_name
    ELSE 'Unknown'::text
END) STORED,
    CONSTRAINT chk_profiles_name_not_empty CHECK (((length(TRIM(BOTH FROM first_name)) > 0) AND (length(TRIM(BOTH FROM last_name)) > 0))),
    CONSTRAINT chk_profiles_phone_format CHECK (((phone IS NULL) OR (phone ~ '^[\+]?[1-9][\d]{0,15}$'::text))),
    CONSTRAINT profiles_avatar_url_check CHECK ((avatar_url ~ '^https?://'::text)),
    CONSTRAINT profiles_phone_check CHECK ((phone ~ '^\+[1-9]\d{1,14}$'::text))
);


--
-- Name: COLUMN profiles.emergency_contact_phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Emergency contact phone number';


--
-- Name: COLUMN profiles.hire_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.hire_date IS 'Employee hire date';


--
-- Name: COLUMN profiles.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.name IS 'Computed full name (first_name + last_name) - Industry standard for display';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid,
    company_id uuid,
    role public.user_role_enum DEFAULT 'technician'::public.user_role_enum NOT NULL,
    status public.employee_status_enum DEFAULT 'active'::public.employee_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    login_count integer DEFAULT 0
);


--
-- Name: COLUMN users.login_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.login_count IS 'Total number of successful logins';


--
-- Name: employee_performance; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.employee_performance AS
 SELECT e.id,
    e.employee_number,
    ((p.first_name || ' '::text) || p.last_name) AS employee_name,
    e.job_title,
    e.department,
    count(wo.id) AS total_work_orders,
    avg((EXTRACT(epoch FROM (wo.actual_end - wo.actual_start)) / (3600)::numeric)) AS avg_job_hours,
    COALESCE(sum(wo.total_amount), (0)::numeric) AS total_revenue,
    count(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END) AS completed_jobs,
    round((((count(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END))::numeric / (NULLIF(count(wo.id), 0))::numeric) * (100)::numeric), 2) AS completion_rate,
    e.hire_date,
    u.status
   FROM (((public.employees e
     LEFT JOIN public.users u ON ((e.user_id = u.id)))
     LEFT JOIN public.profiles p ON ((u.id = p.user_id)))
     LEFT JOIN public.work_orders wo ON ((u.id = wo.assigned_to)))
  GROUP BY e.id, e.employee_number, p.first_name, p.last_name, e.job_title, e.department, e.hire_date, u.status;


--
-- Name: employee_performance_metrics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.employee_performance_metrics AS
 SELECT e.id,
    e.employee_number,
    ((p.first_name || ' '::text) || p.last_name) AS employee_name,
    e.job_title,
    e.department,
    u.role,
    u.status,
    e.hire_date,
    count(wo.id) AS total_work_orders,
    count(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END) AS completed_work_orders,
    count(
        CASE
            WHEN (wo.status = 'cancelled'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END) AS cancelled_work_orders,
    round((((count(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN 1
            ELSE NULL::integer
        END))::numeric / (NULLIF(count(wo.id), 0))::numeric) * (100)::numeric), 2) AS completion_rate,
    COALESCE(sum(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN wo.total_amount
            ELSE NULL::numeric
        END), (0)::numeric) AS total_revenue,
    COALESCE(avg(
        CASE
            WHEN (wo.status = 'completed'::public.work_order_status_enum) THEN wo.total_amount
            ELSE NULL::numeric
        END), (0)::numeric) AS avg_job_value,
    avg(
        CASE
            WHEN ((wo.actual_end IS NOT NULL) AND (wo.actual_start IS NOT NULL)) THEN (EXTRACT(epoch FROM (wo.actual_end - wo.actual_start)) / (3600)::numeric)
            ELSE NULL::numeric
        END) AS avg_job_duration_hours,
    count(
        CASE
            WHEN (wo.actual_start > wo.scheduled_start) THEN 1
            ELSE NULL::integer
        END) AS late_starts,
    count(
        CASE
            WHEN (wo.actual_end > wo.scheduled_end) THEN 1
            ELSE NULL::integer
        END) AS overruns,
    max(wo.created_at) AS last_job_date,
    count(
        CASE
            WHEN (wo.created_at >= (CURRENT_DATE - '30 days'::interval)) THEN 1
            ELSE NULL::integer
        END) AS jobs_last_30_days
   FROM (((public.employees e
     LEFT JOIN public.users u ON ((e.user_id = u.id)))
     LEFT JOIN public.profiles p ON ((u.id = p.user_id)))
     LEFT JOIN public.work_orders wo ON ((u.id = wo.assigned_to)))
  GROUP BY e.id, e.employee_number, p.first_name, p.last_name, e.job_title, e.department, u.role, u.status, e.hire_date;


--
-- Name: employee_timesheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_timesheets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    work_order_id uuid,
    date date NOT NULL,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    break_duration integer DEFAULT 0,
    regular_hours numeric(5,2) DEFAULT 0.00,
    overtime_hours numeric(5,2) DEFAULT 0.00,
    status public.timesheet_status_enum DEFAULT 'draft'::public.timesheet_status_enum,
    notes text,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_clock_times CHECK (((clock_out IS NULL) OR (clock_out > clock_in))),
    CONSTRAINT chk_timesheet_hours CHECK (((regular_hours >= (0)::numeric) AND (overtime_hours >= (0)::numeric)))
);


--
-- Name: employees_with_profiles; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.employees_with_profiles AS
 SELECT e.id AS employee_id,
    e.company_id,
    e.user_id,
    e.employee_number,
    e.hire_date,
    e.termination_date,
    e.job_title,
    e.department,
    e.hourly_rate,
    e.overtime_rate,
    e.employee_type,
    e.pay_type,
    e.certifications,
    e.skills,
    e.notes,
    e.created_at,
    e.updated_at,
    p.first_name,
    p.last_name,
    p.name,
    p.phone,
    p.email,
    p.avatar_url,
    p.status,
    p.role,
    u.auth_user_id,
    c.name AS company_name
   FROM (((public.employees e
     LEFT JOIN public.users u ON ((e.user_id = u.id)))
     LEFT JOIN public.profiles p ON ((u.id = p.user_id)))
     LEFT JOIN public.companies c ON ((e.company_id = c.id)));


--
-- Name: VIEW employees_with_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.employees_with_profiles IS 'Industry standard view combining employees + profiles + users + companies';


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    employee_id uuid,
    expense_type public.expense_type_enum NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date date DEFAULT CURRENT_DATE,
    receipt_url text,
    is_billable boolean DEFAULT false,
    is_reimbursable boolean DEFAULT true,
    status text DEFAULT 'pending'::text,
    approved_by uuid,
    approved_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT expenses_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'reimbursed'::text])))
);


--
-- Name: global_reference_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.global_reference_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    unit_of_measure text DEFAULT 'each'::text,
    cost_price numeric(10,2) DEFAULT 0.00,
    sell_price numeric(10,2) DEFAULT 0.00,
    reorder_point integer DEFAULT 0,
    reorder_quantity integer DEFAULT 0,
    barcode text,
    manufacturer text,
    model_number text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    description text,
    address_line1 text,
    address_line2 text,
    city text,
    state_province text,
    postal_code text,
    is_mobile boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    item_id uuid,
    location_id uuid,
    work_order_id uuid,
    movement_type public.inventory_movement_type_enum NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) DEFAULT 0.00,
    reference_number text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid,
    location_id uuid,
    quantity_on_hand integer DEFAULT 0,
    quantity_allocated integer DEFAULT 0,
    quantity_available integer GENERATED ALWAYS AS ((quantity_on_hand - quantity_allocated)) STORED,
    last_counted_at timestamp with time zone,
    last_counted_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_status_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_status_summary AS
 SELECT ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.unit_of_measure,
    ii.cost_price,
    ii.sell_price,
    ii.reorder_point,
    ii.reorder_quantity,
    COALESCE(sum(ist.quantity_on_hand), (0)::bigint) AS total_on_hand,
    COALESCE(sum(ist.quantity_allocated), (0)::bigint) AS total_allocated,
    COALESCE(sum(ist.quantity_available), (0)::bigint) AS total_available,
        CASE
            WHEN (COALESCE(sum(ist.quantity_available), (0)::bigint) = 0) THEN 'out_of_stock'::text
            WHEN (COALESCE(sum(ist.quantity_available), (0)::bigint) <= ii.reorder_point) THEN 'low_stock'::text
            ELSE 'in_stock'::text
        END AS stock_status,
    ((COALESCE(sum(ist.quantity_on_hand), (0)::bigint))::numeric * ii.cost_price) AS total_cost_value,
    ((COALESCE(sum(ist.quantity_on_hand), (0)::bigint))::numeric * ii.sell_price) AS total_sell_value,
    count(DISTINCT ist.location_id) AS locations_count,
    ii.is_active,
    ii.created_at,
    ii.updated_at
   FROM (public.inventory_items ii
     LEFT JOIN public.inventory_stock ist ON ((ii.id = ist.item_id)))
  GROUP BY ii.id, ii.sku, ii.name, ii.category, ii.unit_of_measure, ii.cost_price, ii.sell_price, ii.reorder_point, ii.reorder_quantity, ii.is_active, ii.created_at, ii.updated_at;


--
-- Name: inventory_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_summary AS
 SELECT ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.cost_price,
    ii.sell_price,
    ii.reorder_point,
    sum(ist.quantity_on_hand) AS total_on_hand,
    sum(ist.quantity_allocated) AS total_allocated,
    sum(ist.quantity_available) AS total_available,
        CASE
            WHEN (sum(ist.quantity_available) <= ii.reorder_point) THEN 'reorder'::text
            WHEN (sum(ist.quantity_available) = 0) THEN 'out_of_stock'::text
            ELSE 'in_stock'::text
        END AS stock_status,
    ii.is_active
   FROM (public.inventory_items ii
     LEFT JOIN public.inventory_stock ist ON ((ii.id = ist.item_id)))
  GROUP BY ii.id, ii.sku, ii.name, ii.category, ii.cost_price, ii.sell_price, ii.reorder_point, ii.is_active;


--
-- Name: invoice_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    delivery_method text NOT NULL,
    recipient_email text,
    recipient_phone text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone,
    viewed_at timestamp with time zone,
    opened_at timestamp with time zone,
    pdf_url text,
    portal_link text,
    payment_link text,
    delivery_status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    sent_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoice_deliveries_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['email'::text, 'sms'::text, 'portal'::text, 'download'::text]))),
    CONSTRAINT invoice_deliveries_delivery_status_check CHECK ((delivery_status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'viewed'::text, 'failed'::text])))
);


--
-- Name: TABLE invoice_deliveries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invoice_deliveries IS 'Tracks invoice delivery via email, SMS, portal, or download with view tracking';


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    description text NOT NULL,
    quantity numeric(10,3) DEFAULT 1.000,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    tax_rate numeric(5,4) DEFAULT 0.0000,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    item_type text,
    line_number integer,
    CONSTRAINT invoice_line_items_item_type_check CHECK ((item_type = ANY (ARRAY['product'::text, 'service'::text, 'labor'::text, 'tax'::text, 'discount'::text, 'fee'::text])))
);


--
-- Name: invoices_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.invoices_summary AS
 SELECT i.id,
    i.invoice_number,
    i.status,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    ((c.first_name || ' '::text) || c.last_name) AS customer_name,
    c.company_name,
    wo.work_order_number,
        CASE
            WHEN ((i.due_date < CURRENT_DATE) AND (i.balance_due > (0)::numeric)) THEN 'overdue'::text
            WHEN (i.balance_due = (0)::numeric) THEN 'paid'::text
            ELSE 'current'::text
        END AS payment_status,
    i.created_at
   FROM ((public.invoices i
     LEFT JOIN public.customers c ON ((i.customer_id = c.id)))
     LEFT JOIN public.work_orders wo ON ((i.work_order_id = wo.id)));


--
-- Name: job_completion_checklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_completion_checklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    item_text text NOT NULL,
    is_required boolean DEFAULT true,
    is_completed boolean DEFAULT false,
    completed_by uuid,
    completed_at timestamp with time zone,
    notes text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE job_completion_checklist; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.job_completion_checklist IS 'Required completion steps for jobs - ensures nothing is forgotten';


--
-- Name: marketplace_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    response_id uuid,
    sender_company_id uuid,
    sender_user_id uuid,
    message text NOT NULL,
    attachments text[],
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: marketplace_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    title text NOT NULL,
    description text,
    service_category_id uuid,
    service_type_id uuid,
    service_address text,
    service_city text,
    service_state text,
    service_zip text,
    service_location_lat numeric(10,8),
    service_location_lng numeric(11,8),
    preferred_date date,
    preferred_time_start time without time zone,
    preferred_time_end time without time zone,
    is_flexible boolean DEFAULT true,
    is_emergency boolean DEFAULT false,
    budget_min numeric(10,2),
    budget_max numeric(10,2),
    status text DEFAULT 'OPEN'::text,
    photos text[],
    attachments text[],
    response_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    closed_at timestamp with time zone,
    CONSTRAINT marketplace_requests_status_check CHECK ((status = ANY (ARRAY['OPEN'::text, 'REVIEWING_BIDS'::text, 'CONTRACTOR_SELECTED'::text, 'JOB_SCHEDULED'::text, 'COMPLETED'::text, 'CANCELLED'::text])))
);


--
-- Name: marketplace_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    contractor_company_id uuid,
    message text,
    estimated_cost numeric(10,2),
    estimated_duration integer,
    available_date date,
    available_time_start time without time zone,
    available_time_end time without time zone,
    status text DEFAULT 'PENDING'::text,
    response_time_minutes integer,
    photos text[],
    attachments text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    viewed_at timestamp with time zone,
    accepted_at timestamp with time zone,
    rejected_at timestamp with time zone,
    CONSTRAINT marketplace_responses_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'VIEWED'::text, 'ACCEPTED'::text, 'REJECTED'::text, 'WITHDRAWN'::text])))
);


--
-- Name: marketplace_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    emergency_rate_multiplier numeric(5,2) DEFAULT 1.0,
    transparency_mode boolean DEFAULT false,
    auto_accept_jobs boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    customer_id uuid,
    sender_id uuid,
    recipient_type text NOT NULL,
    recipient_id uuid,
    subject text,
    content text NOT NULL,
    message_type text DEFAULT 'email'::text,
    status text DEFAULT 'draft'::text,
    sent_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    delivered_at timestamp with time zone,
    CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['email'::text, 'sms'::text, 'in_app'::text, 'system'::text]))),
    CONSTRAINT messages_recipient_type_check CHECK ((recipient_type = ANY (ARRAY['customer'::text, 'employee'::text, 'vendor'::text]))),
    CONSTRAINT messages_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])))
);


--
-- Name: COLUMN messages.read_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.messages.read_at IS 'Timestamp when message was read';


--
-- Name: COLUMN messages.delivered_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.messages.delivered_at IS 'Timestamp when message was delivered';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    type public.notification_type_enum DEFAULT 'in_app'::public.notification_type_enum,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    status public.notification_status_enum DEFAULT 'pending'::public.notification_status_enum,
    scheduled_for timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    action_url text,
    CONSTRAINT chk_notifications_message_not_empty CHECK ((length(TRIM(BOTH FROM message)) > 0)),
    CONSTRAINT chk_notifications_read_after_sent CHECK (((read_at IS NULL) OR (sent_at IS NULL) OR (read_at >= sent_at)))
);


--
-- Name: COLUMN notifications.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.expires_at IS 'When notification expires and should be removed';


--
-- Name: COLUMN notifications.action_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.action_url IS 'URL for notification action button';


--
-- Name: onboarding_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    current_step integer DEFAULT 1,
    steps jsonb DEFAULT '{}'::jsonb,
    skipped boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);


--
-- Name: payment_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    payment_id uuid NOT NULL,
    delivery_method text NOT NULL,
    recipient_email text,
    recipient_phone text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone,
    receipt_pdf_url text,
    delivery_status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payment_deliveries_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['email'::text, 'sms'::text, 'portal'::text]))),
    CONSTRAINT payment_deliveries_delivery_status_check CHECK ((delivery_status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'failed'::text])))
);


--
-- Name: TABLE payment_deliveries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_deliveries IS 'Tracks payment receipt delivery to customers';


--
-- Name: payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    default_payment_method text DEFAULT 'CARD'::text,
    invoice_template_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payment_settings_default_payment_method_check CHECK ((default_payment_method = ANY (ARRAY['CARD'::text, 'ACH'::text, 'CASH'::text, 'CHECK'::text])))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    invoice_id uuid,
    customer_id uuid NOT NULL,
    payment_method text DEFAULT 'cash'::text,
    amount numeric(12,2) NOT NULL,
    status public.payment_status_enum DEFAULT 'pending'::public.payment_status_enum,
    reference_number text,
    transaction_id text,
    payment_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    received_at timestamp with time zone DEFAULT now(),
    gateway_response jsonb,
    refund_amount numeric(10,2) DEFAULT 0,
    refund_date date,
    CONSTRAINT chk_payments_payment_method_not_empty CHECK ((length(TRIM(BOTH FROM payment_method)) > 0)),
    CONSTRAINT payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT payments_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'check'::text, 'credit_card'::text, 'debit_card'::text, 'bank_transfer'::text, 'online'::text, 'other'::text])))
);


--
-- Name: COLUMN payments.gateway_response; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.gateway_response IS 'JSON response from payment gateway';


--
-- Name: COLUMN payments.refund_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.refund_amount IS 'Amount refunded if applicable';


--
-- Name: COLUMN payments.refund_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.payments.refund_date IS 'Date refund was processed';


--
-- Name: payroll_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_run_id uuid,
    employee_id uuid,
    regular_hours numeric(5,2) DEFAULT 0.00,
    overtime_hours numeric(5,2) DEFAULT 0.00,
    regular_pay numeric(10,2) DEFAULT 0.00,
    overtime_pay numeric(10,2) DEFAULT 0.00,
    gross_pay numeric(10,2) DEFAULT 0.00,
    deductions numeric(10,2) DEFAULT 0.00,
    net_pay numeric(10,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    pay_period_start date NOT NULL,
    pay_period_end date NOT NULL,
    pay_date date NOT NULL,
    status public.payroll_run_status_enum DEFAULT 'draft'::public.payroll_run_status_enum,
    total_gross numeric(12,2) DEFAULT 0.00,
    total_deductions numeric(12,2) DEFAULT 0.00,
    total_net numeric(12,2) DEFAULT 0.00,
    processed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_payroll_period CHECK ((pay_period_end >= pay_period_start)),
    CONSTRAINT chk_payroll_totals CHECK ((total_net <= total_gross))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    level integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_level_check CHECK (((level >= 0) AND (level <= 100)))
);


--
-- Name: purchase_order_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid,
    inventory_item_id uuid,
    description text NOT NULL,
    quantity numeric(10,3) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    quantity_received numeric(10,3) DEFAULT 0,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    vendor_id uuid NOT NULL,
    work_order_id uuid,
    po_number text NOT NULL,
    status text DEFAULT 'draft'::text,
    order_date date DEFAULT CURRENT_DATE,
    expected_date date,
    subtotal numeric(12,2) DEFAULT 0.00,
    tax_amount numeric(12,2) DEFAULT 0.00,
    shipping_amount numeric(12,2) DEFAULT 0.00,
    total_amount numeric(12,2) DEFAULT 0.00,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT purchase_orders_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'acknowledged'::text, 'partially_received'::text, 'received'::text, 'cancelled'::text])))
);


--
-- Name: quote_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    company_id uuid,
    quote_created_at timestamp with time zone NOT NULL,
    quote_sent_at timestamp with time zone,
    quote_viewed_at timestamp with time zone,
    quote_accepted_at timestamp with time zone,
    quote_rejected_at timestamp with time zone,
    time_to_send_hours numeric,
    time_to_view_hours numeric,
    time_to_decision_hours numeric,
    conversion_rate numeric,
    quote_value numeric(12,2),
    quote_version integer DEFAULT 1,
    revision_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    follow_up_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_approval_workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_approval_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    workflow_name character varying(100) NOT NULL,
    approval_threshold numeric(12,2),
    current_step integer DEFAULT 1,
    total_steps integer NOT NULL,
    overall_status character varying(50) DEFAULT 'pending'::character varying,
    approver_user_id uuid,
    approver_role character varying(50),
    submitted_at timestamp with time zone DEFAULT now(),
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    approval_notes text,
    rejection_reason text,
    escalated boolean DEFAULT false,
    escalated_at timestamp with time zone,
    escalated_to uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_approval_workflows_overall_status_check CHECK (((overall_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: quote_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    company_id uuid,
    approver_id uuid,
    approver_role text,
    status text DEFAULT 'PENDING'::text,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    decision_notes text,
    auto_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_approvals_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'SKIPPED'::text])))
);


--
-- Name: quote_defaults; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_defaults (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    default_tax_rate numeric(5,2) DEFAULT 0.00,
    default_payment_terms text DEFAULT 'Net 30'::text,
    default_deposit_percentage numeric(5,2),
    require_deposit boolean DEFAULT false,
    default_terms_and_conditions text,
    default_warranty_info text,
    default_cancellation_policy text,
    default_quote_expiration_days integer DEFAULT 30,
    auto_send_follow_ups boolean DEFAULT true,
    follow_up_days integer[] DEFAULT ARRAY[3, 7, 14],
    require_manager_approval boolean DEFAULT false,
    approval_threshold_amount numeric(12,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE quote_defaults; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.quote_defaults IS 'Company-wide default settings for quotes';


--
-- Name: quote_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    delivery_method text NOT NULL,
    recipient_email text,
    recipient_phone text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone,
    viewed_at timestamp with time zone,
    opened_at timestamp with time zone,
    pdf_url text,
    portal_link text,
    email_subject text,
    email_body text,
    sms_body text,
    delivery_status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    sent_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT quote_deliveries_delivery_method_check CHECK ((delivery_method = ANY (ARRAY['email'::text, 'sms'::text, 'portal'::text, 'download'::text]))),
    CONSTRAINT quote_deliveries_delivery_status_check CHECK ((delivery_status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'viewed'::text, 'failed'::text])))
);


--
-- Name: TABLE quote_deliveries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.quote_deliveries IS 'Tracks quote delivery via email, SMS, portal, or download with view tracking';


--
-- Name: COLUMN quote_deliveries.delivery_method; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quote_deliveries.delivery_method IS 'How quote was delivered: email, sms, portal, download';


--
-- Name: COLUMN quote_deliveries.viewed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quote_deliveries.viewed_at IS 'When customer opened/viewed the quote';


--
-- Name: quote_follow_ups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_follow_ups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    company_id uuid,
    follow_up_type text,
    scheduled_date timestamp with time zone NOT NULL,
    completed_date timestamp with time zone,
    status text DEFAULT 'SCHEDULED'::text,
    outcome text,
    subject text,
    message text,
    notes text,
    assigned_to uuid,
    is_automated boolean DEFAULT false,
    attempt_number integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_follow_ups_follow_up_type_check CHECK ((follow_up_type = ANY (ARRAY['email'::text, 'sms'::text, 'call'::text, 'task'::text]))),
    CONSTRAINT quote_follow_ups_outcome_check CHECK ((outcome = ANY (ARRAY['NO_RESPONSE'::text, 'INTERESTED'::text, 'NOT_INTERESTED'::text, 'NEEDS_REVISION'::text, 'ACCEPTED'::text, 'REJECTED'::text]))),
    CONSTRAINT quote_follow_ups_status_check CHECK ((status = ANY (ARRAY['SCHEDULED'::text, 'COMPLETED'::text, 'CANCELLED'::text, 'FAILED'::text])))
);


--
-- Name: quote_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    response_type text NOT NULL,
    rejection_reason text,
    rejection_category text,
    change_request_notes text,
    signature_id uuid,
    signature_data text,
    responded_by_name text,
    responded_by_email text,
    responded_by_phone text,
    responded_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT quote_responses_rejection_category_check CHECK ((rejection_category = ANY (ARRAY['price_too_high'::text, 'timeline_too_long'::text, 'went_with_competitor'::text, 'scope_changed'::text, 'other'::text]))),
    CONSTRAINT quote_responses_response_type_check CHECK ((response_type = ANY (ARRAY['accepted'::text, 'rejected'::text, 'changes_requested'::text])))
);


--
-- Name: TABLE quote_responses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.quote_responses IS 'Tracks customer acceptance, rejection, or change requests for quotes';


--
-- Name: COLUMN quote_responses.rejection_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quote_responses.rejection_category IS 'Categorized reason for rejection for analytics';


--
-- Name: quote_template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_template_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid,
    line_type text NOT NULL,
    description text NOT NULL,
    quantity numeric(10,3) DEFAULT 1.000,
    unit_price numeric(10,2) NOT NULL,
    is_optional boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    description text,
    category text,
    default_pricing_model text DEFAULT 'TIME_MATERIALS'::text,
    default_terms text DEFAULT 'Net 30'::text,
    default_notes text,
    is_active boolean DEFAULT true,
    use_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: rate_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    service_category_id uuid NOT NULL,
    service_type_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    base_rate numeric(10,2) NOT NULL,
    unit_type text NOT NULL,
    unit_label text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category public.service_category_enum DEFAULT 'OTHER'::public.service_category_enum NOT NULL,
    effective_date date DEFAULT CURRENT_DATE,
    expiration_date date,
    CONSTRAINT rate_cards_unit_type_check CHECK ((unit_type = ANY (ARRAY['HOUR'::text, 'SQFT'::text, 'FLAT_FEE'::text, 'UNIT'::text])))
);


--
-- Name: recurring_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    title text NOT NULL,
    description text,
    service_type_id uuid,
    frequency text,
    "interval" integer DEFAULT 1,
    day_of_week integer,
    day_of_month integer,
    start_date date NOT NULL,
    end_date date,
    next_occurrence date,
    assigned_to uuid,
    price_per_occurrence numeric(10,2),
    is_active boolean DEFAULT true,
    status text DEFAULT 'active'::text,
    occurrences_completed integer DEFAULT 0,
    last_occurrence_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recurring_schedules_frequency_check CHECK ((frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'biweekly'::text, 'monthly'::text, 'quarterly'::text, 'semiannual'::text, 'annual'::text]))),
    CONSTRAINT recurring_schedules_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: schedule_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    user_id uuid,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    all_day boolean DEFAULT false,
    location text,
    status text DEFAULT 'scheduled'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_schedule_times CHECK ((end_time > start_time)),
    CONSTRAINT schedule_events_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: service_address_tax_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_address_tax_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    address text NOT NULL,
    city character varying(100),
    state character varying(2),
    zip_code character varying(10),
    latitude numeric(10,8),
    longitude numeric(11,8),
    combined_rate numeric(5,4) NOT NULL,
    jurisdiction_breakdown jsonb,
    jurisdiction_ids uuid[],
    last_verified timestamp with time zone DEFAULT now(),
    verification_source character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_combined_rate_valid CHECK (((combined_rate >= (0)::numeric) AND (combined_rate <= (1)::numeric)))
);


--
-- Name: TABLE service_address_tax_rates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.service_address_tax_rates IS 'Cached tax rates for service addresses. Improves performance by avoiding repeated calculations.';


--
-- Name: COLUMN service_address_tax_rates.combined_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_address_tax_rates.combined_rate IS 'Total tax rate (sum of all jurisdictions)';


--
-- Name: COLUMN service_address_tax_rates.jurisdiction_breakdown; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.service_address_tax_rates.jurisdiction_breakdown IS 'JSON breakdown of tax by jurisdiction type';


--
-- Name: service_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    agreement_number text NOT NULL,
    title text NOT NULL,
    description text,
    agreement_type text NOT NULL,
    status text DEFAULT 'active'::text,
    start_date date NOT NULL,
    end_date date,
    auto_renew boolean DEFAULT false,
    renewal_period_months integer DEFAULT 12,
    service_frequency text,
    contract_value numeric(10,2) DEFAULT 0.00,
    billing_frequency text DEFAULT 'monthly'::text,
    next_service_date date,
    last_service_date date,
    terms_and_conditions text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    renewal_date date,
    cancellation_date date,
    cancellation_reason text,
    CONSTRAINT chk_contract_value_positive CHECK ((contract_value >= (0)::numeric)),
    CONSTRAINT chk_end_date_after_start CHECK (((end_date IS NULL) OR (end_date >= start_date))),
    CONSTRAINT chk_renewal_period_positive CHECK ((renewal_period_months > 0)),
    CONSTRAINT service_agreements_agreement_type_check CHECK ((agreement_type = ANY (ARRAY['maintenance'::text, 'warranty'::text, 'service_plan'::text, 'subscription'::text]))),
    CONSTRAINT service_agreements_billing_frequency_check CHECK ((billing_frequency = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'annual'::text, 'one_time'::text]))),
    CONSTRAINT service_agreements_service_frequency_check CHECK ((service_frequency = ANY (ARRAY['weekly'::text, 'monthly'::text, 'quarterly'::text, 'semi_annual'::text, 'annual'::text]))),
    CONSTRAINT service_agreements_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'suspended'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    description text,
    icon_url text,
    color text DEFAULT '#6b7280'::text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0.00,
    estimated_duration text DEFAULT '2 hours'::text,
    requires_permit boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    billing_plan_id uuid,
    status text DEFAULT 'active'::text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    trial_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'past_due'::text, 'suspended'::text])))
);


--
-- Name: tax_exemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_exemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    exemption_type character varying(50) NOT NULL,
    certificate_number character varying(100),
    issuing_state character varying(2),
    issuing_authority character varying(255),
    issue_date date,
    expiration_date date,
    applies_to character varying(50) DEFAULT 'all'::character varying,
    exempt_jurisdictions uuid[],
    document_url text,
    notes text,
    active boolean DEFAULT true,
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    verified_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT chk_exemption_dates_valid CHECK (((expiration_date IS NULL) OR (expiration_date > issue_date)))
);


--
-- Name: TABLE tax_exemptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tax_exemptions IS 'Customer tax exemption certificates. Tracks resale certificates, nonprofit exemptions, etc.';


--
-- Name: COLUMN tax_exemptions.exemption_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tax_exemptions.exemption_type IS 'Type of exemption: resale, nonprofit, government, agricultural, other';


--
-- Name: COLUMN tax_exemptions.applies_to; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tax_exemptions.applies_to IS 'What this exemption applies to: all, goods, services, labor';


--
-- Name: tax_jurisdictions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_jurisdictions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    jurisdiction_type character varying(50) NOT NULL,
    tax_rate numeric(5,4) NOT NULL,
    applies_to character varying(50) DEFAULT 'all'::character varying,
    state_code character varying(2),
    county_name character varying(100),
    city_name character varying(100),
    zip_codes text[],
    active boolean DEFAULT true,
    effective_date date DEFAULT CURRENT_DATE,
    expiration_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT chk_dates_valid CHECK (((expiration_date IS NULL) OR (expiration_date > effective_date))),
    CONSTRAINT chk_tax_rate_valid CHECK (((tax_rate >= (0)::numeric) AND (tax_rate <= (1)::numeric))),
    CONSTRAINT tax_jurisdictions_tax_rate_check CHECK (((tax_rate >= (0)::numeric) AND (tax_rate <= (1)::numeric)))
);


--
-- Name: TABLE tax_jurisdictions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.tax_jurisdictions IS 'Tax rates for different jurisdictions (state, county, city, district). Supports multi-rate tax calculation.';


--
-- Name: COLUMN tax_jurisdictions.tax_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tax_jurisdictions.tax_rate IS 'Tax rate as decimal (0.0725 = 7.25%)';


--
-- Name: COLUMN tax_jurisdictions.applies_to; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.tax_jurisdictions.applies_to IS 'What this tax applies to: all, goods, services, labor';


--
-- Name: taxes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taxes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    tax_type public.tax_type_enum DEFAULT 'sales_tax'::public.tax_type_enum,
    rate numeric(5,4) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT taxes_rate_check CHECK (((rate >= (0)::numeric) AND (rate <= (1)::numeric)))
);


--
-- Name: tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    tool_number text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    manufacturer text,
    model text,
    serial_number text,
    purchase_date date,
    purchase_price numeric(10,2) DEFAULT 0.00,
    current_value numeric(10,2) DEFAULT 0.00,
    status public.tool_status_enum DEFAULT 'available'::public.tool_status_enum,
    assigned_to uuid,
    location text,
    maintenance_schedule text,
    last_maintenance date,
    next_maintenance date,
    warranty_expiry date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    action_type text NOT NULL,
    description text,
    ip_address inet,
    user_agent text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_dashboard_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_dashboard_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    dashboard_config jsonb DEFAULT '{}'::jsonb,
    widget_preferences jsonb DEFAULT '{}'::jsonb,
    layout_settings jsonb DEFAULT '{}'::jsonb,
    theme_settings jsonb DEFAULT '{}'::jsonb,
    notification_preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_profiles; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_profiles AS
 SELECT p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.name,
    p.phone,
    p.email,
    p.avatar_url,
    p.status,
    p.role,
    p.preferences,
    p.created_at,
    p.updated_at,
    u.auth_user_id,
    u.company_id,
    u.login_count,
    c.name AS company_name,
    c.is_active AS company_is_active
   FROM ((public.profiles p
     LEFT JOIN public.users u ON ((p.user_id = u.id)))
     LEFT JOIN public.companies c ON ((u.company_id = c.id)));


--
-- Name: VIEW user_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.user_profiles IS 'Industry standard view combining users + profiles + companies';


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token text NOT NULL,
    device_name text,
    device_type text,
    browser text,
    os text,
    ip_address inet,
    user_agent text,
    last_active_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    vendor_number text NOT NULL,
    name text NOT NULL,
    vendor_type public.vendor_type_enum DEFAULT 'supplier'::public.vendor_type_enum,
    contact_name text,
    email text,
    phone text,
    website text,
    address_line1 text,
    address_line2 text,
    city text,
    state_province text,
    postal_code text,
    country text DEFAULT 'US'::text,
    tax_id text,
    payment_terms text DEFAULT 'NET30'::text,
    credit_limit numeric(12,2) DEFAULT 0.00,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vendors_email_check CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text)),
    CONSTRAINT vendors_phone_check CHECK ((phone ~ '^\+[1-9]\d{1,14}$'::text)),
    CONSTRAINT vendors_website_check CHECK ((website ~ '^https?://'::text))
);


--
-- Name: work_order_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: work_order_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    line_type public.work_order_line_item_type_enum NOT NULL,
    description text NOT NULL,
    quantity numeric(10,3) DEFAULT 1.000,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(12,2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
    tax_rate numeric(5,4) DEFAULT 0.0000,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    taxable boolean DEFAULT true,
    tax_amount numeric(10,2),
    CONSTRAINT chk_work_order_line_items_quantity_positive CHECK ((quantity > (0)::numeric)),
    CONSTRAINT chk_work_order_line_items_total_calculation CHECK ((total_price = (quantity * unit_price))),
    CONSTRAINT chk_work_order_line_items_unit_price_non_negative CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: COLUMN work_order_line_items.tax_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_order_line_items.tax_rate IS 'Tax rate for this line item (can override work order rate)';


--
-- Name: COLUMN work_order_line_items.taxable; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_order_line_items.taxable IS 'Whether this line item is taxable';


--
-- Name: COLUMN work_order_line_items.tax_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_order_line_items.tax_amount IS 'Calculated tax amount for this line item';


--
-- Name: work_order_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    user_id uuid,
    note_type text DEFAULT 'general'::text,
    content text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_order_notes_note_type_check CHECK ((note_type = ANY (ARRAY['general'::text, 'internal'::text, 'customer'::text, 'technical'::text])))
);


--
-- Name: work_order_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    inventory_item_id uuid,
    product_name text NOT NULL,
    product_sku text,
    quantity_planned numeric(10,2),
    quantity_used numeric(10,2),
    unit_of_measure text,
    unit_cost numeric(10,2),
    unit_price numeric(10,2),
    total_cost numeric(10,2),
    total_price numeric(10,2),
    status text DEFAULT 'planned'::text,
    notes text,
    allocated_at timestamp with time zone,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_order_products_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'allocated'::text, 'used'::text, 'returned'::text])))
);


--
-- Name: work_order_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    service_name text NOT NULL,
    service_type_id uuid,
    description text,
    employee_id uuid,
    hours_estimated numeric(10,2),
    hours_actual numeric(10,2),
    hourly_rate numeric(10,2),
    total_cost numeric(10,2),
    total_price numeric(10,2),
    status text DEFAULT 'planned'::text,
    notes text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_order_services_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'in_progress'::text, 'completed'::text])))
);


--
-- Name: work_order_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    task_name text NOT NULL,
    description text,
    instructions text,
    assigned_to uuid,
    status text DEFAULT 'pending'::text,
    estimated_duration integer,
    actual_duration integer,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    sort_order integer DEFAULT 0,
    notes text,
    photos text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT work_order_tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'skipped'::text, 'blocked'::text])))
);


--
-- Name: work_orders_dashboard; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.work_orders_dashboard AS
 SELECT wo.id,
    wo.work_order_number,
    wo.status,
    wo.priority,
    wo.title,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.actual_start,
    wo.actual_end,
    wo.total_amount,
    wo.created_at,
    wo.updated_at,
    c.customer_number,
        CASE
            WHEN (c.company_name IS NOT NULL) THEN c.company_name
            ELSE ((c.first_name || ' '::text) || c.last_name)
        END AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    (((((((ca.address_line_1 || COALESCE((', '::text || ca.address_line2), ''::text)) || ', '::text) || ca.city) || ', '::text) || ca.state) || ' '::text) || ca.zip_code) AS service_address,
    sc.name AS service_category,
    st.name AS service_type,
    ((p.first_name || ' '::text) || p.last_name) AS assigned_technician,
    u.role AS technician_role,
        CASE
            WHEN ((wo.scheduled_start < now()) AND (wo.status = ANY (ARRAY['scheduled'::public.work_order_status_enum, 'approved'::public.work_order_status_enum]))) THEN true
            ELSE false
        END AS is_overdue,
        CASE
            WHEN ((wo.scheduled_start >= now()) AND (wo.scheduled_start <= (now() + '24:00:00'::interval))) THEN true
            ELSE false
        END AS is_due_soon,
        CASE
            WHEN ((wo.status = 'completed'::public.work_order_status_enum) AND (NOT (EXISTS ( SELECT 1
               FROM public.invoices
              WHERE (invoices.work_order_id = wo.id))))) THEN 'needs_invoice'::text
            WHEN (EXISTS ( SELECT 1
               FROM public.invoices i
              WHERE ((i.work_order_id = wo.id) AND (i.status = 'paid'::public.invoice_status_enum)))) THEN 'paid'::text
            WHEN (EXISTS ( SELECT 1
               FROM public.invoices i
              WHERE ((i.work_order_id = wo.id) AND (i.status = ANY (ARRAY['sent'::public.invoice_status_enum, 'viewed'::public.invoice_status_enum]))))) THEN 'invoiced'::text
            ELSE 'not_invoiced'::text
        END AS financial_status
   FROM ((((((public.work_orders wo
     LEFT JOIN public.customers c ON ((wo.customer_id = c.id)))
     LEFT JOIN public.customer_addresses ca ON ((wo.customer_address_id = ca.id)))
     LEFT JOIN public.service_categories sc ON ((wo.service_category_id = sc.id)))
     LEFT JOIN public.service_types st ON ((wo.service_type_id = st.id)))
     LEFT JOIN public.users u ON ((wo.assigned_to = u.id)))
     LEFT JOIN public.profiles p ON ((u.id = p.user_id)));


--
-- Name: work_orders_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.work_orders_summary AS
 SELECT wo.id,
    wo.work_order_number,
    wo.status,
    wo.priority,
    wo.title,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.total_amount,
    ((c.first_name || ' '::text) || c.last_name) AS customer_name,
    c.company_name,
    ((((ca.address_line_1 || ', '::text) || ca.city) || ', '::text) || ca.state) AS service_address,
    sc.name AS service_category,
    st.name AS service_type,
    ((p.first_name || ' '::text) || p.last_name) AS assigned_technician,
    wo.created_at,
    wo.updated_at
   FROM ((((((public.work_orders wo
     LEFT JOIN public.customers c ON ((wo.customer_id = c.id)))
     LEFT JOIN public.customer_addresses ca ON ((wo.customer_address_id = ca.id)))
     LEFT JOIN public.service_categories sc ON ((wo.service_category_id = sc.id)))
     LEFT JOIN public.service_types st ON ((wo.service_type_id = st.id)))
     LEFT JOIN public.users u ON ((wo.assigned_to = u.id)))
     LEFT JOIN public.profiles p ON ((u.id = p.user_id)));


--
-- Name: work_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    business_hours jsonb,
    default_tax_rate numeric(5,2) DEFAULT 0.00,
    invoice_terms text DEFAULT 'NET30'::text,
    auto_invoice boolean DEFAULT false,
    require_signatures boolean DEFAULT false,
    cancellation_fee numeric(10,2) DEFAULT 0.00,
    travel_charge_per_mile numeric(10,2) DEFAULT 0.00,
    minimum_travel_charge numeric(10,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	1465ea83-b79e-413d-a87d-6414eb27923c	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"707245dd-538e-4f94-8318-63b308c6d046","user_phone":""}}	2025-09-27 21:20:39.562703+00	
00000000-0000-0000-0000-000000000000	73eb7345-9ae4-4b17-bcda-d1f91c976951	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"707245dd-538e-4f94-8318-63b308c6d046","user_phone":""}}	2025-09-27 21:25:44.023643+00	
00000000-0000-0000-0000-000000000000	853a7cd5-aa54-4aad-8704-ec060e5dd9d3	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@trademate.com","user_id":"9fb8a9ae-0d8c-43f5-814f-abe9ba916812","user_phone":""}}	2025-09-27 23:59:01.737926+00	
00000000-0000-0000-0000-000000000000	f7f636ee-de0f-45b7-807e-3818c1df7a1e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@trademate.com","user_id":"9fb8a9ae-0d8c-43f5-814f-abe9ba916812","user_phone":""}}	2025-09-27 23:59:02.493149+00	
00000000-0000-0000-0000-000000000000	d7c2db55-8b53-4e9f-8f4c-ed57dd32a4d6	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@trademate.com","user_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","user_phone":""}}	2025-09-28 00:11:21.889355+00	
00000000-0000-0000-0000-000000000000	e99aa6d2-e0a6-444d-a54d-fb9b5dffc1dc	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:11:59.571387+00	
00000000-0000-0000-0000-000000000000	42707e9e-3993-4f21-9e3b-9d90d660aff2	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:30:00.118528+00	
00000000-0000-0000-0000-000000000000	998fadc2-2408-477c-98e7-03689715bf90	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:36:55.503633+00	
00000000-0000-0000-0000-000000000000	367bf93a-d199-4f15-b516-de56174aa58a	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:37:02.373406+00	
00000000-0000-0000-0000-000000000000	2c629fba-f76b-4643-af66-2dc0eed2e5dc	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:56:20.938421+00	
00000000-0000-0000-0000-000000000000	49bf02db-ef9d-44df-9b29-3c3fb24e7871	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 00:56:37.33602+00	
00000000-0000-0000-0000-000000000000	a84cabe2-bd7f-4958-bb78-3ec965258ef6	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 01:08:03.723745+00	
00000000-0000-0000-0000-000000000000	673cb2cb-74a0-49c4-a0fb-4a37c3d856f4	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 01:08:28.286574+00	
00000000-0000-0000-0000-000000000000	2d9f7efd-8030-4b73-8aed-3e480345e335	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 01:12:15.154139+00	
00000000-0000-0000-0000-000000000000	72f05c4f-cf28-45cd-9756-694f3fd8ef6b	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 01:12:29.430726+00	
00000000-0000-0000-0000-000000000000	caedfd48-fc85-44bb-a5a4-a56164377104	{"action":"login","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 01:36:51.316655+00	
00000000-0000-0000-0000-000000000000	9e44ffca-5b72-4d4e-b2c3-d70e5c3da318	{"action":"token_refreshed","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 01:36:52.049289+00	
00000000-0000-0000-0000-000000000000	159cf3f6-c4e5-4c58-87cc-dcd9144244c7	{"action":"token_revoked","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 01:36:52.050532+00	
00000000-0000-0000-0000-000000000000	50134570-5407-453d-81f6-179ba9f8e052	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"50d43881-d236-4786-8376-1d0397a41069","user_phone":""}}	2025-09-28 01:50:58.497824+00	
00000000-0000-0000-0000-000000000000	e2627902-614c-4946-80bd-892d44ccfd05	{"action":"token_refreshed","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 02:35:16.316776+00	
00000000-0000-0000-0000-000000000000	ca0d48db-73f1-4a52-9353-7d4fa893bf2f	{"action":"token_revoked","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 02:35:16.344359+00	
00000000-0000-0000-0000-000000000000	2870c705-883a-4532-b002-394e4c8d9e68	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"50d43881-d236-4786-8376-1d0397a41069","user_phone":""}}	2025-09-28 02:58:02.051777+00	
00000000-0000-0000-0000-000000000000	a0dd8cce-3c29-483d-9df9-4e81660b1fe6	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"aea42758-f2c2-427b-bb17-c9a72f079849","user_phone":""}}	2025-09-28 02:58:58.341199+00	
00000000-0000-0000-0000-000000000000	b6002ceb-9cd0-4923-825f-78fb4eaeb6fc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"aea42758-f2c2-427b-bb17-c9a72f079849","user_phone":""}}	2025-09-28 02:59:59.823289+00	
00000000-0000-0000-0000-000000000000	15559439-b420-4478-ae5d-4a0b04520a19	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","user_phone":""}}	2025-09-28 03:07:00.348695+00	
00000000-0000-0000-0000-000000000000	73eeaef6-c54e-43c4-8486-58217a49e3c7	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 03:32:16.553194+00	
00000000-0000-0000-0000-000000000000	c801af02-e2c6-4074-80ad-1fdbea603596	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 03:33:16.19278+00	
00000000-0000-0000-0000-000000000000	76a3f04c-6ae9-4f51-bc1f-877d5937c3e7	{"action":"logout","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-28 03:42:51.525508+00	
00000000-0000-0000-0000-000000000000	8f8748e3-ca5b-4912-9ae5-068fc1946d97	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 03:42:55.894658+00	
00000000-0000-0000-0000-000000000000	7f88c0c6-bc32-4abe-9704-22decbfede09	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 04:41:46.79757+00	
00000000-0000-0000-0000-000000000000	dec2b984-5f26-42ac-aff1-22442d0c6fd4	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 04:41:46.805131+00	
00000000-0000-0000-0000-000000000000	97c1f399-4752-4475-9d8f-ff9fa94673d9	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-28 04:47:11.356999+00	
00000000-0000-0000-0000-000000000000	e4b1f05e-87d9-410d-911b-3607211d4707	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 17:30:49.559147+00	
00000000-0000-0000-0000-000000000000	7818b574-2ba0-4c5c-a198-15fd0c1e9fab	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 17:30:49.582884+00	
00000000-0000-0000-0000-000000000000	3fb12c9a-0167-4bdc-ae47-acecd539b9aa	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 18:29:46.115119+00	
00000000-0000-0000-0000-000000000000	ac0f1e0b-be3b-4149-b5af-8a872428aadb	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 18:29:46.132867+00	
00000000-0000-0000-0000-000000000000	f522582a-11c1-4061-9dc2-7768f3ef099a	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 19:28:12.048872+00	
00000000-0000-0000-0000-000000000000	da4e5d22-d209-47d8-85c2-d804a5f027d7	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 19:28:12.063048+00	
00000000-0000-0000-0000-000000000000	4114fa5b-e9b4-4348-9ff1-d6c90dd68df0	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 20:26:46.010745+00	
00000000-0000-0000-0000-000000000000	2102bcf3-261d-444e-bb17-dac834628cfe	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 20:26:46.020645+00	
00000000-0000-0000-0000-000000000000	1c689875-7b45-4cc2-b9de-abae342b283a	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 21:25:14.496095+00	
00000000-0000-0000-0000-000000000000	a8264909-907d-44c0-b525-c94e0117d835	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 21:25:14.506582+00	
00000000-0000-0000-0000-000000000000	78830812-a042-4fff-878f-8669e2c8ab50	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 22:11:21.368124+00	
00000000-0000-0000-0000-000000000000	7aa5b256-7385-4e01-93f3-e0bfeba30bd5	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 22:11:21.375411+00	
00000000-0000-0000-0000-000000000000	aa7f5ee5-cc8b-41fe-9c46-ddbe3048c1a2	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 22:23:36.779199+00	
00000000-0000-0000-0000-000000000000	e194385c-50d3-4c20-ab33-e38ba8df2517	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 22:23:36.785214+00	
00000000-0000-0000-0000-000000000000	689410a0-90a1-45a7-bc9f-319a43b2c784	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 23:20:37.570702+00	
00000000-0000-0000-0000-000000000000	ec22fde9-4c47-424c-a7c5-ac47a7a9cac4	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 23:20:37.581519+00	
00000000-0000-0000-0000-000000000000	98540ded-7164-44eb-9f9c-afb276e7b845	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 23:21:51.584122+00	
00000000-0000-0000-0000-000000000000	bbe38b08-36b2-4290-a73c-0a346dba1832	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-28 23:21:51.586916+00	
00000000-0000-0000-0000-000000000000	c2003f03-5c51-4faa-ae0c-52673077947b	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:20:07.306314+00	
00000000-0000-0000-0000-000000000000	09cf22ef-cbd8-4786-b6ce-2134b02f0dd3	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:20:07.315475+00	
00000000-0000-0000-0000-000000000000	399d5362-ac1c-4f99-a524-95e26f8be67d	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:25:19.96012+00	
00000000-0000-0000-0000-000000000000	97cfec6e-324b-4e84-8078-3194dfcf32cb	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:25:19.966859+00	
00000000-0000-0000-0000-000000000000	0ed65533-b30d-436a-9169-d8f5b2ff561a	{"action":"logout","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-29 00:27:32.106513+00	
00000000-0000-0000-0000-000000000000	4fd61a06-b3ee-4085-850c-a49b83785c4e	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-29 00:33:34.252662+00	
00000000-0000-0000-0000-000000000000	712c0486-c0ac-441c-9d15-29adcdd91953	{"action":"logout","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-29 00:39:32.351502+00	
00000000-0000-0000-0000-000000000000	5ff4c366-689f-483e-89f5-b349981c87cf	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-29 00:43:16.289995+00	
00000000-0000-0000-0000-000000000000	df3e7989-8455-47fc-9ce8-8812b29c7299	{"action":"token_refreshed","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:47:50.882775+00	
00000000-0000-0000-0000-000000000000	e710051a-eca0-4d45-a051-5eb03ea3979a	{"action":"token_revoked","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 00:47:50.888601+00	
00000000-0000-0000-0000-000000000000	1392dad5-472b-4f26-bc7a-28b42b9578ee	{"action":"token_refreshed","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 02:11:46.158562+00	
00000000-0000-0000-0000-000000000000	3d878946-ae0f-4219-821e-5a5199d92435	{"action":"token_revoked","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 02:11:46.170981+00	
00000000-0000-0000-0000-000000000000	e3fdde43-c212-4098-9069-607de548e7ec	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-29 02:12:47.123733+00	
00000000-0000-0000-0000-000000000000	ed12c9e7-2311-495a-98f7-dc5ab088b34a	{"action":"token_refreshed","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 03:29:57.211535+00	
00000000-0000-0000-0000-000000000000	9d4fd0e9-e654-429c-adbb-16f00b5ea703	{"action":"token_revoked","actor_id":"c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5","actor_username":"admin@trademate.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 03:29:57.220738+00	
00000000-0000-0000-0000-000000000000	11f955f3-31b3-4274-9f71-d39d98fabcbd	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 03:29:59.934867+00	
00000000-0000-0000-0000-000000000000	0fabff9d-0cc1-4aac-b53d-636165d703d3	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 03:29:59.935649+00	
00000000-0000-0000-0000-000000000000	e3e0e2df-1a47-4e31-931a-23b69e7850b9	{"action":"login","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-29 15:17:52.752245+00	
00000000-0000-0000-0000-000000000000	6287dce5-6142-4842-9a62-31a2f529f133	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 16:16:49.243617+00	
00000000-0000-0000-0000-000000000000	f151affc-335b-4abb-aeff-2270ba08f8d3	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 16:16:49.252231+00	
00000000-0000-0000-0000-000000000000	56b8f2a6-c26b-4d64-9320-c3a9e42a3adc	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 17:15:36.156244+00	
00000000-0000-0000-0000-000000000000	eb7468f6-431f-40b4-bb09-36be6cc1df48	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 17:15:36.174209+00	
00000000-0000-0000-0000-000000000000	11f4814e-fb3e-4463-ba44-3a453275e2e2	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 18:14:36.346659+00	
00000000-0000-0000-0000-000000000000	32f9fabe-dea1-4236-ba64-bfe2eff1f7b9	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 18:14:36.365634+00	
00000000-0000-0000-0000-000000000000	06f88ff6-4448-45f0-8ebc-20429c07a790	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 19:13:36.199457+00	
00000000-0000-0000-0000-000000000000	5712c911-59fc-4976-b378-54305ade52c4	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 19:13:36.20731+00	
00000000-0000-0000-0000-000000000000	fc145e35-af14-4501-98a1-e35024ef9d66	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 20:12:36.257773+00	
00000000-0000-0000-0000-000000000000	6fafe0b9-0f36-4397-ba64-8adde33c34f6	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 20:12:36.27231+00	
00000000-0000-0000-0000-000000000000	3234b6a8-b39a-40f4-9766-33f1a8ba90a4	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 21:10:54.711351+00	
00000000-0000-0000-0000-000000000000	677267de-f702-40ab-b4a8-8e5c7241b0ff	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 21:10:54.71767+00	
00000000-0000-0000-0000-000000000000	67c2bd13-9ca4-40e4-bcbb-502133d56b05	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 23:16:18.704268+00	
00000000-0000-0000-0000-000000000000	9c5b8a18-e740-46a1-808a-0bcbeea04332	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 23:16:18.725831+00	
00000000-0000-0000-0000-000000000000	60693c50-96a8-4795-8b07-6c9d02763946	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 23:16:48.963678+00	
00000000-0000-0000-0000-000000000000	d1a4605c-4d54-4e4b-92cb-991ded465d0f	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-29 23:16:48.964667+00	
00000000-0000-0000-0000-000000000000	a43127cf-343d-421a-818c-3e634cfbd61d	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 00:16:58.638599+00	
00000000-0000-0000-0000-000000000000	25878c12-7b06-4236-a6fc-7621b8bf9099	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 00:16:58.647069+00	
00000000-0000-0000-0000-000000000000	111468ab-c2c5-4587-86c7-02692a83038f	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 01:15:44.31894+00	
00000000-0000-0000-0000-000000000000	ff22584c-84ab-4eac-b531-bdf6223051e8	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 01:15:44.340737+00	
00000000-0000-0000-0000-000000000000	09770b7e-4ff0-4862-8cb4-d0d802e6d3d0	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 02:14:44.29031+00	
00000000-0000-0000-0000-000000000000	350cb778-08e9-44b0-a78a-8a861b4e066e	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 02:14:44.302289+00	
00000000-0000-0000-0000-000000000000	07534eb8-c536-4dfe-a9bf-7868008d3d3a	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 03:13:44.203468+00	
00000000-0000-0000-0000-000000000000	af597f87-82bf-46bd-9ef6-0024982a37f0	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 03:13:44.212436+00	
00000000-0000-0000-0000-000000000000	613248b4-ebf7-4a3d-9ab2-21a547cb45df	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 04:12:44.20917+00	
00000000-0000-0000-0000-000000000000	c76589ce-fa63-4814-859b-97592fe82204	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 04:12:44.232264+00	
00000000-0000-0000-0000-000000000000	613bfa57-451b-421c-91b7-bbc14b859407	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 16:17:55.917236+00	
00000000-0000-0000-0000-000000000000	1c759ed7-9284-4e56-9cea-34d34d56a037	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 16:17:55.934151+00	
00000000-0000-0000-0000-000000000000	02d5b409-3609-4cf2-9d4c-1c7419e0c2b6	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 17:16:16.826988+00	
00000000-0000-0000-0000-000000000000	256f1281-17fe-42b6-9897-e1c66f126b10	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 17:16:16.841906+00	
00000000-0000-0000-0000-000000000000	86bf9c58-757a-47ad-9d19-b3ebf7b77c42	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 18:14:36.037295+00	
00000000-0000-0000-0000-000000000000	552cce1f-6d24-4ebb-888f-d88871a6194d	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 18:14:36.057781+00	
00000000-0000-0000-0000-000000000000	7207b138-b04a-49a8-b57c-e35b1b246a6c	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 19:12:57.250211+00	
00000000-0000-0000-0000-000000000000	81b098d9-6e40-4b33-998b-710719ff9d41	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 19:12:57.266105+00	
00000000-0000-0000-0000-000000000000	aff0f9b9-5b02-4958-9b92-c7d39ce131ba	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 20:11:16.740136+00	
00000000-0000-0000-0000-000000000000	e5708fec-a795-4177-92dc-b8a224caadb2	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 20:11:16.766721+00	
00000000-0000-0000-0000-000000000000	c9385bee-cde8-495d-802c-f8737b56b78a	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 21:09:41.693255+00	
00000000-0000-0000-0000-000000000000	1ed23636-9aad-4ef4-a175-345d1664ea56	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 21:09:41.707906+00	
00000000-0000-0000-0000-000000000000	e796bbb5-bd79-4eb1-bda3-8bfada369c88	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 22:56:28.388681+00	
00000000-0000-0000-0000-000000000000	8db03474-3cb3-4b47-97c3-a63944cc365d	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 22:56:28.416604+00	
00000000-0000-0000-0000-000000000000	29a26199-6a67-4c7d-a44d-205e04658ff9	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 23:55:28.347974+00	
00000000-0000-0000-0000-000000000000	287c2406-5ac0-47cd-a37a-beaa4788c20a	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-30 23:55:28.356737+00	
00000000-0000-0000-0000-000000000000	f92ee9e6-2c1d-4110-a49c-5e78a6b463ff	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 00:55:41.418941+00	
00000000-0000-0000-0000-000000000000	2e30dd9e-f5b4-4081-a606-756123e3d106	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 00:55:41.444868+00	
00000000-0000-0000-0000-000000000000	217f918f-e6ac-4381-b17e-0889ddf94d49	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 01:53:46.934174+00	
00000000-0000-0000-0000-000000000000	bc3b81d4-e694-4777-9ad2-80cd74922f2a	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 01:53:46.950727+00	
00000000-0000-0000-0000-000000000000	9a0f607f-0b8f-4556-b9ad-08feba0a7b74	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 02:52:34.477012+00	
00000000-0000-0000-0000-000000000000	575844c7-e0b2-49fc-bfc9-4c96b4b2dc7a	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 02:52:34.48702+00	
00000000-0000-0000-0000-000000000000	81535ee4-9535-47da-bac0-c401ffd43980	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 03:51:41.061883+00	
00000000-0000-0000-0000-000000000000	b15c73b5-6077-4a18-9811-8440ec3c9178	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 03:51:41.06981+00	
00000000-0000-0000-0000-000000000000	300ace57-bf05-43bc-ab85-a941e46bb488	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 15:58:32.049856+00	
00000000-0000-0000-0000-000000000000	e403e131-d4cd-4f81-a852-41bb592a073e	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 15:58:32.064847+00	
00000000-0000-0000-0000-000000000000	1616eaad-d8d4-419a-8a36-9dcc3a81378a	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 16:56:33.316463+00	
00000000-0000-0000-0000-000000000000	2f0ebc8c-3639-459b-849d-e66d1965634f	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 16:56:33.333223+00	
00000000-0000-0000-0000-000000000000	175e4a6b-d5ae-47bf-bf45-278daf49d3eb	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 17:54:50.550029+00	
00000000-0000-0000-0000-000000000000	45fd0904-24a5-4c73-af25-705167268867	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 17:54:50.572863+00	
00000000-0000-0000-0000-000000000000	18cb13a3-238e-4fb1-abdb-107228bef206	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"info@cgre-llc.com","user_id":"9eb7968a-e93b-4ca4-bce3-51de03dd72b1","user_phone":""}}	2025-10-01 18:20:48.272149+00	
00000000-0000-0000-0000-000000000000	2366682b-69a5-45c8-9314-230dcbbffc8c	{"action":"token_refreshed","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 18:53:27.846831+00	
00000000-0000-0000-0000-000000000000	1a359a6d-41a9-47a1-9c72-9820eea5b13e	{"action":"token_revoked","actor_id":"268b99b5-907d-4b48-ad0e-92cdd4ac388a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-01 18:53:27.862333+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	{"sub": "c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5", "email": "admin@trademate.com", "email_verified": false, "phone_verified": false}	email	2025-09-28 00:11:21.883212+00	2025-09-28 00:11:21.883883+00	2025-09-28 00:11:21.883883+00	cd0afffb-97ad-4068-8301-6eab8302e473
268b99b5-907d-4b48-ad0e-92cdd4ac388a	268b99b5-907d-4b48-ad0e-92cdd4ac388a	{"sub": "268b99b5-907d-4b48-ad0e-92cdd4ac388a", "email": "jeraldjsmith@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-09-28 03:07:00.34474+00	2025-09-28 03:07:00.34543+00	2025-09-28 03:07:00.34543+00	15dabab0-f0c4-4283-a46e-d96a46458efd
9eb7968a-e93b-4ca4-bce3-51de03dd72b1	9eb7968a-e93b-4ca4-bce3-51de03dd72b1	{"sub": "9eb7968a-e93b-4ca4-bce3-51de03dd72b1", "email": "info@cgre-llc.com", "email_verified": false, "phone_verified": false}	email	2025-10-01 18:20:48.264382+00	2025-10-01 18:20:48.264438+00	2025-10-01 18:20:48.264438+00	d8a4f052-538f-4e41-949c-3b48217cc7b4
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
8b7e1f89-dc1a-4904-a123-0a848511df05	2025-09-28 00:11:59.589188+00	2025-09-28 00:11:59.589188+00	password	54d57c7b-5f3b-44f8-a4ca-54063ffead99
d8ee89f8-99f7-473d-8cca-769e0e99a9b4	2025-09-28 00:30:00.158648+00	2025-09-28 00:30:00.158648+00	password	e1907d1a-eb80-4eca-87fb-5296eba4f94f
13474494-4740-4b17-b189-8f62970ea6f1	2025-09-28 00:36:55.514806+00	2025-09-28 00:36:55.514806+00	password	19a12604-a2a2-4823-ab29-664b8a221008
704667a4-ee36-4249-af7d-9d55b841a145	2025-09-28 00:37:02.377725+00	2025-09-28 00:37:02.377725+00	password	8870e5e3-8d24-4c83-8e52-56e51a475601
9463b35b-e6a6-4e30-b712-de54f7416070	2025-09-28 00:56:21.012707+00	2025-09-28 00:56:21.012707+00	password	40dc0319-8a6e-4329-86c3-2e802088a7eb
98ef65ab-7d31-4a7f-851a-aabccaec324b	2025-09-28 00:56:37.339792+00	2025-09-28 00:56:37.339792+00	password	a8cd6b6a-7a1c-4314-b7fb-e4c94a92fab3
5ce80795-f1ab-4986-b5a1-e96622c3ef78	2025-09-28 01:08:03.737755+00	2025-09-28 01:08:03.737755+00	password	bf8479a5-3bc4-4f70-a5fc-7a4a4dc63998
7b651139-f751-4bf2-879d-01f6e4c30792	2025-09-28 01:08:28.290551+00	2025-09-28 01:08:28.290551+00	password	5f47dc7e-ef6d-48fe-ba6c-942e92892b6d
482ca7ac-8967-446b-a443-2012d5e507da	2025-09-28 01:12:15.207631+00	2025-09-28 01:12:15.207631+00	password	9fe98648-c90d-4d9b-8df6-cc2d78db430e
0f5c4e35-25c5-4cbd-8538-360e5836b03c	2025-09-28 01:12:29.434799+00	2025-09-28 01:12:29.434799+00	password	ba22a45d-dd92-4dc1-8977-9f386e858463
f2dda457-0eed-4a94-8c91-dfa00f12a563	2025-09-28 01:36:51.367069+00	2025-09-28 01:36:51.367069+00	password	5d7434d8-8bbc-406e-9a96-1a6eee921fbd
dc0269c3-01ca-479f-a042-229cd01e86cb	2025-09-29 00:43:16.296869+00	2025-09-29 00:43:16.296869+00	password	e7d32db2-fcc9-474f-b899-ae75c4f7cec5
2d7f5027-5fe8-4d59-b460-f8e29cd42041	2025-09-29 02:12:47.139146+00	2025-09-29 02:12:47.139146+00	password	5410dbff-0d53-4825-a7be-e791f9c614e6
46f239ef-0885-4e0f-ab69-011eb329b0a7	2025-09-29 15:17:52.865243+00	2025-09-29 15:17:52.865243+00	password	619a53bb-de0c-4acc-885c-3e9e64a85dea
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	5scoilbxqhg6	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 00:11:59.579315+00	2025-09-28 00:11:59.579315+00	\N	8b7e1f89-dc1a-4904-a123-0a848511df05
00000000-0000-0000-0000-000000000000	2	nug6d2k4dc6o	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 00:30:00.145954+00	2025-09-28 00:30:00.145954+00	\N	d8ee89f8-99f7-473d-8cca-769e0e99a9b4
00000000-0000-0000-0000-000000000000	3	haibjfffd53b	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 00:36:55.50956+00	2025-09-28 00:36:55.50956+00	\N	13474494-4740-4b17-b189-8f62970ea6f1
00000000-0000-0000-0000-000000000000	55	so3oeee4x7vj	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 20:11:16.798989+00	2025-09-30 21:09:41.709844+00	vg74rxksm6o6	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	5	plthuv2pxluy	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 00:56:20.982892+00	2025-09-28 00:56:20.982892+00	\N	9463b35b-e6a6-4e30-b712-de54f7416070
00000000-0000-0000-0000-000000000000	6	347aqdagaouk	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 00:56:37.337898+00	2025-09-28 00:56:37.337898+00	\N	98ef65ab-7d31-4a7f-851a-aabccaec324b
00000000-0000-0000-0000-000000000000	7	k4tjzxu7oxfz	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 01:08:03.734354+00	2025-09-28 01:08:03.734354+00	\N	5ce80795-f1ab-4986-b5a1-e96622c3ef78
00000000-0000-0000-0000-000000000000	8	y7eenjl236sq	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 01:08:28.288757+00	2025-09-28 01:08:28.288757+00	\N	7b651139-f751-4bf2-879d-01f6e4c30792
00000000-0000-0000-0000-000000000000	9	btj2yq6kkts2	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 01:12:15.176183+00	2025-09-28 01:12:15.176183+00	\N	482ca7ac-8967-446b-a443-2012d5e507da
00000000-0000-0000-0000-000000000000	10	asqv2kkvcstm	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 01:12:29.433602+00	2025-09-28 01:12:29.433602+00	\N	0f5c4e35-25c5-4cbd-8538-360e5836b03c
00000000-0000-0000-0000-000000000000	4	nkxpxlusrioi	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	t	2025-09-28 00:37:02.37538+00	2025-09-28 01:36:52.051069+00	\N	704667a4-ee36-4249-af7d-9d55b841a145
00000000-0000-0000-0000-000000000000	12	7abjo3g6snmu	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-28 01:36:52.053975+00	2025-09-28 01:36:52.053975+00	nkxpxlusrioi	704667a4-ee36-4249-af7d-9d55b841a145
00000000-0000-0000-0000-000000000000	11	t6oylpcu6hn6	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	t	2025-09-28 01:36:51.343621+00	2025-09-28 02:35:16.345478+00	\N	f2dda457-0eed-4a94-8c91-dfa00f12a563
00000000-0000-0000-0000-000000000000	50	q6xndm7zxdni	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 04:12:44.26629+00	2025-09-30 22:56:28.417447+00	z5533xha4chn	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	57	nuxqmwdijrft	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 22:56:28.44345+00	2025-09-30 23:55:28.35742+00	q6xndm7zxdni	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	58	ifhp47w4dqkz	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 23:55:28.369031+00	2025-10-01 00:55:41.448154+00	nuxqmwdijrft	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	59	4g6m5ud3ymio	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 00:55:41.47148+00	2025-10-01 01:53:46.952197+00	ifhp47w4dqkz	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	60	jsp724yc4utc	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 01:53:46.974429+00	2025-10-01 02:52:34.489113+00	4g6m5ud3ymio	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	61	n3fxlmw3hofs	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 02:52:34.499052+00	2025-10-01 03:51:41.072587+00	jsp724yc4utc	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	62	77zijbxprzrc	268b99b5-907d-4b48-ad0e-92cdd4ac388a	f	2025-10-01 03:51:41.077911+00	2025-10-01 03:51:41.077911+00	n3fxlmw3hofs	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	56	eyaghgojde2t	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 21:09:41.73129+00	2025-10-01 15:58:32.066205+00	so3oeee4x7vj	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	63	4snvputazqgs	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 15:58:32.081688+00	2025-10-01 16:56:33.335263+00	eyaghgojde2t	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	64	xvlh2stx3suo	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 16:56:33.352295+00	2025-10-01 17:54:50.573644+00	4snvputazqgs	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	65	cz3qlwqhgx6l	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-10-01 17:54:50.591391+00	2025-10-01 18:53:27.863625+00	xvlh2stx3suo	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	66	ha6vqd56en67	268b99b5-907d-4b48-ad0e-92cdd4ac388a	f	2025-10-01 18:53:27.88734+00	2025-10-01 18:53:27.88734+00	cz3qlwqhgx6l	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	31	blg5lcarahpn	268b99b5-907d-4b48-ad0e-92cdd4ac388a	f	2025-09-29 00:43:16.29365+00	2025-09-29 00:43:16.29365+00	\N	dc0269c3-01ca-479f-a042-229cd01e86cb
00000000-0000-0000-0000-000000000000	13	lwerrqvzpntu	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	t	2025-09-28 02:35:16.3691+00	2025-09-29 00:47:50.889251+00	t6oylpcu6hn6	f2dda457-0eed-4a94-8c91-dfa00f12a563
00000000-0000-0000-0000-000000000000	32	vtruamppzepu	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	t	2025-09-29 00:47:50.897022+00	2025-09-29 02:11:46.178529+00	lwerrqvzpntu	f2dda457-0eed-4a94-8c91-dfa00f12a563
00000000-0000-0000-0000-000000000000	33	cnjuh2wfiqhh	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	t	2025-09-29 02:11:46.191383+00	2025-09-29 03:29:57.223151+00	vtruamppzepu	f2dda457-0eed-4a94-8c91-dfa00f12a563
00000000-0000-0000-0000-000000000000	35	73x724rl4jpq	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	f	2025-09-29 03:29:57.232019+00	2025-09-29 03:29:57.232019+00	cnjuh2wfiqhh	f2dda457-0eed-4a94-8c91-dfa00f12a563
00000000-0000-0000-0000-000000000000	34	vmcidibmzylf	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 02:12:47.136577+00	2025-09-29 03:29:59.936292+00	\N	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	37	etdwxtnruz2j	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 15:17:52.81507+00	2025-09-29 16:16:49.25535+00	\N	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	38	5misqridrbus	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 16:16:49.262696+00	2025-09-29 17:15:36.177331+00	etdwxtnruz2j	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	39	cybkmf6y6ecr	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 17:15:36.195993+00	2025-09-29 18:14:36.368285+00	5misqridrbus	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	40	2t2xzscyurtb	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 18:14:36.393606+00	2025-09-29 19:13:36.207932+00	cybkmf6y6ecr	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	41	juto4bxiyylh	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 19:13:36.226925+00	2025-09-29 20:12:36.274806+00	2t2xzscyurtb	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	42	oy6jw423le77	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 20:12:36.294157+00	2025-09-29 21:10:54.718303+00	juto4bxiyylh	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	43	oyuxm5utqnjg	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 21:10:54.729769+00	2025-09-29 23:16:18.729205+00	oy6jw423le77	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	36	mnvye7iyowk4	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 03:29:59.937255+00	2025-09-29 23:16:48.965211+00	vmcidibmzylf	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	45	bev2dofpn6rp	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 23:16:48.965523+00	2025-09-30 00:16:58.647719+00	mnvye7iyowk4	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	46	ogwggiszkpkm	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 00:16:58.663354+00	2025-09-30 01:15:44.343484+00	bev2dofpn6rp	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	47	7vsishchtymd	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 01:15:44.368559+00	2025-09-30 02:14:44.304124+00	ogwggiszkpkm	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	48	pgeegmgqlfz6	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 02:14:44.317874+00	2025-09-30 03:13:44.21436+00	7vsishchtymd	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	49	z5533xha4chn	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 03:13:44.224446+00	2025-09-30 04:12:44.238387+00	pgeegmgqlfz6	2d7f5027-5fe8-4d59-b460-f8e29cd42041
00000000-0000-0000-0000-000000000000	44	rgbroh33upp6	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-29 23:16:18.752328+00	2025-09-30 16:17:55.935404+00	oyuxm5utqnjg	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	51	6qwnzyi7epnk	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 16:17:55.950443+00	2025-09-30 17:16:16.843143+00	rgbroh33upp6	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	52	4k5jaeeyc3ka	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 17:16:16.860184+00	2025-09-30 18:14:36.060572+00	6qwnzyi7epnk	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	53	sbjhyesryakv	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 18:14:36.079574+00	2025-09-30 19:12:57.268581+00	4k5jaeeyc3ka	46f239ef-0885-4e0f-ab69-011eb329b0a7
00000000-0000-0000-0000-000000000000	54	vg74rxksm6o6	268b99b5-907d-4b48-ad0e-92cdd4ac388a	t	2025-09-30 19:12:57.283913+00	2025-09-30 20:11:16.767754+00	sbjhyesryakv	46f239ef-0885-4e0f-ab69-011eb329b0a7
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
8b7e1f89-dc1a-4904-a123-0a848511df05	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:11:59.575305+00	2025-09-28 00:11:59.575305+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
d8ee89f8-99f7-473d-8cca-769e0e99a9b4	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:30:00.133334+00	2025-09-28 00:30:00.133334+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
13474494-4740-4b17-b189-8f62970ea6f1	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:36:55.50783+00	2025-09-28 00:36:55.50783+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
9463b35b-e6a6-4e30-b712-de54f7416070	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:56:20.96035+00	2025-09-28 00:56:20.96035+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
98ef65ab-7d31-4a7f-851a-aabccaec324b	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:56:37.337134+00	2025-09-28 00:56:37.337134+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
5ce80795-f1ab-4986-b5a1-e96622c3ef78	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 01:08:03.729835+00	2025-09-28 01:08:03.729835+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
7b651139-f751-4bf2-879d-01f6e4c30792	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 01:08:28.28804+00	2025-09-28 01:08:28.28804+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
482ca7ac-8967-446b-a443-2012d5e507da	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 01:12:15.164304+00	2025-09-28 01:12:15.164304+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
0f5c4e35-25c5-4cbd-8538-360e5836b03c	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 01:12:29.43289+00	2025-09-28 01:12:29.43289+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
704667a4-ee36-4249-af7d-9d55b841a145	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 00:37:02.374613+00	2025-09-28 01:36:52.056413+00	\N	aal1	\N	2025-09-28 01:36:52.056344	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
f2dda457-0eed-4a94-8c91-dfa00f12a563	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	2025-09-28 01:36:51.333299+00	2025-09-29 03:29:57.245858+00	\N	aal1	\N	2025-09-29 03:29:57.245164	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
2d7f5027-5fe8-4d59-b460-f8e29cd42041	268b99b5-907d-4b48-ad0e-92cdd4ac388a	2025-09-29 02:12:47.126179+00	2025-10-01 03:51:41.093492+00	\N	aal1	\N	2025-10-01 03:51:41.092242	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
dc0269c3-01ca-479f-a042-229cd01e86cb	268b99b5-907d-4b48-ad0e-92cdd4ac388a	2025-09-29 00:43:16.291795+00	2025-09-29 00:43:16.291795+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
46f239ef-0885-4e0f-ab69-011eb329b0a7	268b99b5-907d-4b48-ad0e-92cdd4ac388a	2025-09-29 15:17:52.786703+00	2025-10-01 18:53:27.916887+00	\N	aal1	\N	2025-10-01 18:53:27.915573	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	98.97.44.30	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	9eb7968a-e93b-4ca4-bce3-51de03dd72b1	authenticated	authenticated	info@cgre-llc.com	$2a$10$rAcKzLp4nd61f8I2RKmNKuFs5CZSWus50w/eUrgLmhDsyrm2Tu8n6	\N	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "employee", "full_name": "Jerald Smith", "company_id": "cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e", "invited_at": "2025-10-01T18:20:47.954Z", "invited_by": "44475f47-be87-45ef-b465-2ecbbc0616ea"}	\N	2025-10-01 18:20:48.239697+00	2025-10-01 18:20:48.285346+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	268b99b5-907d-4b48-ad0e-92cdd4ac388a	authenticated	authenticated	jeraldjsmith@gmail.com	$2a$10$nrnOkamCQHS17mzlecQHgupd3Roeg4bHAcUlkK73buac0dJ20bMma	2025-09-28 03:07:00.356973+00	\N		\N		\N			\N	2025-09-29 15:17:52.784865+00	{"provider": "email", "providers": ["email"]}	{"role": "owner", "email_verified": true}	\N	2025-09-28 03:07:00.339201+00	2025-10-01 18:53:27.904519+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	authenticated	authenticated	admin@trademate.com	$2a$10$749zarlN/KYVQri6k5AmZeNzFd7cwaJuEqry7Isq9mblnO3zXjREW	2025-09-28 00:11:21.898048+00	\N		\N		\N			\N	2025-09-28 01:36:51.333214+00	{"provider": "email", "providers": ["email"]}	{"role": "APP_OWNER", "last_name": "User", "first_name": "Admin", "email_verified": true}	\N	2025-09-28 00:11:21.863645+00	2025-09-29 03:29:57.237167+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, company_id, user_id, table_name, record_id, action, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: billing_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.billing_plans (id, name, description, price_monthly, price_yearly, features, max_users, max_work_orders, is_active, created_at) FROM stdin;
7b337bd9-bd31-495d-a6de-bddae98a2d47	Starter	Perfect for small contractors	49.00	490.00	{"quotes": true, "invoicing": true, "scheduling": true, "basic_inventory": true}	3	\N	t	2025-09-27 16:29:53.40749+00
bd2e46ec-d493-48a2-b861-291db6343a8d	Professional	For growing businesses	99.00	990.00	{"payroll": true, "reporting": true, "advanced_inventory": true, "everything_in_starter": true}	10	\N	t	2025-09-27 16:29:53.40749+00
fc73120f-9140-4cd4-b1ae-8c419aa54740	Enterprise	For large operations	199.00	1990.00	{"api_access": true, "marketplace": true, "custom_integrations": true, "everything_in_professional": true}	50	\N	t	2025-09-27 16:29:53.40749+00
\.


--
-- Data for Name: change_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.change_order_items (id, company_id, change_order_id, item_type, description, category, quantity, unit_price, total, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: change_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.change_orders (id, company_id, work_order_id, change_order_number, title, description, reason, status, subtotal, discount_amount, tax_rate, tax_amount, total_amount, requested_by, approved_by_name, approved_by_email, signature_id, signature_data, created_at, sent_at, approved_at, rejected_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, company_number, name, legal_name, tax_id, phone, email, website, address_line1, address_line2, city, state_province, postal_code, country, time_zone, currency, is_active, created_at, updated_at, default_tax_rate, created_by, tagline, logo_url, industry, industry_tags) FROM stdin;
cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	C-617912	Smith Plumbing	\N	\N	+15417050524	jeraldjsmith@gmail.com	https://smithplumbing.com	1103 chinook street	\N	The Dalles	\N	97058	US	UTC	USD	t	2025-09-28 03:07:00.946+00	2025-09-29 02:29:37.709485+00	0.0875	\N	\N	\N	\N	\N
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_settings (id, company_id, business_hours, default_tax_rate, invoice_terms, auto_invoice, require_signatures, allow_online_payments, emergency_rate_multiplier, travel_charge_per_mile, minimum_travel_charge, cancellation_fee, transparency_mode, created_at, updated_at, onboarding_progress, timezone, display_name, labor_rate, overtime_multiplier, parts_markup) FROM stdin;
9bdd8e10-8e45-4eb6-8ca5-bd8d02f067d2	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	{"monday": {"open": "08:00", "close": "17:00"}}	8.2500	NET30	f	t	t	1.50	0.65	25.00	50.00	t	2025-09-28 20:21:22.691712+00	2025-09-29 03:33:01.773603+00	{"mode": null, "started_at": "2025-09-29T02:22:28.978Z", "step_1_data": {"city": "The Dalles", "name": "Smith Plumbing", "email": "jeraldjsmith@gmail.com", "phone": "+15417050524", "state": "", "country": "US", "tagline": "", "website": "https://smithplumbing.com", "industry": "", "timezone": "UTC", "postal_code": "97058", "address_line1": "1103 chinook street", "address_line2": ""}, "step_2_data": {"tax_rate": 8.25, "hourly_rate": 75, "overtime_rate": 112.5, "payment_terms": "NET30", "emergency_rate": 150, "material_markup": 25}, "completed_at": "2025-09-29T03:33:01.773603+00:00", "current_step": 6, "last_auto_save": "2025-09-29T03:32:45.250Z", "completed_steps": []}	America/New_York	Smith Plumbing Settings	75.00	1.50	25.00
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_addresses (id, customer_id, address_type, address_line_1, address_line2, city, state, zip_code, country, is_primary, latitude, longitude, access_notes, created_at, company_id, address_name) FROM stdin;
\.


--
-- Data for Name: customer_equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_equipment (id, company_id, customer_id, customer_address_id, equipment_type, manufacturer, model_number, serial_number, install_date, installed_by, warranty_start_date, warranty_end_date, warranty_provider, location_description, status, notes, photos, documents, created_at, updated_at, last_service_date) FROM stdin;
\.


--
-- Data for Name: customer_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_feedback (id, company_id, work_order_id, customer_id, overall_rating, quality_rating, timeliness_rating, professionalism_rating, value_rating, comments, would_recommend, review_posted, review_platform, review_url, submitted_at, created_at) FROM stdin;
\.


--
-- Data for Name: customer_tag_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_tag_assignments (id, customer_id, tag_id, assigned_by, created_at) FROM stdin;
26a59da5-4b19-4ebb-9953-aeb2db9287c2	daece991-2bc1-446f-bb48-d4eb6c429fc9	56994ad1-27be-4cf6-b8ad-2061171d463c	44475f47-be87-45ef-b465-2ecbbc0616ea	2025-09-29 20:15:29.161715+00
3b1a6ebf-7bce-4474-a48a-788380264596	daece991-2bc1-446f-bb48-d4eb6c429fc9	5d7e8743-498c-4a21-a8d2-4771785aa456	44475f47-be87-45ef-b465-2ecbbc0616ea	2025-09-29 20:15:29.468512+00
69ce1c4b-5100-4ab2-96db-3dd400adedb3	dc54b671-557f-41a2-924f-954ba328de19	4c90ce1c-d5b0-47c5-a502-3461ecebf0d6	44475f47-be87-45ef-b465-2ecbbc0616ea	2025-09-29 20:36:26.462117+00
1783221d-da46-4d98-903b-c36df11bcaa3	dc54b671-557f-41a2-924f-954ba328de19	0d003b02-26fc-498c-b1f2-4a546ceda847	44475f47-be87-45ef-b465-2ecbbc0616ea	2025-09-29 20:36:26.775105+00
883208c3-e432-456b-9396-eefce7bac2c3	dc54b671-557f-41a2-924f-954ba328de19	e40a1bf4-e095-4a50-ba2e-e4a1770a9c26	44475f47-be87-45ef-b465-2ecbbc0616ea	2025-09-29 20:36:27.180092+00
\.


--
-- Data for Name: customer_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_tags (id, name, description, color, priority, created_at, company_id) FROM stdin;
6ab913db-b056-4045-88ca-948e7e272272	VIP	Very Important Customer	#f59e0b	90	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
92c287ec-220f-4efd-b14f-cfcf96efc188	High Value	High revenue customer	#10b981	80	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
d570822f-a712-4a63-a43a-a427dc618cee	Repeat Customer	Regular repeat business	#3b82f6	70	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
d6ae81f4-eb1f-469d-8c04-880ce6587dcc	New Customer	First time customer	#8b5cf6	60	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
6ebdbaa3-819d-4f4b-b916-88f8c9ed2c73	Commercial	Commercial account	#ef4444	50	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
9b9b9ee8-b59d-414d-9d17-4a0d37fbb7f5	Residential	Residential customer	#6b7280	40	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
5862a2a0-8dba-42e1-a4db-5e7951dfd8ef	Emergency Only	Emergency services only	#f97316	30	2025-09-27 16:29:53.40749+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
56994ad1-27be-4cf6-b8ad-2061171d463c	residential	Residential customers - homeowners and renters	#10b981	10	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
4c90ce1c-d5b0-47c5-a502-3461ecebf0d6	commercial	Commercial customers - businesses and offices	#3b82f6	20	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
d869c3f6-1d79-47f1-a4f2-eb8498e77289	industrial	Industrial customers - factories and warehouses	#f59e0b	30	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
39c5c8d9-7a77-475e-b6b5-f1bd88fdf64f	government	Government customers - municipal and federal	#8b5cf6	40	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
e40a1bf4-e095-4a50-ba2e-e4a1770a9c26	vip	VIP customers - high value clients	#ef4444	5	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
5d7e8743-498c-4a21-a8d2-4771785aa456	new	New customers - first time clients	#06b6d4	15	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
48fe1cce-63bc-4698-932b-93f4a96e7630	repeat	Repeat customers - returning clients	#84cc16	25	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
b5dbdb8e-cfcd-4ef3-9c32-a24aba1fd531	priority	Priority customers - urgent response needed	#f97316	8	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
7732f5db-7643-4cf2-bb7a-66630c30941f	maintenance	Maintenance customers - recurring service contracts	#6366f1	35	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
5b68f0ac-048f-489a-aa0a-747e5e45eca5	emergency	Emergency customers - after hours service	#dc2626	3	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
bf734dff-438d-432e-84b4-88d70f3fbce0	seasonal	Seasonal customers - periodic service needs	#059669	45	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
4bf60ca4-867a-48d9-852f-f45d603483f7	referral	Referral customers - came from existing clients	#7c3aed	50	2025-09-29 16:46:55.051422+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
0d003b02-26fc-498c-b1f2-4a546ceda847	new customer	New customer customer tag	#10b981	50	2025-09-29 19:39:23.644994+00	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, company_id, customer_number, type, first_name, last_name, company_name, email, phone, mobile_phone, preferred_contact, source, notes, credit_limit, payment_terms, tax_exempt, is_active, created_at, updated_at, customer_since, status, billing_address_line_1, billing_address_line_2, billing_city, billing_state, billing_zip_code, billing_country, primary_contact_name, primary_contact_phone, primary_contact_email, preferred_contact_method, preferred_contact_time, communication_preferences) FROM stdin;
dc54b671-557f-41a2-924f-954ba328de19	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	CUST-000010	commercial	\N	\N	abc plumbing	abc@tradesmate.com	+15098647357	\N	phone	manual_entry	new customer	0.00	NET30	f	t	2025-09-29 20:36:25.980893+00	2025-09-29 20:36:25.980893+00	2025-09-29	active	\N	\N	\N	\N	\N	United States	\N	\N	\N	email	\N	{"marketing_emails": false, "sms_notifications": false, "email_notifications": true}
daece991-2bc1-446f-bb48-d4eb6c429fc9	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	CUST-000009	residential	arlie	smith	\N	arliesmith@cgrenewables.com	+15419789236	\N	phone	manual_entry	new customer	0.00	NET30	f	t	2025-09-29 20:15:28.771868+00	2025-09-30 02:56:51.525842+00	2025-09-29	active	123 Main St	\N	Springfield	IL	62701	United States	\N	+15419789236	arliesmith@cgrenewables.com	email	\N	{"marketing_emails": false, "sms_notifications": false, "email_notifications": true}
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_templates (id, company_id, name, type, header_text, footer_text, terms, logo_url, is_default, created_at, updated_at) FROM stdin;
a89f015c-7a5b-4b7b-8148-e5d08538c7cb	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	Default Invoice	INVOICE	Invoice from Smith Plumbing	Thank you for your business!	Payment due within 30 days.	\N	t	2025-09-28 20:34:59.916698+00	2025-09-28 20:34:59.916698+00
eb72fc84-87dc-4223-8737-29919547219d	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	Default Quote	QUOTE	Quote from Smith Plumbing	We look forward to working with you!	This quote is valid for 30 days.	\N	t	2025-09-28 20:34:59.916698+00	2025-09-28 20:34:59.916698+00
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, company_id, work_order_id, customer_id, document_type, title, file_name, file_url, file_size, mime_type, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: employee_timesheets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_timesheets (id, employee_id, work_order_id, date, clock_in, clock_out, break_duration, regular_hours, overtime_hours, status, notes, approved_by, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, company_id, user_id, employee_number, hire_date, termination_date, job_title, department, hourly_rate, overtime_rate, emergency_contact_name, emergency_contact_phone, certifications, skills, notes, created_at, updated_at, employee_type, pay_type) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, company_id, work_order_id, employee_id, expense_type, description, amount, expense_date, receipt_url, is_billable, is_reimbursable, status, approved_by, approved_at, notes, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_items (id, company_id, sku, name, description, category, unit_of_measure, cost_price, sell_price, reorder_point, reorder_quantity, barcode, manufacturer, model_number, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_locations (id, company_id, name, description, address_line1, address_line2, city, state_province, postal_code, is_mobile, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_movements (id, company_id, item_id, location_id, work_order_id, movement_type, quantity, unit_cost, reference_number, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_stock (id, item_id, location_id, quantity_on_hand, quantity_allocated, last_counted_at, last_counted_by, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_deliveries (id, company_id, invoice_id, delivery_method, recipient_email, recipient_phone, sent_at, delivered_at, viewed_at, opened_at, pdf_url, portal_link, payment_link, delivery_status, error_message, sent_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_line_items (id, invoice_id, description, quantity, unit_price, tax_rate, sort_order, created_at, item_type, line_number) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, company_id, work_order_id, customer_id, invoice_number, status, issue_date, due_date, subtotal, tax_amount, total_amount, amount_paid, terms, notes, sent_at, created_at, updated_at, discount_percentage, late_fee_amount, pdf_url, customer_name_snapshot, customer_address_snapshot, customer_tax_id_snapshot, company_name_snapshot, company_address_snapshot, company_tax_id_snapshot) FROM stdin;
\.


--
-- Data for Name: job_completion_checklist; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_completion_checklist (id, company_id, work_order_id, item_text, is_required, is_completed, completed_by, completed_at, notes, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: marketplace_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketplace_messages (id, request_id, response_id, sender_company_id, sender_user_id, message, attachments, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: marketplace_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketplace_requests (id, company_id, customer_id, title, description, service_category_id, service_type_id, service_address, service_city, service_state, service_zip, service_location_lat, service_location_lng, preferred_date, preferred_time_start, preferred_time_end, is_flexible, is_emergency, budget_min, budget_max, status, photos, attachments, response_count, view_count, created_at, updated_at, expires_at, closed_at) FROM stdin;
\.


--
-- Data for Name: marketplace_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketplace_responses (id, request_id, contractor_company_id, message, estimated_cost, estimated_duration, available_date, available_time_start, available_time_end, status, response_time_minutes, photos, attachments, created_at, updated_at, viewed_at, accepted_at, rejected_at) FROM stdin;
\.


--
-- Data for Name: marketplace_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.marketplace_settings (id, company_id, emergency_rate_multiplier, transparency_mode, auto_accept_jobs, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, company_id, work_order_id, customer_id, sender_id, recipient_type, recipient_id, subject, content, message_type, status, sent_at, read_at, created_at, delivered_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, company_id, user_id, type, title, message, data, status, scheduled_for, sent_at, read_at, created_at, expires_at, action_url) FROM stdin;
\.


--
-- Data for Name: onboarding_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_progress (id, company_id, current_step, steps, skipped, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: payment_deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_deliveries (id, company_id, payment_id, delivery_method, recipient_email, recipient_phone, sent_at, delivered_at, receipt_pdf_url, delivery_status, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: payment_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_settings (id, company_id, default_payment_method, invoice_template_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, company_id, invoice_id, customer_id, payment_method, amount, status, reference_number, transaction_id, payment_date, notes, created_at, updated_at, received_at, gateway_response, refund_amount, refund_date) FROM stdin;
\.


--
-- Data for Name: payroll_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_line_items (id, payroll_run_id, employee_id, regular_hours, overtime_hours, regular_pay, overtime_pay, gross_pay, deductions, net_pay, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_runs (id, company_id, pay_period_start, pay_period_end, pay_date, status, total_gross, total_deductions, total_net, processed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, description, level, created_at) FROM stdin;
ef98cc1e-44dc-4dbd-8c6c-e2fd7b6ef1b7	view_dashboard	View company dashboard	10	2025-09-27 16:29:53.40749+00
cad36715-9886-4e17-b12b-6925206cba4e	manage_customers	Create and edit customers	30	2025-09-27 16:29:53.40749+00
094afaa7-3947-4219-9a8c-2a43cc951237	manage_work_orders	Create and edit work orders	40	2025-09-27 16:29:53.40749+00
fda9c438-f6d4-45d5-a0ea-4e4fabb5fc7d	manage_scheduling	Schedule and assign work	50	2025-09-27 16:29:53.40749+00
d7829716-6df8-4d64-93f7-944c4ff69c82	manage_invoicing	Create and send invoices	60	2025-09-27 16:29:53.40749+00
3c9600ef-9313-4aea-82e9-4166370371da	manage_inventory	Manage inventory items and stock	70	2025-09-27 16:29:53.40749+00
24a78556-1a8e-4045-b3e3-eb5a2b752947	manage_employees	Manage employee records	80	2025-09-27 16:29:53.40749+00
641325ab-22d3-4055-bcba-6e0d05090101	manage_company	Manage company settings	90	2025-09-27 16:29:53.40749+00
ae27c8f6-5bc4-458e-a23b-1c35268cfc79	super_admin	Full system access	100	2025-09-27 16:29:53.40749+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, user_id, first_name, last_name, phone, avatar_url, preferences, created_at, updated_at, status, emergency_contact_phone, hire_date, company_id, email, role, date_of_birth, bio, address_line_1, address_line_2, city, state_province, postal_code, country, emergency_contact_name, emergency_contact_relationship, timezone, language, date_format, time_format, email_verified, phone_verified, two_factor_enabled, two_factor_secret, notification_preferences) FROM stdin;
268b99b5-907d-4b48-ad0e-92cdd4ac388a	44475f47-be87-45ef-b465-2ecbbc0616ea	Jerry	Smith	+15417050524	\N	{}	2025-09-28 03:07:00.712759+00	2025-09-30 18:58:45.539866+00	active	5419789236	\N	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	jeraldjsmith@gmail.com	owner	1987-02-26	\N	1103 Chinook Street	\N	The Dalles	OR	97058	US	Arlie Smith	spouse	America/Los_Angeles	en	MM/DD/YYYY	12h	f	f	f	\N	{"sms": false, "push": true, "email": true, "job_updates": true, "pto_updates": true, "schedule_changes": true, "timesheet_reminders": true}
\.


--
-- Data for Name: purchase_order_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_line_items (id, purchase_order_id, inventory_item_id, description, quantity, unit_price, quantity_received, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, company_id, vendor_id, work_order_id, po_number, status, order_date, expected_date, subtotal, tax_amount, shipping_amount, total_amount, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_analytics (id, work_order_id, company_id, quote_created_at, quote_sent_at, quote_viewed_at, quote_accepted_at, quote_rejected_at, time_to_send_hours, time_to_view_hours, time_to_decision_hours, conversion_rate, quote_value, quote_version, revision_count, view_count, follow_up_count, created_at, updated_at) FROM stdin;
0f10df05-2129-40d2-bfe6-09e5cebcbe74	92333880-d0fe-4b21-9310-c1af14ecd4c7	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	2025-09-30 19:53:27.425+00	\N	\N	\N	\N	\N	\N	\N	\N	679.11	1	0	0	0	2025-09-30 19:53:27.704921+00	2025-10-01 00:04:43.454222+00
\.


--
-- Data for Name: quote_approval_workflows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_approval_workflows (id, company_id, work_order_id, workflow_name, approval_threshold, current_step, total_steps, overall_status, approver_user_id, approver_role, submitted_at, approved_at, rejected_at, approval_notes, rejection_reason, escalated, escalated_at, escalated_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_approvals (id, work_order_id, company_id, approver_id, approver_role, status, approved_at, rejected_at, decision_notes, auto_approved, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_defaults; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_defaults (id, company_id, default_tax_rate, default_payment_terms, default_deposit_percentage, require_deposit, default_terms_and_conditions, default_warranty_info, default_cancellation_policy, default_quote_expiration_days, auto_send_follow_ups, follow_up_days, require_manager_approval, approval_threshold_amount, created_at, updated_at) FROM stdin;
eaccf244-6a87-4ace-b0f2-f8d517ccdecd	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	0.00	Net 30	\N	f	\N	\N	\N	30	t	{3,7,14}	f	\N	2025-09-29 20:57:36.922195+00	2025-09-29 20:57:36.922195+00
\.


--
-- Data for Name: quote_deliveries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_deliveries (id, company_id, work_order_id, delivery_method, recipient_email, recipient_phone, sent_at, delivered_at, viewed_at, opened_at, pdf_url, portal_link, email_subject, email_body, sms_body, delivery_status, error_message, sent_by, created_at, updated_at) FROM stdin;
07b04a2c-4cbd-4239-a4cf-a031c0a6bdaf	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	92333880-d0fe-4b21-9310-c1af14ecd4c7	email	arliesmith@cgrenewables.com	\N	2025-10-01 02:54:17.585+00	\N	\N	\N	\N	\N	Quote 92333880-d0fe-4b21-9310-c1af14ecd4c7 from Jerry Smith	Hi arlie smith,\n\nPlease review your quote below. You can view it online or in the attached PDF.\n\nThanks!	\N	sent	\N	\N	2025-10-01 02:54:14.872146+00	2025-10-01 02:54:14.872146+00
d05ca109-3ba3-4fd9-9544-b1fce0873c2d	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	92333880-d0fe-4b21-9310-c1af14ecd4c7	email	arliesmith@cgrenewables.com	\N	2025-10-01 03:26:16.17+00	\N	\N	\N	\N	\N	Quote 92333880-d0fe-4b21-9310-c1af14ecd4c7 from Jerry Smith	Hi arlie smith,\n\nPlease review your quote below. You can view it online or in the attached PDF.\n\nThanks!	\N	sent	\N	\N	2025-10-01 03:26:13.409761+00	2025-10-01 03:26:13.409761+00
a0fecb70-25b2-458f-8598-48e288a878fc	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	92333880-d0fe-4b21-9310-c1af14ecd4c7	email	arliesmith@cgrenewables.com	\N	2025-10-01 03:30:14.789+00	\N	\N	\N	\N	\N	Quote 92333880-d0fe-4b21-9310-c1af14ecd4c7 from Jerry Smith	Hi arlie smith,\n\nPlease review your quote below. You can view it online or in the attached PDF.\n\nThanks!	\N	sent	\N	\N	2025-10-01 03:30:11.981274+00	2025-10-01 03:30:11.981274+00
c272b930-eb12-485e-869d-0bebbb75287e	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	92333880-d0fe-4b21-9310-c1af14ecd4c7	email	arliesmith@cgrenewables.com	\N	2025-10-01 03:30:30.575+00	\N	\N	\N	\N	\N	Quote 92333880-d0fe-4b21-9310-c1af14ecd4c7 from Jerry Smith	Hi arlie smith,\n\nPlease review your quote below. You can view it online or in the attached PDF.\n\nThanks!	\N	sent	\N	\N	2025-10-01 03:30:27.790363+00	2025-10-01 03:30:27.790363+00
\.


--
-- Data for Name: quote_follow_ups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_follow_ups (id, work_order_id, company_id, follow_up_type, scheduled_date, completed_date, status, outcome, subject, message, notes, assigned_to, is_automated, attempt_number, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_responses (id, company_id, work_order_id, response_type, rejection_reason, rejection_category, change_request_notes, signature_id, signature_data, responded_by_name, responded_by_email, responded_by_phone, responded_at, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: quote_template_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_template_items (id, template_id, line_type, description, quantity, unit_price, is_optional, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: quote_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_templates (id, company_id, name, description, category, default_pricing_model, default_terms, default_notes, is_active, use_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rate_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rate_cards (id, company_id, service_category_id, service_type_id, name, description, base_rate, unit_type, unit_label, is_active, created_at, updated_at, category, effective_date, expiration_date) FROM stdin;
\.


--
-- Data for Name: recurring_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recurring_schedules (id, company_id, customer_id, title, description, service_type_id, frequency, "interval", day_of_week, day_of_month, start_date, end_date, next_occurrence, assigned_to, price_per_occurrence, is_active, status, occurrences_completed, last_occurrence_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schedule_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schedule_events (id, company_id, work_order_id, user_id, title, description, start_time, end_time, all_day, location, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_address_tax_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_address_tax_rates (id, company_id, address, city, state, zip_code, latitude, longitude, combined_rate, jurisdiction_breakdown, jurisdiction_ids, last_verified, verification_source, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_agreements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_agreements (id, company_id, customer_id, agreement_number, title, description, agreement_type, status, start_date, end_date, auto_renew, renewal_period_months, service_frequency, contract_value, billing_frequency, next_service_date, last_service_date, terms_and_conditions, created_by, created_at, updated_at, renewal_date, cancellation_date, cancellation_reason) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_categories (id, company_id, name, description, icon_url, color, sort_order, is_active, created_at) FROM stdin;
c522bbb7-466c-4a14-a14a-e4ecfa376f86	\N	Plumbing	Plumbing services and repairs	\N	#3b82f6	1	t	2025-09-27 16:29:53.40749+00
e86cdba5-2e31-480d-98c3-3ac3df05336c	\N	Electrical	Electrical installation and repair	\N	#f59e0b	2	t	2025-09-27 16:29:53.40749+00
56e461f8-2575-47dd-9054-0daf485ca1e6	\N	HVAC	Heating, ventilation, and air conditioning	\N	#10b981	3	t	2025-09-27 16:29:53.40749+00
5b9de2e9-cd44-4661-9ef6-dd70115fddc9	\N	General Contracting	General construction and renovation	\N	#8b5cf6	4	t	2025-09-27 16:29:53.40749+00
79a06497-40dd-46a0-a0c3-261a52c7a2ca	\N	Landscaping	Lawn care and landscaping services	\N	#22c55e	5	t	2025-09-27 16:29:53.40749+00
5e5894b4-93ad-4b09-b644-fc1f2de62b4a	\N	Cleaning	Residential and commercial cleaning	\N	#06b6d4	6	t	2025-09-27 16:29:53.40749+00
d788e8c2-124c-484d-9bdc-a79c03b4506b	\N	Roofing	Roof installation and repair	\N	#dc2626	7	t	2025-09-27 16:29:53.40749+00
d4fcca6a-5df8-42d0-8e5f-8b7e19fcf133	\N	Flooring	Flooring installation and refinishing	\N	#92400e	8	t	2025-09-27 16:29:53.40749+00
58aa77cf-d6a5-4a0d-8ebd-a63bf4e49a9e	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	General Contracting	General construction and contracting services	\N	#6b7280	0	t	2025-09-28 21:43:19.0377+00
\.


--
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_types (id, category_id, name, description, base_price, estimated_duration, requires_permit, is_active, created_at) FROM stdin;
d564d49e-6290-4fa6-9a13-66e3422319d3	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	drain cleaning	75.00	2 hours	f	t	2025-09-28 19:52:13.514264+00
7b851481-7fa9-4384-9e23-fd0ffb5388b4	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 21:58:48.812925+00
938be4e8-c604-4a98-899a-35fa15c58f37	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 21:58:49.441293+00
2092e141-31d1-4582-bd87-a1eb9c2f5ae0	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 21:58:50.473929+00
fdee2a2e-f44b-4327-93bf-6763054b645d	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 21:58:50.902876+00
a2da4a1c-6185-4cba-806c-664ce9d24d55	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Emergency Plumbing	24/7 emergency plumbing service	180.00	2 hours	f	t	2025-09-28 21:58:51.335738+00
9d4cd23c-e26c-4882-8d46-f4585f8264b8	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 22:20:50.178118+00
f11cbfbd-92ed-4a4d-b952-e863b548294d	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 22:20:50.443729+00
60f4d9d7-f0f1-4e20-a4cc-e8784f59d6f2	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 22:20:50.881387+00
020535de-9caf-42cd-bd69-730806352caf	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 22:20:51.153204+00
734901ef-c666-4410-84a3-e5ff5a8ace0e	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Emergency Plumbing	24/7 emergency plumbing service	180.00	2 hours	f	t	2025-09-28 22:20:51.536994+00
76fa8058-cd2c-4e4f-a401-654d8db574b4	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 22:32:45.695936+00
6b08d2c1-c9d6-46a1-99cb-86ad13fe4660	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 22:32:46.132106+00
5b8509d8-ea48-49e3-9fea-697344d62fa6	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 22:32:46.467285+00
14a2c151-f1d9-40af-8959-254d3368208f	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 22:32:46.711852+00
2cad67a7-b6a7-41c1-be6c-a5a4f4101f72	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Emergency Plumbing	24/7 emergency plumbing service	180.00	2 hours	f	t	2025-09-28 22:32:47.072319+00
78d01e26-1239-4651-bfcd-6dcf134bba52	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 23:29:53.302746+00
64527c45-ed26-4c22-b977-9cb8c041f279	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 23:29:53.751982+00
d19d469b-5502-4e8e-a1fc-3d836132825e	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 23:29:54.099476+00
20d05a44-eac0-4bbc-b8a5-976490617349	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Emergency Plumbing	24/7 emergency plumbing service	180.00	2 hours	f	t	2025-09-28 23:29:54.950572+00
284a1838-6f4c-4ca2-bd2e-bf56122f2988	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 23:37:00.082471+00
9f9dae42-cd7f-48ef-a038-d23266ce8b91	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 23:37:00.38294+00
46125502-3960-4014-9be7-b543bf57811d	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 23:37:00.834274+00
ec35029f-5fe2-4211-9fee-39606cf08fde	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 23:37:01.141452+00
6385fce4-e777-420e-b225-1589f704c0c2	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	drain cleaning	brief description	75.00	2 hours	f	t	2025-09-28 23:37:33.664937+00
dc673536-170e-4f9a-9a8b-c89c7ca77501	d4fcca6a-5df8-42d0-8e5f-8b7e19fcf133	test	test	100.00	2 hours	f	t	2025-09-28 23:37:48.6678+00
6d82e7f7-afc4-4e4c-92fc-113a606022de	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 23:38:04.278168+00
cf7e8263-25e7-453e-9e3c-a0bdeb333bf3	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 23:38:04.665786+00
3ebd4bee-2c59-4576-a308-127d5109fa5a	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 23:38:05.030734+00
0b596635-957f-4b2f-bfff-74d1d85c7ebb	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 23:38:05.281256+00
823b92a7-4930-417b-9454-b4b807e9e3b3	d4fcca6a-5df8-42d0-8e5f-8b7e19fcf133	custom service test	test	75.00	2 hours	f	t	2025-09-28 23:38:16.532894+00
6dc1d389-2480-462a-875c-d10f87ab3e36	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Leak Repair	Fix residential or commercial leaks	120.00	2 hours	f	t	2025-09-28 23:42:46.87698+00
ef3f9e40-0a93-405d-aec0-7764f37c453c	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Water Heater Install	Standard 40-50 gallon tank install	1200.00	1 day	f	t	2025-09-28 23:42:47.214461+00
38b304c2-69c0-48a8-a644-93ccce25e85a	5e5894b4-93ad-4b09-b644-fc1f2de62b4a	Drain Cleaning	Snaking/jetting services	150.00	2 hours	f	t	2025-09-28 23:42:47.622202+00
a4c81b2c-bdb9-44d0-9c31-8b3d1a17dc68	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Fixture Replacement	Sinks, faucets, toilets	200.00	2 hours	f	t	2025-09-28 23:42:47.859345+00
3417a0bd-c0ee-486b-af9e-71dfb7a55701	5b9de2e9-cd44-4661-9ef6-dd70115fddc9	Emergency Plumbing	24/7 emergency plumbing service	180.00	2 hours	f	t	2025-09-28 23:42:48.153997+00
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, company_id, billing_plan_id, status, current_period_start, current_period_end, trial_end, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tax_exemptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_exemptions (id, customer_id, exemption_type, certificate_number, issuing_state, issuing_authority, issue_date, expiration_date, applies_to, exempt_jurisdictions, document_url, notes, active, verified, verified_at, verified_by, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: tax_jurisdictions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_jurisdictions (id, company_id, name, jurisdiction_type, tax_rate, applies_to, state_code, county_name, city_name, zip_codes, active, effective_date, expiration_date, notes, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: taxes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.taxes (id, company_id, name, tax_type, rate, description, is_active, created_at) FROM stdin;
20580029-7a1f-43e9-bf82-20606ae72da0	\N	Sales Tax	sales_tax	0.0875	Standard sales tax	t	2025-09-27 16:29:53.40749+00
b15849f8-274c-4af1-a770-9364a5ae8fcd	\N	GST	gst	0.0500	Goods and Services Tax	t	2025-09-27 16:29:53.40749+00
c99f36cd-ef59-49fc-bc52-040ab971a76a	\N	HST	hst	0.1300	Harmonized Sales Tax	t	2025-09-27 16:29:53.40749+00
fbd9b55a-4a27-460d-ae8c-5a4d65c7533c	\N	VAT	vat	0.2000	Value Added Tax	t	2025-09-27 16:29:53.40749+00
\.


--
-- Data for Name: tools; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tools (id, company_id, tool_number, name, description, category, manufacturer, model, serial_number, purchase_date, purchase_price, current_value, status, assigned_to, location, maintenance_schedule, last_maintenance, next_maintenance, warranty_expiry, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_activity_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_activity_log (id, user_id, company_id, action_type, description, ip_address, user_agent, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: user_dashboard_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_dashboard_settings (id, user_id, dashboard_config, widget_preferences, layout_settings, theme_settings, notification_preferences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, session_token, device_name, device_type, browser, os, ip_address, user_agent, last_active_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_user_id, company_id, role, status, created_at, updated_at, login_count) FROM stdin;
c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	c797d7b8-9c63-43e3-8d6b-4862e9e8ccd5	\N	APP_OWNER	active	2025-09-28 00:11:22.216545+00	2025-09-28 00:11:22.216545+00	0
44475f47-be87-45ef-b465-2ecbbc0616ea	268b99b5-907d-4b48-ad0e-92cdd4ac388a	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	owner	active	2025-09-28 03:07:00.4793+00	2025-09-28 03:07:00.4793+00	0
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, company_id, vendor_number, name, vendor_type, contact_name, email, phone, website, address_line1, address_line2, city, state_province, postal_code, country, tax_id, payment_terms, credit_limit, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_order_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_attachments (id, work_order_id, file_name, file_url, file_type, file_size, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: work_order_line_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_line_items (id, work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order, created_at, taxable, tax_amount) FROM stdin;
37d7fa93-a7d1-4816-848d-31af7428c0f7	92333880-d0fe-4b21-9310-c1af14ecd4c7	labor	Labor 1	8.000	75.00	0.0000	0	2025-10-01 17:02:20.257632+00	t	\N
aa9adbbf-c15e-43aa-a35d-97510e1732eb	92333880-d0fe-4b21-9310-c1af14ecd4c7	material	test part newest	1.000	22.22	0.0000	1	2025-10-01 17:02:20.257632+00	t	\N
\.


--
-- Data for Name: work_order_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_notes (id, work_order_id, user_id, note_type, content, is_internal, created_at) FROM stdin;
\.


--
-- Data for Name: work_order_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_products (id, company_id, work_order_id, inventory_item_id, product_name, product_sku, quantity_planned, quantity_used, unit_of_measure, unit_cost, unit_price, total_cost, total_price, status, notes, allocated_at, used_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_order_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_services (id, company_id, work_order_id, service_name, service_type_id, description, employee_id, hours_estimated, hours_actual, hourly_rate, total_cost, total_price, status, notes, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_order_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_order_tasks (id, company_id, work_order_id, task_name, description, instructions, assigned_to, status, estimated_duration, actual_duration, started_at, completed_at, sort_order, notes, photos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_orders (id, company_id, work_order_number, customer_id, customer_address_id, service_category_id, service_type_id, status, priority, title, description, scheduled_start, scheduled_end, actual_start, actual_end, assigned_to, created_by, subtotal, tax_amount, total_amount, notes, internal_notes, requires_signature, customer_signature_url, technician_signature_url, completion_photos, created_at, updated_at, customer_feedback, quote_sent_at, quote_viewed_at, quote_expires_at, quote_accepted_at, quote_rejected_at, quote_rejection_reason, quote_terms, quote_notes, quote_version, quote_parent_id, deposit_amount, deposit_percentage, payment_schedule, discount_amount, discount_percentage, payment_terms, estimated_duration_hours, requires_site_visit, urgency_level, service_location_type, terms_and_conditions, warranty_info, cancellation_policy, special_instructions, preferred_start_date, estimated_completion_date, assigned_technician_id, attachment_urls, photo_urls, document_urls, customer_approved_at, customer_signature_data, customer_ip_address, approval_method, estimated_duration, actual_duration, service_location_lat, service_location_lng, time_window_start, time_window_end, customer_equipment_id, pricing_model, labor_summary, flat_rate_amount, unit_count, unit_price, percentage, percentage_base_amount, recurring_interval, service_address_line_1, service_address_line_2, service_city, service_state, service_zip_code, tax_rate, quote_number, customer_notes, has_change_orders, change_orders_total, invoice_sent_at, invoice_viewed_at, paid_at, closed_at, service_address_id, tax_jurisdiction_ids, tax_exempt, tax_exemption_id) FROM stdin;
92333880-d0fe-4b21-9310-c1af14ecd4c7	cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e	Q20250930-125327425-WCS4	daece991-2bc1-446f-bb48-d4eb6c429fc9	\N	\N	\N	approved	normal	hvac install test	install hvac test	\N	\N	\N	\N	\N	\N	627.78	51.79	679.57	internal notes test		t	\N	\N	\N	2025-09-30 19:53:27.425+00	2025-10-01 17:02:19.797603+00	\N	2025-10-01 03:30:30.476+00	\N	\N	\N	\N	\N	Net 30	\N	1	\N	0.00	\N	\N	0.00	\N	Net 30	\N	f	routine	residential	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	TIME_MATERIALS	{"days": 1, "crew_size": 1, "hours_per_day": 8, "regular_hours": 8, "labor_subtotal": 600, "overtime_hours": 0}	\N	\N	\N	\N	\N	\N	123 Main St	\N	Springfield	IL	62701	8.25	Q20250930-125327425-IW2D	visible notes test	f	0.00	\N	\N	\N	\N	\N	\N	f	\N
\.


--
-- Data for Name: work_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_settings (id, company_id, business_hours, default_tax_rate, invoice_terms, auto_invoice, require_signatures, cancellation_fee, travel_charge_per_mile, minimum_travel_charge, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-09-27 15:04:52
20211116045059	2025-09-27 15:04:54
20211116050929	2025-09-27 15:04:56
20211116051442	2025-09-27 15:04:58
20211116212300	2025-09-27 15:05:00
20211116213355	2025-09-27 15:05:02
20211116213934	2025-09-27 15:05:03
20211116214523	2025-09-27 15:05:06
20211122062447	2025-09-27 15:05:07
20211124070109	2025-09-27 15:05:09
20211202204204	2025-09-27 15:05:11
20211202204605	2025-09-27 15:05:13
20211210212804	2025-09-27 15:05:18
20211228014915	2025-09-27 15:05:20
20220107221237	2025-09-27 15:05:22
20220228202821	2025-09-27 15:05:23
20220312004840	2025-09-27 15:05:25
20220603231003	2025-09-27 15:05:28
20220603232444	2025-09-27 15:05:29
20220615214548	2025-09-27 15:05:32
20220712093339	2025-09-27 15:05:33
20220908172859	2025-09-27 15:05:35
20220916233421	2025-09-27 15:05:37
20230119133233	2025-09-27 15:05:38
20230128025114	2025-09-27 15:05:41
20230128025212	2025-09-27 15:05:42
20230227211149	2025-09-27 15:05:44
20230228184745	2025-09-27 15:05:46
20230308225145	2025-09-27 15:05:48
20230328144023	2025-09-27 15:05:49
20231018144023	2025-09-27 15:05:51
20231204144023	2025-09-27 15:05:54
20231204144024	2025-09-27 15:05:56
20231204144025	2025-09-27 15:05:57
20240108234812	2025-09-27 15:05:59
20240109165339	2025-09-27 15:06:01
20240227174441	2025-09-27 15:06:04
20240311171622	2025-09-27 15:06:06
20240321100241	2025-09-27 15:06:10
20240401105812	2025-09-27 15:06:15
20240418121054	2025-09-27 15:06:17
20240523004032	2025-09-27 15:06:24
20240618124746	2025-09-27 15:06:25
20240801235015	2025-09-27 15:06:27
20240805133720	2025-09-27 15:06:29
20240827160934	2025-09-27 15:06:30
20240919163303	2025-09-27 15:06:33
20240919163305	2025-09-27 15:06:34
20241019105805	2025-09-27 15:06:36
20241030150047	2025-09-27 15:06:43
20241108114728	2025-09-27 15:06:45
20241121104152	2025-09-27 15:06:47
20241130184212	2025-09-27 15:06:49
20241220035512	2025-09-27 15:06:51
20241220123912	2025-09-27 15:06:52
20241224161212	2025-09-27 15:06:54
20250107150512	2025-09-27 15:06:56
20250110162412	2025-09-27 15:06:57
20250123174212	2025-09-27 15:06:59
20250128220012	2025-09-27 15:07:01
20250506224012	2025-09-27 15:07:02
20250523164012	2025-09-27 15:07:04
20250714121412	2025-09-27 15:07:06
20250905041441	2025-09-27 15:07:07
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-09-27 15:04:49.050073
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-09-27 15:04:49.055665
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-09-27 15:04:49.058729
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-09-27 15:04:49.080834
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-09-27 15:04:49.133973
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-09-27 15:04:49.136396
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-09-27 15:04:49.139839
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-09-27 15:04:49.142678
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-09-27 15:04:49.145035
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-09-27 15:04:49.148341
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-09-27 15:04:49.153052
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-09-27 15:04:49.156352
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-09-27 15:04:49.163392
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-09-27 15:04:49.167502
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-09-27 15:04:49.170412
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-09-27 15:04:49.18827
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-09-27 15:04:49.191692
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-09-27 15:04:49.194036
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-09-27 15:04:49.197001
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-09-27 15:04:49.200604
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-09-27 15:04:49.203364
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-09-27 15:04:49.208243
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-09-27 15:04:49.222501
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-09-27 15:04:49.233527
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-09-27 15:04:49.236298
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-09-27 15:04:49.239623
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 66, true);


--
-- Name: customer_number_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_number_seq', 10, true);


--
-- Name: global_reference_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.global_reference_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: billing_plans billing_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_name_key UNIQUE (name);


--
-- Name: billing_plans billing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_plans
    ADD CONSTRAINT billing_plans_pkey PRIMARY KEY (id);


--
-- Name: change_order_items change_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_order_items
    ADD CONSTRAINT change_order_items_pkey PRIMARY KEY (id);


--
-- Name: change_orders change_orders_change_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_change_order_number_key UNIQUE (change_order_number);


--
-- Name: change_orders change_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_pkey PRIMARY KEY (id);


--
-- Name: companies companies_company_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_company_number_key UNIQUE (company_number);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_company_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_company_id_unique UNIQUE (company_id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_equipment customer_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_equipment
    ADD CONSTRAINT customer_equipment_pkey PRIMARY KEY (id);


--
-- Name: customer_feedback customer_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback
    ADD CONSTRAINT customer_feedback_pkey PRIMARY KEY (id);


--
-- Name: customer_tag_assignments customer_tag_assignments_customer_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tag_assignments
    ADD CONSTRAINT customer_tag_assignments_customer_id_tag_id_key UNIQUE (customer_id, tag_id);


--
-- Name: customer_tag_assignments customer_tag_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tag_assignments
    ADD CONSTRAINT customer_tag_assignments_pkey PRIMARY KEY (id);


--
-- Name: customer_tags customer_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_name_key UNIQUE (name);


--
-- Name: customer_tags customer_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_pkey PRIMARY KEY (id);


--
-- Name: customers customers_customer_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_number_key UNIQUE (customer_number);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_company_id_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_company_id_type_name_key UNIQUE (company_id, type, name);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_timesheets employee_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_number_key UNIQUE (employee_number);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_sku_key UNIQUE (sku);


--
-- Name: inventory_locations inventory_locations_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_company_id_name_key UNIQUE (company_id, name);


--
-- Name: inventory_locations inventory_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_stock inventory_stock_item_id_location_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_item_id_location_id_key UNIQUE (item_id, location_id);


--
-- Name: inventory_stock inventory_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_pkey PRIMARY KEY (id);


--
-- Name: invoice_deliveries invoice_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_deliveries
    ADD CONSTRAINT invoice_deliveries_pkey PRIMARY KEY (id);


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
-- Name: job_completion_checklist job_completion_checklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_completion_checklist
    ADD CONSTRAINT job_completion_checklist_pkey PRIMARY KEY (id);


--
-- Name: marketplace_messages marketplace_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_pkey PRIMARY KEY (id);


--
-- Name: marketplace_requests marketplace_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_pkey PRIMARY KEY (id);


--
-- Name: marketplace_responses marketplace_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_pkey PRIMARY KEY (id);


--
-- Name: marketplace_settings marketplace_settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_settings
    ADD CONSTRAINT marketplace_settings_company_id_key UNIQUE (company_id);


--
-- Name: marketplace_settings marketplace_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_settings
    ADD CONSTRAINT marketplace_settings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_progress onboarding_progress_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_company_id_key UNIQUE (company_id);


--
-- Name: onboarding_progress onboarding_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_pkey PRIMARY KEY (id);


--
-- Name: payment_deliveries payment_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_deliveries
    ADD CONSTRAINT payment_deliveries_pkey PRIMARY KEY (id);


--
-- Name: payment_settings payment_settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_company_id_key UNIQUE (company_id);


--
-- Name: payment_settings payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payroll_line_items payroll_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_line_items
    ADD CONSTRAINT payroll_line_items_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_line_items purchase_order_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);


--
-- Name: quote_analytics quote_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_pkey PRIMARY KEY (id);


--
-- Name: quote_approval_workflows quote_approval_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_pkey PRIMARY KEY (id);


--
-- Name: quote_approvals quote_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approvals
    ADD CONSTRAINT quote_approvals_pkey PRIMARY KEY (id);


--
-- Name: quote_defaults quote_defaults_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_defaults
    ADD CONSTRAINT quote_defaults_company_id_key UNIQUE (company_id);


--
-- Name: quote_defaults quote_defaults_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_defaults
    ADD CONSTRAINT quote_defaults_pkey PRIMARY KEY (id);


--
-- Name: quote_deliveries quote_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_deliveries
    ADD CONSTRAINT quote_deliveries_pkey PRIMARY KEY (id);


--
-- Name: quote_follow_ups quote_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: quote_responses quote_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_responses
    ADD CONSTRAINT quote_responses_pkey PRIMARY KEY (id);


--
-- Name: quote_template_items quote_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_template_items
    ADD CONSTRAINT quote_template_items_pkey PRIMARY KEY (id);


--
-- Name: quote_templates quote_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);


--
-- Name: rate_cards rate_cards_company_id_service_category_id_service_type_id_n_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_cards
    ADD CONSTRAINT rate_cards_company_id_service_category_id_service_type_id_n_key UNIQUE (company_id, service_category_id, service_type_id, name);


--
-- Name: rate_cards rate_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_cards
    ADD CONSTRAINT rate_cards_pkey PRIMARY KEY (id);


--
-- Name: recurring_schedules recurring_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_schedules
    ADD CONSTRAINT recurring_schedules_pkey PRIMARY KEY (id);


--
-- Name: schedule_events schedule_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);


--
-- Name: service_address_tax_rates service_address_tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_address_tax_rates
    ADD CONSTRAINT service_address_tax_rates_pkey PRIMARY KEY (id);


--
-- Name: service_agreements service_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_agreements
    ADD CONSTRAINT service_agreements_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_company_id_name_key UNIQUE (company_id, name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tax_exemptions tax_exemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_exemptions
    ADD CONSTRAINT tax_exemptions_pkey PRIMARY KEY (id);


--
-- Name: tax_jurisdictions tax_jurisdictions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_jurisdictions
    ADD CONSTRAINT tax_jurisdictions_pkey PRIMARY KEY (id);


--
-- Name: taxes taxes_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_company_id_name_key UNIQUE (company_id, name);


--
-- Name: taxes taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: tools tools_tool_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_tool_number_key UNIQUE (tool_number);


--
-- Name: service_agreements unique_agreement_number_per_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_agreements
    ADD CONSTRAINT unique_agreement_number_per_company UNIQUE (company_id, agreement_number);


--
-- Name: customer_addresses unique_primary_address_per_customer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT unique_primary_address_per_customer EXCLUDE USING btree (customer_id WITH =) WHERE ((is_primary = true));


--
-- Name: user_activity_log user_activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_log
    ADD CONSTRAINT user_activity_log_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_key UNIQUE (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);


--
-- Name: users users_company_id_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_auth_user_id_key UNIQUE (company_id, auth_user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_vendor_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_vendor_number_key UNIQUE (vendor_number);


--
-- Name: work_order_attachments work_order_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_attachments
    ADD CONSTRAINT work_order_attachments_pkey PRIMARY KEY (id);


--
-- Name: work_order_line_items work_order_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_line_items
    ADD CONSTRAINT work_order_line_items_pkey PRIMARY KEY (id);


--
-- Name: work_order_notes work_order_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_notes
    ADD CONSTRAINT work_order_notes_pkey PRIMARY KEY (id);


--
-- Name: work_order_products work_order_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_products
    ADD CONSTRAINT work_order_products_pkey PRIMARY KEY (id);


--
-- Name: work_order_services work_order_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_services
    ADD CONSTRAINT work_order_services_pkey PRIMARY KEY (id);


--
-- Name: work_order_tasks work_order_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_work_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_work_order_number_key UNIQUE (work_order_number);


--
-- Name: work_settings work_settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_settings
    ADD CONSTRAINT work_settings_company_id_key UNIQUE (company_id);


--
-- Name: work_settings work_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_settings
    ADD CONSTRAINT work_settings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_company_id ON public.audit_logs USING btree (company_id);


--
-- Name: idx_audit_logs_company_table; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_company_table ON public.audit_logs USING btree (company_id, table_name);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_record_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_record_id ON public.audit_logs USING btree (record_id);


--
-- Name: idx_audit_logs_table_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs USING btree (table_name);


--
-- Name: idx_audit_logs_user_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_action ON public.audit_logs USING btree (user_id, action);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_change_order_items_change_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_order_items_change_order ON public.change_order_items USING btree (change_order_id);


--
-- Name: idx_change_order_items_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_order_items_company ON public.change_order_items USING btree (company_id);


--
-- Name: idx_change_orders_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_orders_company ON public.change_orders USING btree (company_id);


--
-- Name: idx_change_orders_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_orders_number ON public.change_orders USING btree (change_order_number);


--
-- Name: idx_change_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_orders_status ON public.change_orders USING btree (status);


--
-- Name: idx_change_orders_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_change_orders_work_order ON public.change_orders USING btree (work_order_id);


--
-- Name: idx_customer_addresses_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);


--
-- Name: idx_customer_addresses_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_is_primary ON public.customer_addresses USING btree (is_primary);


--
-- Name: idx_customer_addresses_postal_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_postal_code ON public.customer_addresses USING btree (zip_code);


--
-- Name: idx_customer_addresses_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_type ON public.customer_addresses USING btree (address_type);


--
-- Name: idx_customer_equipment_address; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_equipment_address ON public.customer_equipment USING btree (customer_address_id);


--
-- Name: idx_customer_equipment_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_equipment_customer ON public.customer_equipment USING btree (customer_id);


--
-- Name: idx_customer_feedback_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_feedback_company ON public.customer_feedback USING btree (company_id);


--
-- Name: idx_customer_feedback_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_feedback_customer ON public.customer_feedback USING btree (customer_id);


--
-- Name: idx_customer_feedback_overall_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_feedback_overall_rating ON public.customer_feedback USING btree (overall_rating);


--
-- Name: idx_customer_feedback_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_feedback_work_order ON public.customer_feedback USING btree (work_order_id);


--
-- Name: idx_customer_tag_assignments_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_tag_assignments_customer_id ON public.customer_tag_assignments USING btree (customer_id);


--
-- Name: idx_customer_tag_assignments_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_tag_assignments_tag_id ON public.customer_tag_assignments USING btree (tag_id);


--
-- Name: idx_customer_tags_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_tags_company_id ON public.customer_tags USING btree (company_id);


--
-- Name: idx_customers_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_company ON public.customers USING btree (company_id);


--
-- Name: idx_customers_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_company_id ON public.customers USING btree (company_id);


--
-- Name: idx_customers_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at);


--
-- Name: idx_customers_customer_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_customer_number ON public.customers USING btree (customer_number);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);


--
-- Name: idx_customers_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_type ON public.customers USING btree (type);


--
-- Name: idx_customers_with_tags_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_with_tags_company_id ON public.customers USING btree (company_id);


--
-- Name: idx_employees_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_company_id ON public.employees USING btree (company_id);


--
-- Name: idx_employees_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employees_user_id ON public.employees USING btree (user_id);


--
-- Name: idx_expenses_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_company_id ON public.expenses USING btree (company_id);


--
-- Name: idx_expenses_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_employee_id ON public.expenses USING btree (employee_id);


--
-- Name: idx_expenses_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_work_order_id ON public.expenses USING btree (work_order_id);


--
-- Name: idx_inventory_items_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_company_id ON public.inventory_items USING btree (company_id);


--
-- Name: idx_inventory_items_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_sku ON public.inventory_items USING btree (sku);


--
-- Name: idx_inventory_stock_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_stock_item_id ON public.inventory_stock USING btree (item_id);


--
-- Name: idx_inventory_stock_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_stock_location_id ON public.inventory_stock USING btree (location_id);


--
-- Name: idx_invoice_deliveries_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_deliveries_company ON public.invoice_deliveries USING btree (company_id);


--
-- Name: idx_invoice_deliveries_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_deliveries_invoice ON public.invoice_deliveries USING btree (invoice_id);


--
-- Name: idx_invoice_deliveries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_deliveries_status ON public.invoice_deliveries USING btree (delivery_status);


--
-- Name: idx_invoices_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_company_id ON public.invoices USING btree (company_id);


--
-- Name: idx_invoices_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_created_at ON public.invoices USING btree (created_at);


--
-- Name: idx_invoices_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_customer_id ON public.invoices USING btree (customer_id);


--
-- Name: idx_invoices_customer_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_customer_status ON public.invoices USING btree (customer_id, status);


--
-- Name: idx_invoices_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);


--
-- Name: idx_invoices_due_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_due_status ON public.invoices USING btree (due_date, status);


--
-- Name: idx_invoices_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_invoice_number ON public.invoices USING btree (invoice_number);


--
-- Name: idx_invoices_issue_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_issue_date ON public.invoices USING btree (issue_date);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_invoices_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_work_order_id ON public.invoices USING btree (work_order_id);


--
-- Name: idx_job_completion_checklist_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_completion_checklist_company ON public.job_completion_checklist USING btree (company_id);


--
-- Name: idx_job_completion_checklist_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_completion_checklist_work_order ON public.job_completion_checklist USING btree (work_order_id);


--
-- Name: idx_marketplace_messages_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_messages_request ON public.marketplace_messages USING btree (request_id);


--
-- Name: idx_marketplace_requests_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_requests_customer ON public.marketplace_requests USING btree (customer_id);


--
-- Name: idx_marketplace_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_requests_status ON public.marketplace_requests USING btree (status);


--
-- Name: idx_marketplace_responses_contractor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_responses_contractor ON public.marketplace_responses USING btree (contractor_company_id);


--
-- Name: idx_marketplace_responses_request; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_responses_request ON public.marketplace_responses USING btree (request_id);


--
-- Name: idx_messages_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_company_id ON public.messages USING btree (company_id);


--
-- Name: idx_messages_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_customer_id ON public.messages USING btree (customer_id);


--
-- Name: idx_messages_message_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_message_type ON public.messages USING btree (message_type);


--
-- Name: idx_messages_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sent_at ON public.messages USING btree (sent_at);


--
-- Name: idx_messages_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_work_order_id ON public.messages USING btree (work_order_id);


--
-- Name: idx_notifications_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_company_id ON public.notifications USING btree (company_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_scheduled_for; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_scheduled_for ON public.notifications USING btree (scheduled_for);


--
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_payment_deliveries_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_deliveries_company ON public.payment_deliveries USING btree (company_id);


--
-- Name: idx_payment_deliveries_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_deliveries_payment ON public.payment_deliveries USING btree (payment_id);


--
-- Name: idx_payments_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_company_id ON public.payments USING btree (company_id);


--
-- Name: idx_payments_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_customer_id ON public.payments USING btree (customer_id);


--
-- Name: idx_payments_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_invoice_id ON public.payments USING btree (invoice_id);


--
-- Name: idx_payments_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_payment_date ON public.payments USING btree (payment_date);


--
-- Name: idx_payments_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_payment_method ON public.payments USING btree (payment_method);


--
-- Name: idx_payments_received_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_received_at ON public.payments USING btree (received_at);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_profiles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_name ON public.profiles USING btree (first_name, last_name);


--
-- Name: idx_profiles_name_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_name_lower ON public.profiles USING btree (lower(name));


--
-- Name: idx_profiles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_status ON public.profiles USING btree (status);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: idx_purchase_orders_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_company_id ON public.purchase_orders USING btree (company_id);


--
-- Name: idx_purchase_orders_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_vendor_id ON public.purchase_orders USING btree (vendor_id);


--
-- Name: idx_quote_analytics_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_analytics_company ON public.quote_analytics USING btree (company_id);


--
-- Name: idx_quote_analytics_conversion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_analytics_conversion ON public.quote_analytics USING btree (conversion_rate) WHERE (conversion_rate IS NOT NULL);


--
-- Name: idx_quote_analytics_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_analytics_work_order ON public.quote_analytics USING btree (work_order_id);


--
-- Name: idx_quote_approval_workflows_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_approval_workflows_company_id ON public.quote_approval_workflows USING btree (company_id);


--
-- Name: idx_quote_approvals_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_approvals_company ON public.quote_approvals USING btree (company_id);


--
-- Name: idx_quote_approvals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_approvals_status ON public.quote_approvals USING btree (status) WHERE (status = 'PENDING'::text);


--
-- Name: idx_quote_approvals_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_approvals_work_order ON public.quote_approvals USING btree (work_order_id);


--
-- Name: idx_quote_defaults_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_defaults_company ON public.quote_defaults USING btree (company_id);


--
-- Name: idx_quote_deliveries_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_deliveries_company ON public.quote_deliveries USING btree (company_id);


--
-- Name: idx_quote_deliveries_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_deliveries_sent_at ON public.quote_deliveries USING btree (sent_at);


--
-- Name: idx_quote_deliveries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_deliveries_status ON public.quote_deliveries USING btree (delivery_status);


--
-- Name: idx_quote_deliveries_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_deliveries_work_order ON public.quote_deliveries USING btree (work_order_id);


--
-- Name: idx_quote_follow_ups_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_follow_ups_assigned ON public.quote_follow_ups USING btree (assigned_to) WHERE (assigned_to IS NOT NULL);


--
-- Name: idx_quote_follow_ups_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_follow_ups_company ON public.quote_follow_ups USING btree (company_id);


--
-- Name: idx_quote_follow_ups_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_follow_ups_scheduled ON public.quote_follow_ups USING btree (scheduled_date) WHERE (status = 'SCHEDULED'::text);


--
-- Name: idx_quote_follow_ups_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_follow_ups_work_order ON public.quote_follow_ups USING btree (work_order_id);


--
-- Name: idx_quote_responses_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_responses_company ON public.quote_responses USING btree (company_id);


--
-- Name: idx_quote_responses_responded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_responses_responded_at ON public.quote_responses USING btree (responded_at);


--
-- Name: idx_quote_responses_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_responses_type ON public.quote_responses USING btree (response_type);


--
-- Name: idx_quote_responses_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_responses_work_order ON public.quote_responses USING btree (work_order_id);


--
-- Name: idx_quote_template_items_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_template_items_template ON public.quote_template_items USING btree (template_id);


--
-- Name: idx_quote_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_templates_active ON public.quote_templates USING btree (company_id, is_active) WHERE (is_active = true);


--
-- Name: idx_quote_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_templates_category ON public.quote_templates USING btree (category);


--
-- Name: idx_quote_templates_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_templates_company ON public.quote_templates USING btree (company_id);


--
-- Name: idx_rate_cards_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_cards_active ON public.rate_cards USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_rate_cards_active_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_cards_active_dates ON public.rate_cards USING btree (company_id, is_active, effective_date, expiration_date) WHERE (is_active = true);


--
-- Name: idx_rate_cards_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_cards_category ON public.rate_cards USING btree (category);


--
-- Name: idx_rate_cards_company_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_cards_company_active ON public.rate_cards USING btree (company_id, is_active) WHERE (is_active = true);


--
-- Name: idx_rate_cards_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rate_cards_company_id ON public.rate_cards USING btree (company_id);


--
-- Name: idx_recurring_schedules_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_schedules_customer ON public.recurring_schedules USING btree (customer_id);


--
-- Name: idx_recurring_schedules_next_occurrence; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_schedules_next_occurrence ON public.recurring_schedules USING btree (next_occurrence) WHERE (is_active = true);


--
-- Name: idx_schedule_events_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_company_id ON public.schedule_events USING btree (company_id);


--
-- Name: idx_schedule_events_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_start_time ON public.schedule_events USING btree (start_time);


--
-- Name: idx_schedule_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_user_id ON public.schedule_events USING btree (user_id);


--
-- Name: idx_schedule_events_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_work_order_id ON public.schedule_events USING btree (work_order_id);


--
-- Name: idx_service_address_tax_rates_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_address_tax_rates_company ON public.service_address_tax_rates USING btree (company_id);


--
-- Name: idx_service_address_tax_rates_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_address_tax_rates_location ON public.service_address_tax_rates USING btree (latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));


--
-- Name: idx_service_address_tax_rates_zip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_address_tax_rates_zip ON public.service_address_tax_rates USING btree (zip_code);


--
-- Name: idx_service_agreements_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_agreements_company_id ON public.service_agreements USING btree (company_id);


--
-- Name: idx_service_agreements_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_agreements_customer_id ON public.service_agreements USING btree (customer_id);


--
-- Name: idx_service_agreements_next_service_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_agreements_next_service_date ON public.service_agreements USING btree (next_service_date);


--
-- Name: idx_service_agreements_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_agreements_status ON public.service_agreements USING btree (status);


--
-- Name: idx_tax_exemptions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_exemptions_active ON public.tax_exemptions USING btree (active) WHERE (active = true);


--
-- Name: idx_tax_exemptions_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_exemptions_customer ON public.tax_exemptions USING btree (customer_id);


--
-- Name: idx_tax_exemptions_expiring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_exemptions_expiring ON public.tax_exemptions USING btree (expiration_date) WHERE ((active = true) AND (expiration_date IS NOT NULL));


--
-- Name: idx_tax_jurisdictions_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_jurisdictions_active ON public.tax_jurisdictions USING btree (active) WHERE (active = true);


--
-- Name: idx_tax_jurisdictions_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_jurisdictions_company ON public.tax_jurisdictions USING btree (company_id);


--
-- Name: idx_tax_jurisdictions_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_jurisdictions_state ON public.tax_jurisdictions USING btree (state_code) WHERE (state_code IS NOT NULL);


--
-- Name: idx_tax_jurisdictions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tax_jurisdictions_type ON public.tax_jurisdictions USING btree (jurisdiction_type);


--
-- Name: idx_tools_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tools_assigned_to ON public.tools USING btree (assigned_to);


--
-- Name: idx_tools_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tools_company_id ON public.tools USING btree (company_id);


--
-- Name: idx_tools_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tools_status ON public.tools USING btree (status);


--
-- Name: idx_user_activity_log_action_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_action_type ON public.user_activity_log USING btree (action_type);


--
-- Name: idx_user_activity_log_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_company_id ON public.user_activity_log USING btree (company_id, created_at DESC);


--
-- Name: idx_user_activity_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log USING btree (user_id, created_at DESC);


--
-- Name: idx_user_dashboard_settings_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_dashboard_settings_user_id ON public.user_dashboard_settings USING btree (user_id);


--
-- Name: idx_user_sessions_last_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_last_active ON public.user_sessions USING btree (last_active_at DESC);


--
-- Name: idx_user_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_token ON public.user_sessions USING btree (session_token);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_auth_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_auth_user_id ON public.users USING btree (auth_user_id);


--
-- Name: idx_users_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_company_id ON public.users USING btree (company_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_vendors_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendors_company_id ON public.vendors USING btree (company_id);


--
-- Name: idx_work_order_line_items_taxable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_line_items_taxable ON public.work_order_line_items USING btree (taxable);


--
-- Name: idx_work_order_line_items_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_line_items_work_order_id ON public.work_order_line_items USING btree (work_order_id);


--
-- Name: idx_work_order_products_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_products_work_order ON public.work_order_products USING btree (work_order_id);


--
-- Name: idx_work_order_services_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_services_work_order ON public.work_order_services USING btree (work_order_id);


--
-- Name: idx_work_order_tasks_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_tasks_work_order ON public.work_order_tasks USING btree (work_order_id);


--
-- Name: idx_work_orders_assigned_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_assigned_status ON public.work_orders USING btree (assigned_to, status);


--
-- Name: idx_work_orders_assigned_technician; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_assigned_technician ON public.work_orders USING btree (assigned_technician_id) WHERE (assigned_technician_id IS NOT NULL);


--
-- Name: idx_work_orders_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_assigned_to ON public.work_orders USING btree (assigned_to);


--
-- Name: idx_work_orders_closed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_closed_at ON public.work_orders USING btree (closed_at);


--
-- Name: idx_work_orders_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_company_id ON public.work_orders USING btree (company_id);


--
-- Name: idx_work_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_created_at ON public.work_orders USING btree (created_at);


--
-- Name: idx_work_orders_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_created_by ON public.work_orders USING btree (created_by);


--
-- Name: idx_work_orders_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_customer ON public.work_orders USING btree (customer_id, status);


--
-- Name: idx_work_orders_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_customer_id ON public.work_orders USING btree (customer_id);


--
-- Name: idx_work_orders_customer_notes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_customer_notes ON public.work_orders USING btree (company_id) WHERE (customer_notes IS NOT NULL);


--
-- Name: idx_work_orders_customer_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_customer_status ON public.work_orders USING btree (customer_id, status);


--
-- Name: idx_work_orders_notes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_notes ON public.work_orders USING btree (company_id) WHERE (notes IS NOT NULL);


--
-- Name: idx_work_orders_paid_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_paid_at ON public.work_orders USING btree (paid_at);


--
-- Name: idx_work_orders_preferred_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_preferred_start ON public.work_orders USING btree (preferred_start_date) WHERE (preferred_start_date IS NOT NULL);


--
-- Name: idx_work_orders_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_priority ON public.work_orders USING btree (priority);


--
-- Name: idx_work_orders_quote_accepted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_accepted_at ON public.work_orders USING btree (quote_accepted_at);


--
-- Name: idx_work_orders_quote_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_expires ON public.work_orders USING btree (quote_expires_at) WHERE (quote_expires_at IS NOT NULL);


--
-- Name: idx_work_orders_quote_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_number ON public.work_orders USING btree (quote_number);


--
-- Name: idx_work_orders_quote_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_parent ON public.work_orders USING btree (quote_parent_id) WHERE (quote_parent_id IS NOT NULL);


--
-- Name: idx_work_orders_quote_sent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_sent ON public.work_orders USING btree (quote_sent_at) WHERE (quote_sent_at IS NOT NULL);


--
-- Name: idx_work_orders_quote_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_sent_at ON public.work_orders USING btree (quote_sent_at);


--
-- Name: idx_work_orders_quote_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_quote_version ON public.work_orders USING btree (quote_version);


--
-- Name: idx_work_orders_scheduled_end; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_scheduled_end ON public.work_orders USING btree (scheduled_end);


--
-- Name: idx_work_orders_scheduled_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_scheduled_start ON public.work_orders USING btree (scheduled_start);


--
-- Name: idx_work_orders_service_address; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_service_address ON public.work_orders USING btree (service_address_id) WHERE (service_address_id IS NOT NULL);


--
-- Name: idx_work_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);


--
-- Name: idx_work_orders_tax_exempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_tax_exempt ON public.work_orders USING btree (tax_exempt) WHERE (tax_exempt = true);


--
-- Name: idx_work_orders_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_updated_at ON public.work_orders USING btree (updated_at);


--
-- Name: idx_work_orders_work_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_work_order_number ON public.work_orders USING btree (work_order_number);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: customers_summary _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.customers_summary AS
 SELECT c.id,
    c.customer_number,
    c.type,
        CASE
            WHEN (c.company_name IS NOT NULL) THEN c.company_name
            ELSE ((c.first_name || ' '::text) || c.last_name)
        END AS display_name,
    c.email,
    c.phone,
    ((((ca.address_line_1 || ', '::text) || ca.city) || ', '::text) || ca.state) AS primary_address,
    count(wo.id) AS total_work_orders,
    COALESCE(sum(wo.total_amount), (0)::numeric) AS total_revenue,
    max(wo.created_at) AS last_service_date,
    c.created_at,
    c.is_active
   FROM ((public.customers c
     LEFT JOIN public.customer_addresses ca ON (((c.id = ca.customer_id) AND (ca.is_primary = true))))
     LEFT JOIN public.work_orders wo ON ((c.id = wo.customer_id)))
  GROUP BY c.id, ca.address_line_1, ca.city, ca.state;


--
-- Name: invoices trg_auto_invoice_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auto_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.auto_generate_invoice_number();


--
-- Name: companies trigger_set_company_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_company_number BEFORE INSERT ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_company_number();


--
-- Name: profiles trigger_update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();


--
-- Name: user_dashboard_settings trigger_user_dashboard_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_user_dashboard_settings_updated_at BEFORE UPDATE ON public.user_dashboard_settings FOR EACH ROW EXECUTE FUNCTION public.update_user_dashboard_settings_updated_at();


--
-- Name: companies update_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_settings update_company_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customer_addresses update_customer_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customer_equipment update_customer_equipment_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customer_equipment_updated_at BEFORE UPDATE ON public.customer_equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employee_timesheets update_employee_timesheets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_employee_timesheets_updated_at BEFORE UPDATE ON public.employee_timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employees update_employees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_items update_inventory_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_stock update_inventory_stock_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON public.inventory_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketplace_requests update_marketplace_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketplace_requests_updated_at BEFORE UPDATE ON public.marketplace_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketplace_responses update_marketplace_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketplace_responses_updated_at BEFORE UPDATE ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payroll_runs update_payroll_runs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON public.payroll_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: purchase_orders update_purchase_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rate_cards update_rate_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_rate_cards_updated_at BEFORE UPDATE ON public.rate_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recurring_schedules update_recurring_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recurring_schedules_updated_at BEFORE UPDATE ON public.recurring_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schedule_events update_schedule_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_schedule_events_updated_at BEFORE UPDATE ON public.schedule_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_address_tax_rates update_service_address_tax_rates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_address_tax_rates_updated_at BEFORE UPDATE ON public.service_address_tax_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_agreements update_service_agreements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_agreements_updated_at BEFORE UPDATE ON public.service_agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tax_exemptions update_tax_exemptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tax_exemptions_updated_at BEFORE UPDATE ON public.tax_exemptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tax_jurisdictions update_tax_jurisdictions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tax_jurisdictions_updated_at BEFORE UPDATE ON public.tax_jurisdictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tools update_tools_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendors update_vendors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_order_products update_work_order_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_order_products_updated_at BEFORE UPDATE ON public.work_order_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_order_services update_work_order_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_order_services_updated_at BEFORE UPDATE ON public.work_order_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_order_tasks update_work_order_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_order_tasks_updated_at BEFORE UPDATE ON public.work_order_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_orders update_work_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: change_order_items change_order_items_change_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_order_items
    ADD CONSTRAINT change_order_items_change_order_id_fkey FOREIGN KEY (change_order_id) REFERENCES public.change_orders(id) ON DELETE CASCADE;


--
-- Name: change_order_items change_order_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_order_items
    ADD CONSTRAINT change_order_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: change_orders change_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: change_orders change_orders_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.profiles(id);


--
-- Name: change_orders change_orders_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_orders
    ADD CONSTRAINT change_orders_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: companies companies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: company_settings company_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_equipment customer_equipment_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_equipment
    ADD CONSTRAINT customer_equipment_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_equipment customer_equipment_customer_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_equipment
    ADD CONSTRAINT customer_equipment_customer_address_id_fkey FOREIGN KEY (customer_address_id) REFERENCES public.customer_addresses(id);


--
-- Name: customer_equipment customer_equipment_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_equipment
    ADD CONSTRAINT customer_equipment_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_equipment customer_equipment_installed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_equipment
    ADD CONSTRAINT customer_equipment_installed_by_fkey FOREIGN KEY (installed_by) REFERENCES public.employees(id);


--
-- Name: customer_feedback customer_feedback_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback
    ADD CONSTRAINT customer_feedback_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_feedback customer_feedback_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback
    ADD CONSTRAINT customer_feedback_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_feedback customer_feedback_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback
    ADD CONSTRAINT customer_feedback_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: customer_tag_assignments customer_tag_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tag_assignments
    ADD CONSTRAINT customer_tag_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: customer_tag_assignments customer_tag_assignments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tag_assignments
    ADD CONSTRAINT customer_tag_assignments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_tag_assignments customer_tag_assignments_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tag_assignments
    ADD CONSTRAINT customer_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.customer_tags(id) ON DELETE CASCADE;


--
-- Name: customer_tags customer_tags_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: document_templates document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: documents documents_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: documents documents_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_timesheets employee_timesheets_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id);


--
-- Name: expenses expenses_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: users fk_users_company; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_locations inventory_locations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: inventory_movements inventory_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: inventory_stock inventory_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_last_counted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_last_counted_by_fkey FOREIGN KEY (last_counted_by) REFERENCES public.users(id);


--
-- Name: inventory_stock inventory_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id) ON DELETE CASCADE;


--
-- Name: invoice_deliveries invoice_deliveries_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_deliveries
    ADD CONSTRAINT invoice_deliveries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoice_deliveries invoice_deliveries_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_deliveries
    ADD CONSTRAINT invoice_deliveries_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_deliveries invoice_deliveries_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_deliveries
    ADD CONSTRAINT invoice_deliveries_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.profiles(id);


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: job_completion_checklist job_completion_checklist_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_completion_checklist
    ADD CONSTRAINT job_completion_checklist_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: job_completion_checklist job_completion_checklist_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_completion_checklist
    ADD CONSTRAINT job_completion_checklist_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.profiles(id);


--
-- Name: job_completion_checklist job_completion_checklist_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_completion_checklist
    ADD CONSTRAINT job_completion_checklist_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: marketplace_messages marketplace_messages_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_messages marketplace_messages_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.marketplace_responses(id) ON DELETE CASCADE;


--
-- Name: marketplace_messages marketplace_messages_sender_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_sender_company_id_fkey FOREIGN KEY (sender_company_id) REFERENCES public.companies(id);


--
-- Name: marketplace_messages marketplace_messages_sender_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES public.profiles(id);


--
-- Name: marketplace_requests marketplace_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_requests marketplace_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: marketplace_requests marketplace_requests_service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id);


--
-- Name: marketplace_requests marketplace_requests_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: marketplace_responses marketplace_responses_contractor_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_contractor_company_id_fkey FOREIGN KEY (contractor_company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_responses marketplace_responses_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_settings marketplace_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_settings
    ADD CONSTRAINT marketplace_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: messages messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: messages messages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: messages messages_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: onboarding_progress onboarding_progress_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_progress
    ADD CONSTRAINT onboarding_progress_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payment_deliveries payment_deliveries_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_deliveries
    ADD CONSTRAINT payment_deliveries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payment_deliveries payment_deliveries_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_deliveries
    ADD CONSTRAINT payment_deliveries_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE;


--
-- Name: payment_settings payment_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payment_settings payment_settings_invoice_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_invoice_template_id_fkey FOREIGN KEY (invoice_template_id) REFERENCES public.document_templates(id);


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payments payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: payroll_line_items payroll_line_items_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_line_items
    ADD CONSTRAINT payroll_line_items_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payroll_line_items payroll_line_items_payroll_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_line_items
    ADD CONSTRAINT payroll_line_items_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) ON DELETE CASCADE;


--
-- Name: payroll_runs payroll_runs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payroll_runs payroll_runs_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: profiles profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: purchase_order_line_items purchase_order_line_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id);


--
-- Name: purchase_order_line_items purchase_order_line_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: purchase_orders purchase_orders_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id);


--
-- Name: quote_analytics quote_analytics_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_analytics quote_analytics_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_approval_workflows quote_approval_workflows_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.profiles(id);


--
-- Name: quote_approval_workflows quote_approval_workflows_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_approval_workflows quote_approval_workflows_escalated_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_escalated_to_fkey FOREIGN KEY (escalated_to) REFERENCES public.profiles(id);


--
-- Name: quote_approval_workflows quote_approval_workflows_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_approvals quote_approvals_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approvals
    ADD CONSTRAINT quote_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: quote_approvals quote_approvals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approvals
    ADD CONSTRAINT quote_approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_approvals quote_approvals_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approvals
    ADD CONSTRAINT quote_approvals_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_defaults quote_defaults_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_defaults
    ADD CONSTRAINT quote_defaults_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_deliveries quote_deliveries_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_deliveries
    ADD CONSTRAINT quote_deliveries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_deliveries quote_deliveries_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_deliveries
    ADD CONSTRAINT quote_deliveries_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.profiles(id);


--
-- Name: quote_deliveries quote_deliveries_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_deliveries
    ADD CONSTRAINT quote_deliveries_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_follow_ups quote_follow_ups_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: quote_follow_ups quote_follow_ups_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_follow_ups quote_follow_ups_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_responses quote_responses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_responses
    ADD CONSTRAINT quote_responses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_responses quote_responses_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_responses
    ADD CONSTRAINT quote_responses_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_template_items quote_template_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_template_items
    ADD CONSTRAINT quote_template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.quote_templates(id) ON DELETE CASCADE;


--
-- Name: quote_templates quote_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_templates quote_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: rate_cards rate_cards_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_cards
    ADD CONSTRAINT rate_cards_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: rate_cards rate_cards_service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_cards
    ADD CONSTRAINT rate_cards_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id);


--
-- Name: rate_cards rate_cards_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_cards
    ADD CONSTRAINT rate_cards_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: recurring_schedules recurring_schedules_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_schedules
    ADD CONSTRAINT recurring_schedules_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: recurring_schedules recurring_schedules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_schedules
    ADD CONSTRAINT recurring_schedules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: recurring_schedules recurring_schedules_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_schedules
    ADD CONSTRAINT recurring_schedules_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: recurring_schedules recurring_schedules_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_schedules
    ADD CONSTRAINT recurring_schedules_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: schedule_events schedule_events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: schedule_events schedule_events_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: service_address_tax_rates service_address_tax_rates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_address_tax_rates
    ADD CONSTRAINT service_address_tax_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_agreements service_agreements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_agreements
    ADD CONSTRAINT service_agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_agreements service_agreements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_agreements
    ADD CONSTRAINT service_agreements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: service_agreements service_agreements_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_agreements
    ADD CONSTRAINT service_agreements_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: service_categories service_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_types service_types_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_billing_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_billing_plan_id_fkey FOREIGN KEY (billing_plan_id) REFERENCES public.billing_plans(id);


--
-- Name: subscriptions subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: tax_exemptions tax_exemptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_exemptions
    ADD CONSTRAINT tax_exemptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tax_exemptions tax_exemptions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_exemptions
    ADD CONSTRAINT tax_exemptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: tax_exemptions tax_exemptions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_exemptions
    ADD CONSTRAINT tax_exemptions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id);


--
-- Name: tax_jurisdictions tax_jurisdictions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_jurisdictions
    ADD CONSTRAINT tax_jurisdictions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: tax_jurisdictions tax_jurisdictions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_jurisdictions
    ADD CONSTRAINT tax_jurisdictions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: taxes taxes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxes
    ADD CONSTRAINT taxes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: tools tools_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tools tools_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_activity_log user_activity_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_log
    ADD CONSTRAINT user_activity_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_activity_log user_activity_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity_log
    ADD CONSTRAINT user_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_attachments work_order_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_attachments
    ADD CONSTRAINT work_order_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: work_order_attachments work_order_attachments_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_attachments
    ADD CONSTRAINT work_order_attachments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_line_items work_order_line_items_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_line_items
    ADD CONSTRAINT work_order_line_items_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_notes work_order_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_notes
    ADD CONSTRAINT work_order_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: work_order_notes work_order_notes_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_notes
    ADD CONSTRAINT work_order_notes_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_products work_order_products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_products
    ADD CONSTRAINT work_order_products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_products work_order_products_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_products
    ADD CONSTRAINT work_order_products_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id);


--
-- Name: work_order_products work_order_products_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_products
    ADD CONSTRAINT work_order_products_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_services work_order_services_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_services
    ADD CONSTRAINT work_order_services_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_services work_order_services_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_services
    ADD CONSTRAINT work_order_services_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: work_order_services work_order_services_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_services
    ADD CONSTRAINT work_order_services_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: work_order_services work_order_services_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_services
    ADD CONSTRAINT work_order_services_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_tasks work_order_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: work_order_tasks work_order_tasks_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_tasks work_order_tasks_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_tasks
    ADD CONSTRAINT work_order_tasks_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_assigned_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_technician_id_fkey FOREIGN KEY (assigned_technician_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: work_orders work_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: work_orders work_orders_customer_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_address_id_fkey FOREIGN KEY (customer_address_id) REFERENCES public.customer_addresses(id);


--
-- Name: work_orders work_orders_customer_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_equipment_id_fkey FOREIGN KEY (customer_equipment_id) REFERENCES public.customer_equipment(id);


--
-- Name: work_orders work_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: work_orders work_orders_quote_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_quote_parent_id_fkey FOREIGN KEY (quote_parent_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_service_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES public.service_address_tax_rates(id);


--
-- Name: work_orders work_orders_service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_service_category_id_fkey FOREIGN KEY (service_category_id) REFERENCES public.service_categories(id);


--
-- Name: work_orders work_orders_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id);


--
-- Name: work_orders work_orders_tax_exemption_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_tax_exemption_id_fkey FOREIGN KEY (tax_exemption_id) REFERENCES public.tax_exemptions(id);


--
-- Name: work_settings work_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_settings
    ADD CONSTRAINT work_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions Users can delete their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions FOR DELETE USING ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = user_sessions.user_id))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = profiles.user_id))));


--
-- Name: service_agreements Users can manage service agreements for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage service agreements for their company" ON public.service_agreements TO authenticated USING ((company_id = ( SELECT profiles.company_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = profiles.user_id)))) WITH CHECK ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = profiles.user_id))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = profiles.user_id))));


--
-- Name: user_activity_log Users can view their own activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own activity" ON public.user_activity_log FOR SELECT USING ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = user_activity_log.user_id))));


--
-- Name: user_sessions Users can view their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING ((auth.uid() IN ( SELECT users.auth_user_id
   FROM public.users
  WHERE (users.id = user_sessions.user_id))));


--
-- Name: profiles app_owner_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_owner_bypass ON public.profiles USING ((auth.role() = 'APP_OWNER'::text));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: service_agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_agreements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_activity_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict 8cvkHmJo22z6X7bJYkVu9MFUKQPe66WFxdCcd6hTQf9vUxOkvLEPQtlkkXpbzVP

