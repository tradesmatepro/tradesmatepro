--
-- PostgreSQL database dump
--

\restrict CmdlgybkmQg6lcP48Rxo0OkwxQ1ee67Y8CvNTVh4JmRJNfUBy44doeLyHLHWNn5

-- Dumped from database version 17.4
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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: legacy_archive; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA legacy_archive;


ALTER SCHEMA legacy_archive OWNER TO postgres;

--
-- Name: SCHEMA legacy_archive; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA legacy_archive IS 'Stores archived copies of deprecated tables to avoid accidental use in the app.';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: communication_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.communication_type_enum AS ENUM (
    'CALL',
    'EMAIL',
    'MEETING',
    'NOTE'
);


ALTER TYPE public.communication_type_enum OWNER TO postgres;

--
-- Name: company_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.company_status_enum OWNER TO postgres;

--
-- Name: customer_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.customer_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.customer_status_enum OWNER TO postgres;

--
-- Name: inventory_movement_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_movement_type_enum AS ENUM (
    'IN',
    'OUT',
    'TRANSFER',
    'ADJUSTMENT'
);


ALTER TYPE public.inventory_movement_type_enum OWNER TO postgres;

--
-- Name: invoice_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invoice_status_enum AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'VOID'
);


ALTER TYPE public.invoice_status_enum OWNER TO postgres;

--
-- Name: lead_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.lead_status_enum AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'LOST',
    'CONVERTED'
);


ALTER TYPE public.lead_status_enum OWNER TO postgres;

--
-- Name: message_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.message_status_enum AS ENUM (
    'SENT',
    'DELIVERED',
    'READ'
);


ALTER TYPE public.message_status_enum OWNER TO postgres;

--
-- Name: opportunity_stage_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.opportunity_stage_enum AS ENUM (
    'PROSPECTING',
    'NEGOTIATION',
    'WON',
    'LOST'
);


ALTER TYPE public.opportunity_stage_enum OWNER TO postgres;

--
-- Name: payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status_enum AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public.payment_status_enum OWNER TO postgres;

--
-- Name: service_agreement_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_agreement_status_enum AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public.service_agreement_status_enum OWNER TO postgres;

--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.user_status_enum OWNER TO postgres;

--
-- Name: work_order_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.work_order_status_enum AS ENUM (
    'QUOTE',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'INVOICED'
);


ALTER TYPE public.work_order_status_enum OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
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


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
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


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
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


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
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


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: generate_invoice_number(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_invoice_number(p_company_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num bigint;
BEGIN
    -- Get next number from sequence
    next_num := nextval('invoice_number_seq');
    -- Format: INV-{YEAR}-{company_id_prefix}-{SEQ}
    RETURN 'INV-' || EXTRACT(YEAR FROM now()) || '-' ||
           substr(p_company_id::text, 1, 4) || '-' ||
           lpad(next_num::text, 6, '0');
END;
$$;


ALTER FUNCTION public.generate_invoice_number(p_company_id uuid) OWNER TO postgres;

--
-- Name: log_work_order_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_work_order_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.work_order_audit_log (
      work_order_id, company_id, action, old_status, new_status, details
    ) VALUES (
      NEW.id, NEW.company_id, 'status_changed',
      OLD.status::text, NEW.status::text,
      jsonb_build_object('old_total', OLD.total_amount, 'new_total', NEW.total_amount)
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_work_order_change() OWNER TO postgres;

--
-- Name: set_invoice_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_invoice_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  prefix TEXT;
  counter INT;
  start_number INT;
  current_year INT := EXTRACT(YEAR FROM now());
BEGIN
  -- Get prefix + starting number
  SELECT COALESCE(c.invoice_prefix, current_year::text || '-'),
         COALESCE(c.invoice_start_number, 1)
  INTO prefix, start_number
  FROM public.companies c
  WHERE c.id = NEW.company_id;

  -- Ensure counter exists for this company/year
  INSERT INTO public.company_invoice_counters (company_id, year, next_number)
  VALUES (NEW.company_id, current_year, start_number)
  ON CONFLICT (company_id, year) DO NOTHING;

  -- Increment counter and return previous value
  UPDATE public.company_invoice_counters
  SET next_number = next_number + 1
  WHERE company_id = NEW.company_id AND year = current_year
  RETURNING next_number - 1 INTO counter;

  -- Apply prefix + padded counter
  NEW.invoice_number := prefix || LPAD(counter::TEXT, 3, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_invoice_number() OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
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


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
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


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
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


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
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


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
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


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
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


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
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
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
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


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: jobs_20250823_013140; Type: TABLE; Schema: legacy_archive; Owner: postgres
--

CREATE TABLE legacy_archive.jobs_20250823_013140 (
    id uuid,
    company_id uuid,
    customer_id uuid,
    quote_id uuid,
    assigned_technician_id uuid,
    job_title text,
    description text,
    job_status text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    actual_start timestamp with time zone,
    actual_end timestamp with time zone,
    created_at timestamp with time zone,
    company_name text,
    notes text,
    job_location text,
    estimated_duration integer,
    actual_duration integer,
    labor_cost numeric(10,2),
    material_cost numeric(10,2),
    total_cost numeric(10,2),
    attachments jsonb,
    updated_at timestamp with time zone
);


ALTER TABLE legacy_archive.jobs_20250823_013140 OWNER TO postgres;

--
-- Name: quote_items_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: postgres
--

CREATE TABLE legacy_archive.quote_items_20250828_021425 (
    id uuid,
    quote_id uuid,
    item_name text,
    quantity integer,
    rate numeric,
    is_overtime boolean,
    description text,
    photo_url text,
    created_at timestamp with time zone,
    company_id uuid,
    company_name text
);


ALTER TABLE legacy_archive.quote_items_20250828_021425 OWNER TO postgres;

--
-- Name: quotes_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: postgres
--

CREATE TABLE legacy_archive.quotes_20250828_021425 (
    id uuid,
    customer_id uuid,
    quote_number text,
    title text,
    description text,
    status text,
    subtotal numeric,
    total_amount numeric,
    notes text,
    created_at timestamp with time zone,
    company_id uuid,
    company_name text
);


ALTER TABLE legacy_archive.quotes_20250828_021425 OWNER TO postgres;

--
-- Name: wo_master_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: postgres
--

CREATE TABLE legacy_archive.wo_master_20250828_021425 (
    id uuid,
    company_id uuid,
    customer_id uuid,
    title text,
    description text,
    location text,
    subtotal_cents bigint,
    tax_cents bigint,
    total_cents bigint,
    scheduled_start timestamp with time zone,
    scheduled_end timestamp with time zone,
    technician_id uuid,
    quote_snapshot jsonb,
    meta jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE legacy_archive.wo_master_20250828_021425 OWNER TO postgres;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    related_type text NOT NULL,
    related_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    enable_auto_invoice boolean DEFAULT false,
    default_tax_rate numeric(5,2) DEFAULT 0,
    currency text DEFAULT 'USD'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.business_settings OWNER TO postgres;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_type text DEFAULT 'OTHER'::text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    location text,
    status text DEFAULT 'SCHEDULED'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendar_events_event_type_check CHECK ((event_type = ANY (ARRAY['WORK_ORDER'::text, 'MEETING'::text, 'PTO'::text, 'OTHER'::text])))
);


ALTER TABLE public.calendar_events OWNER TO postgres;

--
-- Name: calendar_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calendar_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    invitee_email text NOT NULL,
    status text DEFAULT 'PENDING'::text,
    sent_at timestamp with time zone DEFAULT now(),
    responded_at timestamp with time zone
);


ALTER TABLE public.calendar_invitations OWNER TO postgres;

--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    title text NOT NULL,
    description text,
    status public.work_order_status_enum DEFAULT 'QUOTE'::public.work_order_status_enum,
    estimated_duration integer,
    total_amount numeric(12,2) DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.work_orders OWNER TO postgres;

--
-- Name: closed_jobs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.closed_jobs AS
 SELECT id,
    company_id,
    customer_id,
    title,
    description,
    status,
    estimated_duration,
    total_amount,
    created_by,
    updated_by,
    created_at,
    updated_at
   FROM public.work_orders
  WHERE (status = 'COMPLETED'::public.work_order_status_enum);


ALTER VIEW public.closed_jobs OWNER TO postgres;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    status public.company_status_enum DEFAULT 'ACTIVE'::public.company_status_enum,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    invoice_prefix text DEFAULT (to_char(now(), 'YYYY'::text) || '-'::text),
    invoice_start_number integer DEFAULT 1,
    address text,
    phone text,
    settings jsonb DEFAULT '{}'::jsonb,
    timezone text DEFAULT 'UTC'::text,
    logo_url text
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: company_document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    template_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.company_document_templates OWNER TO postgres;

--
-- Name: company_invoice_counters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_invoice_counters (
    company_id uuid NOT NULL,
    next_number integer DEFAULT 1
);


ALTER TABLE public.company_invoice_counters OWNER TO postgres;

--
-- Name: company_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    description text,
    services_offered text[],
    coverage_area text,
    social_links jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.company_profiles OWNER TO postgres;

--
-- Name: customer_communications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    type public.communication_type_enum,
    subject text,
    body text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_communications OWNER TO postgres;

--
-- Name: customer_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    sender_id uuid,
    message text NOT NULL,
    status public.message_status_enum DEFAULT 'SENT'::public.message_status_enum,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_messages OWNER TO postgres;

--
-- Name: customer_service_agreements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_service_agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    agreement_text text,
    start_date date,
    end_date date,
    status public.service_agreement_status_enum DEFAULT 'ACTIVE'::public.service_agreement_status_enum,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_service_agreements OWNER TO postgres;

--
-- Name: customer_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    tag text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.customer_tags OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    email text,
    phone text,
    status public.customer_status_enum DEFAULT 'ACTIVE'::public.customer_status_enum,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: document_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_audit_log (
    id bigint NOT NULL,
    document_id uuid,
    company_id uuid,
    action text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.document_audit_log OWNER TO postgres;

--
-- Name: document_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_audit_log_id_seq OWNER TO postgres;

--
-- Name: document_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_audit_log_id_seq OWNED BY public.document_audit_log.id;


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    template_type text NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.document_templates OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_url text,
    doc_type text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: employee_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_audit_log (
    id bigint NOT NULL,
    employee_id uuid NOT NULL,
    company_id uuid,
    action text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.employee_audit_log OWNER TO postgres;

--
-- Name: employee_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_audit_log_id_seq OWNER TO postgres;

--
-- Name: employee_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_audit_log_id_seq OWNED BY public.employee_audit_log.id;


--
-- Name: employee_time_off; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_time_off (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    type text,
    status text DEFAULT 'PENDING'::text,
    approved_by uuid,
    requested_at timestamp with time zone DEFAULT now(),
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_time_off_type_check CHECK ((type = ANY (ARRAY['VACATION'::text, 'SICK'::text, 'PERSONAL'::text, 'OTHER'::text])))
);


ALTER TABLE public.employee_time_off OWNER TO postgres;

--
-- Name: employee_timesheets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_timesheets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    work_date date NOT NULL,
    hours_worked numeric DEFAULT 0,
    notes text,
    approved boolean DEFAULT false,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.employee_timesheets OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid,
    hire_date date,
    termination_date date,
    job_title text,
    department text,
    employment_type text,
    pay_rate numeric,
    pay_type text,
    status text DEFAULT 'ACTIVE'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employees_employment_type_check CHECK ((employment_type = ANY (ARRAY['FULL_TIME'::text, 'PART_TIME'::text, 'CONTRACTOR'::text]))),
    CONSTRAINT employees_pay_type_check CHECK ((pay_type = ANY (ARRAY['HOURLY'::text, 'SALARY'::text])))
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    vendor_id uuid,
    description text,
    amount numeric NOT NULL,
    expense_date date NOT NULL,
    category text,
    receipt_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    feature_name text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.feature_flags OWNER TO postgres;

--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    service_name text NOT NULL,
    api_key text,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.integration_settings OWNER TO postgres;

--
-- Name: inventory_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    batch_number text NOT NULL,
    quantity integer DEFAULT 0,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_batches OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    catalog_id uuid NOT NULL,
    company_id uuid NOT NULL,
    sku text,
    serial_tracking boolean DEFAULT false,
    batch_tracking boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    address text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_locations OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    location_id uuid,
    user_id uuid,
    type public.inventory_movement_type_enum,
    description text,
    quantity integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: inventory_serial_numbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_serial_numbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    serial_number text NOT NULL,
    status text DEFAULT 'IN_STOCK'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_serial_numbers OWNER TO postgres;

--
-- Name: inventory_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid,
    quantity integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_stock OWNER TO postgres;

--
-- Name: invoice_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_audit_log (
    id bigint NOT NULL,
    invoice_id uuid,
    company_id uuid,
    action text,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.invoice_audit_log OWNER TO postgres;

--
-- Name: invoice_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_audit_log_id_seq OWNER TO postgres;

--
-- Name: invoice_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_audit_log_id_seq OWNED BY public.invoice_audit_log.id;


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    invoice_id uuid,
    description text NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(12,2) DEFAULT 0,
    total numeric(12,2) GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED
);


ALTER TABLE public.invoice_line_items OWNER TO postgres;

--
-- Name: invoice_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_number_seq OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    customer_id uuid,
    status public.invoice_status_enum DEFAULT 'UNPAID'::public.invoice_status_enum,
    total_amount numeric(12,2) DEFAULT 0,
    due_date timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    invoice_number text,
    issued_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: items_catalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    unit_price numeric DEFAULT 0,
    unit_of_measure text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.items_catalog OWNER TO postgres;

--
-- Name: job_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    file_url text NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.job_photos OWNER TO postgres;

--
-- Name: jobs_with_payment_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.jobs_with_payment_status AS
 SELECT wo.id,
    wo.company_id,
    wo.customer_id,
    wo.title,
    wo.description,
    wo.status,
    wo.estimated_duration,
    wo.total_amount,
    wo.created_by,
    wo.updated_by,
    wo.created_at,
    wo.updated_at,
    i.status AS invoice_status
   FROM (public.work_orders wo
     LEFT JOIN public.invoices i ON ((i.work_order_id = wo.id)));


ALTER VIEW public.jobs_with_payment_status OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    source text,
    status public.lead_status_enum DEFAULT 'NEW'::public.lead_status_enum,
    potential_value numeric(12,2),
    assigned_to uuid,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: marketplace_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    sender_id uuid,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.marketplace_messages OWNER TO postgres;

--
-- Name: marketplace_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid,
    title text NOT NULL,
    description text,
    status text DEFAULT 'OPEN'::text,
    budget numeric,
    location text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.marketplace_requests OWNER TO postgres;

--
-- Name: marketplace_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    company_id uuid NOT NULL,
    response_status text DEFAULT 'INTERESTED'::text,
    message text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.marketplace_responses OWNER TO postgres;

--
-- Name: marketplace_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    reviewer_id uuid,
    company_id uuid,
    rating integer,
    review text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT marketplace_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.marketplace_reviews OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    sender_id uuid,
    receiver_id uuid,
    message text NOT NULL,
    status text DEFAULT 'SENT'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    type text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'UNREAD'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: open_invoices; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.open_invoices AS
 SELECT i.id,
    i.work_order_id,
    i.customer_id,
    c.name AS customer_name,
    i.status,
    i.total_amount,
    i.due_date,
    i.created_at,
    i.updated_at
   FROM (public.invoices i
     JOIN public.customers c ON ((c.id = i.customer_id)))
  WHERE (i.status = 'UNPAID'::public.invoice_status_enum);


ALTER VIEW public.open_invoices OWNER TO postgres;

--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    lead_id uuid,
    customer_id uuid,
    stage public.opportunity_stage_enum DEFAULT 'PROSPECTING'::public.opportunity_stage_enum,
    expected_close_date date,
    value numeric(12,2),
    assigned_to uuid,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.opportunities OWNER TO postgres;

--
-- Name: payment_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_audit_log (
    id bigint NOT NULL,
    payment_id uuid,
    company_id uuid,
    action text,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_audit_log OWNER TO postgres;

--
-- Name: payment_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_audit_log_id_seq OWNER TO postgres;

--
-- Name: payment_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_audit_log_id_seq OWNED BY public.payment_audit_log.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    customer_id uuid,
    invoice_id uuid,
    method text NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public.payment_status_enum DEFAULT 'PENDING'::public.payment_status_enum NOT NULL,
    transaction_reference text,
    received_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payroll_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_run_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    hours_worked numeric DEFAULT 0,
    gross_pay numeric DEFAULT 0,
    deductions numeric DEFAULT 0,
    net_pay numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payroll_items OWNER TO postgres;

--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_amount numeric DEFAULT 0,
    status text DEFAULT 'PENDING'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payroll_runs OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: po_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.po_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric DEFAULT 0,
    total numeric
);


ALTER TABLE public.po_items OWNER TO postgres;

--
-- Name: pto_current_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pto_current_balances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    balance_hours numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pto_current_balances OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    vendor_id uuid,
    order_number text,
    status text DEFAULT 'DRAFT'::text,
    total_amount numeric DEFAULT 0,
    order_date date DEFAULT now(),
    expected_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: quote_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    viewed_at timestamp with time zone,
    accepted_at timestamp with time zone,
    declined_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quote_analytics OWNER TO postgres;

--
-- Name: quote_approval_workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_approval_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    approver_id uuid,
    status text DEFAULT 'PENDING'::text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quote_approval_workflows OWNER TO postgres;

--
-- Name: quote_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_audit_log (
    id bigint NOT NULL,
    work_order_id uuid NOT NULL,
    company_id uuid,
    action text NOT NULL,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quote_audit_log OWNER TO postgres;

--
-- Name: quote_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quote_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quote_audit_log_id_seq OWNER TO postgres;

--
-- Name: quote_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quote_audit_log_id_seq OWNED BY public.quote_audit_log.id;


--
-- Name: quote_follow_ups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_follow_ups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    work_order_id uuid,
    follow_up_date date,
    notes text,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quote_follow_ups OWNER TO postgres;

--
-- Name: quote_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quote_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quote_templates OWNER TO postgres;

--
-- Name: quotes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.quotes AS
 SELECT id,
    company_id,
    customer_id,
    title,
    description,
    status,
    estimated_duration,
    total_amount,
    created_by,
    updated_by,
    created_at,
    updated_at
   FROM public.work_orders
  WHERE (status = 'QUOTE'::public.work_order_status_enum);


ALTER VIEW public.quotes OWNER TO postgres;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    generated_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: request_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    tag text NOT NULL
);


ALTER TABLE public.request_tags OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: sales_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    lead_id uuid,
    opportunity_id uuid,
    type public.communication_type_enum,
    notes text,
    activity_date timestamp with time zone DEFAULT now(),
    performed_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sales_activities OWNER TO postgres;

--
-- Name: schedule_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid,
    employee_id uuid,
    customer_id uuid,
    title text NOT NULL,
    description text,
    event_type text DEFAULT 'WORK_ORDER'::text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'SCHEDULED'::text,
    location text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT schedule_events_event_type_check CHECK ((event_type = ANY (ARRAY['WORK_ORDER'::text, 'MEETING'::text, 'PTO'::text, 'OTHER'::text])))
);


ALTER TABLE public.schedule_events OWNER TO postgres;

--
-- Name: shared_document_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    shared_with_company_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.shared_document_templates OWNER TO postgres;

--
-- Name: tools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    serial_number text,
    assigned_to uuid,
    location text,
    status text DEFAULT 'AVAILABLE'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tools OWNER TO postgres;

--
-- Name: user_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_audit_log (
    id bigint NOT NULL,
    user_id uuid,
    company_id uuid,
    action text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_audit_log OWNER TO postgres;

--
-- Name: user_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_audit_log_id_seq OWNER TO postgres;

--
-- Name: user_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_audit_log_id_seq OWNED BY public.user_audit_log.id;


--
-- Name: user_dashboard_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_dashboard_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_dashboard_settings OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    email text NOT NULL,
    full_name text,
    status public.user_status_enum DEFAULT 'ACTIVE'::public.user_status_enum,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    role text DEFAULT 'USER'::text,
    last_login timestamp with time zone,
    phone text,
    avatar_url text,
    settings jsonb DEFAULT '{}'::jsonb,
    profile_picture_url text,
    preferences jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    address text,
    status text DEFAULT 'ACTIVE'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: work_order_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_audit_log (
    id bigint NOT NULL,
    work_order_id uuid,
    company_id uuid,
    action text,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.work_order_audit_log OWNER TO postgres;

--
-- Name: work_order_audit_log_ext; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_audit_log_ext (
    id bigint NOT NULL,
    work_order_id uuid NOT NULL,
    company_id uuid,
    action text NOT NULL,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.work_order_audit_log_ext OWNER TO postgres;

--
-- Name: work_order_audit_log_ext_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_audit_log_ext_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_audit_log_ext_id_seq OWNER TO postgres;

--
-- Name: work_order_audit_log_ext_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_audit_log_ext_id_seq OWNED BY public.work_order_audit_log_ext.id;


--
-- Name: work_order_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.work_order_audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_audit_log_id_seq OWNER TO postgres;

--
-- Name: work_order_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.work_order_audit_log_id_seq OWNED BY public.work_order_audit_log.id;


--
-- Name: work_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric DEFAULT 0,
    total numeric
);


ALTER TABLE public.work_order_items OWNER TO postgres;

--
-- Name: work_order_labor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_labor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    employee_id uuid,
    hours numeric DEFAULT 0,
    rate numeric DEFAULT 0,
    total numeric
);


ALTER TABLE public.work_order_labor OWNER TO postgres;

--
-- Name: work_order_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    sender_id uuid,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.work_order_messages OWNER TO postgres;

--
-- Name: work_order_milestones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    due_date date,
    status text DEFAULT 'PENDING'::text,
    completed_at timestamp with time zone
);


ALTER TABLE public.work_order_milestones OWNER TO postgres;

--
-- Name: work_order_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_order_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    version_number integer NOT NULL,
    changes jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.work_order_versions OWNER TO postgres;

--
-- Name: work_orders_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.work_orders_history AS
 SELECT id,
    company_id,
    customer_id,
    title,
    description,
    status,
    estimated_duration,
    total_amount,
    created_by,
    updated_by,
    created_at,
    updated_at
   FROM public.work_orders;


ALTER VIEW public.work_orders_history OWNER TO postgres;

--
-- Name: work_orders_v; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.work_orders_v AS
 SELECT wo.id,
    wo.company_id,
    wo.customer_id,
    wo.title,
    wo.description,
    wo.status,
    wo.estimated_duration,
    wo.total_amount,
    wo.created_at,
    wo.updated_at,
    c.name AS customer_name
   FROM (public.work_orders wo
     LEFT JOIN public.customers c ON ((wo.customer_id = c.id)));


ALTER VIEW public.work_orders_v OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
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


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
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


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
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
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
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
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
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
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
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


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
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


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: document_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audit_log ALTER COLUMN id SET DEFAULT nextval('public.document_audit_log_id_seq'::regclass);


--
-- Name: employee_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_audit_log ALTER COLUMN id SET DEFAULT nextval('public.employee_audit_log_id_seq'::regclass);


--
-- Name: invoice_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_audit_log ALTER COLUMN id SET DEFAULT nextval('public.invoice_audit_log_id_seq'::regclass);


--
-- Name: payment_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_audit_log ALTER COLUMN id SET DEFAULT nextval('public.payment_audit_log_id_seq'::regclass);


--
-- Name: quote_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_audit_log ALTER COLUMN id SET DEFAULT nextval('public.quote_audit_log_id_seq'::regclass);


--
-- Name: user_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_audit_log ALTER COLUMN id SET DEFAULT nextval('public.user_audit_log_id_seq'::regclass);


--
-- Name: work_order_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log ALTER COLUMN id SET DEFAULT nextval('public.work_order_audit_log_id_seq'::regclass);


--
-- Name: work_order_audit_log_ext id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log_ext ALTER COLUMN id SET DEFAULT nextval('public.work_order_audit_log_ext_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	d5ee69b7-5cf7-4f86-9ce8-69d6f5a6d87e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","user_phone":""}}	2025-08-01 22:07:28.130219+00	
00000000-0000-0000-0000-000000000000	2a8c3383-4bea-4f46-a072-63a34b400fbe	{"action":"login","actor_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:10:45.276265+00	
00000000-0000-0000-0000-000000000000	02a58cc8-8690-4065-9a3f-56da07b876d2	{"action":"login","actor_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:26:53.711731+00	
00000000-0000-0000-0000-000000000000	129f02da-fb1e-4031-b10b-7c05f23590cc	{"action":"login","actor_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:36:26.725731+00	
00000000-0000-0000-0000-000000000000	406f894a-4ba6-4451-b89a-9d306149e39c	{"action":"login","actor_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-01 22:37:57.117076+00	
00000000-0000-0000-0000-000000000000	e7a75d25-db3a-44b1-a4f2-86abca9d3587	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"brad@gmail.com","user_id":"9696f9cc-26dd-41d5-88df-0a91db3d0dae","user_phone":""}}	2025-08-01 23:15:02.642121+00	
00000000-0000-0000-0000-000000000000	db1ecae7-e7f7-4dec-b425-93a448171d5b	{"action":"user_confirmation_requested","actor_id":"cc3648b0-ba04-4bb7-99ac-27b4a743e274","actor_username":"gaker@crimson.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:08:26.131353+00	
00000000-0000-0000-0000-000000000000	23dbe085-a166-4c71-adda-c52238446127	{"action":"user_confirmation_requested","actor_id":"6c88d0fa-8998-43ad-b375-abd4f88be080","actor_username":"jsmith@fedex.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:14:24.219821+00	
00000000-0000-0000-0000-000000000000	526ab55b-cc81-4056-bf53-7b41019c82b5	{"action":"user_signedup","actor_id":"6c88d0fa-8998-43ad-b375-abd4f88be080","actor_username":"jsmith@fedex.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-06 00:14:40.89192+00	
00000000-0000-0000-0000-000000000000	2d285236-52ec-4711-8ec1-77345835c450	{"action":"user_repeated_signup","actor_id":"6c88d0fa-8998-43ad-b375-abd4f88be080","actor_username":"jsmith@fedex.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:14:41.244656+00	
00000000-0000-0000-0000-000000000000	466c7f25-9d9e-42ec-b1d3-e011b5c88734	{"action":"user_confirmation_requested","actor_id":"98ce8c31-622e-40a9-824c-ae84d9efc6ad","actor_username":"landersion@legion.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:17:31.309317+00	
00000000-0000-0000-0000-000000000000	29cee945-d749-47f1-b411-110164eeb51c	{"action":"user_confirmation_requested","actor_id":"f06c9351-2f4f-4464-943c-8d970208b8d9","actor_username":"gmoney@google.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:24:15.992149+00	
00000000-0000-0000-0000-000000000000	f92b297e-06c4-4e99-b26d-de5002ef8431	{"action":"user_confirmation_requested","actor_id":"b42374de-19ac-4d1f-818b-3fa439ab7605","actor_username":"jsmith@trademarkpro.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-06 00:45:37.752951+00	
00000000-0000-0000-0000-000000000000	687b1897-13b4-4b09-894e-51350efc00d5	{"action":"user_confirmation_requested","actor_id":"cb809f95-2a60-40b1-88b8-71907fe5330c","actor_username":"jerald.smith@pacificorp.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-07 22:52:22.372698+00	
00000000-0000-0000-0000-000000000000	2eb83914-996f-4320-83e8-bc8e3aec21f0	{"action":"user_signedup","actor_id":"cb809f95-2a60-40b1-88b8-71907fe5330c","actor_username":"jerald.smith@pacificorp.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 22:52:37.997664+00	
00000000-0000-0000-0000-000000000000	7778dd3e-f0d0-4bce-8ca3-fb2107f09e6f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jerald.smith@pacificorp.com","user_id":"cb809f95-2a60-40b1-88b8-71907fe5330c","user_phone":""}}	2025-08-07 22:59:36.525087+00	
00000000-0000-0000-0000-000000000000	04150058-c86e-4f97-87be-a1146b8bcc78	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"gmoney@google.com","user_id":"f06c9351-2f4f-4464-943c-8d970208b8d9","user_phone":""}}	2025-08-07 22:59:36.524995+00	
00000000-0000-0000-0000-000000000000	c9d3d68c-00c0-44e7-b6ac-999ca3d4e6d7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"8905253f-da8d-42ea-ad57-5682cb8a08ff","user_phone":""}}	2025-08-07 22:59:36.549133+00	
00000000-0000-0000-0000-000000000000	75e8010e-50fa-4b32-aff4-f2cd36464e6b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jsmith@fedex.com","user_id":"6c88d0fa-8998-43ad-b375-abd4f88be080","user_phone":""}}	2025-08-07 22:59:36.551684+00	
00000000-0000-0000-0000-000000000000	17c066fd-81ae-41ab-8193-450b8b2f4392	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"brad@gmail.com","user_id":"9696f9cc-26dd-41d5-88df-0a91db3d0dae","user_phone":""}}	2025-08-07 22:59:36.558601+00	
00000000-0000-0000-0000-000000000000	1d4f3fd8-7858-4312-bb0c-cd1910d22612	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"gaker@crimson.com","user_id":"cc3648b0-ba04-4bb7-99ac-27b4a743e274","user_phone":""}}	2025-08-07 22:59:36.570981+00	
00000000-0000-0000-0000-000000000000	0c356625-6776-4f0a-a6af-a864cad6a518	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jsmith@trademarkpro.com","user_id":"b42374de-19ac-4d1f-818b-3fa439ab7605","user_phone":""}}	2025-08-07 22:59:36.571153+00	
00000000-0000-0000-0000-000000000000	688014e7-4a75-4de9-b9af-66c183b6b905	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"landersion@legion.com","user_id":"98ce8c31-622e-40a9-824c-ae84d9efc6ad","user_phone":""}}	2025-08-07 22:59:36.57767+00	
00000000-0000-0000-0000-000000000000	540603ea-9287-45d0-bac0-f6acc7bee5dd	{"action":"user_confirmation_requested","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-08-07 22:59:52.811122+00	
00000000-0000-0000-0000-000000000000	02924114-0363-45f9-9d84-84d0b3962252	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"brad@gmail.com","user_id":"a32b80f5-8151-4b8b-90b9-ab68c459d568","user_phone":""}}	2025-08-07 23:50:39.175779+00	
00000000-0000-0000-0000-000000000000	8735fb3d-c7a8-4267-9c90-04c8003f224b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"brad@gmail.com","user_id":"a32b80f5-8151-4b8b-90b9-ab68c459d568","user_phone":""}}	2025-08-08 00:26:09.431006+00	
00000000-0000-0000-0000-000000000000	8d3ea742-084b-4f23-ab0b-cc825ca60912	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"brad@gmail.com","user_id":"6b801a18-121b-487d-a940-b149b3468be2","user_phone":""}}	2025-08-10 15:44:59.192672+00	
00000000-0000-0000-0000-000000000000	17e4b53a-27e4-4ad1-9659-56e653e3c03e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"fakeguy@gmail.com","user_id":"5a12f41d-4708-4c26-ab8b-9aef7b414c6f","user_phone":""}}	2025-08-10 23:32:03.780572+00	
00000000-0000-0000-0000-000000000000	3a894761-cc2f-4dab-b69b-f3524f6c2693	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"fakeguy2@gmail.com","user_id":"0010f483-b319-422c-b078-987f886f26d0","user_phone":""}}	2025-08-10 23:40:13.045622+00	
00000000-0000-0000-0000-000000000000	c9c0d342-8796-4650-9428-cea912a16c09	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"employee3@fakeguy.com","user_id":"b3168b21-e41c-41e3-aa5f-fcc98f6e354f","user_phone":""}}	2025-08-12 17:04:18.676743+00	
00000000-0000-0000-0000-000000000000	eef1b0f4-f6ad-4ee4-816e-ab7151bd57ed	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-02 03:33:34.519897+00	
00000000-0000-0000-0000-000000000000	0b5b9e51-66b6-4a5a-b531-61856c9685a4	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-02 04:01:27.464586+00	
00000000-0000-0000-0000-000000000000	b0f9dc8c-2f8d-4e34-97ec-0c48342bbc51	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 00:39:31.345615+00	
00000000-0000-0000-0000-000000000000	f1ad2d4f-a8ae-472f-9894-d280d44e9335	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 00:39:31.357271+00	
00000000-0000-0000-0000-000000000000	14e06347-6582-4634-9d62-d24117ffbdc1	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 00:39:31.393509+00	
00000000-0000-0000-0000-000000000000	ff4950a7-e221-441a-9465-468715d25369	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-03 00:39:38.03181+00	
00000000-0000-0000-0000-000000000000	4f5b1cc3-a75a-4c83-8006-fdbea95afc69	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-03 00:40:07.794965+00	
00000000-0000-0000-0000-000000000000	9c3d198a-303f-4f88-b935-e9c20458bba7	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-03 00:40:13.380668+00	
00000000-0000-0000-0000-000000000000	dfaae111-ba5f-4d65-b3d2-2570ada57e2e	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-03 00:46:31.462962+00	
00000000-0000-0000-0000-000000000000	c7767863-99f9-410c-9c5b-484516c9b098	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 00:59:49.966397+00	
00000000-0000-0000-0000-000000000000	e3931fad-1755-4023-9f63-781414944925	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 00:59:49.981974+00	
00000000-0000-0000-0000-000000000000	8cfe89e8-be6d-4188-99ad-ee924e1fb676	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:06:05.88105+00	
00000000-0000-0000-0000-000000000000	dee9f203-31e4-419a-a512-b822a3a7705b	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:06:05.945387+00	
00000000-0000-0000-0000-000000000000	447c71fb-b2cb-4797-941d-1816bad53d46	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:09:14.515295+00	
00000000-0000-0000-0000-000000000000	9b2c5af9-6fad-43c7-9a1d-e26cd3d12183	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:09:14.517409+00	
00000000-0000-0000-0000-000000000000	48fd956a-fb0d-4163-93e4-04832a0ca351	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:14:41.010463+00	
00000000-0000-0000-0000-000000000000	dfe0d873-de6d-4ad0-a940-14d852d35aa0	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 02:25:25.778952+00	
00000000-0000-0000-0000-000000000000	1f2e5ee2-4255-4336-9898-d31a5b7680b5	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 03:07:09.808844+00	
00000000-0000-0000-0000-000000000000	8cfb95d5-428e-4fd8-851b-0305c43d7dce	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 03:43:57.829568+00	
00000000-0000-0000-0000-000000000000	545d7f68-7318-4d17-b587-25cd73bc827e	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 03:43:57.843095+00	
00000000-0000-0000-0000-000000000000	8194137d-bc72-45e7-aa80-f5a64ce712ab	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:05:20.908523+00	
00000000-0000-0000-0000-000000000000	e0195e74-e59c-46c2-b8e5-a4bc7a86204a	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:05:20.97311+00	
00000000-0000-0000-0000-000000000000	46f26703-6d5e-4c97-a969-be80eda805a2	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:07:20.091429+00	
00000000-0000-0000-0000-000000000000	94cfc218-d6f6-4b35-854d-c58f3cf22983	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:07:48.02843+00	
00000000-0000-0000-0000-000000000000	5a13121e-6ba3-4125-8b09-31c1db525f33	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:07:48.029487+00	
00000000-0000-0000-0000-000000000000	14952f79-c075-4d31-93bd-87bf32611450	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:08:11.925832+00	
00000000-0000-0000-0000-000000000000	c8dd54e8-362a-46a7-8330-8fe06bdae178	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:08:28.401882+00	
00000000-0000-0000-0000-000000000000	fe4f58af-7f16-4231-9ca3-5cccb233bff9	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:16:33.13835+00	
00000000-0000-0000-0000-000000000000	1dc5bfe0-8715-4dda-adc7-d56189a756e7	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 00:16:33.825629+00	
00000000-0000-0000-0000-000000000000	8e682604-5333-4512-a08b-d273fa6c2266	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 00:16:33.909109+00	
00000000-0000-0000-0000-000000000000	e3fd26da-f17c-407d-a216-214f574735d8	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 00:22:27.00505+00	
00000000-0000-0000-0000-000000000000	ef491e2f-ce53-41ae-85c5-3706df531970	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 00:22:27.01796+00	
00000000-0000-0000-0000-000000000000	8327b564-d503-4b20-97ca-f712eaa943fb	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 02:38:30.907633+00	
00000000-0000-0000-0000-000000000000	70e52658-fdf8-40d4-8e12-4409c432e338	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 02:38:31.12792+00	
00000000-0000-0000-0000-000000000000	bb2243ca-127e-406a-bdb5-d9baded09be2	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 02:40:10.244377+00	
00000000-0000-0000-0000-000000000000	5d37cb7c-bf7d-4190-9ae8-114bb3c96aad	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 02:40:10.246449+00	
00000000-0000-0000-0000-000000000000	edb5bdb5-fb96-4093-a3a6-5109e89fbb56	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 03:27:25.381079+00	
00000000-0000-0000-0000-000000000000	c6eea758-8f41-4d85-9a1d-9ab1815cea40	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 03:27:25.442913+00	
00000000-0000-0000-0000-000000000000	a40b1f2d-83c9-4b05-9b2a-36a625c97111	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 03:28:19.366972+00	
00000000-0000-0000-0000-000000000000	1f30701c-588a-4939-af6c-b7527875ddc5	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 04:05:49.172878+00	
00000000-0000-0000-0000-000000000000	c6b125dc-3a48-41e6-ab6c-6bf4dab39aed	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 04:05:49.186864+00	
00000000-0000-0000-0000-000000000000	7f01d494-b47b-4e8c-b0f4-465cb1915ef1	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 18:34:25.089858+00	
00000000-0000-0000-0000-000000000000	5af92b9d-8d81-4a96-be67-cd99e13fde08	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 18:34:25.141777+00	
00000000-0000-0000-0000-000000000000	ff88cc2e-1167-421d-ad0e-e0ca132551c7	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 18:35:10.732958+00	
00000000-0000-0000-0000-000000000000	098ac494-8511-4ae9-bf26-b2fc35066768	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-04 18:35:10.734396+00	
00000000-0000-0000-0000-000000000000	bfdb1756-19bf-472b-ab55-10ca0b985544	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 23:54:41.49286+00	
00000000-0000-0000-0000-000000000000	aad42654-3f21-4bad-93c0-810cba68b8e5	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:07:02.879594+00	
00000000-0000-0000-0000-000000000000	f2d55d0f-9964-4306-ab00-500cc1363270	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:07:02.893678+00	
00000000-0000-0000-0000-000000000000	d0f62802-cee7-4896-8e71-8081da95090f	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:24:13.586319+00	
00000000-0000-0000-0000-000000000000	953a270f-5e68-4f00-912b-0add70c209af	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:31:55.342865+00	
00000000-0000-0000-0000-000000000000	1c8e5b99-1cac-4230-8c12-e9552ada92c6	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:41:11.335328+00	
00000000-0000-0000-0000-000000000000	0241f215-243c-485a-b03a-b5b534b5beb8	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:47:33.412275+00	
00000000-0000-0000-0000-000000000000	2d1477e4-af83-4ea7-939f-0c4c18747023	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:47:33.4541+00	
00000000-0000-0000-0000-000000000000	cbaed989-fac0-4217-989f-4134d75cafc7	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:47:44.541019+00	
00000000-0000-0000-0000-000000000000	a7c21743-5145-4fd1-bd10-f9828ef553a5	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:47:44.542408+00	
00000000-0000-0000-0000-000000000000	d68f9f97-cdf4-4c76-bc05-fb6900b7bb97	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 00:50:36.627932+00	
00000000-0000-0000-0000-000000000000	42304f74-0e5c-4eff-9390-9df91c55c3b4	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 01:01:59.428179+00	
00000000-0000-0000-0000-000000000000	693f0877-1573-4e21-aafb-59ae39045f93	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 01:04:16.24301+00	
00000000-0000-0000-0000-000000000000	b3ef225b-198b-4700-b0e0-7b8ec5d09137	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 02:09:50.110947+00	
00000000-0000-0000-0000-000000000000	5e9b3201-f82e-4020-9ac0-5b81986f671c	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 02:09:50.150341+00	
00000000-0000-0000-0000-000000000000	cf931a0d-4ac8-423a-a12a-66f86ade61c9	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 02:19:46.580912+00	
00000000-0000-0000-0000-000000000000	ca898f6a-326c-4b2f-bee7-797ccc088ffa	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 02:19:46.587313+00	
00000000-0000-0000-0000-000000000000	48b32ab1-fe29-4a1f-a04b-752ef26b39bc	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 02:26:24.459354+00	
00000000-0000-0000-0000-000000000000	7cd9fce3-fec0-40bf-af2a-0eca8bb47a86	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:00:38.345987+00	
00000000-0000-0000-0000-000000000000	3db0177f-7fa4-4ef5-9de4-cf2c48c24784	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:00:38.394801+00	
00000000-0000-0000-0000-000000000000	e2ee4a1a-f08f-4f07-803b-e3c2dad8805d	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:02:13.204336+00	
00000000-0000-0000-0000-000000000000	dd000554-f931-409e-8515-563990550dbf	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:07:36.056932+00	
00000000-0000-0000-0000-000000000000	e5f40c5e-5476-4a92-acb7-7061827a978c	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:07:36.063219+00	
00000000-0000-0000-0000-000000000000	24059ac7-10e2-482a-9b05-aeced930877f	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 03:18:08.265662+00	
00000000-0000-0000-0000-000000000000	b34b8143-88f6-462f-9b7b-3bcded7a8bce	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:07:45.821274+00	
00000000-0000-0000-0000-000000000000	c731c329-c336-4fdf-9f59-a1842269750f	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:07:45.881406+00	
00000000-0000-0000-0000-000000000000	2aa115bd-cc6e-4dd5-8c79-38397b126294	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:12:09.113058+00	
00000000-0000-0000-0000-000000000000	c0cf17a6-f977-4487-8df2-861846946151	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:12:09.114312+00	
00000000-0000-0000-0000-000000000000	48f47b57-cc70-433f-ac71-3c52bad7d543	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:17:55.069144+00	
00000000-0000-0000-0000-000000000000	b2f88599-c4ba-42cc-bc5b-f3d230851647	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:21:16.10125+00	
00000000-0000-0000-0000-000000000000	82b59415-712a-4723-acb8-5aa943a50537	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:28:08.848973+00	
00000000-0000-0000-0000-000000000000	be3924f0-1b2a-42ae-9a5e-82521567a228	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:32:30.299431+00	
00000000-0000-0000-0000-000000000000	7d0f3499-9e49-4062-bac9-d1a841a2a853	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 04:38:30.763833+00	
00000000-0000-0000-0000-000000000000	64058bd0-1f8a-4789-98f5-86f580b58cfd	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:15:10.378296+00	
00000000-0000-0000-0000-000000000000	58c20c87-f68e-49c6-b00b-b2f7372750e5	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:15:10.436187+00	
00000000-0000-0000-0000-000000000000	61dea74b-6cae-45ce-87ed-b6e75a53ff62	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:28:07.19004+00	
00000000-0000-0000-0000-000000000000	b1a8fdb1-d2bf-4d2e-87ee-8e9e8b5acdf0	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:28:07.204517+00	
00000000-0000-0000-0000-000000000000	619fcde8-eb49-4e71-85bf-e49a96adea19	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 15:32:38.378492+00	
00000000-0000-0000-0000-000000000000	5193494d-bc92-481c-a8a1-9c75deed1aeb	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:21:00.931836+00	
00000000-0000-0000-0000-000000000000	5cf5ec83-a5b8-4127-a7a1-c411141352e5	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:21:05.479559+00	
00000000-0000-0000-0000-000000000000	e7c5e9cb-aa57-422d-81e6-b15be2b08493	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:21:05.480216+00	
00000000-0000-0000-0000-000000000000	446e6cee-3cae-47ff-ba75-21c5f7e18d30	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:24:38.70749+00	
00000000-0000-0000-0000-000000000000	6b8431d8-7b5b-4959-b8df-38c29d1da0cc	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 16:29:04.850566+00	
00000000-0000-0000-0000-000000000000	860a669e-cbde-47aa-b13b-97b965be1dc3	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:02:01.577139+00	
00000000-0000-0000-0000-000000000000	b6183635-86dd-4910-95bd-ccd54cda6d12	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 17:55:11.441913+00	
00000000-0000-0000-0000-000000000000	8051ba5f-82de-48f6-a4ce-e2e46df15404	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 17:57:52.574746+00	
00000000-0000-0000-0000-000000000000	0ed56e05-6158-46da-9548-97ecf6e16535	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:08:01.29289+00	
00000000-0000-0000-0000-000000000000	e0ccc209-36a5-40d6-bfef-91d7de547f53	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 18:08:01.29858+00	
00000000-0000-0000-0000-000000000000	8c62f738-70e1-44ed-b2d2-962f377241b0	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:33:02.944989+00	
00000000-0000-0000-0000-000000000000	1f36b184-bf11-40a6-b66b-70206e44e52a	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:33:03.031911+00	
00000000-0000-0000-0000-000000000000	19e68628-327d-4ecd-b1ca-106359d92351	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:37:07.186224+00	
00000000-0000-0000-0000-000000000000	45e6a1c3-d0ee-41c9-846a-068479638aaf	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:37:07.18816+00	
00000000-0000-0000-0000-000000000000	7007d177-99b9-4bec-9c20-74ed3aaec79e	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:56:28.840838+00	
00000000-0000-0000-0000-000000000000	b51fba16-cc8a-457f-9ddb-efebca2f8211	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 16:08:32.113362+00	
00000000-0000-0000-0000-000000000000	e498f620-ebed-45e1-a1fd-ef7bd42a9a8f	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:28:01.96228+00	
00000000-0000-0000-0000-000000000000	a608f061-455b-4953-984e-d68f012b9706	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:28:02.126022+00	
00000000-0000-0000-0000-000000000000	11122f8a-6f5d-4341-9a66-59e58ab52c57	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:30:42.862629+00	
00000000-0000-0000-0000-000000000000	3e4258ec-6395-4f02-9514-fcf109e12d1d	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:30:42.865219+00	
00000000-0000-0000-0000-000000000000	bbfbd346-7585-4553-a309-8874e005061d	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:40:20.195044+00	
00000000-0000-0000-0000-000000000000	cff81bd3-6a05-411c-9fdc-1edc7cd49a52	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 17:46:29.063228+00	
00000000-0000-0000-0000-000000000000	b79a2f6f-fef4-4720-b1cf-8fea65497186	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 18:04:28.955975+00	
00000000-0000-0000-0000-000000000000	72c86c0d-554b-49ac-84cf-a9e6afdf1ab0	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 18:21:44.549123+00	
00000000-0000-0000-0000-000000000000	fca97410-2bd6-4595-b8fe-bcc45cb52ec4	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:01:19.771124+00	
00000000-0000-0000-0000-000000000000	0c34224d-9eab-4cb5-8f32-ab173b92a67a	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:01:19.787187+00	
00000000-0000-0000-0000-000000000000	4aee6d7c-9362-49a1-94d5-27cb5b0f4672	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:16:14.006839+00	
00000000-0000-0000-0000-000000000000	5876a821-cb88-4905-9859-4ff17657e064	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:21:01.273814+00	
00000000-0000-0000-0000-000000000000	df2769bb-2ac2-495f-b2e3-8fd6b8635f5c	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:21:01.279879+00	
00000000-0000-0000-0000-000000000000	7bb33d0f-b20f-4ad3-8806-959ee7fabc18	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:24:49.728978+00	
00000000-0000-0000-0000-000000000000	736e6ca7-f62b-468f-9ed2-8c3c9b2d7f07	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 19:48:21.393614+00	
00000000-0000-0000-0000-000000000000	4f56ad89-8d3f-424e-87cc-6909c2388683	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:02:04.51407+00	
00000000-0000-0000-0000-000000000000	1da8010f-150a-46e1-939d-025c4bf8de4d	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:02:39.593021+00	
00000000-0000-0000-0000-000000000000	2359a322-cace-4cf6-a798-a408edeadca1	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:04:14.307812+00	
00000000-0000-0000-0000-000000000000	0cc7a386-770c-46aa-89fa-531169f4255d	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:07:17.304734+00	
00000000-0000-0000-0000-000000000000	544b99f0-b27a-4455-9fcd-cd09e0007679	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:07:17.315397+00	
00000000-0000-0000-0000-000000000000	b0b13b58-cd5c-4abb-b250-f54d91e54883	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:07:31.472736+00	
00000000-0000-0000-0000-000000000000	39045b9b-a1a2-4e75-946b-89af0169911a	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:10:42.249188+00	
00000000-0000-0000-0000-000000000000	2dde2b83-0663-4e3a-9600-8a6b98c16fe7	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:11:14.973828+00	
00000000-0000-0000-0000-000000000000	7da363eb-f1ee-453d-97e6-1b3699a4ac21	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:11:43.282219+00	
00000000-0000-0000-0000-000000000000	1bd8d8f4-fae5-47ac-b3e4-f81d9ce8d45a	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:11:43.477426+00	
00000000-0000-0000-0000-000000000000	51562016-60bd-4323-981c-7e5c267afc50	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 20:11:51.233811+00	
00000000-0000-0000-0000-000000000000	cb140bcd-6e44-42eb-a460-2a79f99763b4	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:13:23.043486+00	
00000000-0000-0000-0000-000000000000	2e5582a2-bfb0-4396-9d6b-ef709db334a2	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:13:23.049038+00	
00000000-0000-0000-0000-000000000000	5c8306fb-64a0-4ef2-8944-bce3c24c2f46	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:20:43.545098+00	
00000000-0000-0000-0000-000000000000	890ae6e4-d8a5-4531-a591-a5c74af7d5c2	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 20:26:06.129984+00	
00000000-0000-0000-0000-000000000000	ad99951d-8b70-42c0-8718-182c8305438f	{"action":"user_recovery_requested","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-15 02:40:29.363403+00	
00000000-0000-0000-0000-000000000000	2c9b3aea-f797-4d11-aac8-23183e5bc668	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-15 02:44:35.057021+00	
00000000-0000-0000-0000-000000000000	9402e5d1-254b-4ca2-ba98-6837a2ed4fc5	{"action":"user_signedup","actor_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","actor_username":"test@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-15 15:35:56.348275+00	
00000000-0000-0000-0000-000000000000	f7d21cba-4a25-41f2-9595-a8b3eebd5b6e	{"action":"login","actor_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","actor_username":"test@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-15 15:35:56.38487+00	
00000000-0000-0000-0000-000000000000	e32a4121-938c-4bc3-be61-e4a94f8d22e2	{"action":"user_repeated_signup","actor_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","actor_username":"test@cgrenewables.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-15 17:02:11.907374+00	
00000000-0000-0000-0000-000000000000	9f9556c7-987d-4b2b-934f-505d9bc28dab	{"action":"user_signedup","actor_id":"3ff496a1-788f-49c6-8a75-ed3ec79a3d3c","actor_username":"tester@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-15 17:02:26.799143+00	
00000000-0000-0000-0000-000000000000	4a5aafbc-1e93-4c03-a487-0b907d819c4f	{"action":"login","actor_id":"3ff496a1-788f-49c6-8a75-ed3ec79a3d3c","actor_username":"tester@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-15 17:02:26.824536+00	
00000000-0000-0000-0000-000000000000	014dfb2a-4f27-40f8-934e-86896bbe3128	{"action":"token_refreshed","actor_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","actor_username":"test@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 17:04:01.762366+00	
00000000-0000-0000-0000-000000000000	6a556561-dd73-40ed-b1f9-1be88c14e00f	{"action":"token_revoked","actor_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","actor_username":"test@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 17:04:01.778196+00	
00000000-0000-0000-0000-000000000000	efa87c78-c0dd-428e-a04a-ca314349a56a	{"action":"token_refreshed","actor_id":"3ff496a1-788f-49c6-8a75-ed3ec79a3d3c","actor_username":"tester@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 18:34:16.743314+00	
00000000-0000-0000-0000-000000000000	2861ebc3-a6b8-40d7-825a-c0118d9b27bb	{"action":"token_revoked","actor_id":"3ff496a1-788f-49c6-8a75-ed3ec79a3d3c","actor_username":"tester@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 18:34:16.772684+00	
00000000-0000-0000-0000-000000000000	f583524d-7d7e-4be8-bd21-df4a6091730c	{"action":"user_signedup","actor_id":"52e5d3fd-64e9-40ea-b4fd-7ea78f0aa672","actor_username":"hansell86@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-16 00:43:32.739404+00	
00000000-0000-0000-0000-000000000000	cffe9099-2c5a-426f-bcd8-d18306599751	{"action":"login","actor_id":"52e5d3fd-64e9-40ea-b4fd-7ea78f0aa672","actor_username":"hansell86@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 00:43:32.76842+00	
00000000-0000-0000-0000-000000000000	7a81bd72-a425-4774-95cc-20b312019c3d	{"action":"user_signedup","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-16 01:09:37.288199+00	
00000000-0000-0000-0000-000000000000	97b163cd-41aa-4145-a117-376286b7110d	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 01:09:37.308595+00	
00000000-0000-0000-0000-000000000000	9a3f44b2-e07b-42d4-a32a-dfe99439ff73	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 01:09:58.067891+00	
00000000-0000-0000-0000-000000000000	2d3151d2-2fe0-4061-a03d-d0ecd626c0a3	{"action":"user_signedup","actor_id":"cee26023-d3d9-47f3-9c62-535e65316832","actor_username":"ddukes@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-16 01:32:13.481122+00	
00000000-0000-0000-0000-000000000000	ec1e8107-f857-4a0a-900a-a8fe67331e3c	{"action":"login","actor_id":"cee26023-d3d9-47f3-9c62-535e65316832","actor_username":"ddukes@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 01:32:13.50162+00	
00000000-0000-0000-0000-000000000000	c5e6a444-6442-4b37-9364-1a0824840f40	{"action":"user_signedup","actor_id":"fac1d349-5cfa-4f7d-afe8-84f3dd5a8922","actor_username":"real-frontend-test@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-16 02:29:31.199422+00	
00000000-0000-0000-0000-000000000000	0d12a27a-880b-45b3-9b6e-a0509c8194bf	{"action":"login","actor_id":"fac1d349-5cfa-4f7d-afe8-84f3dd5a8922","actor_username":"real-frontend-test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 02:29:31.233272+00	
00000000-0000-0000-0000-000000000000	63bc1155-ffdd-4d9b-a41d-d3e219a4e5f2	{"action":"token_refreshed","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 02:49:20.567562+00	
00000000-0000-0000-0000-000000000000	91b95c60-6825-4ef5-b945-e6a17223fc97	{"action":"token_revoked","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 02:49:20.581169+00	
00000000-0000-0000-0000-000000000000	e2c4f59d-1ffe-4792-8f60-ade52e547181	{"action":"user_signedup","actor_id":"6c55a828-cd00-40b0-8eba-15c845c9b347","actor_username":"arlie@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-16 03:19:40.369676+00	
00000000-0000-0000-0000-000000000000	9e819e87-2807-407e-b62e-40082cc49220	{"action":"login","actor_id":"6c55a828-cd00-40b0-8eba-15c845c9b347","actor_username":"arlie@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-16 03:19:40.40111+00	
00000000-0000-0000-0000-000000000000	16db55b0-0bd5-49bf-b24a-9c6362ca5640	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-17 23:35:19.789502+00	
00000000-0000-0000-0000-000000000000	1438cd5a-f480-4711-8fc9-90df3e032290	{"action":"login","actor_id":"6c55a828-cd00-40b0-8eba-15c845c9b347","actor_username":"arlie@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-17 23:36:23.912294+00	
00000000-0000-0000-0000-000000000000	d2fbd18c-881e-4298-b7da-85cd60b93f7f	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-17 23:37:07.189629+00	
00000000-0000-0000-0000-000000000000	75e4109e-1151-4b55-a6b8-bc49fb106b60	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-17 23:53:25.19304+00	
00000000-0000-0000-0000-000000000000	e23109c9-16c8-4c01-b5f4-7dd97eba758e	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 00:11:29.319734+00	
00000000-0000-0000-0000-000000000000	7a2b145b-619e-48ca-80ec-4a4d5b2efeec	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 00:23:51.672728+00	
00000000-0000-0000-0000-000000000000	33842cdd-ae73-43b4-8c7b-b5ae65f85034	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 00:46:23.591285+00	
00000000-0000-0000-0000-000000000000	95730411-00db-4322-91dd-00ae68c0acd4	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 00:47:48.044287+00	
00000000-0000-0000-0000-000000000000	d46893bb-95a5-4f3c-9d6f-83accd9a6bc9	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 02:12:00.720688+00	
00000000-0000-0000-0000-000000000000	d4ba4def-914c-4a0f-935e-890315a6524c	{"action":"logout","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account"}	2025-09-18 02:17:10.710901+00	
00000000-0000-0000-0000-000000000000	2808599e-96a9-4a92-a07b-1a0bf3871b6b	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 02:52:49.962632+00	
00000000-0000-0000-0000-000000000000	f8bf8567-f889-4125-9bde-28e44f23f300	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 04:14:17.354205+00	
00000000-0000-0000-0000-000000000000	d8cef141-c9cb-46b8-84b7-31e5848c623c	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 04:15:10.120005+00	
00000000-0000-0000-0000-000000000000	166cbef6-2330-4a0d-a097-bf96e2fe55fe	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 04:30:41.294257+00	
00000000-0000-0000-0000-000000000000	66634a4a-a4cc-4798-9f05-27a00e42d58f	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 04:32:47.022256+00	
00000000-0000-0000-0000-000000000000	470e2131-2d4b-4e1d-93a1-e93c3c5db9c1	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 17:43:52.58681+00	
00000000-0000-0000-0000-000000000000	7a78bfda-097a-47e4-9010-b2aae4dfb18d	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 19:19:06.265392+00	
00000000-0000-0000-0000-000000000000	bad2ec3d-cbcf-4202-957c-7b211c5480f5	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-18 19:27:14.43039+00	
00000000-0000-0000-0000-000000000000	91e2c7bb-f854-4075-bc2d-4497176968eb	{"action":"user_signedup","actor_id":"905c1aaf-5d17-427d-821a-df76660a9aea","actor_username":"acates@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-19 01:09:41.882721+00	
00000000-0000-0000-0000-000000000000	e5af424c-69a2-4ba9-9ed1-51080944d00a	{"action":"login","actor_id":"905c1aaf-5d17-427d-821a-df76660a9aea","actor_username":"acates@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:09:41.913454+00	
00000000-0000-0000-0000-000000000000	1437ca47-5480-4636-99ce-585380debc92	{"action":"user_signedup","actor_id":"807d785d-db16-4aaf-96bc-f5da19f89c77","actor_username":"jerry@gcrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-19 01:11:56.458826+00	
00000000-0000-0000-0000-000000000000	48f5ddca-569e-4054-ad86-55650f710eca	{"action":"login","actor_id":"807d785d-db16-4aaf-96bc-f5da19f89c77","actor_username":"jerry@gcrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:11:56.476841+00	
00000000-0000-0000-0000-000000000000	4b886565-f5a4-4994-89f8-ac423f0327f3	{"action":"user_signedup","actor_id":"109f8a35-e705-40cd-9f69-8adeeaf6a08f","actor_username":"brad@cgrenewables.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-19 01:41:39.688745+00	
00000000-0000-0000-0000-000000000000	920b58e7-4050-4652-b703-956bc6f3157a	{"action":"login","actor_id":"109f8a35-e705-40cd-9f69-8adeeaf6a08f","actor_username":"brad@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:41:39.704621+00	
00000000-0000-0000-0000-000000000000	28eefc5c-b574-46ac-826f-83d5ba4d33c5	{"action":"login","actor_id":"109f8a35-e705-40cd-9f69-8adeeaf6a08f","actor_username":"brad@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:42:29.519058+00	
00000000-0000-0000-0000-000000000000	a8e7990b-4451-4917-92db-2b11d1f7c2f0	{"action":"login","actor_id":"905c1aaf-5d17-427d-821a-df76660a9aea","actor_username":"acates@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:42:55.057084+00	
00000000-0000-0000-0000-000000000000	ae406961-a65e-462e-8726-48bab43ac600	{"action":"user_signedup","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-19 01:43:47.459094+00	
00000000-0000-0000-0000-000000000000	a7afcefd-8a40-43e3-8576-0960e8e2fda7	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:43:47.473884+00	
00000000-0000-0000-0000-000000000000	d9f66149-e3d7-4c7e-9314-b7b6f438f6ab	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 01:44:05.316028+00	
00000000-0000-0000-0000-000000000000	ee794157-b6f2-4cb4-b643-532207446d98	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 02:29:01.580371+00	
00000000-0000-0000-0000-000000000000	995d85a6-03ae-49c0-88e5-96907c6a4540	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 15:27:10.84293+00	
00000000-0000-0000-0000-000000000000	dcf76ac9-f66b-44e9-b3f5-2309ddaf71a8	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 21:30:54.02672+00	
00000000-0000-0000-0000-000000000000	44830d5f-6a51-43b5-b3d3-306e2bc5c341	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 21:30:54.06029+00	
00000000-0000-0000-0000-000000000000	c66483fb-51ee-497f-b868-3a8388225bfc	{"action":"login","actor_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","actor_username":"cbrown@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 22:44:30.617252+00	
00000000-0000-0000-0000-000000000000	1670466d-cb32-463f-b084-a1eb004f4b66	{"action":"login","actor_id":"905c1aaf-5d17-427d-821a-df76660a9aea","actor_username":"acates@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 22:44:42.000558+00	
00000000-0000-0000-0000-000000000000	ed21ecff-58f8-4aa4-a0df-7aa51d578f4a	{"action":"login","actor_id":"6c55a828-cd00-40b0-8eba-15c845c9b347","actor_username":"arlie@cgrenewables.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 22:44:50.711898+00	
00000000-0000-0000-0000-000000000000	f23e1a75-1eef-4519-92c4-2b48f5eca6e7	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 22:47:12.215983+00	
00000000-0000-0000-0000-000000000000	1f44a103-6360-4f52-9293-23ebd06a50e7	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 23:45:40.646068+00	
00000000-0000-0000-0000-000000000000	142554e4-554d-4135-85b7-978260dd6cf0	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 23:45:40.673159+00	
00000000-0000-0000-0000-000000000000	95e96b8a-d396-403e-b563-db4820230c90	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 23:46:13.433298+00	
00000000-0000-0000-0000-000000000000	b4f5894f-615a-40bd-9682-a70d5f700671	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 23:46:13.435539+00	
00000000-0000-0000-0000-000000000000	12c35c98-0fda-412e-a891-b305c0fe3231	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 00:44:30.694457+00	
00000000-0000-0000-0000-000000000000	8f602648-ecdb-47ae-b3b7-893bfc3df7d5	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 00:44:30.720197+00	
00000000-0000-0000-0000-000000000000	88cf96d8-4312-4500-8913-ec69db12ae46	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 01:01:31.255176+00	
00000000-0000-0000-0000-000000000000	d02291f0-9596-490f-a47b-be611d934dec	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 02:36:50.993545+00	
00000000-0000-0000-0000-000000000000	439a9ad8-6efb-4300-bc0c-990495b48c61	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 02:36:51.020969+00	
00000000-0000-0000-0000-000000000000	6d949532-2c2f-4f6b-bd1d-fa7d6c10193e	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 03:10:56.085081+00	
00000000-0000-0000-0000-000000000000	1bbcd184-f2a7-454f-9245-37525f9bb7d4	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 03:10:56.107037+00	
00000000-0000-0000-0000-000000000000	51710dfb-f0c6-4a89-b73e-33d1a931525d	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 03:36:23.301097+00	
00000000-0000-0000-0000-000000000000	8de43e51-093c-4c7c-8ecc-3bd714b0e953	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 03:36:23.317031+00	
00000000-0000-0000-0000-000000000000	2cd0a8eb-90f4-4ff6-85d9-d5ba726d5036	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 15:46:31.742616+00	
00000000-0000-0000-0000-000000000000	2a7a06e0-18ce-46d6-a040-7b4d9f2dada2	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 15:46:31.774679+00	
00000000-0000-0000-0000-000000000000	6545702f-7c18-439e-952c-563feaca1286	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 15:46:55.594106+00	
00000000-0000-0000-0000-000000000000	b761c5f4-42c7-4373-b6fd-a80176427924	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 16:07:00.392756+00	
00000000-0000-0000-0000-000000000000	1465aec9-9502-422e-8ebb-99e67db9485c	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:52:35.633587+00	
00000000-0000-0000-0000-000000000000	170a85eb-12fa-4bb3-a133-e665a0676031	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:52:35.657643+00	
00000000-0000-0000-0000-000000000000	423f812a-d95c-4d09-9084-ae1f065acb00	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:58:49.205794+00	
00000000-0000-0000-0000-000000000000	6080bce8-4501-4491-8495-5572ee300eec	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:58:49.20906+00	
00000000-0000-0000-0000-000000000000	2d6e0c7e-3d71-4a66-a6fd-80801a90faa4	{"action":"token_refreshed","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 17:24:12.443988+00	
00000000-0000-0000-0000-000000000000	86bd2535-e3ff-4a87-9cd0-dee9217447c8	{"action":"token_revoked","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 17:24:12.461475+00	
00000000-0000-0000-0000-000000000000	44ae5280-af6c-4c69-9f84-5b505361c43a	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:04:22.205823+00	
00000000-0000-0000-0000-000000000000	0c472ffd-90af-418e-a60c-793b1305c217	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:04:22.218132+00	
00000000-0000-0000-0000-000000000000	ba7a7189-6ea8-491d-8663-6697b7c930c3	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:04:22.488121+00	
00000000-0000-0000-0000-000000000000	14c6ce3b-9723-4cdb-be84-cc41ce66eb79	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:04:22.491827+00	
00000000-0000-0000-0000-000000000000	e694ef7d-d1a4-4bd0-89c9-cf8d95e145dd	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 18:18:41.581267+00	
00000000-0000-0000-0000-000000000000	7a9984d3-75ef-4381-bbc8-611c55eab7ea	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:49:08.059194+00	
00000000-0000-0000-0000-000000000000	242bd586-6e9a-43c8-931e-d5496be6c51e	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 18:49:08.078753+00	
00000000-0000-0000-0000-000000000000	ecfb4ac2-d992-4547-9de3-90941a1350d7	{"action":"login","actor_id":"5b0be87f-c586-467c-880c-9ce30d682813","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 19:01:35.974798+00	
00000000-0000-0000-0000-000000000000	169275a2-6337-41e7-8a08-f7e74b45d43e	{"action":"login","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-20 19:19:01.441547+00	
00000000-0000-0000-0000-000000000000	2d7dad46-ee74-49b0-9b32-f4e45b147424	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 20:17:51.905391+00	
00000000-0000-0000-0000-000000000000	824dfd7b-f59d-4b20-ae26-6295e85bb563	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 20:17:51.916523+00	
00000000-0000-0000-0000-000000000000	273e8e3c-5d0b-4596-b8c4-10b3cc0b1f82	{"action":"token_refreshed","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 21:53:48.070035+00	
00000000-0000-0000-0000-000000000000	85bb4a0a-553f-4d0f-bb2e-830290845bcb	{"action":"token_revoked","actor_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","actor_username":"jerry@jerrysflowers.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 21:53:48.082562+00	
00000000-0000-0000-0000-000000000000	041d21bd-dc32-43f3-91bc-7019251bae11	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"brad@cgrenewables.com","user_id":"109f8a35-e705-40cd-9f69-8adeeaf6a08f","user_phone":""}}	2025-09-21 19:32:37.467276+00	
00000000-0000-0000-0000-000000000000	4f1bfc3e-5982-43a8-a478-ee04b0c434b2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jerry@gcrenewables.com","user_id":"807d785d-db16-4aaf-96bc-f5da19f89c77","user_phone":""}}	2025-09-21 19:32:37.466576+00	
00000000-0000-0000-0000-000000000000	e43e59a1-8049-4958-ac26-79d58b10acbe	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jerry@jerrysflowers.com","user_id":"cee9b1da-f4a1-4817-bf3a-6510a110a5aa","user_phone":""}}	2025-09-21 19:32:37.468534+00	
00000000-0000-0000-0000-000000000000	3255d54b-d94a-4a61-9d58-205a48906832	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"fakeguy2@gmail.com","user_id":"0010f483-b319-422c-b078-987f886f26d0","user_phone":""}}	2025-09-21 19:32:51.37407+00	
00000000-0000-0000-0000-000000000000	da458bb6-81fe-4270-a932-1e56a259c1bf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"5b0be87f-c586-467c-880c-9ce30d682813","user_phone":""}}	2025-09-21 19:32:51.477224+00	
00000000-0000-0000-0000-000000000000	6aefb384-c43a-4946-b355-c075bc13a57e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hansell86@cgrenewables.com","user_id":"52e5d3fd-64e9-40ea-b4fd-7ea78f0aa672","user_phone":""}}	2025-09-21 19:32:51.487721+00	
00000000-0000-0000-0000-000000000000	bee50d38-e5e2-4ae2-9648-ed4c913665fd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cbrown@cgrenewables.com","user_id":"e0673edc-8d0b-425d-91ea-b8396600f2db","user_phone":""}}	2025-09-21 19:32:51.495563+00	
00000000-0000-0000-0000-000000000000	8e7825c0-9eb6-4079-bb3f-aa81a363b118	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"arlie@cgrenewables.com","user_id":"6c55a828-cd00-40b0-8eba-15c845c9b347","user_phone":""}}	2025-09-21 19:32:51.50266+00	
00000000-0000-0000-0000-000000000000	c62cdb6c-a6d8-4a22-b808-20b6a77d3c6e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tester@cgrenewables.com","user_id":"3ff496a1-788f-49c6-8a75-ed3ec79a3d3c","user_phone":""}}	2025-09-21 19:32:51.512855+00	
00000000-0000-0000-0000-000000000000	a366caea-ce70-4ed8-80c5-4664448d29fb	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"real-frontend-test@example.com","user_id":"fac1d349-5cfa-4f7d-afe8-84f3dd5a8922","user_phone":""}}	2025-09-21 19:32:51.516114+00	
00000000-0000-0000-0000-000000000000	3770168c-3e26-4303-ad5a-60ac8d9a0fce	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ddukes@cgrenewables.com","user_id":"cee26023-d3d9-47f3-9c62-535e65316832","user_phone":""}}	2025-09-21 19:32:51.518367+00	
00000000-0000-0000-0000-000000000000	7796001d-6a34-4ec0-a872-ab17699a260a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"brad@gmail.com","user_id":"6b801a18-121b-487d-a940-b149b3468be2","user_phone":""}}	2025-09-21 19:32:51.533113+00	
00000000-0000-0000-0000-000000000000	06c892ca-5fc2-481f-92c1-c2e821d37b21	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"fakeguy@gmail.com","user_id":"5a12f41d-4708-4c26-ab8b-9aef7b414c6f","user_phone":""}}	2025-09-21 19:32:51.53324+00	
00000000-0000-0000-0000-000000000000	185c145e-e93f-4d9b-94f6-9a916193335d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@cgrenewables.com","user_id":"d2a5a1e8-039b-4cad-98bf-e1780d0d0831","user_phone":""}}	2025-09-21 19:32:51.538216+00	
00000000-0000-0000-0000-000000000000	72c003ff-754f-4dc1-af51-a1cd9e40fa66	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"acates@cgrenewables.com","user_id":"905c1aaf-5d17-427d-821a-df76660a9aea","user_phone":""}}	2025-09-21 19:32:51.551651+00	
00000000-0000-0000-0000-000000000000	d1f2f9c0-5e0d-42b5-b28e-c8e1260a0d90	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"employee3@fakeguy.com","user_id":"b3168b21-e41c-41e3-aa5f-fcc98f6e354f","user_phone":""}}	2025-09-21 19:32:51.554565+00	
00000000-0000-0000-0000-000000000000	c13adba4-fdd4-4fdc-aedf-ebed34e70c3e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"0919281a-2441-4091-8337-af86570d7fe7","user_phone":""}}	2025-09-21 20:10:00.570359+00	
00000000-0000-0000-0000-000000000000	170365ed-4b9d-47d0-ab66-8bb20db37d9c	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 03:49:49.171983+00	
00000000-0000-0000-0000-000000000000	8aabb0b6-13de-45da-880a-13aa6c71043a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"0919281a-2441-4091-8337-af86570d7fe7","user_phone":""}}	2025-09-21 20:10:07.091756+00	
00000000-0000-0000-0000-000000000000	c05f9d8c-8c81-40e3-8485-1392e31bfdb7	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"a4478664-1cd0-4b60-866c-1929d6e524a5","user_phone":""}}	2025-09-21 20:10:19.278452+00	
00000000-0000-0000-0000-000000000000	5a42e6bc-863a-4a1d-b8d7-cd3e5771f374	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"a4478664-1cd0-4b60-866c-1929d6e524a5","user_phone":""}}	2025-09-21 20:12:03.417858+00	
00000000-0000-0000-0000-000000000000	37e3ef64-0cbe-4212-8ce1-9fb72f5ea8a8	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"648636bb-b302-4de7-a4a5-c7030bcb578a"}}	2025-09-21 20:12:11.039585+00	
00000000-0000-0000-0000-000000000000	3ed7f828-81c2-4c36-953f-685b5bf31e3d	{"action":"user_signedup","actor_id":"648636bb-b302-4de7-a4a5-c7030bcb578a","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-21 20:12:17.784677+00	
00000000-0000-0000-0000-000000000000	f3d90410-a907-48c2-8932-f1d6b536dfdd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"648636bb-b302-4de7-a4a5-c7030bcb578a","user_phone":""}}	2025-09-21 20:12:33.084606+00	
00000000-0000-0000-0000-000000000000	4bcdfc07-3a54-4926-b175-f61b66fb6b80	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"jeraldjsmith@gmail.com","user_id":"140c26a5-d994-4b7c-9a99-3755f1e84d7b","user_phone":""}}	2025-09-21 20:12:42.460828+00	
00000000-0000-0000-0000-000000000000	8ee524d9-7483-44cf-b6e5-7cff6d2d594c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"140c26a5-d994-4b7c-9a99-3755f1e84d7b","user_phone":""}}	2025-09-21 23:16:53.736021+00	
00000000-0000-0000-0000-000000000000	bd42f2e9-0b8b-469c-9b8a-2cf65cec1aed	{"action":"user_signedup","actor_id":"62602d16-9a2f-43cf-8366-7c8afc03e920","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-21 23:38:51.07375+00	
00000000-0000-0000-0000-000000000000	17e7eea2-c2ee-43b1-a339-cdb404ec77c8	{"action":"login","actor_id":"62602d16-9a2f-43cf-8366-7c8afc03e920","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-21 23:38:51.10661+00	
00000000-0000-0000-0000-000000000000	b1b764e0-02e3-44e8-94c9-dc622e6c7aa2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jeraldjsmith@gmail.com","user_id":"62602d16-9a2f-43cf-8366-7c8afc03e920","user_phone":""}}	2025-09-22 00:10:28.998561+00	
00000000-0000-0000-0000-000000000000	2d694013-9a96-48c2-9d88-fcb353f023a8	{"action":"user_signedup","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-22 00:10:52.142755+00	
00000000-0000-0000-0000-000000000000	4953aac5-6144-45f4-8a99-9a5b62d33d4c	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:10:52.158917+00	
00000000-0000-0000-0000-000000000000	66d50b7b-4606-461b-83e3-f4f9516e2bb5	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:12:01.729412+00	
00000000-0000-0000-0000-000000000000	d60e5c0d-a7af-4131-87da-0c2277f7613f	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:18:12.766983+00	
00000000-0000-0000-0000-000000000000	03ff60d4-642b-404f-8d78-3cde636ea71e	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:20:49.179233+00	
00000000-0000-0000-0000-000000000000	74634674-15ea-4737-9e54-66c6fc17568e	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:21:02.117463+00	
00000000-0000-0000-0000-000000000000	4428153a-af3b-4e93-b139-fe6aeaa12a08	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 00:26:17.484359+00	
00000000-0000-0000-0000-000000000000	b77f3645-8742-4fa2-8ab3-d7bebbbb8743	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 01:26:04.17304+00	
00000000-0000-0000-0000-000000000000	51c6cea1-f796-446c-82c2-809adb7c9346	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 01:26:04.203443+00	
00000000-0000-0000-0000-000000000000	e7d35228-42c0-49b1-bdc2-51285676d007	{"action":"login","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-22 01:51:47.536708+00	
00000000-0000-0000-0000-000000000000	b8c0d3dc-ca71-418b-afec-8d58854c3460	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 02:24:49.755103+00	
00000000-0000-0000-0000-000000000000	718e37af-7e0b-429e-9bab-edd4b4aeeb78	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 02:24:49.778101+00	
00000000-0000-0000-0000-000000000000	f576f55e-9cc7-430d-b3dc-5adf3ce3dcdc	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 02:50:49.628248+00	
00000000-0000-0000-0000-000000000000	367ce2b3-2b61-481a-b142-8da0e12958c0	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 02:50:49.643983+00	
00000000-0000-0000-0000-000000000000	cb6fb437-9742-491b-b347-1414a6d652ad	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 03:23:49.392834+00	
00000000-0000-0000-0000-000000000000	59803b4c-e71c-4864-860d-bb305896d606	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 03:23:49.413613+00	
00000000-0000-0000-0000-000000000000	1adcfc6b-97de-4815-b53b-05025ddfc920	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 03:49:49.157902+00	
00000000-0000-0000-0000-000000000000	f98ade0e-9d76-4bcd-a6a6-2e6586586eea	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 04:22:49.112365+00	
00000000-0000-0000-0000-000000000000	671bce4b-8136-4e62-97e9-c3dabae2d2e7	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 04:22:49.139788+00	
00000000-0000-0000-0000-000000000000	8852f2fc-83da-4093-89c6-6a2be83eff51	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 14:44:51.429728+00	
00000000-0000-0000-0000-000000000000	b6830bc9-3a9c-4da7-abdf-6cb51ced144f	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 14:44:51.431008+00	
00000000-0000-0000-0000-000000000000	d569eba6-e9da-4aa7-a4fb-32d082e8c7fb	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 14:44:51.466728+00	
00000000-0000-0000-0000-000000000000	b49bbf21-5dca-4a8c-86e1-2a6da8ff321e	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 14:44:51.467894+00	
00000000-0000-0000-0000-000000000000	b2159fe9-7a07-4d69-a4da-4290458ac688	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 15:43:51.436755+00	
00000000-0000-0000-0000-000000000000	de7b2bd5-8f27-4570-8802-af3d8cddd358	{"action":"token_refreshed","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 15:43:51.438203+00	
00000000-0000-0000-0000-000000000000	814cd089-2e39-4390-8a94-2be1294b05a1	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 15:43:51.465585+00	
00000000-0000-0000-0000-000000000000	88001642-a783-4f4b-89a6-5a9fa01e22f8	{"action":"token_revoked","actor_id":"e68224cc-ec42-4ceb-9f9a-635d425d1b01","actor_username":"jeraldjsmith@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-22 15:43:51.465649+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e68224cc-ec42-4ceb-9f9a-635d425d1b01	e68224cc-ec42-4ceb-9f9a-635d425d1b01	{"sub": "e68224cc-ec42-4ceb-9f9a-635d425d1b01", "email": "jeraldjsmith@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-09-22 00:10:52.119765+00	2025-09-22 00:10:52.120457+00	2025-09-22 00:10:52.120457+00	05cb40f3-57c1-4693-9cef-303622f80b56
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
0a745567-61cc-4f89-b10b-79eefd15f85c	2025-09-22 00:10:52.182336+00	2025-09-22 00:10:52.182336+00	password	7e50a7f8-f850-482d-bd94-d284963aa132
95d13ead-b6bf-488a-85ae-7e1cfeda9982	2025-09-22 00:12:01.74121+00	2025-09-22 00:12:01.74121+00	password	f692ada2-f682-4d24-9c0f-4e8f8023d95e
622932a6-c6cf-4f18-ac20-5e998f2a8a2b	2025-09-22 00:18:12.782622+00	2025-09-22 00:18:12.782622+00	password	0e9aad82-7889-4d42-83e5-b9c784dabdb6
7092c94d-3d4a-47a7-ba21-6439c3ad199c	2025-09-22 00:20:49.187762+00	2025-09-22 00:20:49.187762+00	password	fbcce461-163e-4693-9d95-78756988be41
c3531774-1ef2-4ba0-9318-0df147d6b268	2025-09-22 00:21:02.121021+00	2025-09-22 00:21:02.121021+00	password	1a224166-bb3e-471c-a193-69d51eab5b1e
a70b2a47-b3aa-461f-8f44-8325f5e33b23	2025-09-22 00:26:17.511427+00	2025-09-22 00:26:17.511427+00	password	2c5ceaa7-2ffd-4d89-9f8d-fa4b1e15ce13
15e90ef3-5ce5-4aa2-afe7-db5192c82e76	2025-09-22 01:51:47.581086+00	2025-09-22 01:51:47.581086+00	password	0efbb42c-d07d-47fe-b920-88032fbfddd0
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	105	g75gdwr7lte3	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 00:10:52.170198+00	2025-09-22 00:10:52.170198+00	\N	0a745567-61cc-4f89-b10b-79eefd15f85c
00000000-0000-0000-0000-000000000000	106	mzoxe7emkjfn	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 00:12:01.735334+00	2025-09-22 00:12:01.735334+00	\N	95d13ead-b6bf-488a-85ae-7e1cfeda9982
00000000-0000-0000-0000-000000000000	107	ruqdilzyq2k3	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 00:18:12.778068+00	2025-09-22 00:18:12.778068+00	\N	622932a6-c6cf-4f18-ac20-5e998f2a8a2b
00000000-0000-0000-0000-000000000000	108	qw3ewqe5aqld	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 00:20:49.182112+00	2025-09-22 00:20:49.182112+00	\N	7092c94d-3d4a-47a7-ba21-6439c3ad199c
00000000-0000-0000-0000-000000000000	109	ziln4upgyx5i	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 00:21:02.119691+00	2025-09-22 00:21:02.119691+00	\N	c3531774-1ef2-4ba0-9318-0df147d6b268
00000000-0000-0000-0000-000000000000	110	hkddmeefnidp	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 00:26:17.502622+00	2025-09-22 01:26:04.20611+00	\N	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	111	vl6gdohkytw4	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 01:26:04.230539+00	2025-09-22 02:24:49.781149+00	hkddmeefnidp	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	112	jz2kpgxxjlfn	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 01:51:47.564526+00	2025-09-22 02:50:49.648412+00	\N	15e90ef3-5ce5-4aa2-afe7-db5192c82e76
00000000-0000-0000-0000-000000000000	113	n45qxzd22rb2	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 02:24:49.803858+00	2025-09-22 03:23:49.417764+00	vl6gdohkytw4	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	114	ankcou3fosda	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 02:50:49.662167+00	2025-09-22 03:49:49.17686+00	jz2kpgxxjlfn	15e90ef3-5ce5-4aa2-afe7-db5192c82e76
00000000-0000-0000-0000-000000000000	115	ckom3bys5nw3	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 03:23:49.43829+00	2025-09-22 04:22:49.142611+00	n45qxzd22rb2	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	117	wfqij63m27fd	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 04:22:49.158979+00	2025-09-22 14:44:51.469253+00	ckom3bys5nw3	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	116	lznssxaj4plm	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 03:49:49.188386+00	2025-09-22 14:44:51.467475+00	ankcou3fosda	15e90ef3-5ce5-4aa2-afe7-db5192c82e76
00000000-0000-0000-0000-000000000000	118	qxm4ajcskkfw	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 14:44:51.504384+00	2025-09-22 15:43:51.467068+00	wfqij63m27fd	a70b2a47-b3aa-461f-8f44-8325f5e33b23
00000000-0000-0000-0000-000000000000	119	nakxwlglwbc2	e68224cc-ec42-4ceb-9f9a-635d425d1b01	t	2025-09-22 14:44:51.504365+00	2025-09-22 15:43:51.467044+00	lznssxaj4plm	15e90ef3-5ce5-4aa2-afe7-db5192c82e76
00000000-0000-0000-0000-000000000000	120	absrblv3dico	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 15:43:51.505612+00	2025-09-22 15:43:51.505612+00	nakxwlglwbc2	15e90ef3-5ce5-4aa2-afe7-db5192c82e76
00000000-0000-0000-0000-000000000000	121	z3dmopjengtq	e68224cc-ec42-4ceb-9f9a-635d425d1b01	f	2025-09-22 15:43:51.502902+00	2025-09-22 15:43:51.502902+00	qxm4ajcskkfw	a70b2a47-b3aa-461f-8f44-8325f5e33b23
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
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
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
0a745567-61cc-4f89-b10b-79eefd15f85c	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:10:52.161748+00	2025-09-22 00:10:52.161748+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
95d13ead-b6bf-488a-85ae-7e1cfeda9982	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:12:01.730828+00	2025-09-22 00:12:01.730828+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
622932a6-c6cf-4f18-ac20-5e998f2a8a2b	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:18:12.773696+00	2025-09-22 00:18:12.773696+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
7092c94d-3d4a-47a7-ba21-6439c3ad199c	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:20:49.180943+00	2025-09-22 00:20:49.180943+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
c3531774-1ef2-4ba0-9318-0df147d6b268	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:21:02.118312+00	2025-09-22 00:21:02.118312+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
15e90ef3-5ce5-4aa2-afe7-db5192c82e76	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 01:51:47.555012+00	2025-09-22 15:43:51.520912+00	\N	aal1	\N	2025-09-22 15:43:51.520825	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
a70b2a47-b3aa-461f-8f44-8325f5e33b23	e68224cc-ec42-4ceb-9f9a-635d425d1b01	2025-09-22 00:26:17.493792+00	2025-09-22 15:43:51.530384+00	\N	aal1	\N	2025-09-22 15:43:51.530297	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0	47.40.111.10	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	261614b4-70a5-447a-b2fa-cd5d7676efad	\N	\N	test@gmail.com	$2a$06$EjMt19rIf8ZYDZk/p1KdluWgGqL1L5oldFi5N9jo4iYB/geEONShS	2025-09-15 04:20:09.629059+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-15 04:20:09.629059+00	2025-09-15 04:20:09.629059+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e68224cc-ec42-4ceb-9f9a-635d425d1b01	authenticated	authenticated	jeraldjsmith@gmail.com	$2a$10$NhMQu.OFpavjOQRBLEpR3eeV.CRB1.azSjHrzOZSnXkGi/CZhWMSC	2025-09-22 00:10:52.144646+00	\N		\N		\N			\N	2025-09-22 01:51:47.554311+00	{"provider": "email", "providers": ["email"]}	{"sub": "e68224cc-ec42-4ceb-9f9a-635d425d1b01", "email": "jeraldjsmith@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-09-22 00:10:52.07117+00	2025-09-22 15:43:51.519505+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: jobs_20250823_013140; Type: TABLE DATA; Schema: legacy_archive; Owner: postgres
--

COPY legacy_archive.jobs_20250823_013140 (id, company_id, customer_id, quote_id, assigned_technician_id, job_title, description, job_status, start_time, end_time, actual_start, actual_end, created_at, company_name, notes, job_location, estimated_duration, actual_duration, labor_cost, material_cost, total_cost, attachments, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_items_20250828_021425; Type: TABLE DATA; Schema: legacy_archive; Owner: postgres
--

COPY legacy_archive.quote_items_20250828_021425 (id, quote_id, item_name, quantity, rate, is_overtime, description, photo_url, created_at, company_id, company_name) FROM stdin;
\.


--
-- Data for Name: quotes_20250828_021425; Type: TABLE DATA; Schema: legacy_archive; Owner: postgres
--

COPY legacy_archive.quotes_20250828_021425 (id, customer_id, quote_number, title, description, status, subtotal, total_amount, notes, created_at, company_id, company_name) FROM stdin;
\.


--
-- Data for Name: wo_master_20250828_021425; Type: TABLE DATA; Schema: legacy_archive; Owner: postgres
--

COPY legacy_archive.wo_master_20250828_021425 (id, company_id, customer_id, title, description, location, subtotal_cents, tax_cents, total_cents, scheduled_start, scheduled_end, technician_id, quote_snapshot, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attachments (id, company_id, related_type, related_id, file_url, file_type, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_settings (id, company_id, enable_auto_invoice, default_tax_rate, currency, created_at, updated_at) FROM stdin;
0cbdc4ed-8b1c-4ff2-9f83-9f75cd7eff68	7ec8a32f-6f90-4bc5-bf62-6007526ca947	t	0.00	USD	2025-09-22 00:10:52.591624+00	2025-09-22 00:10:52.591624+00
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_events (id, company_id, title, description, event_type, start_time, end_time, location, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: calendar_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calendar_invitations (id, event_id, invitee_email, status, sent_at, responded_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, status, created_at, updated_at, created_by, updated_by, invoice_prefix, invoice_start_number, address, phone, settings, timezone, logo_url) FROM stdin;
7ec8a32f-6f90-4bc5-bf62-6007526ca947	CGRenewables	ACTIVE	2025-09-21 23:38:50.540419+00	2025-09-21 23:38:50.540419+00	\N	\N	2025	1	\N	\N	{}	America/Los_Angeles	\N
\.


--
-- Data for Name: company_document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_document_templates (id, company_id, template_id, created_at) FROM stdin;
\.


--
-- Data for Name: company_invoice_counters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_invoice_counters (company_id, next_number) FROM stdin;
\.


--
-- Data for Name: company_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_profiles (id, company_id, description, services_offered, coverage_area, social_links, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_communications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_communications (id, company_id, customer_id, type, subject, body, metadata, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: customer_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_messages (id, company_id, customer_id, sender_id, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: customer_service_agreements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_service_agreements (id, company_id, customer_id, agreement_text, start_date, end_date, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_tags (id, company_id, customer_id, tag, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, company_id, name, email, phone, status, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: document_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_audit_log (id, document_id, company_id, action, details, created_at) FROM stdin;
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_templates (id, company_id, name, template_type, content, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, company_id, title, description, file_url, doc_type, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: employee_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_audit_log (id, employee_id, company_id, action, details, created_at) FROM stdin;
\.


--
-- Data for Name: employee_time_off; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_time_off (id, company_id, employee_id, start_date, end_date, type, status, approved_by, requested_at, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: employee_timesheets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_timesheets (id, company_id, employee_id, work_date, hours_worked, notes, approved, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, company_id, user_id, hire_date, termination_date, job_title, department, employment_type, pay_rate, pay_type, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, company_id, vendor_id, description, amount, expense_date, category, receipt_url, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, company_id, feature_name, enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: integration_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_settings (id, company_id, service_name, api_key, config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_batches (id, item_id, batch_number, quantity, expiry_date, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, catalog_id, company_id, sku, serial_tracking, batch_tracking, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_locations (id, company_id, name, address, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, company_id, location_id, user_id, type, description, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_serial_numbers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_serial_numbers (id, item_id, serial_number, status, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_stock (id, item_id, location_id, quantity, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_audit_log (id, invoice_id, company_id, action, old_status, new_status, details, created_at) FROM stdin;
\.


--
-- Data for Name: invoice_line_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_line_items (id, company_id, invoice_id, description, quantity, unit_price) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, company_id, work_order_id, customer_id, status, total_amount, due_date, created_by, updated_by, created_at, updated_at, invoice_number, issued_at) FROM stdin;
\.


--
-- Data for Name: items_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_catalog (id, company_id, name, description, unit_price, unit_of_measure, created_at) FROM stdin;
\.


--
-- Data for Name: job_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_photos (id, work_order_id, file_url, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, company_id, customer_id, source, status, potential_value, assigned_to, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketplace_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_messages (id, request_id, sender_id, message, created_at) FROM stdin;
\.


--
-- Data for Name: marketplace_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_requests (id, company_id, customer_id, title, description, status, budget, location, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marketplace_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_responses (id, request_id, company_id, response_status, message, created_at) FROM stdin;
\.


--
-- Data for Name: marketplace_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_reviews (id, request_id, reviewer_id, company_id, rating, review, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, company_id, sender_id, receiver_id, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, company_id, user_id, type, message, status, created_at, read_at) FROM stdin;
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunities (id, company_id, lead_id, customer_id, stage, expected_close_date, value, assigned_to, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_audit_log (id, payment_id, company_id, action, old_status, new_status, details, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, company_id, customer_id, invoice_id, method, amount, status, transaction_reference, received_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_items (id, payroll_run_id, employee_id, hours_worked, gross_pay, deductions, net_pay, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_runs (id, company_id, start_date, end_date, total_amount, status, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: po_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.po_items (id, purchase_order_id, description, quantity, unit_price, total) FROM stdin;
\.


--
-- Data for Name: pto_current_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pto_current_balances (id, company_id, employee_id, balance_hours, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, company_id, vendor_id, order_number, status, total_amount, order_date, expected_date, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quote_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_analytics (id, company_id, work_order_id, viewed_at, accepted_at, declined_at, created_at) FROM stdin;
\.


--
-- Data for Name: quote_approval_workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_approval_workflows (id, company_id, work_order_id, approver_id, status, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: quote_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_audit_log (id, work_order_id, company_id, action, old_status, new_status, details, created_at) FROM stdin;
\.


--
-- Data for Name: quote_follow_ups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_follow_ups (id, company_id, work_order_id, follow_up_date, notes, completed, created_at) FROM stdin;
\.


--
-- Data for Name: quote_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quote_templates (id, company_id, name, content, created_at) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, company_id, name, type, parameters, generated_at, created_by) FROM stdin;
\.


--
-- Data for Name: request_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_tags (id, request_id, tag) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, company_id, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: sales_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_activities (id, company_id, lead_id, opportunity_id, type, notes, activity_date, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: schedule_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_events (id, company_id, work_order_id, employee_id, customer_id, title, description, event_type, start_time, end_time, status, location, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shared_document_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shared_document_templates (id, template_id, shared_with_company_id, created_at) FROM stdin;
\.


--
-- Data for Name: tools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tools (id, company_id, name, description, serial_number, assigned_to, location, status, created_at) FROM stdin;
\.


--
-- Data for Name: user_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_audit_log (id, user_id, company_id, action, details, created_at) FROM stdin;
\.


--
-- Data for Name: user_dashboard_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_dashboard_settings (id, user_id, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, company_id, email, full_name, status, created_at, updated_at, created_by, updated_by, role, last_login, phone, avatar_url, settings, profile_picture_url, preferences) FROM stdin;
e68224cc-ec42-4ceb-9f9a-635d425d1b01	7ec8a32f-6f90-4bc5-bf62-6007526ca947	jeraldjsmith@gmail.com	Jerald Smith	ACTIVE	2025-09-22 00:10:52.373156+00	2025-09-22 01:51:47.945974+00	\N	\N	owner	2025-09-22 01:51:50.448+00	\N	\N	{}	\N	{}
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, company_id, name, contact_name, email, phone, address, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: work_order_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_audit_log (id, work_order_id, company_id, action, old_status, new_status, details, created_at) FROM stdin;
\.


--
-- Data for Name: work_order_audit_log_ext; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_audit_log_ext (id, work_order_id, company_id, action, old_status, new_status, details, created_at) FROM stdin;
\.


--
-- Data for Name: work_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_items (id, work_order_id, description, quantity, unit_price, total) FROM stdin;
\.


--
-- Data for Name: work_order_labor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_labor (id, work_order_id, employee_id, hours, rate, total) FROM stdin;
\.


--
-- Data for Name: work_order_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_messages (id, work_order_id, sender_id, message, created_at) FROM stdin;
\.


--
-- Data for Name: work_order_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_milestones (id, work_order_id, title, description, due_date, status, completed_at) FROM stdin;
\.


--
-- Data for Name: work_order_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_order_versions (id, work_order_id, version_number, changes, created_at) FROM stdin;
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_orders (id, company_id, customer_id, title, description, status, estimated_duration, total_amount, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-01 20:54:10
20211116045059	2025-08-01 20:54:13
20211116050929	2025-08-01 20:54:16
20211116051442	2025-08-01 20:54:18
20211116212300	2025-08-01 20:54:20
20211116213355	2025-08-01 20:54:23
20211116213934	2025-08-01 20:54:25
20211116214523	2025-08-01 20:54:28
20211122062447	2025-08-01 20:54:30
20211124070109	2025-08-01 20:54:32
20211202204204	2025-08-01 20:54:34
20211202204605	2025-08-01 20:54:36
20211210212804	2025-08-01 20:54:43
20211228014915	2025-08-01 20:54:45
20220107221237	2025-08-01 20:54:48
20220228202821	2025-08-01 20:54:50
20220312004840	2025-08-01 20:54:52
20220603231003	2025-08-01 20:54:55
20220603232444	2025-08-01 20:54:57
20220615214548	2025-08-01 20:55:00
20220712093339	2025-08-01 20:55:02
20220908172859	2025-08-01 20:55:04
20220916233421	2025-08-01 20:55:06
20230119133233	2025-08-01 20:55:08
20230128025114	2025-08-01 20:55:11
20230128025212	2025-08-01 20:55:14
20230227211149	2025-08-01 20:55:16
20230228184745	2025-08-01 20:55:18
20230308225145	2025-08-01 20:55:20
20230328144023	2025-08-01 20:55:22
20231018144023	2025-08-01 20:55:25
20231204144023	2025-08-01 20:55:28
20231204144024	2025-08-01 20:55:30
20231204144025	2025-08-01 20:55:32
20240108234812	2025-08-01 20:55:35
20240109165339	2025-08-01 20:55:37
20240227174441	2025-08-01 20:55:41
20240311171622	2025-08-01 20:55:44
20240321100241	2025-08-01 20:55:48
20240401105812	2025-08-01 20:55:54
20240418121054	2025-08-01 20:55:57
20240523004032	2025-08-01 20:56:05
20240618124746	2025-08-01 20:56:07
20240801235015	2025-08-01 20:56:09
20240805133720	2025-08-01 20:56:11
20240827160934	2025-08-01 20:56:14
20240919163303	2025-08-01 20:56:17
20240919163305	2025-08-01 20:56:19
20241019105805	2025-08-01 20:56:21
20241030150047	2025-08-01 20:56:29
20241108114728	2025-08-01 20:56:32
20241121104152	2025-08-01 20:56:34
20241130184212	2025-08-01 20:56:37
20241220035512	2025-08-01 20:56:39
20241220123912	2025-08-01 20:56:41
20241224161212	2025-08-01 20:56:43
20250107150512	2025-08-01 20:56:46
20250110162412	2025-08-01 20:56:48
20250123174212	2025-08-01 20:56:50
20250128220012	2025-08-01 20:56:52
20250506224012	2025-08-01 20:56:54
20250523164012	2025-08-01 20:56:56
20250714121412	2025-08-01 20:56:58
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
company-files	company-files	\N	2025-08-26 01:40:44.761606+00	2025-08-26 01:40:44.761606+00	t	f	\N	\N	\N	STANDARD
company-assets	company-assets	\N	2025-08-26 02:24:25.329344+00	2025-08-26 02:24:25.329344+00	t	f	\N	\N	\N	STANDARD
quote_pdfs	quote_pdfs	\N	2025-09-15 02:09:59.9944+00	2025-09-15 02:09:59.9944+00	f	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-01 20:54:08.37881
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-01 20:54:08.391117
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-01 20:54:08.394252
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-01 20:54:08.430022
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-01 20:54:08.459726
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-01 20:54:08.463939
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-01 20:54:08.469413
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-01 20:54:08.473627
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-01 20:54:08.476929
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-01 20:54:08.480271
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-01 20:54:08.484497
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-01 20:54:08.488569
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-01 20:54:08.498301
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-01 20:54:08.504398
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-01 20:54:08.508578
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-01 20:54:08.54354
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-01 20:54:08.55714
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-01 20:54:08.56085
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-01 20:54:08.56605
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-01 20:54:08.574185
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-01 20:54:08.578703
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-01 20:54:08.593121
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-01 20:54:08.615102
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-01 20:54:08.631942
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-01 20:54:08.635989
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-01 20:54:08.64106
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-09-01 20:13:38.624076
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-09-01 20:13:38.855593
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-09-01 20:13:38.87374
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-09-01 20:13:38.918253
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-09-01 20:13:38.950266
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-09-01 20:13:38.975627
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-09-01 20:13:39.021406
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-09-01 20:13:39.045041
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-09-01 20:13:39.048674
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-09-01 20:13:39.073584
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-09-01 20:13:39.125167
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-09-01 20:13:39.159241
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-09-01 20:13:39.249372
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
9340efdf-4283-4022-84f1-37cbdcbf6915	company-assets	company-ba643da1-c16f-468e-8fcb-f347e7929597/branding/company_logo/1756175173073-wd3wf4.png	\N	2025-08-26 02:26:13.626576+00	2025-09-01 20:13:38.92152+00	2025-08-26 02:26:13.626576+00	{"eTag": "\\"e756c75626a05905c6f423d1682667d2\\"", "size": 98291, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-08-26T02:26:14.000Z", "contentLength": 98291, "httpStatusCode": 200}	f9861ae7-9b51-49aa-9075-bca6f808f511	\N	{}	4
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
company-assets	company-ba643da1-c16f-468e-8fcb-f347e7929597	2025-09-01 20:13:38.87564+00	2025-09-01 20:13:38.87564+00
company-assets	company-ba643da1-c16f-468e-8fcb-f347e7929597/branding	2025-09-01 20:13:38.87564+00	2025-09-01 20:13:38.87564+00
company-assets	company-ba643da1-c16f-468e-8fcb-f347e7929597/branding/company_logo	2025-09-01 20:13:38.87564+00	2025-09-01 20:13:38.87564+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 121, true);


--
-- Name: document_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_audit_log_id_seq', 1, false);


--
-- Name: employee_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_audit_log_id_seq', 1, false);


--
-- Name: invoice_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_audit_log_id_seq', 1, false);


--
-- Name: invoice_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_number_seq', 1, false);


--
-- Name: payment_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_audit_log_id_seq', 1, false);


--
-- Name: quote_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quote_audit_log_id_seq', 1, false);


--
-- Name: user_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_audit_log_id_seq', 1, false);


--
-- Name: work_order_audit_log_ext_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_audit_log_ext_id_seq', 1, false);


--
-- Name: work_order_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.work_order_audit_log_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: calendar_invitations calendar_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_invitations
    ADD CONSTRAINT calendar_invitations_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_document_templates company_document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_document_templates
    ADD CONSTRAINT company_document_templates_pkey PRIMARY KEY (id);


--
-- Name: company_invoice_counters company_invoice_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invoice_counters
    ADD CONSTRAINT company_invoice_counters_pkey PRIMARY KEY (company_id);


--
-- Name: company_profiles company_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (id);


--
-- Name: customer_communications customer_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_communications
    ADD CONSTRAINT customer_communications_pkey PRIMARY KEY (id);


--
-- Name: customer_messages customer_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_pkey PRIMARY KEY (id);


--
-- Name: customer_service_agreements customer_service_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_service_agreements
    ADD CONSTRAINT customer_service_agreements_pkey PRIMARY KEY (id);


--
-- Name: customer_tags customer_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: document_audit_log document_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audit_log
    ADD CONSTRAINT document_audit_log_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_audit_log employee_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_audit_log
    ADD CONSTRAINT employee_audit_log_pkey PRIMARY KEY (id);


--
-- Name: employee_time_off employee_time_off_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_pkey PRIMARY KEY (id);


--
-- Name: employee_timesheets employee_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: inventory_batches inventory_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_locations inventory_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_serial_numbers inventory_serial_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_serial_numbers
    ADD CONSTRAINT inventory_serial_numbers_pkey PRIMARY KEY (id);


--
-- Name: inventory_stock inventory_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_pkey PRIMARY KEY (id);


--
-- Name: invoice_audit_log invoice_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_audit_log
    ADD CONSTRAINT invoice_audit_log_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: items_catalog items_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_catalog
    ADD CONSTRAINT items_catalog_pkey PRIMARY KEY (id);


--
-- Name: job_photos job_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: marketplace_messages marketplace_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_pkey PRIMARY KEY (id);


--
-- Name: marketplace_requests marketplace_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_pkey PRIMARY KEY (id);


--
-- Name: marketplace_responses marketplace_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_pkey PRIMARY KEY (id);


--
-- Name: marketplace_reviews marketplace_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: payment_audit_log payment_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_audit_log
    ADD CONSTRAINT payment_audit_log_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payroll_items payroll_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: po_items po_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_pkey PRIMARY KEY (id);


--
-- Name: pto_current_balances pto_current_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pto_current_balances
    ADD CONSTRAINT pto_current_balances_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: quote_analytics quote_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_pkey PRIMARY KEY (id);


--
-- Name: quote_approval_workflows quote_approval_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_pkey PRIMARY KEY (id);


--
-- Name: quote_audit_log quote_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_audit_log
    ADD CONSTRAINT quote_audit_log_pkey PRIMARY KEY (id);


--
-- Name: quote_follow_ups quote_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: quote_templates quote_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: request_tags request_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_tags
    ADD CONSTRAINT request_tags_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sales_activities sales_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_pkey PRIMARY KEY (id);


--
-- Name: schedule_events schedule_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);


--
-- Name: shared_document_templates shared_document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_document_templates
    ADD CONSTRAINT shared_document_templates_pkey PRIMARY KEY (id);


--
-- Name: tools tools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);


--
-- Name: user_audit_log user_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_audit_log
    ADD CONSTRAINT user_audit_log_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: work_order_audit_log_ext work_order_audit_log_ext_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log_ext
    ADD CONSTRAINT work_order_audit_log_ext_pkey PRIMARY KEY (id);


--
-- Name: work_order_audit_log work_order_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_pkey PRIMARY KEY (id);


--
-- Name: work_order_items work_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_pkey PRIMARY KEY (id);


--
-- Name: work_order_labor work_order_labor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_pkey PRIMARY KEY (id);


--
-- Name: work_order_messages work_order_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_messages
    ADD CONSTRAINT work_order_messages_pkey PRIMARY KEY (id);


--
-- Name: work_order_milestones work_order_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_milestones
    ADD CONSTRAINT work_order_milestones_pkey PRIMARY KEY (id);


--
-- Name: work_order_versions work_order_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_customer_communications_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_communications_company_id ON public.customer_communications USING btree (company_id);


--
-- Name: idx_customer_messages_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_messages_company_id ON public.customer_messages USING btree (company_id);


--
-- Name: idx_customer_service_agreements_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_service_agreements_company_id ON public.customer_service_agreements USING btree (company_id);


--
-- Name: idx_customer_tags_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_tags_company_id ON public.customer_tags USING btree (company_id);


--
-- Name: idx_inventory_locations_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_locations_company_id ON public.inventory_locations USING btree (company_id);


--
-- Name: idx_inventory_movements_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_company_id ON public.inventory_movements USING btree (company_id);


--
-- Name: idx_invoice_line_items_invoice_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items USING btree (invoice_id);


--
-- Name: idx_leads_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leads_company_id ON public.leads USING btree (company_id);


--
-- Name: idx_notifications_company_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_company_user ON public.notifications USING btree (company_id, user_id, status);


--
-- Name: idx_opportunities_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunities_company_id ON public.opportunities USING btree (company_id);


--
-- Name: idx_payments_company_invoice; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_company_invoice ON public.payments USING btree (company_id, invoice_id, status);


--
-- Name: idx_quote_analytics_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quote_analytics_company_id ON public.quote_analytics USING btree (company_id);


--
-- Name: idx_quote_approval_workflows_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quote_approval_workflows_company_id ON public.quote_approval_workflows USING btree (company_id);


--
-- Name: idx_quote_follow_ups_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_quote_follow_ups_company_id ON public.quote_follow_ups USING btree (company_id);


--
-- Name: idx_sales_activities_company_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_activities_company_id ON public.sales_activities USING btree (company_id);


--
-- Name: idx_work_order_audit_log_work_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_work_order_audit_log_work_order_id ON public.work_order_audit_log USING btree (work_order_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: customers set_updated_at_customers; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoice_line_items set_updated_at_invoice_line_items; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_invoice_line_items BEFORE UPDATE ON public.invoice_line_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices set_updated_at_invoices; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: user_dashboard_settings set_updated_at_user_dashboard_settings; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_user_dashboard_settings BEFORE UPDATE ON public.user_dashboard_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users set_updated_at_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: work_order_audit_log set_updated_at_work_order_audit_log; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_work_order_audit_log BEFORE UPDATE ON public.work_order_audit_log FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: work_orders set_updated_at_work_orders; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at_work_orders BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: work_orders trg_log_work_order_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_work_order_change AFTER UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.log_work_order_change();


--
-- Name: invoices trg_set_invoice_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: business_settings business_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: calendar_events calendar_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: calendar_invitations calendar_invitations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calendar_invitations
    ADD CONSTRAINT calendar_invitations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.schedule_events(id) ON DELETE CASCADE;


--
-- Name: companies companies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: companies companies_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: company_document_templates company_document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_document_templates
    ADD CONSTRAINT company_document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_document_templates company_document_templates_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_document_templates
    ADD CONSTRAINT company_document_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.document_templates(id) ON DELETE CASCADE;


--
-- Name: company_invoice_counters company_invoice_counters_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_invoice_counters
    ADD CONSTRAINT company_invoice_counters_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_profiles company_profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_profiles
    ADD CONSTRAINT company_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_communications customer_communications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_communications
    ADD CONSTRAINT customer_communications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_communications customer_communications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_communications
    ADD CONSTRAINT customer_communications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: customer_communications customer_communications_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_communications
    ADD CONSTRAINT customer_communications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: customer_service_agreements customer_service_agreements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_service_agreements
    ADD CONSTRAINT customer_service_agreements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_service_agreements customer_service_agreements_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_service_agreements
    ADD CONSTRAINT customer_service_agreements_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_tags customer_tags_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_tags customer_tags_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: customers customers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: document_audit_log document_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audit_log
    ADD CONSTRAINT document_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: document_audit_log document_audit_log_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_audit_log
    ADD CONSTRAINT document_audit_log_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_templates document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: employee_audit_log employee_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_audit_log
    ADD CONSTRAINT employee_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: employee_audit_log employee_audit_log_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_audit_log
    ADD CONSTRAINT employee_audit_log_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_time_off employee_time_off_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_time_off employee_time_off_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_time_off employee_time_off_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_timesheets employee_timesheets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees employees_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: expenses expenses_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: feature_flags feature_flags_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: integration_settings integration_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_batches inventory_batches_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.items_catalog(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_locations inventory_locations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_locations
    ADD CONSTRAINT inventory_locations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id);


--
-- Name: inventory_movements inventory_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: inventory_serial_numbers inventory_serial_numbers_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_serial_numbers
    ADD CONSTRAINT inventory_serial_numbers_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id);


--
-- Name: invoice_audit_log invoice_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_audit_log
    ADD CONSTRAINT invoice_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: invoice_audit_log invoice_audit_log_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_audit_log
    ADD CONSTRAINT invoice_audit_log_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: invoice_line_items invoice_line_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: items_catalog items_catalog_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_catalog
    ADD CONSTRAINT items_catalog_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: job_photos job_photos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: job_photos job_photos_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: leads leads_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: leads leads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: leads leads_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: leads leads_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: marketplace_messages marketplace_messages_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_messages marketplace_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_messages
    ADD CONSTRAINT marketplace_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: marketplace_requests marketplace_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_requests marketplace_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: marketplace_responses marketplace_responses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_responses marketplace_responses_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_reviews marketplace_reviews_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: marketplace_reviews marketplace_reviews_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_reviews marketplace_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.customers(id);


--
-- Name: messages messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: opportunities opportunities_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: opportunities opportunities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: opportunities opportunities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: opportunities opportunities_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: opportunities opportunities_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: opportunities opportunities_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: payment_audit_log payment_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_audit_log
    ADD CONSTRAINT payment_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: payment_audit_log payment_audit_log_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_audit_log
    ADD CONSTRAINT payment_audit_log_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payments payments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: payroll_items payroll_items_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: payroll_items payroll_items_payroll_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) ON DELETE CASCADE;


--
-- Name: payroll_runs payroll_runs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payroll_runs payroll_runs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: po_items po_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: pto_current_balances pto_current_balances_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pto_current_balances
    ADD CONSTRAINT pto_current_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: pto_current_balances pto_current_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pto_current_balances
    ADD CONSTRAINT pto_current_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: quote_analytics quote_analytics_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_analytics quote_analytics_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_analytics
    ADD CONSTRAINT quote_analytics_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_approval_workflows quote_approval_workflows_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: quote_approval_workflows quote_approval_workflows_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_approval_workflows quote_approval_workflows_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_audit_log quote_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_audit_log
    ADD CONSTRAINT quote_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: quote_audit_log quote_audit_log_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_audit_log
    ADD CONSTRAINT quote_audit_log_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_follow_ups quote_follow_ups_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_follow_ups quote_follow_ups_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_templates quote_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reports reports_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reports reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: request_tags request_tags_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.request_tags
    ADD CONSTRAINT request_tags_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: sales_activities sales_activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: sales_activities sales_activities_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: sales_activities sales_activities_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id);


--
-- Name: sales_activities sales_activities_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id);


--
-- Name: schedule_events schedule_events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: schedule_events schedule_events_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: schedule_events schedule_events_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: schedule_events schedule_events_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: shared_document_templates shared_document_templates_shared_with_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_document_templates
    ADD CONSTRAINT shared_document_templates_shared_with_company_id_fkey FOREIGN KEY (shared_with_company_id) REFERENCES public.companies(id);


--
-- Name: shared_document_templates shared_document_templates_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_document_templates
    ADD CONSTRAINT shared_document_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.document_templates(id) ON DELETE CASCADE;


--
-- Name: tools tools_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: tools tools_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tools
    ADD CONSTRAINT tools_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_audit_log user_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_audit_log
    ADD CONSTRAINT user_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: user_audit_log user_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_audit_log
    ADD CONSTRAINT user_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users users_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vendors vendors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_audit_log work_order_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_audit_log_ext work_order_audit_log_ext_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log_ext
    ADD CONSTRAINT work_order_audit_log_ext_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: work_order_audit_log_ext work_order_audit_log_ext_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log_ext
    ADD CONSTRAINT work_order_audit_log_ext_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_audit_log work_order_audit_log_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_items work_order_items_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_labor work_order_labor_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: work_order_labor work_order_labor_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_messages work_order_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_messages
    ADD CONSTRAINT work_order_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: work_order_messages work_order_messages_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_messages
    ADD CONSTRAINT work_order_messages_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_milestones work_order_milestones_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_milestones
    ADD CONSTRAINT work_order_milestones_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_versions work_order_versions_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: work_orders work_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow all authenticated deletes from company-files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow all authenticated deletes from company-files" ON storage.objects FOR DELETE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow all authenticated updates to company-files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow all authenticated updates to company-files" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow all authenticated uploads to company-files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow all authenticated uploads to company-files" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file deletes; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow company file deletes" ON storage.objects FOR DELETE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file updates; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow company file updates" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file uploads; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow company file uploads" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow public read access to company files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow public read access to company files" ON storage.objects FOR SELECT USING ((bucket_id = 'company-files'::text));


--
-- Name: objects Allow public read from company-files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow public read from company-files" ON storage.objects FOR SELECT USING ((bucket_id = 'company-files'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: objects company-assets auth delete; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "company-assets auth delete" ON storage.objects FOR DELETE USING (((bucket_id = 'company-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects company-assets auth insert; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "company-assets auth insert" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'company-assets'::text));


--
-- Name: objects company-assets auth update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "company-assets auth update" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects company-assets public read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "company-assets public read" ON storage.objects FOR SELECT USING ((bucket_id = 'company-assets'::text));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT USAGE ON SCHEMA public TO anon;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE business_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_settings TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.business_settings TO authenticated;


--
-- Name: TABLE work_orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.work_orders TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.work_orders TO authenticated;


--
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companies TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.companies TO authenticated;


--
-- Name: TABLE integration_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.integration_settings TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.integration_settings TO authenticated;


--
-- Name: TABLE invoice_line_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.invoice_line_items TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.invoice_line_items TO authenticated;


--
-- Name: SEQUENCE invoice_number_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.invoice_number_seq TO anon;
GRANT ALL ON SEQUENCE public.invoice_number_seq TO authenticated;


--
-- Name: TABLE invoices; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invoices TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.invoices TO authenticated;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.users TO authenticated;


--
-- Name: SEQUENCE work_order_audit_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.work_order_audit_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.work_order_audit_log_id_seq TO authenticated;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict CmdlgybkmQg6lcP48Rxo0OkwxQ1ee67Y8CvNTVh4JmRJNfUBy44doeLyHLHWNn5

