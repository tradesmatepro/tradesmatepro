--
-- PostgreSQL database dump
--

\restrict cbhcfQi03KM0nB3kYKtV8oh98RHORQ0NkHMVFMPUmwoqenVt7cyBeqT5FpZ6Zmn

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
-- Name: legacy_archive; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA legacy_archive;


--
-- Name: SCHEMA legacy_archive; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA legacy_archive IS 'Stores archived copies of deprecated tables to avoid accidental use in the app.';


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
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


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
-- Name: invoice_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_status_enum AS ENUM (
    'UNPAID',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE'
);


--
-- Name: item_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.item_type_enum AS ENUM (
    'material',
    'part',
    'labor',
    'service'
);


--
-- Name: job_priority_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_priority_enum AS ENUM (
    'low',
    'normal',
    'high',
    'emergency'
);


--
-- Name: lead_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lead_status_enum AS ENUM (
    'NEW',
    'QUALIFIED',
    'CONTACTED',
    'CONVERTED',
    'LOST'
);


--
-- Name: marketplace_response_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.marketplace_response_status_enum AS ENUM (
    'INTERESTED',
    'OFFER_SUBMITTED',
    'INFO_REQUESTED',
    'SITE_VISIT_PROPOSED',
    'ACCEPTED',
    'DECLINED'
);


--
-- Name: marketplace_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.marketplace_status_enum AS ENUM (
    'AVAILABLE',
    'NEGOTIATION',
    'AUTO_HOLD',
    'BOOKED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELED'
);


--
-- Name: movement_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.movement_type_enum AS ENUM (
    'PURCHASE',
    'RETURN',
    'USAGE',
    'TRANSFER',
    'ADJUSTMENT',
    'ALLOCATION'
);


--
-- Name: pricing_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pricing_enum AS ENUM (
    'FLAT',
    'HOURLY',
    'NEGOTIABLE'
);


--
-- Name: pricing_model_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pricing_model_enum AS ENUM (
    'FLAT',
    'HOURLY',
    'NEGOTIABLE'
);


--
-- Name: pricing_preference_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.pricing_preference_enum AS ENUM (
    'FLAT',
    'HOURLY',
    'NEGOTIABLE'
);


--
-- Name: request_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.request_type_enum AS ENUM (
    'STANDARD',
    'EMERGENCY'
);


--
-- Name: response_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.response_status_enum AS ENUM (
    'OFFERED',
    'ACCEPTED',
    'REJECTED',
    'DECLINED',
    'BOOKED'
);


--
-- Name: review_target_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_target_enum AS ENUM (
    'COMPANY',
    'WORK_ORDER',
    'MARKETPLACE'
);


--
-- Name: service_mode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_mode_enum AS ENUM (
    'ONSITE',
    'REMOTE',
    'HYBRID'
);


--
-- Name: stage_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stage_enum AS ENUM (
    'QUOTE',
    'JOB',
    'WORK_ORDER'
);


--
-- Name: unified_job_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.unified_job_status_enum AS ENUM (
    'DRAFT',
    'OPEN',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'ASSIGNED'
);


--
-- Name: verification_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status_enum AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED'
);


--
-- Name: work_order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.work_order_status_enum AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'DECLINED',
    'EXPIRED',
    'INVOICED'
);


--
-- Name: workflow_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workflow_status_enum AS ENUM (
    'APPROVED',
    'REJECTED',
    'PENDING'
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
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
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
-- Name: _add_col_if_missing(text, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._add_col_if_missing(p_schema text, p_table text, p_col text, p_type text, p_default text DEFAULT NULL::text, p_not_null boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = p_schema AND table_name = p_table AND column_name = p_col
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s', p_schema, p_table, p_col, p_type);
    IF p_default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s', p_schema, p_table, p_col, p_default);
    END IF;
    IF p_not_null THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET NOT NULL', p_schema, p_table, p_col);
    END IF;
  END IF;
END;
$$;


--
-- Name: accept_marketplace_response(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_marketplace_response(_response_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  _request_id uuid;
begin
  -- mark response as accepted
  update marketplace_responses
  set response_status = 'accepted'
  where id = _response_id;

  -- tie request to response
  update marketplace_requests
  set booked_response_id = _response_id,
      status = 'booked'
  where id = (select request_id from marketplace_responses where id = _response_id);

  -- mark all other responses as rejected
  update marketplace_responses
  set response_status = 'rejected'
  where request_id = (select request_id from marketplace_responses where id = _response_id)
    and id <> _response_id;
end;
$$;


--
-- Name: accept_marketplace_response(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_marketplace_response(_response_id uuid, _customer_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    _request_id uuid;
    new_work_order_id uuid;
BEGIN
    -- Find request
    SELECT request_id INTO _request_id
    FROM marketplace_responses
    WHERE id = _response_id;

    -- Mark chosen response as ACCEPTED
    UPDATE marketplace_responses
    SET response_status = 'ACCEPTED'
    WHERE id = _response_id;

    -- Decline all other responses for same request
    UPDATE marketplace_responses
    SET response_status = 'DECLINED'
    WHERE request_id = _request_id
      AND id <> _response_id;

    -- Create linked work order
    INSERT INTO work_orders (
        marketplace_request_id,
        marketplace_response_id,
        customer_id,
        status,
        created_at
    ) VALUES (
        _request_id,
        _response_id,
        _customer_id,
        'PENDING',
        now()
    )
    RETURNING id INTO new_work_order_id;

    RETURN new_work_order_id;
END;
$$;


--
-- Name: accept_marketplace_response(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accept_marketplace_response(_request_id uuid, _response_id uuid, _customer_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
  v_response marketplace_responses%rowtype;
  v_request marketplace_requests%rowtype;
  v_work_order_id uuid;
begin
  -- Load response
  select * into v_response
  from marketplace_responses
  where id = _response_id;

  if not found then
    raise exception 'Response not found';
  end if;

  -- Load request
  select * into v_request
  from marketplace_requests
  where id = _request_id;

  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.booked_response_id is not null then
    raise exception 'Request already booked with another response';
  end if;

  -- Mark accepted
  update marketplace_responses
  set response_status = 'ACCEPTED'
  where id = _response_id;

  -- Reject all others
  update marketplace_responses
  set response_status = 'REJECTED'
  where request_id = _request_id
    and id <> _response_id;

  -- Link request
  update marketplace_requests
  set booked_response_id = _response_id,
      status = 'booked'
  where id = _request_id;

  -- Always create a work order in QUOTE
  insert into work_orders (
    company_id,
    customer_id,
    marketplace_request_id,
    marketplace_response_id,
    status,
    quote_amount,
    description,
    created_at
  )
  values (
    v_response.company_id,
    _customer_id,
    _request_id,
    _response_id,
    'QUOTE',  -- work_order_status_enum should already exist
    case
      when v_response.response_status = 'OFFERED' then v_response.proposed_rate
      else null
    end,
    v_request.description,
    now()
  )
  returning id into v_work_order_id;

  -- If OFFERED, mark quote as sent
  if v_response.response_status = 'OFFERED' then
    update work_orders
    set quote_sent_at = now()
    where id = v_work_order_id;
  end if;

end;
$$;


--
-- Name: accrue_pto(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.accrue_pto() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Insert accrual entries for all employees with active policies
  INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
  SELECT
    gen_random_uuid(),
    e.id AS employee_id,
    p.id AS policy_id,
    'ACCRUAL' AS entry_type,
    p.vacation_hours_per_period AS hours,
    now()
  FROM employees e
  JOIN pto_policies p ON p.company_id = e.company_id
  WHERE p.vacation_hours_per_period > 0;

  -- Update balances for employees who just received accruals
  UPDATE pto_balances b
  SET balance = b.balance + sub.hours
  FROM (
    SELECT employee_id, SUM(hours) AS hours
    FROM pto_ledger
    WHERE entry_type = 'ACCRUAL'
      AND created_at::date = current_date
    GROUP BY employee_id
  ) sub
  WHERE b.employee_id = sub.employee_id;
END;
$$;


--
-- Name: add_pto_ledger_entry(uuid, uuid, text, text, numeric, date, text, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_pto_ledger_entry(p_employee_id uuid, p_company_id uuid, p_category_code text DEFAULT 'VAC'::text, p_entry_type text DEFAULT 'ACCRUAL'::text, p_hours numeric DEFAULT 0, p_effective_date date DEFAULT CURRENT_DATE, p_description text DEFAULT NULL::text, p_related_request_id uuid DEFAULT NULL::uuid, p_processed_by uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_balance DECIMAL(8,2);
  entry_id UUID;
BEGIN
  -- Calculate new balance
  new_balance := get_pto_balance(p_employee_id, p_category_code, p_effective_date) + p_hours;

  -- Insert ledger entry
  INSERT INTO pto_ledger (
    employee_id, company_id, category_code, entry_type, hours,
    effective_date, balance_after, description, related_request_id, processed_by
  ) VALUES (
    p_employee_id, p_company_id, p_category_code, p_entry_type, p_hours,
    p_effective_date, new_balance, p_description, p_related_request_id, p_processed_by
  ) RETURNING id INTO entry_id;

  RETURN entry_id;
END;
$$;


--
-- Name: add_tag_to_company(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_tag_to_company(_company_id uuid, _tag_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    _tag_id uuid;
begin
    -- normalize input
    _tag_name := lower(trim(_tag_name));

    -- ensure tag exists in tags table
    insert into public.tags (name, category, is_curated)
    values (_tag_name, 'CUSTOM', false)
    on conflict (name) do nothing;

    -- get tag id
    select id into _tag_id
    from public.tags
    where name = _tag_name
    limit 1;

    -- link company to tag
    insert into public.company_tags (company_id, tag_id)
    values (_company_id, _tag_id)
    on conflict do nothing;
end;
$$;


--
-- Name: add_tag_to_request(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_tag_to_request(_request_id uuid, _tag_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
declare
    _tag_id uuid;
begin
    -- normalize input
    _tag_name := lower(trim(_tag_name));

    -- ensure tag exists in tags table
    insert into public.tags (name, category, is_curated)
    values (_tag_name, 'CUSTOM', false)
    on conflict (name) do nothing;

    -- get tag id
    select id into _tag_id
    from public.tags
    where name = _tag_name
    limit 1;

    -- link request to tag
    insert into public.request_tags (request_id, tag_id)
    values (_request_id, _tag_id)
    on conflict do nothing;
end;
$$;


--
-- Name: apply_patch(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_patch(patch_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  patch auto_patches%ROWTYPE;
BEGIN
  SELECT * INTO patch FROM auto_patches WHERE id = patch_id;

  IF patch.status != 'pending' THEN
    RETURN json_build_object('status','error','message','Already applied or failed');
  END IF;

  BEGIN
    EXECUTE patch.sql_command;
    UPDATE auto_patches SET status='applied', applied_at=now() WHERE id=patch_id;
    RETURN json_build_object('status','success','patch_id',patch_id);
  EXCEPTION WHEN OTHERS THEN
    UPDATE auto_patches SET status='failed', error_message=SQLERRM WHERE id=patch_id;
    RETURN json_build_object('status','error','patch_id',patch_id,'message',SQLERRM);
  END;
END;
$$;


--
-- Name: auto_generate_po_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_po_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := generate_po_number(NEW.company_id);
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: auto_generate_work_order_numbers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_generate_work_order_numbers() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Generate quote number when status is QUOTE and quote_number is null
    IF NEW.status = 'QUOTE' AND NEW.quote_number IS NULL THEN
        NEW.quote_number := generate_quote_number(NEW.company_id);
    END IF;
    
    -- Generate job number when status changes to ACCEPTED/SCHEDULED and job_number is null
    IF NEW.status IN ('ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED') AND NEW.job_number IS NULL THEN
        NEW.job_number := generate_job_number(NEW.company_id);
    END IF;
    
    -- Generate invoice number when status changes to INVOICED and invoice_number is null
    IF NEW.status = 'INVOICED' AND NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number(NEW.company_id);
        NEW.invoice_date := COALESCE(NEW.invoice_date, now());
        NEW.due_date := COALESCE(NEW.due_date, now() + INTERVAL '30 days');
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: backup_db(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.backup_db(label text DEFAULT 'auto'::text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  ts text := to_char(now(), 'YYYYMMDD_HH24MISS');
  fname text := format('%s_backup_%s.dump', label, ts);
BEGIN
  PERFORM dblink_connect('host=db.amgtktrwpdsigcomavlg.supabase.co user=postgres password=YOURPASSWORD dbname=postgres');
  -- Note: native pg_dump via SQL isn’t possible, so this just logs metadata
  RETURN json_build_object(
    'status', 'scheduled',
    'filename', fname,
    'time', now()
  );
END;
$$;


--
-- Name: calculate_next_due_date(date, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_next_due_date(p_start_date date, p_frequency_type character varying) RETURNS date
    LANGUAGE plpgsql
    AS $$
BEGIN
    CASE p_frequency_type
        WHEN 'weekly' THEN RETURN p_start_date + INTERVAL '1 week';
        WHEN 'biweekly' THEN RETURN p_start_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN RETURN p_start_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN RETURN p_start_date + INTERVAL '3 months';
        WHEN 'semiannual' THEN RETURN p_start_date + INTERVAL '6 months';
        WHEN 'annual' THEN RETURN p_start_date + INTERVAL '1 year';
        ELSE RETURN p_start_date + INTERVAL '1 month';
    END CASE;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    company_name text,
    title text NOT NULL,
    description text,
    customer_id uuid,
    status public.work_order_status_enum NOT NULL,
    assigned_technician_id uuid,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    estimated_duration integer,
    work_location text,
    subtotal numeric(12,4) DEFAULT 0,
    tax_rate numeric(5,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(12,4) DEFAULT 0,
    quote_number text,
    quote_sent_date timestamp with time zone,
    quote_expires_date timestamp with time zone,
    job_number text,
    actual_start_time timestamp with time zone,
    actual_end_time timestamp with time zone,
    invoice_number text,
    invoice_date timestamp with time zone,
    due_date timestamp with time zone,
    amount_paid numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    notes text,
    internal_notes text,
    attachments jsonb DEFAULT '[]'::jsonb,
    stage public.stage_enum DEFAULT 'QUOTE'::public.stage_enum NOT NULL,
    labor_subtotal numeric(12,2) DEFAULT 0,
    labor_summary jsonb,
    reason text,
    invoice_id uuid,
    pricing_model text DEFAULT 'TIME_MATERIALS'::text,
    flat_rate_amount numeric,
    unit_count numeric,
    unit_price numeric,
    percentage numeric,
    recurring_interval text,
    percentage_base_amount numeric,
    recurring_start_date date,
    recurring_end_date date,
    recurring_custom_interval_days integer,
    recurring_rate numeric,
    milestone_base_amount numeric,
    service_address_id uuid,
    service_address_line_1 text,
    service_address_line_2 text,
    service_city text,
    service_state text,
    service_zip_code text,
    service_country text DEFAULT 'United States'::text,
    access_instructions text,
    completed_at timestamp with time zone,
    version integer DEFAULT 1,
    accepted_at timestamp with time zone,
    accepted_by text,
    accepted_ip text,
    sent_at timestamp with time zone,
    sent_to text,
    applied_tax_rate numeric,
    progress_percent numeric(5,2) DEFAULT 0,
    priority public.job_priority_enum DEFAULT 'normal'::public.job_priority_enum,
    tags text[],
    parent_job_id uuid,
    expected_completion timestamp with time zone,
    is_visible_to_customer boolean DEFAULT true,
    is_recurring boolean DEFAULT false,
    recurrence_rule text,
    customer_notified boolean DEFAULT false,
    last_notified_at timestamp with time zone,
    reminder_sent_at timestamp with time zone,
    reminder_method character varying(10),
    confirmation_sent_at timestamp with time zone,
    customer_confirmed_at timestamp with time zone,
    reschedule_requested_at timestamp with time zone,
    recurring_parent_id uuid,
    recurring_sequence integer DEFAULT 0,
    is_sent boolean DEFAULT false,
    marketplace_request_id uuid,
    marketplace_response_id uuid,
    preferred_time_option text DEFAULT 'specific'::text,
    CONSTRAINT work_orders_pricing_model_check CHECK ((pricing_model = ANY (ARRAY['TIME_MATERIALS'::text, 'FLAT_RATE'::text, 'UNIT'::text, 'MILESTONE'::text, 'RECURRING'::text, 'PERCENTAGE'::text]))),
    CONSTRAINT work_orders_progress_percent_check CHECK (((progress_percent >= (0)::numeric) AND (progress_percent <= (100)::numeric))),
    CONSTRAINT work_orders_recurring_interval_check CHECK (((recurring_interval IS NULL) OR (recurring_interval = ANY (ARRAY['MONTHLY'::text, 'QUARTERLY'::text, 'YEARLY'::text, 'CUSTOM'::text])))),
    CONSTRAINT work_orders_reminder_method_check CHECK (((reminder_method)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying])::text[])))
);


--
-- Name: COLUMN work_orders.labor_summary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.labor_summary IS 'JSON summary of labor estimate {"crew_size":int,"hours_per_day":number,"days":int,"regular_hours":number,"overtime_hours":number,"labor_subtotal":number}';


--
-- Name: COLUMN work_orders.applied_tax_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.work_orders.applied_tax_rate IS 'Tax rate applied at time of quote/invoice creation. Prevents history from changing if defaults are updated later.';


--
-- Name: cancel_job(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancel_job(p_id uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status='CANCELLED',
      updated_at=now()
  WHERE id=p_id AND stage IN ('JOB','WORK_ORDER')
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot cancel: record not in JOB/WORK_ORDER (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: carryover_pto(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.carryover_pto() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE pto_balances b
  SET vacation_hours = LEAST(b.vacation_hours, p.max_vacation_hours)
  FROM pto_policies p
  WHERE b.policy_id = p.id;

  -- Log adjustments for transparency
  INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
  SELECT 
    gen_random_uuid(),
    b.employee_id,
    b.policy_id,
    'ADJUSTMENT',
    (b.vacation_hours - p.max_vacation_hours),
    now()
  FROM pto_balances b
  JOIN pto_policies p ON b.policy_id = p.id
  WHERE b.vacation_hours > p.max_vacation_hours;
END;
$$;


--
-- Name: complete_follow_up(uuid, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.complete_follow_up(p_follow_up_id uuid, p_outcome text, p_customer_response text DEFAULT NULL::text, p_schedule_next boolean DEFAULT false) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_work_order_id UUID;
  v_company_id UUID;
  v_attempt_number INTEGER;
BEGIN
  -- Update the follow-up
  UPDATE public.quote_follow_ups
  SET
    status = 'COMPLETED',
    completed_date = NOW(),
    outcome = p_outcome,
    customer_response = p_customer_response,
    updated_at = NOW()
  WHERE id = p_follow_up_id
  RETURNING work_order_id, company_id, attempt_number
  INTO v_work_order_id, v_company_id, v_attempt_number;

  -- Schedule next follow-up if requested and not final attempt
  IF p_schedule_next AND v_attempt_number < 3 AND p_outcome NOT IN ('ACCEPTED', 'REJECTED') THEN
    INSERT INTO public.quote_follow_ups (
      company_id,
      work_order_id,
      follow_up_type,
      scheduled_date,
      subject,
      message,
      is_automated,
      attempt_number
    ) VALUES (
      v_company_id,
      v_work_order_id,
      CASE WHEN v_attempt_number = 1 THEN 'PHONE' ELSE 'EMAIL' END,
      NOW() + INTERVAL '5 days',
      'Additional follow-up on your quote',
      'Following up again on your quote. Please let us know if you have any questions.',
      TRUE,
      v_attempt_number + 1
    );
  END IF;

  RETURN TRUE;
END;
$$;


--
-- Name: convert_lead_to_customer(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.convert_lead_to_customer(p_lead_id uuid, p_company_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_lead RECORD;
    v_customer_id uuid;
BEGIN
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;

    IF v_lead.customer_id IS NULL THEN
        INSERT INTO public.customers (id, company_id, name, email, phone, created_at, updated_at)
        VALUES (gen_random_uuid(), p_company_id, v_lead.name, v_lead.email, v_lead.phone, now(), now())
        RETURNING id INTO v_customer_id;
    ELSE
        v_customer_id := v_lead.customer_id;
    END IF;

    INSERT INTO public.opportunities (id, company_id, customer_id, lead_id, title, stage, created_at, updated_at)
    VALUES (gen_random_uuid(), p_company_id, v_customer_id, p_lead_id, 'New Opportunity from Lead', 'QUALIFICATION', now(), now());

    UPDATE public.leads SET status = 'QUALIFIED', updated_at = now() WHERE id = p_lead_id;
END;
$$;


--
-- Name: count_closed_jobs(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.count_closed_jobs(p_company_id uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'WORK_ORDER'
    AND status = 'COMPLETED';
  RETURN v_count;
END;
$$;


--
-- Name: create_default_approval_workflow(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_default_approval_workflow() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- If a Quote is sent, create a default approval workflow
  IF NEW.stage = 'QUOTE' AND NEW.status = 'SENT' THEN
    INSERT INTO public.quote_approval_workflows (
      company_id,
      work_order_id,
      workflow_name,
      approval_type,
      sequence_order,
      required,
      requires_customer_approval
    )
    VALUES (
      NEW.company_id,
      NEW.id,
      'Customer Approval',
      'CUSTOMER',
      1,
      TRUE,
      TRUE
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: create_document_version(uuid, text, text, integer, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_document_version(p_document_id uuid, p_file_name text, p_file_url text, p_file_size integer, p_mime_type text, p_change_notes text, p_created_by uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_company_id UUID;
    v_next_version INTEGER;
    v_version_id UUID;
BEGIN
    -- Get company_id and next version number
    SELECT company_id INTO v_company_id FROM documents WHERE id = p_document_id;
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version FROM document_versions WHERE document_id = p_document_id;
    
    -- Create new version record
    INSERT INTO document_versions (
        company_id, document_id, version, file_name, file_url, 
        file_size, mime_type, change_notes, created_by
    ) VALUES (
        v_company_id, p_document_id, v_next_version, p_file_name, p_file_url,
        p_file_size, p_mime_type, p_change_notes, p_created_by
    ) RETURNING id INTO v_version_id;
    
    -- Update main document record
    UPDATE documents 
    SET 
        version = v_next_version,
        file_name = p_file_name,
        file_url = p_file_url,
        file_size = p_file_size,
        mime_type = p_mime_type,
        updated_at = NOW()
    WHERE id = p_document_id;
    
    RETURN v_version_id;
END;
$$;


--
-- Name: create_marketplace_request(uuid, text, text, text[], numeric, text, integer, timestamp with time zone, timestamp with time zone, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_marketplace_request(_customer_id uuid, _title text, _description text, _trade_tags text[], _budget numeric, _budget_type text, _max_responses integer DEFAULT 5, _start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _end_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _auto_booking boolean DEFAULT false) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  _id uuid;
begin
  insert into marketplace_requests (
    customer_id, title, description, trade_tags, budget, budget_type,
    max_responses, start_time, end_time, auto_booking, status
  ) values (
    _customer_id, _title, _description, _trade_tags, _budget, _budget_type,
    _max_responses, _start_time, _end_time, _auto_booking, 'available'
  )
  returning id into _id;
  return _id;
end;
$$;


--
-- Name: create_marketplace_request(uuid, text, text, text[], numeric, text, integer, timestamp with time zone, timestamp with time zone, boolean, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_marketplace_request(_customer_id uuid, _title text, _description text, _trade_tags text[], _budget numeric, _budget_type text DEFAULT 'negotiable'::text, _max_responses integer DEFAULT 5, _start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _end_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _auto_booking boolean DEFAULT false, _service_mode text DEFAULT 'on_site'::text, _requires_inspection boolean DEFAULT false) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  _id uuid;
begin
  insert into marketplace_requests (
    customer_id,
    title,
    description,
    trade_tags,
    budget,
    budget_type,
    max_responses,
    start_time,
    end_time,
    auto_booking,
    service_mode,
    requires_inspection,
    status
  ) values (
    _customer_id,
    _title,
    _description,
    _trade_tags,
    _budget,
    _budget_type,
    _max_responses,
    _start_time,
    _end_time,
    _auto_booking,
    _service_mode,
    _requires_inspection,
    'available'
  )
  returning id into _id;

  return _id;
end;
$$;


--
-- Name: create_work_order_version(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_work_order_version(p_work_order_id uuid, p_user_id uuid DEFAULT NULL::uuid) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_work_order work_orders%ROWTYPE;
  v_new_version INTEGER;
BEGIN
  -- Get current work order
  SELECT * INTO v_work_order FROM work_orders WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found';
  END IF;

  -- Increment version
  v_new_version := v_work_order.version + 1;

  -- Create version record
  INSERT INTO work_order_versions (
    work_order_id,
    company_id,
    version,
    title,
    description,
    subtotal,
    total_amount,
    notes,
    created_by
  ) VALUES (
    v_work_order.id,
    v_work_order.company_id,
    v_new_version,
    v_work_order.title,
    v_work_order.description,
    v_work_order.subtotal,
    v_work_order.total_amount,
    v_work_order.notes,
    p_user_id
  );

  -- Update work order version
  UPDATE work_orders SET
    version = v_new_version,
    updated_at = now()
  WHERE id = p_work_order_id;

  -- Log the versioning
  INSERT INTO work_order_audit_log (
    work_order_id,
    company_id,
    action,
    user_id,
    details
  ) VALUES (
    p_work_order_id,
    v_work_order.company_id,
    'version_created',
    p_user_id,
    jsonb_build_object('version', v_new_version)
  );
  
  RETURN v_new_version;
END;
$$;


--
-- Name: deduct_pto_on_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.deduct_pto_on_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
    -- Deduct from balances
    UPDATE pto_balances
    SET vacation_hours = vacation_hours - NEW.hours_requested
    WHERE employee_id = NEW.employee_id;

    -- Log the usage
    INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
    VALUES (
      gen_random_uuid(),
      NEW.employee_id,
      NEW.policy_id,
      'USAGE',
      NEW.hours_requested,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: demote_job_to_quote(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.demote_job_to_quote(p_id uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='QUOTE',
      status='DRAFT',
      updated_at=now()
  WHERE id=p_id AND stage='JOB'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in JOB (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: demote_job_to_quote(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.demote_job_to_quote(p_id uuid, p_status text DEFAULT 'DRAFT'::text) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'QUOTE',
      status = p_status,
      updated_at = now()
  WHERE id = p_id AND stage = 'JOB'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in JOB (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$$;


--
-- Name: demote_work_order_to_job(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.demote_work_order_to_job(p_id uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='JOB',
      status='SCHEDULED',
      start_time=NULL,
      end_time=NULL,
      assigned_technician_id=NULL,
      updated_at=now()
  WHERE id=p_id AND stage='WORK_ORDER'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in WORK_ORDER (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: demote_work_order_to_job(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.demote_work_order_to_job(p_id uuid, p_status text DEFAULT 'DRAFT'::text) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'JOB',
      status = p_status,
      start_time = NULL,
      end_time = NULL,
      assigned_technician_id = NULL,
      updated_at = now()
  WHERE id = p_id AND stage = 'WORK_ORDER'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in WORK_ORDER (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$$;


--
-- Name: devtools_get_schema(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.devtools_get_schema() RETURNS TABLE(table_name text, column_name text, data_type text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    table_name, 
    column_name, 
    data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position;
$$;


--
-- Name: enforce_attachments_company_match(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_attachments_company_match() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Ensure attachments always match the company of the linked work order
  IF NEW.work_order_id IS NOT NULL THEN
    SELECT wo.company_id
    INTO STRICT NEW.company_id
    FROM public.work_orders wo
    WHERE wo.id = NEW.work_order_id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: enforce_message_context(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_message_context() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if (new.request_id is null and new.work_order_id is null) then
    raise exception 'Message must be tied to either a request/response or a work order';
  end if;

  if (new.request_id is not null and new.work_order_id is not null) then
    raise exception 'Message cannot be tied to both a request and a work order';
  end if;

  return new;
end;
$$;


--
-- Name: enforce_response_cap(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_response_cap() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  -- Check if request is already full
  if (select response_count from public.marketplace_requests where id = new.request_id) >=
     (select max_responses from public.marketplace_requests where id = new.request_id) then
    raise exception 'This request is no longer accepting responses';
  end if;

  -- Increment response_count
  update public.marketplace_requests
    set response_count = response_count + 1
    where id = new.request_id;

  return new;
end;
$$;


--
-- Name: exec_readonly_sql(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_readonly_sql(sql text) RETURNS SETOF record
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;


--
-- Name: exec_sql(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_sql(query text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  result json;
  query_type text;
BEGIN
  BEGIN
    -- Detect query type
    query_type := upper(trim(split_part(query, ' ', 1)));
    
    IF query_type IN ('SELECT', 'WITH') THEN
      -- For SELECT queries, return data as JSON (for troubleshooting/reading)
      EXECUTE format('SELECT json_agg(t) FROM (%s) t', query) INTO result;
      IF result IS NULL THEN
        RETURN json_build_object('status','success','result','null');
      END IF;
      RETURN result;
    ELSE
      -- For DDL/DML queries (CREATE, ALTER, INSERT, UPDATE, DELETE), just execute
      EXECUTE query;
      RETURN json_build_object('status','success','message','Command executed successfully');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'status','error',
      'message', SQLERRM,
      'sqlstate', SQLSTATE
    );
  END;
END;
$$;


--
-- Name: fn_search_companies_by_tags(uuid[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_search_companies_by_tags(tag_list uuid[], max_results integer DEFAULT 20) RETURNS TABLE(company_id uuid, name text, avg_rating numeric, distance numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.avg_rating, 0::NUMERIC as distance
  FROM companies c
  JOIN company_tags ct ON ct.company_id = c.id
  WHERE ct.tag_id = ANY(tag_list)
  ORDER BY c.avg_rating DESC NULLS LAST, c.rating_count DESC
  LIMIT max_results;
END;
$$;


--
-- Name: fn_search_requests_by_tags(uuid[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_search_requests_by_tags(tag_list uuid[], max_results integer DEFAULT 20) RETURNS TABLE(request_id uuid, title text, budget numeric, location text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.title, r.budget, r.location
  FROM marketplace_requests r
  JOIN request_tags rt ON rt.request_id = r.id
  WHERE rt.tag_id = ANY(tag_list)
  ORDER BY r.created_at DESC
  LIMIT max_results;
END;
$$;


--
-- Name: forbid_writes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.forbid_writes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'Legacy table is read-only';
END;
$$;


--
-- Name: generate_invoice_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_invoice_number(company_uuid uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND invoice_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'INV' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_job_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_job_number(company_uuid uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND job_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'J' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_po_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_po_number(company_id_param uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    po_number TEXT;
BEGIN
    -- Get current settings
    SELECT po_number_prefix, next_po_number, po_auto_numbering
    INTO settings_record
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings table if business_settings not found
    IF NOT FOUND THEN
        SELECT po_number_prefix, next_po_number, true as po_auto_numbering
        INTO settings_record
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Use defaults if no settings found
    IF NOT FOUND THEN
        settings_record.po_number_prefix := 'PO-';
        settings_record.next_po_number := 1001;
        settings_record.po_auto_numbering := true;
    END IF;
    
    -- Generate PO number
    IF settings_record.po_auto_numbering THEN
        new_number := settings_record.next_po_number;
        po_number := settings_record.po_number_prefix || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(new_number::TEXT, 4, '0');
        
        -- Update next number in business_settings
        UPDATE business_settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
        
        -- Also update legacy settings table
        UPDATE settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
    ELSE
        -- Manual numbering - return template
        po_number := settings_record.po_number_prefix || 'MANUAL';
    END IF;
    
    RETURN po_number;
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
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND quote_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'Q' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_recurring_occurrences(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_recurring_occurrences(recurring_job_id uuid, generate_until date DEFAULT NULL::date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    rj recurring_jobs%ROWTYPE;
    next_date DATE;
    end_date DATE;
    count INTEGER := 0;
    work_order_data JSONB;
BEGIN
    -- Get recurring job details
    SELECT * INTO rj FROM recurring_jobs WHERE id = recurring_job_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Determine end date
    end_date := COALESCE(generate_until, rj.last_occurrence, CURRENT_DATE + INTERVAL '1 year');
    next_date := COALESCE(rj.next_occurrence, rj.first_occurrence);
    
    -- Generate work orders until end date or max occurrences
    WHILE next_date <= end_date AND (rj.max_occurrences IS NULL OR rj.occurrences_created < rj.max_occurrences) LOOP
        -- Create work order for this occurrence
        INSERT INTO work_orders (
            company_id,
            title,
            description,
            customer_id,
            start_time,
            end_time,
            assigned_to,
            pricing_model,
            estimated_cost,
            labor_summary,
            is_recurring,
            recurring_parent_id,
            recurring_sequence,
            unified_status,
            created_by
        ) VALUES (
            rj.company_id,
            rj.title,
            rj.description,
            rj.customer_id,
            next_date + rj.start_time,
            next_date + rj.start_time + (rj.duration_minutes || ' minutes')::INTERVAL,
            rj.assigned_to,
            rj.pricing_model,
            rj.estimated_cost,
            rj.labor_summary,
            TRUE,
            recurring_job_id,
            rj.occurrences_created + count + 1,
            'scheduled_job',
            rj.created_by
        );
        
        count := count + 1;
        
        -- Calculate next occurrence date
        IF rj.frequency = 'daily' THEN
            next_date := next_date + (rj.interval_value || ' days')::INTERVAL;
        ELSIF rj.frequency = 'weekly' THEN
            next_date := next_date + (rj.interval_value * 7 || ' days')::INTERVAL;
        ELSIF rj.frequency = 'monthly' THEN
            next_date := next_date + (rj.interval_value || ' months')::INTERVAL;
        ELSIF rj.frequency = 'yearly' THEN
            next_date := next_date + (rj.interval_value || ' years')::INTERVAL;
        END IF;
    END LOOP;
    
    -- Update recurring job with next occurrence and count
    UPDATE recurring_jobs 
    SET 
        next_occurrence = CASE WHEN next_date <= end_date THEN next_date ELSE NULL END,
        occurrences_created = occurrences_created + count,
        updated_at = NOW()
    WHERE id = recurring_job_id;
    
    RETURN count;
END;
$$;


--
-- Name: FUNCTION generate_recurring_occurrences(recurring_job_id uuid, generate_until date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_recurring_occurrences(recurring_job_id uuid, generate_until date) IS 'Generates work orders from recurring job templates';


--
-- Name: marketplace_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    company_id uuid,
    title text NOT NULL,
    description text,
    budget numeric(12,2),
    request_type public.request_type_enum DEFAULT 'STANDARD'::public.request_type_enum NOT NULL,
    max_responses integer,
    response_count integer DEFAULT 0,
    status public.marketplace_status_enum DEFAULT 'AVAILABLE'::public.marketplace_status_enum NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    booked_response_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    total_declines integer DEFAULT 0 NOT NULL,
    pricing_type text DEFAULT 'negotiable'::text NOT NULL,
    service_mode text DEFAULT 'onsite'::text NOT NULL,
    hourly_rate_limit numeric(12,2),
    requires_inspection boolean DEFAULT false NOT NULL,
    budget_type text DEFAULT 'negotiable'::text,
    pricing_preference public.pricing_preference_enum DEFAULT 'NEGOTIABLE'::public.pricing_preference_enum,
    postal_code text,
    location_address text,
    location_city text,
    location_state text,
    fulfillment_mode text DEFAULT 'match_any'::text,
    preferred_time_option text DEFAULT 'anytime'::text,
    CONSTRAINT marketplace_requests_budget_type_check CHECK ((budget_type = ANY (ARRAY['flat'::text, 'hourly'::text, 'negotiable'::text]))),
    CONSTRAINT marketplace_requests_fulfillment_mode_check CHECK ((fulfillment_mode = ANY (ARRAY['match_any'::text, 'match_all'::text]))),
    CONSTRAINT marketplace_requests_preferred_time_option_check CHECK ((preferred_time_option = ANY (ARRAY['anytime'::text, 'soonest'::text, 'this_week'::text, 'weekend_only'::text, 'specific'::text]))),
    CONSTRAINT marketplace_requests_pricing_type_check CHECK ((pricing_type = ANY (ARRAY['flat_rate'::text, 'hourly_rate'::text, 'negotiable'::text]))),
    CONSTRAINT marketplace_requests_service_mode_check CHECK ((service_mode = ANY (ARRAY['onsite'::text, 'remote'::text, 'hybrid'::text])))
);


--
-- Name: get_available_requests(uuid, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_available_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[]) RETURNS SETOF public.marketplace_requests
    LANGUAGE sql STABLE
    AS $$
  select distinct r.*
  from marketplace_requests r
  join companies c on c.id = _company_id
  left join request_tags rt on rt.request_id = r.id
  left join tags t on t.id = rt.tag_id
  where r.status = 'available'
    and (
      _tags is null
      or exists (
        select 1
        from request_tags rt2
        join tags t2 on t2.id = rt2.tag_id
        where rt2.request_id = r.id
          and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
      )
    )
  order by r.created_at desc;
$$;


--
-- Name: get_browse_requests(uuid, text[], numeric, public.pricing_enum[], text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_browse_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[], _distance_km numeric DEFAULT NULL::numeric, _pricing public.pricing_enum[] DEFAULT NULL::public.pricing_enum[], _request_type text[] DEFAULT NULL::text[]) RETURNS SETOF public.marketplace_requests
    LANGUAGE sql STABLE
    AS $$
  select r.*
  from marketplace_requests r
  join companies c on r.company_id = c.id
  where r.company_id is distinct from _company_id
    and r.status = 'available'
    and (
      _tags is null 
      or exists (
        select 1 
        from unnest(r.trade_tags) t
        where lower(t) = any (select lower(x) from unnest(_tags) x)
      )
    )
    and (
      _request_type is null 
      or r.request_type = any(_request_type)
    )
    and (
      _pricing is null 
      or r.pricing_preference = any(_pricing)
    )
    -- TODO: distance filter if you have lat/long
  order by r.created_at desc;
$$;


--
-- Name: get_browse_requests(uuid, text[], numeric, public.pricing_preference_enum[], public.request_type_enum[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_browse_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[], _distance_km numeric DEFAULT NULL::numeric, _pricing public.pricing_preference_enum[] DEFAULT NULL::public.pricing_preference_enum[], _request_type public.request_type_enum[] DEFAULT NULL::public.request_type_enum[]) RETURNS SETOF public.marketplace_requests
    LANGUAGE sql STABLE
    AS $$
  select distinct r.*
  from marketplace_requests r
  join companies c on r.company_id = c.id
  left join request_tags rt on rt.request_id = r.id
  left join tags t on t.id = rt.tag_id
  where r.company_id is distinct from _company_id
    and r.status = 'available'
    and (
      _tags is null
      or exists (
        select 1
        from request_tags rt2
        join tags t2 on t2.id = rt2.tag_id
        where rt2.request_id = r.id
          and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
      )
    )
    and (
      _request_type is null
      or r.request_type = any(_request_type)
    )
    and (
      _pricing is null
      or r.pricing_preference = any(_pricing)
    )
    -- TODO: distance filter if/when lat/long added
  order by r.created_at desc;
$$;


--
-- Name: get_calendar_events_with_context(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_calendar_events_with_context(p_company_id uuid) RETURNS TABLE(id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, event_type text, status text, work_order_id uuid, work_order_stage text, work_order_status text, customer_id uuid, customer_name text, employee_id uuid, employee_name text, service_address text, estimated_duration integer, total_amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM get_calendar_events_with_context(p_company_id, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid);
END;
$$;


--
-- Name: get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_calendar_events_with_context(p_company_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, event_type text, status public.work_order_status_enum, work_order_id uuid, customer_id uuid, customer_name text, employee_id uuid, employee_name text, service_address text, estimated_duration integer, total_amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT
    se.id,
    COALESCE(se.title, 'Untitled Event'),
    se.description,
    se.start_time,
    se.end_time,
    COALESCE(se.event_type, 'appointment'),
    wo.status,
    se.work_order_id,
    se.customer_id,
    c.name AS customer_name,
    se.employee_id,
    u.email AS employee_name,
    wo.service_address_line_1 AS service_address,
    wo.estimated_duration,
    wo.total_amount,
    se.created_at,
    se.updated_at
  FROM schedule_events se
  LEFT JOIN work_orders wo ON se.work_order_id = wo.id
  LEFT JOIN customers c ON se.customer_id = c.id
  LEFT JOIN users u ON se.employee_id = u.id
  WHERE se.company_id = p_company_id
    AND (p_start_date IS NULL OR se.start_time >= p_start_date)
    AND (p_end_date IS NULL OR se.end_time <= p_end_date)
    AND (p_employee_id IS NULL OR se.employee_id = p_employee_id)
  ORDER BY se.start_time ASC;
$$;


--
-- Name: get_closed_jobs(uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_closed_jobs(p_company_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(work_order_id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, completed_at timestamp with time zone, total_amount numeric, customer_name text, customer_email text, customer_phone text)
    LANGUAGE sql
    AS $$
  SELECT
    w.id AS work_order_id,
    w.title,
    w.description,
    w.start_time,
    w.end_time,
    w.completed_at,
    w.total_amount,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone
  FROM public.work_orders w
  LEFT JOIN public.customers c ON c.id = w.customer_id
  WHERE w.company_id = p_company_id
    AND w.stage = 'WORK_ORDER'
    AND w.status = 'COMPLETED'
  ORDER BY w.completed_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$$;


--
-- Name: get_companies_by_tags(text[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_companies_by_tags(_tags text[] DEFAULT NULL::text[], _limit integer DEFAULT 20) RETURNS TABLE(company_id uuid, name text, avg_rating numeric, rating_count integer)
    LANGUAGE sql STABLE
    AS $$
  select c.id, c.name, c.avg_rating, c.rating_count
  from companies c
  left join company_tags ct on ct.company_id = c.id
  left join tags t on t.id = ct.tag_id
  where (
    _tags is null
    or exists (
      select 1
      from company_tags ct2
      join tags t2 on t2.id = ct2.tag_id
      where ct2.company_id = c.id
        and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
    )
  )
  order by c.avg_rating desc nulls last, c.rating_count desc nulls last
  limit _limit;
$$;


--
-- Name: get_company_customers(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_company_customers(company_uuid uuid) RETURNS TABLE(id uuid, name text, email text, phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone, c.created_at, c.updated_at
  FROM customers c
  WHERE c.company_id = company_uuid
  ORDER BY c.created_at DESC;
END;
$$;


--
-- Name: get_customer_requests(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_customer_requests(_customer_id uuid) RETURNS SETOF public.marketplace_requests
    LANGUAGE sql
    AS $$
  select *
  from marketplace_requests
  where customer_id = _customer_id
  order by created_at desc;
$$;


--
-- Name: get_pending_follow_ups(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_follow_ups(p_company_id uuid, p_user_id uuid DEFAULT NULL::uuid) RETURNS TABLE(follow_up_id uuid, work_order_id uuid, quote_number text, customer_name text, follow_up_type text, scheduled_date timestamp with time zone, days_overdue integer, attempt_number integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    qf.id as follow_up_id,
    qf.work_order_id,
    wo.quote_number,
    c.name as customer_name,
    qf.follow_up_type,
    qf.scheduled_date,
    CASE
      WHEN qf.scheduled_date < NOW() THEN EXTRACT(DAY FROM NOW() - qf.scheduled_date)::INTEGER
      ELSE 0
    END as days_overdue,
    qf.attempt_number
  FROM public.quote_follow_ups qf
  JOIN public.work_orders wo ON qf.work_order_id = wo.id
  JOIN public.customers c ON wo.customer_id = c.id
  WHERE qf.company_id = p_company_id
    AND qf.status = 'SCHEDULED'
    AND (p_user_id IS NULL OR qf.assigned_user_id = p_user_id)
  ORDER BY qf.scheduled_date ASC;
END;
$$;


--
-- Name: get_po_settings(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_po_settings(company_id_param uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    settings_json JSONB;
BEGIN
    -- Try business_settings first
    SELECT jsonb_build_object(
        'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
        'next_po_number', COALESCE(next_po_number, 1001),
        'po_auto_numbering', COALESCE(po_auto_numbering, true),
        'po_require_approval', COALESCE(po_require_approval, false),
        'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
        'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
        'po_auto_send_to_vendor', COALESCE(po_auto_send_to_vendor, false),
        'po_require_receipt_confirmation', COALESCE(po_require_receipt_confirmation, true),
        'po_allow_partial_receiving', COALESCE(po_allow_partial_receiving, true),
        'po_default_shipping_method', COALESCE(po_default_shipping_method, 'STANDARD'),
        'po_tax_calculation_method', COALESCE(po_tax_calculation_method, 'AUTOMATIC'),
        'po_currency', COALESCE(po_currency, 'USD'),
        'po_payment_terms_options', COALESCE(po_payment_terms_options, '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb),
        'po_default_notes', COALESCE(po_default_notes, ''),
        'po_footer_text', COALESCE(po_footer_text, ''),
        'po_email_template', COALESCE(po_email_template, 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.'),
        'po_reminder_days', COALESCE(po_reminder_days, 7),
        'po_overdue_notification_days', COALESCE(po_overdue_notification_days, 14)
    )
    INTO settings_json
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings if business_settings not found
    IF settings_json IS NULL THEN
        SELECT jsonb_build_object(
            'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
            'next_po_number', COALESCE(next_po_number, 1001),
            'po_auto_numbering', true,
            'po_require_approval', COALESCE(po_require_approval, false),
            'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
            'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        )
        INTO settings_json
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Return defaults if no settings found
    IF settings_json IS NULL THEN
        settings_json := jsonb_build_object(
            'po_number_prefix', 'PO-',
            'next_po_number', 1001,
            'po_auto_numbering', true,
            'po_require_approval', false,
            'po_approval_threshold', 1000.00,
            'po_default_terms', 'NET_30',
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        );
    END IF;
    
    RETURN settings_json;
END;
$$;


--
-- Name: get_pto_balance(uuid, text, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pto_balance(p_employee_id uuid, p_category_code text DEFAULT 'VAC'::text, p_as_of_date date DEFAULT CURRENT_DATE) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
  balance DECIMAL(8,2) := 0;
BEGIN
  SELECT COALESCE(SUM(hours), 0)
  INTO balance
  FROM pto_ledger
  WHERE employee_id = p_employee_id
    AND COALESCE(category_code, 'VAC') = p_category_code
    AND effective_date <= p_as_of_date;

  RETURN balance;
END;
$$;


--
-- Name: get_quote_conversion_metrics(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_quote_conversion_metrics(p_company_id uuid) RETURNS TABLE(total_quotes integer, accepted_quotes integer, conversion_rate numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE v_total integer;
DECLARE v_accepted integer;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'QUOTE';

  SELECT COUNT(*) INTO v_accepted
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'QUOTE'
    AND status = 'ACCEPTED';

  RETURN QUERY
  SELECT
    v_total,
    v_accepted,
    CASE WHEN v_total > 0 THEN ROUND((v_accepted::numeric / v_total) * 100, 2)
         ELSE 0 END;
END;
$$;


--
-- Name: get_quote_conversion_metrics(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_quote_conversion_metrics(p_company_id uuid, p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date) RETURNS TABLE(total_quotes integer, sent_quotes integer, viewed_quotes integer, accepted_quotes integer, rejected_quotes integer, conversion_rate numeric, average_time_to_decision_hours numeric, average_quote_value numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_quotes,
    COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END)::INTEGER as sent_quotes,
    COUNT(CASE WHEN qa.first_viewed_date IS NOT NULL THEN 1 END)::INTEGER as viewed_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::INTEGER as accepted_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'REJECTED' THEN 1 END)::INTEGER as rejected_quotes,
    CASE
      WHEN COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) > 0
      THEN (COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::DECIMAL / COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) * 100)
      ELSE 0
    END as conversion_rate,
    AVG(qa.time_to_decision_hours) as average_time_to_decision_hours,
    AVG(qa.quote_value) as average_quote_value
  FROM public.quote_analytics qa
  WHERE qa.company_id = p_company_id
    AND (p_date_from IS NULL OR qa.quote_sent_date >= p_date_from)
    AND (p_date_to IS NULL OR qa.quote_sent_date <= p_date_to);
END;
$$;


--
-- Name: get_request_with_roles(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_request_with_roles(p_request_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    request_data JSON;
    roles_data JSON;
BEGIN
    -- Get the main request
    SELECT to_json(r.*) INTO request_data
    FROM marketplace_requests r
    WHERE r.id = p_request_id;
    
    -- If no request found, return null
    IF request_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get roles with their responses and progress
    SELECT json_agg(
        json_build_object(
            'id', mrr.id,
            'category_id', mrr.category_id,
            'quantity_required', mrr.quantity_required,
            'quantity_fulfilled', COALESCE(mrr.quantity_fulfilled, 0),
            'service_category', json_build_object(
                'name', sc.name,
                'description', sc.description
            ),
            'responses', COALESCE(responses.response_list, '[]'::json)
        )
    ) INTO roles_data
    FROM marketplace_request_roles mrr
    LEFT JOIN service_categories sc ON sc.id = mrr.category_id
    LEFT JOIN (
        SELECT 
            mr.role_id,
            json_agg(
                json_build_object(
                    'id', mr.id,
                    'company_id', mr.company_id,
                    'response_status', mr.response_status,
                    'counter_offer', mr.counter_offer,
                    'available_start', mr.available_start,
                    'available_end', mr.available_end,
                    'message', mr.message,
                    'created_at', mr.created_at
                )
            ) as response_list
        FROM marketplace_responses mr
        GROUP BY mr.role_id
    ) responses ON responses.role_id = mrr.id
    WHERE mrr.request_id = p_request_id;
    
    -- Return combined data
    RETURN json_build_object(
        'request', request_data,
        'roles', COALESCE(roles_data, '[]'::json)
    );
END;
$$;


--
-- Name: marketplace_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    company_id uuid,
    counter_offer numeric(12,2),
    available_start timestamp with time zone,
    available_end timestamp with time zone,
    message text,
    created_at timestamp with time zone DEFAULT now(),
    decline_reason text,
    decline_reason_code text,
    quantity_fulfilled integer DEFAULT 1 NOT NULL,
    role_id uuid,
    response_status public.marketplace_response_status_enum DEFAULT 'INTERESTED'::public.marketplace_response_status_enum NOT NULL
);


--
-- Name: get_responses_for_request(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_responses_for_request(_request_id uuid) RETURNS SETOF public.marketplace_responses
    LANGUAGE sql
    AS $$
  select *
  from marketplace_responses
  where request_id = _request_id
  order by created_at;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: invoice_items_recalc(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoice_items_recalc() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Calculate tax
  NEW.tax_amount := round((NEW.quantity * NEW.unit_price) * (COALESCE(NEW.tax_rate,0)/100), 2);

  -- Apply discounts
  IF NEW.discount_type = 'PERCENT' THEN
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) * (1 - COALESCE(NEW.discount_value,0)/100)
      + COALESCE(NEW.tax_amount,0),
      2
    );
  ELSIF NEW.discount_type = 'FLAT' THEN
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) - COALESCE(NEW.discount_value,0)
      + COALESCE(NEW.tax_amount,0),
      2
    );
  ELSE
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) + COALESCE(NEW.tax_amount,0),
      2
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: invoices_auto_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_auto_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_total    numeric;
  v_paid     numeric := 0;
  v_due_date timestamptz;
  v_invoice_id uuid;
BEGIN
  v_invoice_id := COALESCE(NEW.id, OLD.id);

  -- Get total and due date
  SELECT total_amount, due_date
  INTO v_total, v_due_date
  FROM public.invoices
  WHERE id = v_invoice_id;

  -- Sum payments if table exists
  IF to_regclass('public.invoice_payments') IS NOT NULL THEN
    SELECT COALESCE(SUM(amount),0)
    INTO v_paid
    FROM public.invoice_payments
    WHERE invoice_id = v_invoice_id;
  END IF;

  -- Update status based on totals
  IF v_total > 0 AND v_paid >= v_total THEN
    UPDATE public.invoices
    SET status = 'PAID', updated_at = now()
    WHERE id = v_invoice_id;
  ELSIF v_paid > 0 AND v_paid < v_total THEN
    UPDATE public.invoices
    SET status = 'PARTIALLY_PAID', updated_at = now()
    WHERE id = v_invoice_id;
  ELSIF v_total > 0 AND v_due_date IS NOT NULL AND now() > v_due_date THEN
    UPDATE public.invoices
    SET status = 'OVERDUE', updated_at = now()
    WHERE id = v_invoice_id;
  ELSE
    UPDATE public.invoices
    SET status = 'UNPAID', updated_at = now()
    WHERE id = v_invoice_id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: invoices_auto_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_auto_status(p_invoice_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_total    numeric;
  v_paid     numeric := 0;
  v_due_date timestamptz;
BEGIN
  -- Fetch invoice totals
  SELECT total_amount, due_date
  INTO v_total, v_due_date
  FROM public.invoices
  WHERE id = p_invoice_id;

  -- Fetch payments if table exists
  IF to_regclass('public.invoice_payments') IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0)
    INTO v_paid
    FROM public.invoice_payments
    WHERE invoice_id = p_invoice_id;
  END IF;

  -- Update status based on totals
  IF v_total > 0 AND v_paid >= v_total THEN
    UPDATE public.invoices
    SET status = 'PAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSIF v_paid > 0 AND v_paid < v_total THEN
    UPDATE public.invoices
    SET status = 'PARTIALLY_PAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSIF v_total > 0 AND v_due_date IS NOT NULL AND now() > v_due_date THEN
    UPDATE public.invoices
    SET status = 'OVERDUE'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSE
    UPDATE public.invoices
    SET status = 'UNPAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;
  END IF;
END;
$$;


--
-- Name: invoices_update_total(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_update_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_items_total numeric := 0;
  v_inv_disc    numeric := 0;
  v_invoice_id  uuid;
BEGIN
  -- Determine which invoice_id to use
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Sum all line items for this invoice
  SELECT COALESCE(SUM(line_total), 0)
  INTO v_items_total
  FROM public.invoice_items
  WHERE invoice_id = v_invoice_id;

  -- Get any discount applied at invoice level
  SELECT COALESCE(discount_amount, 0)
  INTO v_inv_disc
  FROM public.invoices
  WHERE id = v_invoice_id;

  -- Update invoice total
  UPDATE public.invoices
  SET total_amount = round(GREATEST(v_items_total - v_inv_disc, 0), 2),
      updated_at   = now()
  WHERE id = v_invoice_id;

  RETURN NEW;
END;
$$;


--
-- Name: invoices_update_total(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_update_total(p_invoice_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_items_total numeric := 0;
  v_inv_disc    numeric := 0;
BEGIN
  SELECT COALESCE(SUM(line_total),0) INTO v_items_total
  FROM public.invoice_items WHERE invoice_id = p_invoice_id;

  SELECT COALESCE(discount_amount,0) INTO v_inv_disc
  FROM public.invoices WHERE id = p_invoice_id;

  UPDATE public.invoices
  SET total_amount = round(GREATEST(v_items_total - v_inv_disc, 0), 2),
      updated_at   = now()
  WHERE id = p_invoice_id;
END;
$$;


--
-- Name: invoices_update_total_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_update_total_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM public.invoices_update_total(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END;
$$;


--
-- Name: invoices_updated_at_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.invoices_updated_at_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: log_customer_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_customer_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.customers_status_history (customer_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: log_vendor_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_vendor_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.vendors_status_history (vendor_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: log_work_order_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_work_order_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO work_order_audit_log (
      work_order_id, company_id, action,
      old_status, new_status, details
    )
    VALUES (
      NEW.id, NEW.company_id, 'status_initialized',
      NULL, NEW.status::text,
      jsonb_build_object(
        'total', NEW.total_amount,
        'version', NEW.version,
        'stage', NEW.stage
      )
    );
  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO work_order_audit_log (
      work_order_id, company_id, action,
      old_status, new_status, details
    )
    VALUES (
      NEW.id, NEW.company_id, 'status_changed',
      OLD.status::text, NEW.status::text,
      jsonb_build_object(
        'old_total', OLD.total_amount,
        'new_total', NEW.total_amount,
        'version', NEW.version,
        'stage', NEW.stage
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: lookup_item_by_code(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.lookup_item_by_code(p_code text) RETURNS TABLE(id uuid, name text, description text, barcode text, qr_code text, upc_code text)
    LANGUAGE sql STABLE
    AS $$
    SELECT id, name, description, barcode, qr_code, upc_code
    FROM public.inventory_items
    WHERE p_code IN (barcode, qr_code, upc_code);
$$;


--
-- Name: match_companies_to_request(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_companies_to_request(_request_id uuid) RETURNS TABLE(company_id uuid, company_name text, tags text[], avg_rating numeric, rating_count integer)
    LANGUAGE sql
    AS $$
    select
        c.id as company_id,
        c.name as company_name,
        array_agg(distinct t.name) as tags,
        coalesce(c.avg_rating, 0) as avg_rating,
        coalesce(c.rating_count, 0) as rating_count
    from public.request_tags rt
    join public.tags t on rt.tag_id = t.id
    join public.company_tags ct on ct.tag_id = t.id
    join public.companies c on c.id = ct.company_id
    where rt.request_id = _request_id
    group by c.id, c.name, c.avg_rating, c.rating_count
    order by avg_rating desc nulls last, rating_count desc;
$$;


--
-- Name: match_companies_to_request(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_companies_to_request(_request_id uuid, _limit integer DEFAULT 20) RETURNS TABLE(company_id uuid, company_name text, avg_rating numeric, rating_count integer, matched_tags text[], company_postal_code text, request_postal_code text)
    LANGUAGE sql STABLE
    AS $$
  with req as (
    select 
      r.id, 
      r.postal_code, 
      array_agg(lower(t.name)) as tags   -- normalize
    from public.marketplace_requests r
    join public.request_tags rt on r.id = rt.request_id
    join public.tags t on t.id = rt.tag_id
    where r.id = _request_id
    group by r.id, r.postal_code
  ),
  comp as (
    select
      c.id,
      c.name,
      c.avg_rating,
      c.rating_count,
      c.postal_code,
      array_agg(lower(t.name)) as tags   -- normalize
    from public.companies c
    join public.company_tags ct on ct.company_id = c.id
    join public.tags t on t.id = ct.tag_id
    group by c.id, c.name, c.avg_rating, c.rating_count, c.postal_code
  )
  select
    c.id as company_id,
    c.name as company_name,
    coalesce(c.avg_rating, 0) as avg_rating,
    coalesce(c.rating_count, 0) as rating_count,
    c.tags as matched_tags,
    c.postal_code as company_postal_code,
    r.postal_code as request_postal_code
  from req r
  join comp c on c.tags && r.tags  -- overlap on normalized tags
  limit _limit;
$$;


--
-- Name: match_contractors_to_request(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_contractors_to_request(_request_id uuid) RETURNS TABLE(company_id uuid, company_name text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name
    FROM companies c
    JOIN company_tags ct ON ct.company_id = c.id
    JOIN marketplace_request_tags rt ON rt.tag_id = ct.tag_id
    WHERE rt.request_id = _request_id
      AND c.verification_status != 'BANNED'
    ORDER BY c.avg_rating DESC NULLS LAST;
END;
$$;


--
-- Name: match_requests_to_company(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_requests_to_company(_company_id uuid) RETURNS TABLE(request_id uuid, title text, description text, tags text[], budget numeric, request_type text, status text, start_time timestamp with time zone, end_time timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql
    AS $$
    select
        r.id as request_id,
        r.title,
        r.description,
        array_agg(distinct t.name) as tags,
        r.budget,
        r.request_type,
        r.status,
        r.start_time,
        r.end_time,
        r.created_at
    from public.company_tags ct
    join public.tags t on ct.tag_id = t.id
    join public.request_tags rt on rt.tag_id = t.id
    join public.marketplace_requests r on r.id = rt.request_id
    where ct.company_id = _company_id
      and r.status = 'available'
    group by r.id, r.title, r.description, r.budget, r.request_type, r.status,
             r.start_time, r.end_time, r.created_at
    order by r.created_at desc;
$$;


--
-- Name: migrate_existing_pto_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.migrate_existing_pto_data() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update any NULL company_id values in pto_ledger
  UPDATE pto_ledger
  SET company_id = u.company_id
  FROM users u
  WHERE pto_ledger.employee_id = u.id AND pto_ledger.company_id IS NULL;

  -- Update any NULL company_id values in pto_requests
  UPDATE pto_requests
  SET company_id = u.company_id
  FROM users u
  WHERE pto_requests.employee_id = u.id AND pto_requests.company_id IS NULL;

  -- Set default category_code for existing records
  UPDATE pto_ledger SET category_code = 'VAC' WHERE category_code IS NULL;
  UPDATE pto_requests SET category_code = 'VAC' WHERE category_code IS NULL;

  RAISE NOTICE 'PTO data migration completed successfully';
END;
$$;


--
-- Name: normalize_tag(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_tag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    new.name := lower(trim(new.name));
    return new;
end;
$$;


--
-- Name: normalize_tag_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_tag_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    new.name := lower(new.name);
    return new;
end;
$$;


--
-- Name: notify_on_new_request(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_on_new_request() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO marketplace_notifications (company_id, request_id, message)
    SELECT ct.company_id, NEW.id, 'New request available'
    FROM marketplace_request_tags rt
    JOIN company_tags ct ON rt.tag_id = ct.tag_id;
    RETURN NEW;
END;
$$;


--
-- Name: notify_on_new_response(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_on_new_response() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    _customer_id uuid;
BEGIN
    SELECT customer_id INTO _customer_id
    FROM marketplace_requests
    WHERE id = NEW.request_id;

    INSERT INTO marketplace_notifications (company_id, request_id, message)
    VALUES (
        _customer_id, -- here company_id column acts as "recipient"; you may split into recipient_id later
        NEW.request_id,
        'A new response has been submitted to your request'
    );

    RETURN NEW;
END;
$$;


--
-- Name: notify_on_response_accept(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_on_response_accept() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO marketplace_notifications (company_id, request_id, message)
    VALUES (
        NEW.company_id,
        NEW.request_id,
        'Your response has been accepted!'
    );
    RETURN NEW;
END;
$$;


--
-- Name: process_workflow_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_workflow_approval() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    total_approvals INTEGER;
    required_approvals INTEGER;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = NEW.workflow_id;
    
    -- Count current approvals
    SELECT COUNT(*) INTO total_approvals 
    FROM workflow_approvals 
    WHERE workflow_id = NEW.workflow_id AND status = 'approved';
    
    required_approvals := workflow_record.minimum_approvals;
    
    -- Check if workflow is complete
    IF total_approvals >= required_approvals THEN
        UPDATE document_workflows 
        SET status = 'approved', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    -- Check if workflow is rejected
    IF NEW.status = 'rejected' THEN
        UPDATE document_workflows 
        SET status = 'rejected', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: promote_job_to_work_order(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_job_to_work_order(p_id uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='WORK_ORDER',
      status='ASSIGNED',
      updated_at=now()
  WHERE id=p_id AND stage='JOB'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in JOB (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: promote_job_to_work_order(uuid, text, timestamp with time zone, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_job_to_work_order(p_id uuid, p_status text DEFAULT 'ASSIGNED'::text, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone, p_tech uuid DEFAULT NULL::uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'WORK_ORDER',
      status = p_status,
      start_time = COALESCE(p_start,start_time),
      end_time = COALESCE(p_end,end_time),
      assigned_technician_id = COALESCE(p_tech,assigned_technician_id),
      updated_at = now()
  WHERE id = p_id AND stage = 'JOB'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in JOB (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$$;


--
-- Name: promote_quote_to_job(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_quote_to_job(p_id uuid) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='JOB',
      status='SCHEDULED',
      updated_at=now()
  WHERE id=p_id AND stage='QUOTE'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in QUOTE (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: promote_quote_to_job(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_quote_to_job(p_id uuid, p_status text DEFAULT 'DRAFT'::text) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'JOB',
      status = p_status,
      updated_at = now()
  WHERE id = p_id AND stage = 'QUOTE'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in QUOTE (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$$;


--
-- Name: recalc_labor_totals(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalc_labor_totals(p_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_labor numeric;
BEGIN
  -- recalc labor portion
  SELECT COALESCE(SUM(amount),0)
  INTO v_labor
  FROM work_order_labor
  WHERE work_order_id = p_id;

  -- update parent totals
  UPDATE work_orders
  SET labor_subtotal = v_labor,
      subtotal = COALESCE(subtotal,0) - COALESCE(labor_subtotal,0) + v_labor,
      total_amount = COALESCE(subtotal,0) + COALESCE(tax_amount,0)
  WHERE id = p_id;
END;
$$;


--
-- Name: recalc_labor_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalc_labor_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM recalc_labor_totals(NEW.work_order_id);
  RETURN NEW;
END;
$$;


--
-- Name: recalculate_inventory_stock(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_inventory_stock(target_company_id uuid DEFAULT NULL::uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    movement_record RECORD;
    stock_change NUMERIC;
    processed_count INTEGER := 0;
BEGIN
    IF target_company_id IS NOT NULL THEN
        DELETE FROM inventory_stock WHERE company_id = target_company_id;
    ELSE
        DELETE FROM inventory_stock;
    END IF;

    FOR movement_record IN
        SELECT * FROM inventory_movements
        WHERE (target_company_id IS NULL OR company_id = target_company_id)
        ORDER BY created_at ASC
    LOOP
        IF movement_record.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_record.quantity;
        ELSIF movement_record.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -movement_record.quantity;
        ELSIF movement_record.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_record.quantity;
        ELSE
            stock_change := 0;
        END IF;

        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (movement_record.item_id, movement_record.location_id, movement_record.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();

        processed_count := processed_count + 1;
    END LOOP;

    RETURN 'Recalculated stock levels from ' || processed_count || ' movements';
END;
$$;


--
-- Name: FUNCTION recalculate_inventory_stock(target_company_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.recalculate_inventory_stock(target_company_id uuid) IS 'Recalculates all stock levels from movement history. Use for data repair.';


--
-- Name: reopen_work_order(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reopen_work_order(p_id uuid, p_new_status text) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status=p_new_status,
      updated_at=now()
  WHERE id=p_id
    AND status IN ('COMPLETED','CANCELLED','IN_PROGRESS')
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot reopen: not in a closable state (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: reopen_work_order(uuid, public.work_order_status_enum); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reopen_work_order(p_id uuid, p_new_status public.work_order_status_enum) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE
  rec work_orders;
BEGIN
  UPDATE work_orders
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_id
    AND status IN ('COMPLETED','CANCELLED')
  RETURNING * INTO rec;

  RETURN rec;
END;
$$;


--
-- Name: search_companies_by_tags(text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_companies_by_tags(_tags text[]) RETURNS TABLE(company_id uuid, name text, matched_tags text[], avg_rating numeric, rating_count integer, accepts_emergency boolean, emergency_fee numeric, nights_weekends boolean)
    LANGUAGE sql
    AS $$
  select 
    c.id as company_id,
    c.name,
    array_agg(distinct t.name) as matched_tags,
    coalesce(c.avg_rating, 0) as avg_rating,
    coalesce(c.rating_count, 0) as rating_count,
    coalesce(c.accepts_emergency, false) as accepts_emergency,
    c.emergency_fee,
    coalesce(c.nights_weekends, false) as nights_weekends
  from public.companies c
  join public.company_tags ct on c.id = ct.company_id
  join public.service_tags t on ct.tag_id = t.id
  where lower(t.name) = any (select lower(unnest(_tags)))
  group by c.id, c.name, c.avg_rating, c.rating_count, 
           c.accepts_emergency, c.emergency_fee, c.nights_weekends;
$$;


--
-- Name: search_marketplace_requests(text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_marketplace_requests(_tags text[]) RETURNS TABLE(request_id uuid, title text, description text, matched_tags text[], budget numeric, request_type text, status text, start_time timestamp with time zone, end_time timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql
    AS $$
  select 
    r.id as request_id,
    r.title,
    r.description,
    array_agg(distinct t.name) as matched_tags,
    r.budget,
    r.request_type,
    r.status,
    r.start_time,
    r.end_time,
    r.created_at
  from public.marketplace_requests r
  join public.marketplace_request_tags rt on r.id = rt.request_id
  join public.service_tags t on rt.tag_id = t.id
  where lower(t.name) = any (select lower(unnest(_tags)))
    and r.status = 'available'
  group by r.id, r.title, r.description, r.budget, r.request_type,
           r.status, r.start_time, r.end_time, r.created_at;
$$;


--
-- Name: send_appointment_reminder(uuid, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_appointment_reminder(work_order_id uuid, method character varying DEFAULT 'email'::character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    wo work_orders%ROWTYPE;
    customer customers%ROWTYPE;
    settings notification_settings%ROWTYPE;
BEGIN
    -- Get work order and customer details
    SELECT * INTO wo FROM work_orders WHERE id = work_order_id;
    SELECT * INTO customer FROM customers WHERE id = wo.customer_id;
    SELECT * INTO settings FROM notification_settings WHERE company_id = wo.company_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update work order to track reminder sent
    UPDATE work_orders 
    SET 
        reminder_sent_at = NOW(),
        reminder_method = method
    WHERE id = work_order_id;
    
    -- TODO: Integrate with actual email/SMS service
    -- This is a placeholder that would integrate with SendGrid, Twilio, etc.
    
    RETURN TRUE;
END;
$$;


--
-- Name: FUNCTION send_appointment_reminder(work_order_id uuid, method character varying); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.send_appointment_reminder(work_order_id uuid, method character varying) IS 'Sends appointment reminders via email or SMS';


--
-- Name: send_workflow_notification(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_workflow_notification(p_workflow_id uuid, p_notification_type text DEFAULT 'reminder'::text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    approver_email TEXT;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = p_workflow_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Send notifications to pending approvers
    FOR approver_email IN 
        SELECT UNNEST(workflow_record.required_approvers)
        WHERE approver_email NOT IN (
            SELECT approver_email FROM workflow_approvals 
            WHERE workflow_id = p_workflow_id AND status IN ('approved', 'rejected')
        )
    LOOP
        -- TODO: Integrate with email service (SendGrid, Mailgun, etc.)
        -- For now, just log the notification
        RAISE NOTICE 'Sending % notification to % for workflow %', p_notification_type, approver_email, p_workflow_id;
    END LOOP;
    
    RETURN TRUE;
END;
$$;


--
-- Name: set_joined_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_joined_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.joined_at IS NULL THEN
    NEW.joined_at := NEW.created_at;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_reimbursement_request_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_reimbursement_request_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := 'REQ-' ||
            TO_CHAR(NEW.created_at, 'YYYY') || '-' ||
            LPAD(EXTRACT(DOY FROM NEW.created_at)::TEXT, 3, '0') || '-' ||
            LPAD((EXTRACT(EPOCH FROM NEW.created_at) % 86400)::INTEGER::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: set_service_request_responses_created_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_service_request_responses_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_service_requests_requested_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_service_requests_requested_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.requested_at IS NULL THEN
    NEW.requested_at = now();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;


--
-- Name: submit_marketplace_response(uuid, uuid, numeric, timestamp with time zone, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_marketplace_response(_request_id uuid, _company_id uuid, _counter_offer numeric DEFAULT NULL::numeric, _available_start timestamp with time zone DEFAULT NULL::timestamp with time zone, _available_end timestamp with time zone DEFAULT NULL::timestamp with time zone, _message text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
  _id uuid;
  _max int;
  _count int;
BEGIN
  SELECT max_responses, response_count INTO _max, _count
  FROM public.marketplace_requests
  WHERE id = _request_id AND status = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not available or does not exist';
  END IF;

  IF _max IS NOT NULL AND _count >= _max THEN
    RAISE EXCEPTION 'This request has reached its maximum number of responses';
  END IF;

  INSERT INTO public.marketplace_responses (
    request_id, company_id, response_status, counter_offer,
    available_start, available_end, message, created_at
  ) VALUES (
    _request_id, _company_id, 'INTERESTED', _counter_offer,
    _available_start, _available_end, _message, now()
  ) RETURNING id INTO _id;

  UPDATE public.marketplace_requests
  SET response_count = COALESCE(response_count, 0) + 1
  WHERE id = _request_id;

  RETURN _id;
END;
$$;


--
-- Name: submit_marketplace_response(uuid, uuid, uuid, public.marketplace_response_status_enum, numeric, integer, timestamp with time zone, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_marketplace_response(_request_id uuid, _company_id uuid, _role_id uuid, _response_status public.marketplace_response_status_enum, _proposed_rate numeric DEFAULT NULL::numeric, _duration_hours integer DEFAULT NULL::integer, _proposed_start timestamp with time zone DEFAULT NULL::timestamp with time zone, _proposed_end timestamp with time zone DEFAULT NULL::timestamp with time zone, _message text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    new_response_id uuid;
BEGIN
    INSERT INTO marketplace_responses (
        request_id, company_id, role_id, response_status,
        proposed_rate, duration_hours, proposed_start, proposed_end, message
    ) VALUES (
        _request_id, _company_id, _role_id, _response_status,
        _proposed_rate, _duration_hours, _proposed_start, _proposed_end, _message
    )
    RETURNING id INTO new_response_id;

    -- Increment response counter in requests
    UPDATE marketplace_requests
    SET response_count = COALESCE(response_count, 0) + 1
    WHERE id = _request_id;

    RETURN new_response_id;
END;
$$;


--
-- Name: submit_response(uuid, uuid, uuid, text, text, integer, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_response(p_request_id uuid, p_role_id uuid, p_company_id uuid, p_response_type text, p_pricing_type text, p_quantity_fulfilled integer, p_proposed_start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_proposed_end_time timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_response_id uuid;
    v_required int;
    v_current int;
    v_remaining int;
    v_final_qty int;
BEGIN
    -- Get required vs current fulfillment
    SELECT quantity_required, quantity_fulfilled
    INTO v_required, v_current
    FROM marketplace_request_roles
    WHERE id = p_role_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid role_id: %', p_role_id;
    END IF;

    -- Calculate how many spots remain
    v_remaining := GREATEST(v_required - v_current, 0);

    -- Clamp the contractor’s offered quantity to remaining capacity
    v_final_qty := LEAST(COALESCE(p_quantity_fulfilled, 1), v_remaining);

    IF v_final_qty <= 0 THEN
        RAISE EXCEPTION 'Role % is already fully staffed (required %, fulfilled %)',
            p_role_id, v_required, v_current;
    END IF;

    -- Insert contractor response
    INSERT INTO marketplace_responses
        (request_id, role_id, company_id, response_type,
         pricing_type, quantity_fulfilled,
         proposed_start_time, proposed_end_time)
    VALUES
        (p_request_id, p_role_id, p_company_id, p_response_type,
         p_pricing_type, v_final_qty,
         p_proposed_start_time, p_proposed_end_time)
    RETURNING id INTO v_response_id;

    -- Update role fulfillment tally
    UPDATE marketplace_request_roles
    SET quantity_fulfilled = quantity_fulfilled + v_final_qty
    WHERE id = p_role_id;

    RETURN v_response_id;
END;
$$;


--
-- Name: sync_schedule_event(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_schedule_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update by work_order_id (primary method)
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW(),
      title = COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      customer_id = NEW.customer_id,
      employee_id = NEW.assigned_technician_id
  WHERE work_order_id = NEW.id;

  -- If no existing schedule event, create one for scheduled work orders
  IF NOT FOUND AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    INSERT INTO public.schedule_events (
      company_id,
      work_order_id,
      title,
      description,
      start_time,
      end_time,
      customer_id,
      employee_id,
      event_type,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.company_id,
      NEW.id,
      COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      NEW.description,
      NEW.start_time,
      NEW.end_time,
      NEW.customer_id,
      NEW.assigned_technician_id,
      'work_order',
      'scheduled',
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: sync_schedule_events(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_schedule_events() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO public.schedule_events (
      company_id,
      work_order_id,
      title,
      description,
      start_time,
      end_time,
      employee_id,
      customer_id,
      event_type,
      status,
      created_at,
      updated_at
  )
  SELECT
      wo.company_id,
      wo.id,
      COALESCE(wo.title, 'Work Order #' || wo.id::text),
      wo.description,
      COALESCE(wo.start_time, NOW() + INTERVAL '1 day'),
      COALESCE(wo.end_time, COALESCE(wo.start_time, NOW() + INTERVAL '1 day') + INTERVAL '2 hours'),
      wo.assigned_technician_id,
      wo.customer_id,
      'work_order',
      wo.status,
      NOW(),
      NOW()
  FROM public.work_orders wo
  WHERE NOT EXISTS (
      SELECT 1 FROM public.schedule_events se
      WHERE se.work_order_id = wo.id
  );
END;
$$;


--
-- Name: trg_cancel_request(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_cancel_request() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  update public.marketplace_requests
  set status = 'canceled'
  where id = new.request_id;
  return new;
end;
$$;


--
-- Name: trg_invoice_payments_status_bump_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_invoice_payments_status_bump_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only run if payment inserted, deleted, or amount changed
  IF TG_OP = 'INSERT' 
     OR TG_OP = 'DELETE' 
     OR NEW.amount IS DISTINCT FROM OLD.amount THEN
    PERFORM public.invoices_auto_status(
      COALESCE(NEW.invoice_id, OLD.invoice_id)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: trg_invoices_auto_status_fn(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_invoices_auto_status_fn() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') 
     AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    PERFORM public.invoices_auto_status(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: trg_log_decline_reason(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_log_decline_reason() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- New decline (use REJECTED instead of declined)
  IF NEW.response_status = 'REJECTED' AND NEW.decline_reason_code IS NOT NULL THEN
    INSERT INTO public.marketplace_request_decline_stats (request_id, reason_code, decline_count)
    VALUES (NEW.request_id, NEW.decline_reason_code, 1)
    ON CONFLICT (request_id, reason_code)
    DO UPDATE SET decline_count = marketplace_request_decline_stats.decline_count + 1,
                  updated_at = now();

    UPDATE public.marketplace_requests
    SET total_declines = total_declines + 1,
        updated_at = now()
    WHERE id = NEW.request_id;
  END IF;

  -- Undo decline (use REJECTED instead of declined)
  IF OLD.response_status = 'REJECTED' AND NEW.response_status <> 'REJECTED' AND OLD.decline_reason_code IS NOT NULL THEN
    UPDATE public.marketplace_request_decline_stats
    SET decline_count = greatest(decline_count - 1, 0),
        updated_at = now()
    WHERE request_id = OLD.request_id AND reason_code = OLD.decline_reason_code;

    UPDATE public.marketplace_requests
    SET total_declines = greatest(total_declines - 1, 0),
        updated_at = now()
    WHERE id = OLD.request_id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: trg_recalc_labor(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_recalc_labor() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM public.recalc_labor_totals(NEW.work_order_id);
  RETURN NEW;
END $$;


--
-- Name: trg_review_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_review_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform update_company_rating(old.company_id);
  return old;
end;
$$;


--
-- Name: trg_review_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_review_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$$;


--
-- Name: trg_review_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_review_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$$;


--
-- Name: trigger_update_vendor_costs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_update_vendor_costs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only update costs when PO status changes to RECEIVED or CLOSED
  IF OLD.status != NEW.status AND NEW.status IN ('RECEIVED', 'CLOSED') THEN
    PERFORM public.update_vendor_item_costs();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_calendar_on_invoice(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_calendar_on_invoice() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.status = 'PAID' THEN
    UPDATE public.schedule_events
    SET status = 'paid'
    WHERE work_order_id = NEW.job_id; -- invoices.job_id links to work_orders.id
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_company_customers_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_customers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_company_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE companies
  SET 
    average_rating = (
      (average_rating * total_reviews + NEW.rating) / (total_reviews + 1)
    ),
    total_reviews = total_reviews + 1
  WHERE id = NEW.company_id;

  RETURN NEW;
END;
$$;


--
-- Name: update_company_rating(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_company_rating(company uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update public.companies c
  set avg_rating = sub.new_avg,
      rating_count = sub.new_count
  from (
    select
      r.company_id,
      avg(r.rating)::numeric(3,2) as new_avg,
      count(r.id) as new_count
    from public.marketplace_reviews r
    where r.company_id = company
    group by r.company_id
  ) sub
  where c.id = sub.company_id;
end;
$$;


--
-- Name: update_inventory_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inventory_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    stock_change NUMERIC;
BEGIN
    -- INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := NEW.quantity; -- add stock
        ELSIF NEW.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -NEW.quantity; -- remove stock
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := NEW.quantity; -- +/- stock
        ELSIF NEW.movement_type = 'ALLOCATION' THEN
            -- allocation reserves stock but doesn’t consume it
            -- here we reduce available stock but not on-hand
            stock_change := 0; -- handled separately in reporting
        ELSE
            stock_change := 0;
        END IF;

        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET 
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();

        RETURN NEW;
    END IF;

    -- DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -OLD.quantity;
        ELSIF OLD.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := OLD.quantity;
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -OLD.quantity;
        ELSIF OLD.movement_type = 'ALLOCATION' THEN
            stock_change := 0; -- allocations don’t affect stock directly
        ELSE
            stock_change := 0;
        END IF;

        UPDATE inventory_stock 
        SET quantity = quantity + stock_change,
            updated_at = NOW()
        WHERE item_id = OLD.item_id 
          AND location_id = OLD.location_id
          AND company_id = OLD.company_id;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: FUNCTION update_inventory_stock(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_inventory_stock() IS 'Automatically updates inventory_stock when movements are created, updated, or deleted';


--
-- Name: update_pto_request_historical(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_pto_request_historical() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Mark requests as historical when end_date passes
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'APPROVED' THEN
    NEW.is_historical = true;
  END IF;

  -- Set updated_at if column exists
  IF TG_TABLE_NAME = 'pto_requests' AND NEW.updated_at IS NOT NULL THEN
    NEW.updated_at = now();
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
-- Name: update_vendor_item_costs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_vendor_item_costs() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update vendor_items.unit_cost based on most recent PO receipts
  UPDATE public.vendor_items vi
  SET 
    unit_cost = recent_costs.avg_cost,
    last_cost_update = now(),
    updated_at = now()
  FROM (
    SELECT 
      poi.supplier_part_number,
      po.vendor_id,
      AVG(poi.unit_cost) as avg_cost,
      MAX(po.created_at) as latest_po_date
    FROM public.po_items poi
    JOIN public.purchase_orders po ON poi.purchase_order_id = po.id
    WHERE po.status IN ('RECEIVED', 'CLOSED')
      AND po.created_at >= now() - interval '90 days'
      AND poi.supplier_part_number IS NOT NULL
      AND poi.unit_cost > 0
    GROUP BY poi.supplier_part_number, po.vendor_id
  ) recent_costs
  WHERE vi.supplier_part_number = recent_costs.supplier_part_number
    AND vi.vendor_id = recent_costs.vendor_id
    AND recent_costs.avg_cost != vi.unit_cost;
END;
$$;


--
-- Name: update_vendor_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_vendor_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.vendor_id IS NOT NULL THEN
      UPDATE public.vendors SET
        total_orders = (
          SELECT COUNT(*) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status != 'CANCELLED'
        ),
        lifetime_spend = (
          SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status IN ('RECEIVED', 'CLOSED')
        ),
        last_order_date = (
          SELECT MAX(created_at::date) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id
        ),
        updated_at = now()
      WHERE id = NEW.vendor_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.vendor_id IS NOT NULL THEN
    UPDATE public.vendors SET
      total_orders = (
        SELECT COUNT(*) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status != 'CANCELLED'
      ),
      lifetime_spend = (
        SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status IN ('RECEIVED', 'CLOSED')
      ),
      last_order_date = (
        SELECT MAX(created_at::date) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id
      ),
      updated_at = now()
    WHERE id = OLD.vendor_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: wo_change_status(uuid, public.work_order_status_enum); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_change_status(p_id uuid, p_to public.work_order_status_enum) RETURNS TABLE(id uuid, status public.work_order_status_enum)
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE work_orders
  SET status = p_to,
      updated_at = now()
  WHERE id = p_id
  RETURNING work_orders.id, work_orders.status
  INTO id, status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order % not found', p_id;
  END IF;
END;
$$;


--
-- Name: wo_change_status(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_change_status(p_id uuid, p_to text, p_reason text DEFAULT NULL::text) RETURNS public.work_orders
    LANGUAGE plpgsql
    AS $$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status = p_to,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order % not found', p_id;
  END IF;

  RETURN rec;
END;
$$;


--
-- Name: wo_change_status(uuid, public.work_order_status_enum, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_change_status(p_id uuid, p_to public.work_order_status_enum, p_reason text DEFAULT NULL::text) RETURNS public.work_orders
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  rec_old work_orders;
  rec_new work_orders;
BEGIN
  SELECT * INTO rec_old FROM work_orders WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'work order % not found', p_id;
  END IF;

  UPDATE work_orders
  SET status = p_to,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO rec_new;

  -- Audit
  INSERT INTO work_order_audit_log (work_order_id, company_id, action, old_status, new_status, details)
  VALUES (
    rec_old.id,
    rec_old.company_id,
    'status_changed',
    rec_old.status::text,
    rec_new.status::text,
    jsonb_build_object('reason', p_reason, 'changed_at', now())
  );

  RETURN rec_new;
END;
$$;


--
-- Name: wo_is_legal_transition(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_is_legal_transition(p_stage text, p_from text, p_to text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
begin
  case p_stage
    when 'QUOTE' then
      return (p_from,p_to) in (('DRAFT','SENT'),('SENT','ACCEPTED'),('SENT','REJECTED'),('SENT','EXPIRED'));
    when 'JOB' then
      return (p_from,p_to) in (('DRAFT','SCHEDULED'),('SCHEDULED','IN_PROGRESS'),('IN_PROGRESS','COMPLETED'),('SCHEDULED','CANCELLED'));
    when 'WORK_ORDER' then
      return (p_from,p_to) in (('ASSIGNED','IN_PROGRESS'),('IN_PROGRESS','COMPLETED'));
    else
      return false;
  end case;
end $$;


--
-- Name: wo_stage_status_auto(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_stage_status_auto() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Stage changes based on unified status
  IF NEW.stage = 'QUOTE' AND NEW.status = 'ACCEPTED' THEN
    NEW.stage := 'JOB';
  ELSIF NEW.stage = 'JOB' AND NEW.status IN ('SCHEDULED','IN_PROGRESS') THEN
    NEW.stage := 'WORK_ORDER';
  ELSIF NEW.stage = 'WORK_ORDER' AND NEW.status IN ('CANCELLED') THEN
    NEW.stage := 'JOB';
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: wo_touch(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.wo_touch() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  NEW.total_cents := COALESCE(NEW.subtotal_cents,0) + COALESCE(NEW.tax_cents,0);
  RETURN NEW;
END; $$;


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
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
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
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
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
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
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
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
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


--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
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
-- Name: jobs_20250823_013140; Type: TABLE; Schema: legacy_archive; Owner: -
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


--
-- Name: quote_items_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: -
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


--
-- Name: quotes_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: -
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


--
-- Name: wo_master_20250828_021425; Type: TABLE; Schema: legacy_archive; Owner: -
--

CREATE TABLE legacy_archive.wo_master_20250828_021425 (
    id uuid,
    company_id uuid,
    customer_id uuid,
    stage public.stage_enum,
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


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    uploaded_by uuid,
    file_url text NOT NULL,
    file_type text,
    uploaded_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    company_name text
);


--
-- Name: auto_accept_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_accept_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_company_id uuid,
    trade_tag text NOT NULL,
    request_type text DEFAULT 'standard'::text NOT NULL,
    min_internal_rating numeric(3,2) DEFAULT 0,
    require_verified boolean DEFAULT false,
    max_hourly_rate numeric(12,2),
    max_eta_hours integer,
    max_distance_km numeric(6,2),
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT auto_accept_rules_request_type_check CHECK ((request_type = ANY (ARRAY['standard'::text, 'emergency'::text])))
);


--
-- Name: auto_patches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_patches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description text,
    sql_command text NOT NULL,
    status text DEFAULT 'pending'::text,
    applied_at timestamp with time zone,
    error_message text
);


--
-- Name: business_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    timezone text DEFAULT 'America/Los_Angeles'::text NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    date_format text DEFAULT 'MM/DD/YYYY'::text NOT NULL,
    time_format text DEFAULT '12'::text NOT NULL,
    number_format text DEFAULT 'US'::text NOT NULL,
    business_hours jsonb DEFAULT '{"friday": {"open": "08:00", "close": "17:00", "enabled": true}, "monday": {"open": "08:00", "close": "17:00", "enabled": true}, "sunday": {"open": "09:00", "close": "15:00", "enabled": false}, "tuesday": {"open": "08:00", "close": "17:00", "enabled": true}, "saturday": {"open": "09:00", "close": "15:00", "enabled": false}, "thursday": {"open": "08:00", "close": "17:00", "enabled": true}, "wednesday": {"open": "08:00", "close": "17:00", "enabled": true}}'::jsonb NOT NULL,
    preferred_contact_method text DEFAULT 'email'::text NOT NULL,
    send_auto_reminders boolean DEFAULT true NOT NULL,
    send_quote_notifications boolean DEFAULT true NOT NULL,
    send_invoice_notifications boolean DEFAULT true NOT NULL,
    require_customer_approval boolean DEFAULT false NOT NULL,
    allow_partial_payments boolean DEFAULT true NOT NULL,
    auto_generate_work_orders boolean DEFAULT true NOT NULL,
    require_photo_documentation boolean DEFAULT false NOT NULL,
    quality_control_enabled boolean DEFAULT false NOT NULL,
    compliance_tracking jsonb DEFAULT '{}'::jsonb,
    safety_protocols jsonb DEFAULT '[]'::jsonb,
    multi_location_enabled boolean DEFAULT false NOT NULL,
    franchise_mode boolean DEFAULT false NOT NULL,
    custom_workflows jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    po_number_prefix text DEFAULT 'PO-'::text,
    next_po_number integer DEFAULT 1001,
    po_auto_numbering boolean DEFAULT true,
    po_require_approval boolean DEFAULT false,
    po_approval_threshold numeric DEFAULT 1000.00,
    po_default_terms text DEFAULT 'NET_30'::text,
    po_auto_send_to_vendor boolean DEFAULT false,
    po_require_receipt_confirmation boolean DEFAULT true,
    po_allow_partial_receiving boolean DEFAULT true,
    po_default_shipping_method text DEFAULT 'STANDARD'::text,
    po_tax_calculation_method text DEFAULT 'AUTOMATIC'::text,
    po_currency text DEFAULT 'USD'::text,
    po_payment_terms_options jsonb DEFAULT '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
    po_default_notes text DEFAULT ''::text,
    po_footer_text text DEFAULT ''::text,
    po_email_template text DEFAULT 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.'::text,
    po_reminder_days integer DEFAULT 7,
    po_overdue_notification_days integer DEFAULT 14,
    emergency_fee numeric(12,2) DEFAULT 0,
    emergency_hours text,
    CONSTRAINT valid_contact_method CHECK ((preferred_contact_method = ANY (ARRAY['email'::text, 'phone'::text, 'sms'::text, 'app'::text]))),
    CONSTRAINT valid_currency CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT valid_time_format CHECK ((time_format = ANY (ARRAY['12'::text, '24'::text]))),
    CONSTRAINT valid_timezone CHECK ((timezone ~ '^[A-Za-z_]+/[A-Za-z_]+$'::text))
);


--
-- Name: closed_jobs; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.closed_jobs AS
 SELECT id,
    company_id,
    company_name,
    title,
    description,
    customer_id,
    status,
    assigned_technician_id,
    start_time,
    end_time,
    estimated_duration,
    work_location,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    quote_number,
    quote_sent_date,
    quote_expires_date,
    job_number,
    actual_start_time,
    actual_end_time,
    invoice_number,
    invoice_date,
    due_date,
    amount_paid,
    created_at,
    updated_at,
    created_by,
    notes,
    internal_notes,
    attachments,
    stage,
    labor_subtotal,
    labor_summary,
    reason,
    invoice_id,
    pricing_model,
    flat_rate_amount,
    unit_count,
    unit_price,
    percentage,
    recurring_interval,
    percentage_base_amount,
    recurring_start_date,
    recurring_end_date,
    recurring_custom_interval_days,
    recurring_rate,
    milestone_base_amount,
    service_address_id,
    service_address_line_1,
    service_address_line_2,
    service_city,
    service_state,
    service_zip_code,
    service_country,
    access_instructions,
    completed_at,
    version,
    accepted_at,
    accepted_by,
    accepted_ip,
    sent_at,
    sent_to,
    applied_tax_rate,
    progress_percent,
    priority,
    tags,
    parent_job_id,
    expected_completion,
    is_visible_to_customer,
    is_recurring,
    recurrence_rule,
    customer_notified,
    last_notified_at,
    reminder_sent_at,
    reminder_method,
    confirmation_sent_at,
    customer_confirmed_at,
    reschedule_requested_at,
    recurring_parent_id,
    recurring_sequence,
    is_sent,
    marketplace_request_id,
    marketplace_response_id,
    preferred_time_option
   FROM public.work_orders
  WHERE (status = 'COMPLETED'::public.work_order_status_enum);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    street_address text,
    city text,
    state text,
    postal_code text,
    country text DEFAULT 'United States'::text,
    latitude double precision,
    longitude double precision,
    job_buffer_minutes integer DEFAULT 30,
    default_buffer_before_minutes integer DEFAULT 30,
    default_buffer_after_minutes integer DEFAULT 30,
    enable_customer_self_scheduling boolean DEFAULT false,
    auto_approve_customer_selections boolean DEFAULT false,
    business_hours_start text DEFAULT '07:30'::text,
    business_hours_end text DEFAULT '17:00'::text,
    working_days integer[] DEFAULT '{1,2,3,4,5}'::integer[],
    min_advance_booking_hours integer DEFAULT 1,
    max_advance_booking_days integer DEFAULT 30,
    phone text,
    email text,
    website text,
    license_number text,
    tax_id text,
    phone_number text,
    zip_code text,
    license_numbers text[],
    updated_at timestamp with time zone DEFAULT now(),
    licenses jsonb DEFAULT '[]'::jsonb,
    industry_tags jsonb DEFAULT '[]'::jsonb,
    company_logo_url text,
    company_banner_url text,
    accepts_emergency boolean DEFAULT false NOT NULL,
    emergency_fee numeric(12,2),
    nights_weekends boolean DEFAULT false NOT NULL,
    avg_rating numeric(3,2),
    rating_count integer DEFAULT 0,
    verification_status public.verification_status_enum DEFAULT 'UNVERIFIED'::public.verification_status_enum,
    multi_location_enabled boolean DEFAULT false,
    franchise_mode boolean DEFAULT false,
    compliance_tracking jsonb DEFAULT '{}'::jsonb,
    safety_protocols jsonb DEFAULT '[]'::jsonb,
    custom_workflows jsonb DEFAULT '{}'::jsonb
);


--
-- Name: company_approval_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_approval_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    auto_approve_limit numeric(12,4) DEFAULT 500,
    manager_approval_limit numeric(12,4) DEFAULT 5000,
    owner_approval_required boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    mobile_notifications boolean DEFAULT true,
    require_budget_check boolean DEFAULT true,
    allow_over_budget boolean DEFAULT false,
    over_budget_approval_required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    relationship_status text DEFAULT 'active'::text,
    notes text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_document_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    category text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_service_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_service_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    service_tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    default_invoice_due_days integer,
    default_invoice_terms text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    use_inventory boolean DEFAULT false,
    CONSTRAINT company_settings_default_invoice_due_days_check CHECK ((default_invoice_due_days >= 0)),
    CONSTRAINT company_settings_default_invoice_terms_check CHECK ((default_invoice_terms = ANY (ARRAY['DUE_ON_RECEIPT'::text, 'NET_7'::text, 'NET_15'::text, 'NET_30'::text, 'NET_45'::text, 'NET_60'::text])))
);


--
-- Name: company_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_tags (
    company_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: contractor_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contractor_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    company_id uuid NOT NULL,
    rating integer NOT NULL,
    review text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contractor_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    valid_from timestamp with time zone NOT NULL,
    valid_to timestamp with time zone NOT NULL,
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    company_id uuid NOT NULL,
    CONSTRAINT coupons_discount_type_check CHECK ((discount_type = ANY (ARRAY['PERCENT'::text, 'FLAT'::text])))
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    company_id uuid NOT NULL,
    address_type text DEFAULT 'SERVICE'::text NOT NULL,
    address_name text,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text DEFAULT 'United States'::text,
    latitude double precision,
    longitude double precision,
    is_primary boolean DEFAULT false,
    access_instructions text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customer_addresses_address_type_check CHECK ((address_type = ANY (ARRAY['BILLING'::text, 'SERVICE'::text, 'MAILING'::text])))
);


--
-- Name: TABLE customer_addresses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.customer_addresses IS 'Multiple addresses per customer - billing, service, mailing, etc.';


--
-- Name: COLUMN customer_addresses.address_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_addresses.address_type IS 'BILLING, SERVICE, or MAILING address classification';


--
-- Name: COLUMN customer_addresses.is_primary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_addresses.is_primary IS 'Primary address of this type for the customer';


--
-- Name: customer_communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type text DEFAULT 'call'::text,
    direction text DEFAULT 'outbound'::text,
    subject text,
    content text,
    outcome text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    sender_id uuid,
    message_text text NOT NULL,
    message_type text DEFAULT 'text'::text,
    sent_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    status text DEFAULT 'sent'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_portal_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_portal_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    auth_user_id uuid,
    invited_by uuid,
    invited_at timestamp with time zone DEFAULT now(),
    created_via text DEFAULT 'invite'::text,
    needs_password_setup boolean DEFAULT true,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'United States'::text,
    latitude double precision,
    longitude double precision,
    invitation_token text,
    invitation_expires_at timestamp with time zone,
    invitation_accepted_at timestamp with time zone,
    email text,
    last_login timestamp with time zone,
    CONSTRAINT customer_portal_accounts_created_via_check CHECK ((created_via = ANY (ARRAY['invite'::text, 'self_signup'::text, 'magic_link'::text])))
);


--
-- Name: customer_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    customer_id uuid,
    rating integer,
    comments text,
    created_at timestamp with time zone DEFAULT now(),
    company_name text,
    company_id uuid NOT NULL,
    CONSTRAINT customer_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: customer_service_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_service_agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    agreement_type text DEFAULT 'maintenance'::text,
    start_date date NOT NULL,
    end_date date,
    monthly_fee numeric(10,2),
    annual_fee numeric(10,2),
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    signed_by text,
    signed_at timestamp with time zone DEFAULT now(),
    ip_address text,
    signature_data text
);


--
-- Name: customer_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3B82F6'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    preferred_contact_method text,
    created_at timestamp with time zone DEFAULT now(),
    notes text,
    preferred_technician uuid,
    preferred_times text,
    street_address text,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'United States'::text,
    latitude double precision,
    longitude double precision,
    last_service_date date,
    rating integer DEFAULT 5,
    lifetime_revenue numeric DEFAULT 0,
    total_jobs integer DEFAULT 0,
    status text DEFAULT 'ACTIVE'::text,
    preferred_service_time text,
    special_instructions text,
    company_name text,
    status_reason text,
    status_changed_at timestamp with time zone,
    updated_by uuid,
    customer_type text DEFAULT 'RESIDENTIAL'::text,
    billing_address_line_1 text,
    billing_address_line_2 text,
    billing_city text,
    billing_state text,
    billing_zip_code text,
    billing_country text DEFAULT 'United States'::text,
    portal_account_id uuid,
    created_via text DEFAULT 'manual'::text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customers_created_via_check CHECK ((created_via = ANY (ARRAY['manual'::text, 'self_signup'::text, 'contractor_invite'::text]))),
    CONSTRAINT customers_customer_type_check CHECK ((customer_type = ANY (ARRAY['RESIDENTIAL'::text, 'COMMERCIAL'::text, 'PROPERTY_MANAGEMENT'::text])))
);


--
-- Name: COLUMN customers.customer_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customers.customer_type IS 'RESIDENTIAL, COMMERCIAL, or PROPERTY_MANAGEMENT';


--
-- Name: customers_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    from_status text,
    to_status text NOT NULL,
    reason text,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decline_reason_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decline_reason_codes (
    code text NOT NULL,
    description text NOT NULL
);


--
-- Name: default_expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.default_expense_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT true
);


--
-- Name: document_access_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_access_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    document_id uuid NOT NULL,
    action text NOT NULL,
    user_id uuid,
    user_email text,
    ip_address inet,
    user_agent text,
    referrer text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_access_log_action_check CHECK ((action = ANY (ARRAY['view'::text, 'download'::text, 'edit'::text, 'delete'::text, 'share'::text, 'sign'::text])))
);


--
-- Name: TABLE document_access_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.document_access_log IS 'Audit trail for document access and actions';


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    name text NOT NULL,
    category text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_public boolean DEFAULT false NOT NULL,
    trade_category text,
    is_global boolean DEFAULT false
);


--
-- Name: document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    document_id uuid NOT NULL,
    version integer NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    checksum character varying(64),
    change_notes text,
    changes_summary jsonb DEFAULT '{}'::jsonb,
    previous_version_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE document_versions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.document_versions IS 'Tracks all versions of documents with change history';


--
-- Name: document_workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    document_id uuid NOT NULL,
    workflow_type text NOT NULL,
    title text NOT NULL,
    description text,
    required_approvers text[] DEFAULT '{}'::text[] NOT NULL,
    approval_order text DEFAULT 'any'::text,
    minimum_approvals integer DEFAULT 1,
    due_date date,
    reminder_frequency text DEFAULT 'daily'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT document_workflows_approval_order_check CHECK ((approval_order = ANY (ARRAY['any'::text, 'sequential'::text, 'parallel'::text]))),
    CONSTRAINT document_workflows_reminder_frequency_check CHECK ((reminder_frequency = ANY (ARRAY['none'::text, 'daily'::text, 'weekly'::text]))),
    CONSTRAINT document_workflows_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'approved'::text, 'rejected'::text, 'expired'::text]))),
    CONSTRAINT document_workflows_workflow_type_check CHECK ((workflow_type = ANY (ARRAY['approval'::text, 'review'::text, 'signature'::text, 'custom'::text])))
);


--
-- Name: TABLE document_workflows; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.document_workflows IS 'Defines approval workflows for documents';


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    linked_to uuid,
    type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    version integer DEFAULT 1,
    parent_document_id uuid,
    is_current_version boolean DEFAULT true,
    change_notes text,
    checksum character varying(64),
    tags text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: employee_certifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_certifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    certification_name text NOT NULL,
    issuing_organization text NOT NULL,
    certification_number text,
    issue_date date NOT NULL,
    expiration_date date,
    status text DEFAULT 'active'::text NOT NULL,
    verification_url text,
    document_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_certifications_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'expiring'::text, 'revoked'::text])))
);


--
-- Name: employee_compensation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_compensation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    company_id uuid NOT NULL,
    base_salary numeric(10,2),
    hourly_rate numeric(8,2),
    overtime_rate numeric(8,2),
    commission_rate numeric(5,2),
    bonus_eligible boolean DEFAULT false,
    pay_frequency text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_compensation_pay_frequency_check CHECK ((pay_frequency = ANY (ARRAY['weekly'::text, 'biweekly'::text, 'monthly'::text, 'annual'::text])))
);


--
-- Name: employee_development_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_development_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    goal_title text NOT NULL,
    goal_description text,
    goal_category text DEFAULT 'professional'::text NOT NULL,
    target_completion_date date,
    progress_percentage integer DEFAULT 0,
    status text DEFAULT 'active'::text NOT NULL,
    priority text DEFAULT 'medium'::text,
    assigned_by uuid,
    notes text,
    completion_notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_development_goals_goal_category_check CHECK ((goal_category = ANY (ARRAY['professional'::text, 'technical'::text, 'leadership'::text, 'certification'::text, 'training'::text]))),
    CONSTRAINT employee_development_goals_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT employee_development_goals_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100))),
    CONSTRAINT employee_development_goals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text, 'cancelled'::text])))
);


--
-- Name: employee_pay_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_pay_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    base_rate numeric(10,2) NOT NULL,
    overtime_multiplier numeric(4,2) DEFAULT 1.50,
    effective_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_pay_rates_overtime_multiplier_check CHECK ((overtime_multiplier >= 1.0))
);


--
-- Name: employee_performance_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_performance_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    review_period_start date NOT NULL,
    review_period_end date NOT NULL,
    overall_rating numeric(3,2),
    performance_goals_rating numeric(3,2),
    teamwork_rating numeric(3,2),
    communication_rating numeric(3,2),
    technical_skills_rating numeric(3,2),
    strengths text,
    areas_for_improvement text,
    goals_for_next_period text,
    reviewer_comments text,
    employee_comments text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_performance_reviews_communication_rating_check CHECK (((communication_rating >= (0)::numeric) AND (communication_rating <= (5)::numeric))),
    CONSTRAINT employee_performance_reviews_overall_rating_check CHECK (((overall_rating >= (0)::numeric) AND (overall_rating <= (5)::numeric))),
    CONSTRAINT employee_performance_reviews_performance_goals_rating_check CHECK (((performance_goals_rating >= (0)::numeric) AND (performance_goals_rating <= (5)::numeric))),
    CONSTRAINT employee_performance_reviews_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'reviewed'::text, 'finalized'::text]))),
    CONSTRAINT employee_performance_reviews_teamwork_rating_check CHECK (((teamwork_rating >= (0)::numeric) AND (teamwork_rating <= (5)::numeric))),
    CONSTRAINT employee_performance_reviews_technical_skills_rating_check CHECK (((technical_skills_rating >= (0)::numeric) AND (technical_skills_rating <= (5)::numeric)))
);


--
-- Name: employee_pto_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_pto_balances (
    id uuid NOT NULL,
    employee_id uuid,
    company_id uuid,
    vacation_accrued numeric DEFAULT 0,
    vacation_used numeric DEFAULT 0,
    sick_accrued numeric DEFAULT 0,
    sick_used numeric DEFAULT 0,
    personal_accrued numeric DEFAULT 0,
    personal_used numeric DEFAULT 0,
    last_accrual_date date,
    year integer
);


--
-- Name: employee_pto_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_pto_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    policy_id uuid,
    effective_date date NOT NULL,
    end_date date,
    assigned_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: employee_recognition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_recognition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    recognition_type text NOT NULL,
    title text NOT NULL,
    description text,
    given_by uuid,
    recognition_date date DEFAULT CURRENT_DATE,
    is_public boolean DEFAULT true,
    points_awarded integer DEFAULT 0,
    badge_icon text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_recognition_recognition_type_check CHECK ((recognition_type = ANY (ARRAY['achievement'::text, 'award'::text, 'praise'::text, 'thanks'::text, 'milestone'::text])))
);


--
-- Name: employee_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    skill_name text NOT NULL,
    skill_category text DEFAULT 'technical'::text NOT NULL,
    proficiency_level integer DEFAULT 1 NOT NULL,
    assessed_by uuid,
    assessed_at timestamp with time zone DEFAULT now(),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT employee_skills_proficiency_level_check CHECK (((proficiency_level >= 1) AND (proficiency_level <= 100)))
);


--
-- Name: employee_time_off; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_time_off (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    kind text NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    note text,
    status text DEFAULT 'APPROVED'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    approved_by uuid,
    approved_at timestamp with time zone,
    denied_at timestamp with time zone,
    denial_reason text,
    hours_requested numeric(6,2) DEFAULT 0,
    hours_approved numeric(6,2),
    accrual_type text,
    policy_id uuid,
    CONSTRAINT employee_time_off_accrual_type_check CHECK ((accrual_type = ANY (ARRAY['vacation'::text, 'sick'::text, 'personal'::text, 'bereavement'::text, 'unpaid'::text, 'other'::text]))),
    CONSTRAINT employee_time_off_hours_requested_check CHECK ((hours_requested >= (0)::numeric)),
    CONSTRAINT employee_time_off_kind_check CHECK ((kind = ANY (ARRAY['PTO'::text, 'SICK'::text, 'UNPAID'::text, 'OTHER'::text]))),
    CONSTRAINT employee_time_off_status_check CHECK ((status = ANY (ARRAY['REQUESTED'::text, 'APPROVED'::text, 'DENIED'::text, 'CANCELLED'::text, 'EXPIRED'::text])))
);


--
-- Name: employee_time_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_time_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    summary_month date NOT NULL,
    total_hours numeric(8,2) DEFAULT 0,
    regular_hours numeric(8,2) DEFAULT 0,
    overtime_hours numeric(8,2) DEFAULT 0,
    pto_hours numeric(8,2) DEFAULT 0,
    working_days integer DEFAULT 0,
    average_daily_hours numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: employee_timesheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_timesheets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    job_id uuid,
    work_date date NOT NULL,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    break_minutes integer DEFAULT 0,
    overtime_hours numeric(10,4) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'draft'::text,
    submitted_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    denied_by uuid,
    denied_at timestamp with time zone,
    denial_reason text,
    user_id uuid,
    regular_hours numeric(10,4) DEFAULT 0,
    total_paid_hours numeric(10,4) DEFAULT 0,
    total_hours numeric(8,2) DEFAULT 0,
    CONSTRAINT employee_timesheets_break_minutes_check CHECK ((break_minutes >= 0)),
    CONSTRAINT employee_timesheets_overtime_hours_check CHECK ((overtime_hours >= (0)::numeric)),
    CONSTRAINT employee_timesheets_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: COLUMN employee_timesheets.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.status IS 'Approval status: draft, submitted, approved, rejected';


--
-- Name: COLUMN employee_timesheets.submitted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.submitted_at IS 'When timesheet was submitted for approval';


--
-- Name: COLUMN employee_timesheets.approved_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.approved_by IS 'User ID who approved the timesheet';


--
-- Name: COLUMN employee_timesheets.approved_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.approved_at IS 'When timesheet was approved';


--
-- Name: COLUMN employee_timesheets.denied_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.denied_by IS 'User ID who rejected the timesheet';


--
-- Name: COLUMN employee_timesheets.denied_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.denied_at IS 'When timesheet was rejected';


--
-- Name: COLUMN employee_timesheets.denial_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.denial_reason IS 'Reason for rejection';


--
-- Name: COLUMN employee_timesheets.regular_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.regular_hours IS 'Regular hours worked (up to daily/weekly threshold)';


--
-- Name: COLUMN employee_timesheets.total_paid_hours; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.employee_timesheets.total_paid_hours IS 'Total hours to be paid (regular + overtime)';


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    full_name text NOT NULL,
    role text,
    base_rate numeric(10,2),
    overtime_rate numeric(10,2),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: esignatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.esignatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    customer_id uuid,
    quote_id uuid,
    invoice_id uuid,
    signed_by text NOT NULL,
    signature_data jsonb,
    signed_at timestamp with time zone DEFAULT now(),
    ip_address text,
    user_agent text
);


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_tax_deductible boolean DEFAULT true,
    is_taxable boolean DEFAULT false,
    default_tax_rate numeric(5,4) DEFAULT 0.0000,
    mileage_rate numeric(6,3) DEFAULT 0.655,
    reimbursement_type text DEFAULT 'NONE'::text,
    CONSTRAINT expense_categories_reimbursement_type_check CHECK ((reimbursement_type = ANY (ARRAY['NONE'::text, 'DIRECT_PURCHASE'::text, 'MILEAGE'::text, 'PER_DIEM'::text])))
);


--
-- Name: expense_reimbursements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_reimbursements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expense_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    method text DEFAULT 'PAYROLL'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expense_reimbursements_method_check CHECK ((method = ANY (ARRAY['PAYROLL'::text, 'CHECK'::text, 'BANK_TRANSFER'::text]))),
    CONSTRAINT expense_reimbursements_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'PAID'::text])))
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid,
    amount numeric(12,4) NOT NULL,
    description text,
    category text,
    date date DEFAULT CURRENT_DATE NOT NULL,
    receipt_url text,
    vendor text,
    project_id uuid,
    is_billable boolean DEFAULT false,
    tax_amount numeric(12,4) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    reimbursable boolean DEFAULT false,
    reimbursement_status text DEFAULT 'PENDING'::text,
    CONSTRAINT expenses_reimbursement_status_check CHECK ((reimbursement_status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'PAID'::text]))),
    CONSTRAINT expenses_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'reimbursed'::text])))
);


--
-- Name: integration_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    quickbooks_api_key text DEFAULT ''::text,
    twilio_account_sid text DEFAULT ''::text,
    twilio_auth_token text DEFAULT ''::text,
    sendgrid_api_key text DEFAULT ''::text,
    google_calendar_token text DEFAULT ''::text,
    outlook_calendar_token text DEFAULT ''::text,
    hubspot_api_key text DEFAULT ''::text,
    zoho_crm_token text DEFAULT ''::text,
    dropbox_access_token text DEFAULT ''::text,
    gdrive_access_token text DEFAULT ''::text,
    zapier_webhook_url text DEFAULT ''::text
);


--
-- Name: integration_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integration_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    provider text,
    access_token text,
    refresh_token text,
    extra jsonb,
    created_at timestamp with time zone DEFAULT now(),
    company_name text
);


--
-- Name: inventory_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_item_id uuid NOT NULL,
    batch_number text NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE inventory_batches; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_batches IS 'Tracks batch/lot numbers for items with expiry dates';


--
-- Name: inventory_cycle_count_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_cycle_count_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_count_id uuid NOT NULL,
    inventory_item_id uuid NOT NULL,
    expected_qty numeric(12,2) DEFAULT 0,
    counted_qty numeric(12,2) DEFAULT 0,
    variance numeric(12,2) GENERATED ALWAYS AS ((counted_qty - expected_qty)) STORED,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE inventory_cycle_count_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_cycle_count_items IS 'Items within each cycle count session';


--
-- Name: inventory_cycle_counts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_cycle_counts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    status text DEFAULT 'scheduled'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_cycle_counts_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: TABLE inventory_cycle_counts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_cycle_counts IS 'Scheduled physical inventory counts';


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    sku text,
    name text NOT NULL,
    description text,
    category text,
    unit_of_measure text DEFAULT 'each'::text,
    cost numeric(12,4) DEFAULT 0 NOT NULL,
    sell_price numeric(12,4),
    reorder_point integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    base_unit text DEFAULT 'each'::text,
    conversion_factor numeric(12,4) DEFAULT 1.0,
    barcode text,
    qr_code text,
    upc_code text,
    abc_classification text,
    CONSTRAINT inventory_items_abc_classification_check CHECK ((abc_classification = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))
);


--
-- Name: COLUMN inventory_items.barcode; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.barcode IS 'Standard barcode (Code128, Code39, etc.)';


--
-- Name: COLUMN inventory_items.qr_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.qr_code IS 'QR code for mobile scanning';


--
-- Name: COLUMN inventory_items.upc_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.upc_code IS 'UPC for retail items';


--
-- Name: COLUMN inventory_items.abc_classification; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_items.abc_classification IS 'ABC analysis classification (A=high value, B=medium, C=low)';


--
-- Name: inventory_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    company_id uuid NOT NULL,
    quantity numeric(12,4) DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_stock_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_stock_status AS
 SELECT s.item_id,
    i.name AS item_name,
    s.location_id,
    s.company_id,
    s.quantity AS on_hand,
    (0)::numeric(12,4) AS reserved,
    s.quantity AS available,
    s.updated_at
   FROM (public.inventory_stock s
     JOIN public.inventory_items i ON ((i.id = s.item_id)));


--
-- Name: inventory_item_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_item_summary AS
 SELECT i.id AS item_id,
    i.name AS item_name,
    i.sku,
    i.cost,
    i.sell_price,
    (COALESCE(sum(s.on_hand), (0)::numeric))::numeric(12,4) AS total_on_hand,
    (COALESCE(sum(s.reserved), (0)::numeric))::numeric(12,4) AS total_reserved,
    (COALESCE(sum(s.available), (0)::numeric))::numeric(12,4) AS total_available
   FROM (public.inventory_items i
     LEFT JOIN public.inventory_stock_status s ON ((i.id = s.item_id)))
  GROUP BY i.id, i.name, i.sku, i.cost, i.sell_price;


--
-- Name: inventory_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    address text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid,
    work_order_id uuid,
    movement_type text NOT NULL,
    quantity numeric(12,4) NOT NULL,
    unit_cost numeric(12,2),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    related_work_order_id uuid,
    CONSTRAINT inventory_movements_movement_type_check CHECK ((movement_type = ANY (ARRAY['PURCHASE'::text, 'USAGE'::text, 'TRANSFER'::text, 'ADJUSTMENT'::text, 'RETURN'::text])))
);


--
-- Name: COLUMN inventory_movements.related_work_order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_movements.related_work_order_id IS 'Links this movement (allocation/usage) to a work_order for tracking job materials';


--
-- Name: inventory_scan_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_scan_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_item_id uuid,
    scanned_by uuid,
    scan_type text NOT NULL,
    scan_code text NOT NULL,
    scanned_at timestamp with time zone DEFAULT now(),
    notes text,
    CONSTRAINT inventory_scan_log_scan_type_check CHECK ((scan_type = ANY (ARRAY['inbound'::text, 'outbound'::text, 'move'::text, 'adjustment'::text, 'count'::text])))
);


--
-- Name: TABLE inventory_scan_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_scan_log IS 'Audit log of all barcode/QR scans for inventory operations';


--
-- Name: inventory_serial_numbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_serial_numbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inventory_item_id uuid NOT NULL,
    serial_number text NOT NULL,
    status text DEFAULT 'available'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_serial_numbers_status_check CHECK ((status = ANY (ARRAY['available'::text, 'reserved'::text, 'sold'::text, 'returned'::text, 'scrapped'::text])))
);


--
-- Name: TABLE inventory_serial_numbers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.inventory_serial_numbers IS 'Tracks individual serial numbers for serialized items';


--
-- Name: invoice_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    sales_rep_id uuid NOT NULL,
    commission_rate numeric DEFAULT 0 NOT NULL,
    commission_amount numeric DEFAULT 0 NOT NULL,
    commission_status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity numeric(12,4) DEFAULT 1 NOT NULL,
    unit_price numeric(12,4) DEFAULT 0 NOT NULL,
    line_total numeric DEFAULT 0 NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    discount_type text DEFAULT 'NONE'::text,
    discount_value numeric DEFAULT 0,
    sort_order integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid,
    CONSTRAINT invoice_items_discount_type_check CHECK ((discount_type = ANY (ARRAY['NONE'::text, 'FLAT'::text, 'PERCENT'::text])))
);


--
-- Name: invoice_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    amount numeric NOT NULL,
    method text DEFAULT 'CASH'::text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoice_payments_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT invoice_payments_method_check CHECK ((method = ANY (ARRAY['CASH'::text, 'CARD'::text, 'CHECK'::text, 'ACH'::text, 'OTHER'::text])))
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    customer_id uuid,
    invoice_number text NOT NULL,
    total_amount numeric(12,4) DEFAULT 0,
    status text,
    issued_at timestamp with time zone DEFAULT now(),
    due_date timestamp with time zone DEFAULT (now() + '14 days'::interval),
    company_name text,
    company_id uuid NOT NULL,
    notes text,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    currency text DEFAULT 'USD'::text NOT NULL,
    pdf_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    coupon_id uuid,
    subtotal numeric(12,4) DEFAULT 0 NOT NULL,
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['UNPAID'::text, 'PAID'::text, 'OVERDUE'::text, 'PARTIALLY_PAID'::text, 'CANCELLED'::text])))
);


--
-- Name: items_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    item_name text NOT NULL,
    description text,
    item_type text DEFAULT 'material'::text NOT NULL,
    default_rate numeric DEFAULT 0 NOT NULL,
    sku text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT items_catalog_item_type_check CHECK ((item_type = ANY (ARRAY['material'::text, 'part'::text, 'labor'::text, 'service'::text])))
);


--
-- Name: job_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    role text,
    assigned_at timestamp with time zone DEFAULT now(),
    work_order_id uuid,
    CONSTRAINT job_assignments_role_check CHECK ((role = ANY (ARRAY['LEAD'::text, 'ASSISTANT'::text, 'APPRENTICE'::text])))
);


--
-- Name: job_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid,
    photo_url text NOT NULL,
    type text,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    company_name text,
    work_order_id uuid,
    CONSTRAINT job_photos_type_check CHECK ((type = ANY (ARRAY['BEFORE'::text, 'AFTER'::text, 'OTHER'::text])))
);


--
-- Name: job_triggers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_triggers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    event text NOT NULL,
    action text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT job_triggers_action_check CHECK ((action = ANY (ARRAY['SEND_NOTIFICATION'::text, 'CHANGE_STATUS'::text, 'CREATE_INVOICE'::text]))),
    CONSTRAINT job_triggers_event_check CHECK ((event = ANY (ARRAY['ON_CREATE'::text, 'ON_ASSIGN'::text, 'ON_COMPLETE'::text, 'ON_INVOICE'::text])))
);


--
-- Name: jobs_with_payment_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.jobs_with_payment_status AS
 SELECT wo.id,
    wo.company_id,
    wo.company_name,
    wo.title,
    wo.description,
    wo.customer_id,
    wo.status,
    wo.assigned_technician_id,
    wo.start_time,
    wo.end_time,
    wo.estimated_duration,
    wo.work_location,
    wo.subtotal,
    wo.tax_rate,
    wo.tax_amount,
    wo.total_amount,
    wo.quote_number,
    wo.quote_sent_date,
    wo.quote_expires_date,
    wo.job_number,
    wo.actual_start_time,
    wo.actual_end_time,
    wo.invoice_number,
    wo.invoice_date,
    wo.due_date,
    wo.amount_paid,
    wo.created_at,
    wo.updated_at,
    wo.created_by,
    wo.notes,
    wo.internal_notes,
    wo.attachments,
    wo.stage,
    wo.labor_subtotal,
    wo.labor_summary,
    wo.reason,
    wo.invoice_id,
    wo.pricing_model,
    wo.flat_rate_amount,
    wo.unit_count,
    wo.unit_price,
    wo.percentage,
    wo.recurring_interval,
    wo.percentage_base_amount,
    wo.recurring_start_date,
    wo.recurring_end_date,
    wo.recurring_custom_interval_days,
    wo.recurring_rate,
    wo.milestone_base_amount,
    wo.service_address_id,
    wo.service_address_line_1,
    wo.service_address_line_2,
    wo.service_city,
    wo.service_state,
    wo.service_zip_code,
    wo.service_country,
    wo.access_instructions,
    wo.completed_at,
    wo.version,
    wo.accepted_at,
    wo.accepted_by,
    wo.accepted_ip,
    wo.sent_at,
    wo.sent_to,
    wo.applied_tax_rate,
    wo.progress_percent,
    wo.priority,
    wo.tags,
    wo.parent_job_id,
    wo.expected_completion,
    wo.is_visible_to_customer,
    wo.is_recurring,
    wo.recurrence_rule,
    wo.customer_notified,
    wo.last_notified_at,
    wo.reminder_sent_at,
    wo.reminder_method,
    wo.confirmation_sent_at,
    wo.customer_confirmed_at,
    wo.reschedule_requested_at,
    wo.recurring_parent_id,
    wo.recurring_sequence,
    wo.is_sent,
    wo.marketplace_request_id,
    wo.marketplace_response_id,
    wo.preferred_time_option,
    i.status AS invoice_status
   FROM (public.work_orders wo
     LEFT JOIN public.invoices i ON ((i.job_id = wo.id)));


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    company_name text,
    source text DEFAULT 'unknown'::text,
    source_details jsonb DEFAULT '{}'::jsonb,
    utm_data jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'NEW'::public.lead_status_enum,
    temperature text DEFAULT 'cold'::text,
    score integer DEFAULT 0,
    assigned_to uuid,
    last_contact_date date,
    next_contact_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    stage text DEFAULT 'new'::text,
    expected_value numeric(12,2) DEFAULT 0,
    CONSTRAINT leads_status_check CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'qualified'::text, 'unqualified'::text, 'converted'::text, 'lost'::text]))),
    CONSTRAINT leads_temperature_check CHECK ((temperature = ANY (ARRAY['hot'::text, 'warm'::text, 'cold'::text])))
);


--
-- Name: marketplace_cancellations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_cancellations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    canceled_by_customer_id uuid,
    canceled_by_company_id uuid,
    reason_code text,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: marketplace_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    request_id uuid NOT NULL,
    message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: marketplace_request_decline_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_request_decline_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    reason_code text,
    decline_count integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: marketplace_request_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_request_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    category_id uuid,
    quantity_required integer DEFAULT 1 NOT NULL,
    quantity_fulfilled integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: marketplace_request_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_request_tags (
    request_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: marketplace_response_status_enum_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_response_status_enum_backup (
    response_status text
);


--
-- Name: marketplace_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid,
    customer_id uuid,
    company_id uuid,
    rating integer NOT NULL,
    review text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT marketplace_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid,
    work_order_id uuid,
    body text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    company_name text,
    company_id uuid NOT NULL,
    conversation_id uuid,
    read_at timestamp with time zone,
    status text DEFAULT 'sent'::text,
    message_type text DEFAULT 'internal'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    recipient_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    service_request_id uuid,
    customer_id uuid,
    sender_type text,
    CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['internal'::text, 'client'::text, 'system'::text]))),
    CONSTRAINT messages_sender_type_check CHECK ((sender_type = ANY (ARRAY['customer'::text, 'company'::text, 'employee'::text]))),
    CONSTRAINT messages_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'delivered'::text, 'read'::text, 'archived'::text])))
);


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    appointment_reminders_enabled boolean DEFAULT true,
    reminder_hours_before integer DEFAULT 24,
    reminder_methods character varying(20)[] DEFAULT ARRAY['email'::text],
    confirmation_requests_enabled boolean DEFAULT true,
    confirmation_hours_before integer DEFAULT 2,
    reschedule_notifications_enabled boolean DEFAULT true,
    reschedule_buffer_hours integer DEFAULT 4,
    reminder_email_template text DEFAULT 'Hi {customer_name}, this is a reminder that you have an appointment scheduled for {appointment_time} with {company_name}.'::text,
    reminder_sms_template text DEFAULT 'Reminder: Your appointment with {company_name} is scheduled for {appointment_time}. Reply CONFIRM to confirm.'::text,
    confirmation_template text DEFAULT 'Please confirm your appointment for {appointment_time}. Reply YES to confirm or RESCHEDULE to change.'::text,
    email_provider character varying(50),
    sms_provider character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE notification_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_settings IS 'Company-wide settings for customer notifications';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid,
    type text NOT NULL,
    related_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    severity text DEFAULT 'INFO'::text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    CONSTRAINT notifications_severity_check CHECK ((severity = ANY (ARRAY['INFO'::text, 'WARNING'::text, 'CRITICAL'::text])))
);


--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    customer_id uuid,
    lead_id uuid,
    quote_id uuid,
    stage text DEFAULT 'prospecting'::text NOT NULL,
    probability integer DEFAULT 0,
    expected_value numeric(10,2),
    actual_value numeric(10,2),
    expected_close_date date,
    actual_close_date date,
    assigned_to uuid,
    status text DEFAULT 'open'::text,
    win_loss_reason text,
    competitor text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT opportunities_probability_check CHECK (((probability >= 0) AND (probability <= 100))),
    CONSTRAINT opportunities_stage_check CHECK ((stage = ANY (ARRAY['prospecting'::text, 'qualification'::text, 'needs_analysis'::text, 'proposal'::text, 'negotiation'::text, 'closed_won'::text, 'closed_lost'::text]))),
    CONSTRAINT opportunities_status_check CHECK ((status = ANY (ARRAY['open'::text, 'won'::text, 'lost'::text, 'on_hold'::text])))
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    amount numeric NOT NULL,
    payment_method text,
    transaction_id text,
    paid_at timestamp with time zone DEFAULT now(),
    company_name text,
    company_id uuid NOT NULL
);


--
-- Name: po_approval_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_approval_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    action text NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT po_approval_actions_action_check CHECK ((action = ANY (ARRAY['approved'::text, 'rejected'::text])))
);


--
-- Name: po_approval_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_approval_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    min_amount numeric DEFAULT 0 NOT NULL,
    max_amount numeric,
    approver_user_id uuid,
    approver_role text,
    vendor_category_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: po_approval_workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_approval_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    created_by uuid NOT NULL,
    total_amount numeric(12,4) NOT NULL,
    approval_level text NOT NULL,
    required_approvers text[] DEFAULT '{}'::text[] NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT po_approval_workflows_approval_level_check CHECK ((approval_level = ANY (ARRAY['auto'::text, 'manager'::text, 'owner'::text]))),
    CONSTRAINT po_approval_workflows_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'rejected'::text])))
);


--
-- Name: po_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    rule_id uuid,
    approver_user_id uuid,
    status text DEFAULT 'PENDING'::text NOT NULL,
    comments text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT po_approvals_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])))
);


--
-- Name: po_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    item_sku text,
    item_name text NOT NULL,
    description text,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_cost numeric DEFAULT 0 NOT NULL,
    tax_rate numeric,
    line_total numeric,
    received_quantity numeric DEFAULT 0 NOT NULL,
    supplier_part_number text,
    inventory_item_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: po_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    old_status text,
    new_status text,
    changed_by uuid,
    note text,
    changed_at timestamp with time zone DEFAULT now()
);


--
-- Name: preferred_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferred_relationships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_customer_id uuid,
    requester_company_id uuid,
    preferred_company_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT preferred_relationships_check CHECK ((((requester_customer_id IS NOT NULL) AND (requester_company_id IS NULL)) OR ((requester_customer_id IS NULL) AND (requester_company_id IS NOT NULL))))
);


--
-- Name: pto_categories_backup_archive_202509; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pto_categories_backup_archive_202509 (
    id uuid,
    company_id uuid,
    name text,
    code text,
    color text,
    requires_approval boolean,
    max_consecutive_days integer,
    advance_notice_days integer,
    is_active boolean,
    created_at timestamp with time zone
);


--
-- Name: pto_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pto_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    policy_id uuid,
    entry_type text,
    hours numeric NOT NULL,
    effective_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid,
    category_code text DEFAULT 'VAC'::text,
    balance_after numeric(8,2) DEFAULT 0,
    processed_date date DEFAULT CURRENT_DATE,
    related_request_id uuid,
    payroll_period_id uuid,
    description text,
    processed_by uuid,
    CONSTRAINT pto_ledger_entry_type_check CHECK ((entry_type = ANY (ARRAY['ACCRUAL'::text, 'USAGE'::text, 'ADJUSTMENT'::text])))
);


--
-- Name: pto_current_balances; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.pto_current_balances AS
 SELECT employee_id,
    company_id,
    COALESCE(category_code, 'VAC'::text) AS category_code,
    COALESCE(sum(hours), (0)::numeric) AS current_balance,
    max(effective_date) AS last_transaction_date,
    count(
        CASE
            WHEN (entry_type = 'ACCRUAL'::text) THEN 1
            ELSE NULL::integer
        END) AS accrual_count,
    count(
        CASE
            WHEN (entry_type = 'USAGE'::text) THEN 1
            ELSE NULL::integer
        END) AS usage_count
   FROM public.pto_ledger l
  WHERE ((effective_date <= CURRENT_DATE) AND (company_id IS NOT NULL))
  GROUP BY employee_id, company_id, category_code;


--
-- Name: pto_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pto_policies (
    id uuid NOT NULL,
    company_id uuid,
    name text,
    vacation_hours_per_period numeric,
    sick_hours_per_period numeric,
    accrual_period text,
    max_vacation_hours numeric,
    max_sick_hours numeric,
    carryover_vacation_hours numeric,
    carryover_sick_hours numeric,
    description text,
    accrual_rates jsonb DEFAULT '{}'::jsonb,
    max_balances jsonb DEFAULT '{}'::jsonb,
    carryover_rules jsonb DEFAULT '{}'::jsonb,
    eligibility_days integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pto_requests_backup_archive_202509; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pto_requests_backup_archive_202509 (
    id uuid,
    employee_id uuid,
    policy_id uuid,
    start_date date,
    end_date date,
    hours_requested numeric,
    status text,
    created_at timestamp with time zone,
    company_id uuid,
    category_code text,
    submitted_at timestamp with time zone,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    review_notes text,
    reason text,
    notes text,
    is_historical boolean,
    auto_approved boolean,
    updated_at timestamp with time zone
);


--
-- Name: pto_transactions_archive_202509; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pto_transactions_archive_202509 (
    id uuid,
    employee_id uuid,
    company_id uuid,
    transaction_type text,
    pto_type text,
    hours numeric,
    date date,
    description text,
    related_request_id uuid
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    po_number text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    vendor_id uuid,
    vendor_name text,
    vendor_contact text,
    vendor_email text,
    vendor_phone text,
    ship_to_name text,
    ship_to_address_line_1 text,
    ship_to_address_line_2 text,
    ship_to_city text,
    ship_to_state text,
    ship_to_zip_code text,
    ship_to_country text DEFAULT 'United States'::text,
    expected_date date,
    currency text DEFAULT 'USD'::text,
    subtotal numeric,
    tax_rate numeric,
    tax_amount numeric,
    shipping_amount numeric,
    total_amount numeric,
    notes text,
    terms text,
    attachments jsonb DEFAULT '[]'::jsonb,
    related_work_order_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    budget_amount numeric(12,4),
    location_type text,
    approval_status text DEFAULT 'pending'::text,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    CONSTRAINT purchase_orders_approval_status_check CHECK ((approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT purchase_orders_location_type_check CHECK ((location_type = ANY (ARRAY['warehouse'::text, 'office'::text, 'jobsite'::text, 'custom'::text]))),
    CONSTRAINT purchase_orders_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'SENT'::text, 'APPROVED'::text, 'PARTIAL'::text, 'RECEIVED'::text, 'CLOSED'::text, 'CANCELLED'::text])))
);


--
-- Name: quote_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    quote_sent_date timestamp with time zone,
    first_viewed_date timestamp with time zone,
    last_viewed_date timestamp with time zone,
    view_count integer DEFAULT 0,
    time_to_first_view_hours numeric(10,2),
    time_to_decision_hours numeric(10,2),
    conversion_stage text DEFAULT 'SENT'::text,
    rejection_reason text,
    competitor_name text,
    lost_to_price boolean DEFAULT false,
    quote_value numeric(12,2),
    final_job_value numeric(12,2),
    value_variance_percentage numeric(5,2),
    customer_questions_count integer DEFAULT 0,
    revision_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_analytics_conversion_stage_check CHECK ((conversion_stage = ANY (ARRAY['SENT'::text, 'VIEWED'::text, 'ACCEPTED'::text, 'REJECTED'::text, 'EXPIRED'::text])))
);


--
-- Name: quote_approval_workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_approval_workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    workflow_name text DEFAULT 'Standard Approval'::text NOT NULL,
    approval_type text NOT NULL,
    sequence_order integer DEFAULT 1 NOT NULL,
    status text DEFAULT 'PENDING'::text,
    required boolean DEFAULT true,
    approver_user_id uuid,
    approver_name text,
    approver_email text,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    decision_notes text,
    rejection_reason text,
    auto_approve_threshold numeric(12,2),
    requires_manager_approval boolean DEFAULT false,
    requires_customer_approval boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_approval_workflows_approval_type_check CHECK ((approval_type = ANY (ARRAY['MANAGER'::text, 'CUSTOMER'::text, 'FINANCE'::text, 'TECHNICAL'::text]))),
    CONSTRAINT quote_approval_workflows_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'SKIPPED'::text])))
);


--
-- Name: quote_follow_ups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_follow_ups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    follow_up_type text NOT NULL,
    scheduled_date timestamp with time zone NOT NULL,
    completed_date timestamp with time zone,
    assigned_user_id uuid,
    subject text,
    message text,
    template_used text,
    status text DEFAULT 'SCHEDULED'::text,
    outcome text,
    customer_response text,
    is_automated boolean DEFAULT false,
    trigger_days_after integer,
    max_attempts integer DEFAULT 3,
    attempt_number integer DEFAULT 1,
    next_follow_up_date timestamp with time zone,
    escalate_to_manager boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quote_follow_ups_follow_up_type_check CHECK ((follow_up_type = ANY (ARRAY['EMAIL'::text, 'PHONE'::text, 'SMS'::text, 'IN_PERSON'::text, 'AUTOMATED'::text]))),
    CONSTRAINT quote_follow_ups_outcome_check CHECK ((outcome = ANY (ARRAY['NO_RESPONSE'::text, 'INTERESTED'::text, 'NOT_INTERESTED'::text, 'NEEDS_REVISION'::text, 'ACCEPTED'::text, 'REJECTED'::text]))),
    CONSTRAINT quote_follow_ups_status_check CHECK ((status = ANY (ARRAY['SCHEDULED'::text, 'COMPLETED'::text, 'CANCELLED'::text, 'FAILED'::text])))
);


--
-- Name: quote_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_tool_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_tool_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    role text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_tool_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_tool_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tool_id uuid NOT NULL,
    tier_name text NOT NULL,
    rate numeric(10,2) NOT NULL,
    description text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_tool_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_tool_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid,
    tool_id uuid,
    tier_id uuid,
    input_data jsonb,
    output_amount numeric(12,2),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: quote_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    tool_key text NOT NULL,
    display_name text NOT NULL,
    description text,
    unit text NOT NULL,
    base_rate numeric(10,2),
    formula jsonb DEFAULT '{}'::jsonb,
    enabled boolean DEFAULT true,
    allow_override boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: rates_pricing_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rates_pricing_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    default_hourly_rate numeric(12,4) DEFAULT 75.00 NOT NULL,
    overtime_rate_multiplier numeric(6,4) DEFAULT 1.50 NOT NULL,
    weekend_rate_multiplier numeric(6,4) DEFAULT 1.25 NOT NULL,
    holiday_rate_multiplier numeric(6,4) DEFAULT 2.00 NOT NULL,
    emergency_rate_multiplier numeric(6,4) DEFAULT 2.00 NOT NULL,
    travel_fee numeric(12,4) DEFAULT 0.00 NOT NULL,
    mileage_rate numeric(12,4) DEFAULT 0.65 NOT NULL,
    minimum_service_charge numeric(12,4) DEFAULT 0.00 NOT NULL,
    diagnostic_fee numeric(12,4) DEFAULT 0.00 NOT NULL,
    parts_markup_percentage numeric(6,4) DEFAULT 30.00 NOT NULL,
    material_markup_percentage numeric(6,4) DEFAULT 25.00 NOT NULL,
    subcontractor_markup_percentage numeric(6,4) DEFAULT 15.00 NOT NULL,
    senior_discount_percentage numeric(6,4) DEFAULT 0.00 NOT NULL,
    military_discount_percentage numeric(6,4) DEFAULT 0.00 NOT NULL,
    loyalty_discount_percentage numeric(6,4) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    conflict_resolution_policy text DEFAULT 'HIGHEST'::text NOT NULL,
    priority_order text[] DEFAULT ARRAY['HOLIDAY'::text, 'EMERGENCY'::text, 'OVERTIME'::text, 'WEEKEND'::text] NOT NULL,
    default_tax_rate numeric DEFAULT 8.25,
    CONSTRAINT rates_pricing_settings_conflict_resolution_policy_check CHECK ((conflict_resolution_policy = ANY (ARRAY['HIGHEST'::text, 'STACK'::text, 'PRIORITY'::text])))
);


--
-- Name: recurring_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    customer_id uuid,
    frequency character varying(20) NOT NULL,
    interval_value integer DEFAULT 1 NOT NULL,
    days_of_week integer[],
    day_of_month integer,
    start_time time without time zone NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    assigned_to uuid,
    first_occurrence date NOT NULL,
    last_occurrence date,
    max_occurrences integer,
    pricing_model character varying(20) DEFAULT 'TIME_MATERIALS'::character varying,
    estimated_cost numeric(10,2),
    labor_summary jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    next_occurrence date,
    occurrences_created integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT recurring_jobs_frequency_check CHECK (((frequency)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying])::text[]))),
    CONSTRAINT valid_duration CHECK ((duration_minutes > 0)),
    CONSTRAINT valid_frequency CHECK (((frequency)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying])::text[]))),
    CONSTRAINT valid_interval CHECK ((interval_value > 0))
);


--
-- Name: TABLE recurring_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.recurring_jobs IS 'Master templates for recurring appointments and maintenance contracts';


--
-- Name: reimbursement_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reimbursement_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    request_number text,
    title text NOT NULL,
    description text,
    total_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    currency text DEFAULT 'USD'::text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    submitted_at timestamp with time zone,
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    paid_at timestamp with time zone,
    reviewer_id uuid,
    approver_id uuid,
    payment_method text DEFAULT 'PAYROLL'::text,
    payment_reference text,
    employee_notes text,
    reviewer_comments text,
    approver_comments text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reimbursement_requests_payment_method_check CHECK ((payment_method = ANY (ARRAY['PAYROLL'::text, 'CHECK'::text, 'BANK_TRANSFER'::text, 'PETTY_CASH'::text]))),
    CONSTRAINT reimbursement_requests_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'SUBMITTED'::text, 'UNDER_REVIEW'::text, 'APPROVED'::text, 'REJECTED'::text, 'PAID'::text])))
);


--
-- Name: request_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request_tags (
    request_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: route_optimizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.route_optimizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    technician_id uuid,
    optimization_date date NOT NULL,
    original_order jsonb NOT NULL,
    optimized_order jsonb NOT NULL,
    estimated_travel_time integer,
    estimated_distance numeric(10,2),
    optimization_method character varying(50) DEFAULT 'basic'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: TABLE route_optimizations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.route_optimizations IS 'Stores optimized routes for technicians by date';


--
-- Name: sales_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    opportunity_id uuid,
    lead_id uuid,
    user_id uuid,
    activity_type text,
    description text,
    outcome text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    next_action_date date,
    completed_at timestamp with time zone,
    CONSTRAINT sales_activities_activity_type_check CHECK ((activity_type = ANY (ARRAY['CALL'::text, 'EMAIL'::text, 'MEETING'::text, 'NOTE'::text])))
);


--
-- Name: sales_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_targets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid,
    target_amount numeric NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    achieved_amount numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    phone_number text,
    avatar_url text,
    role text NOT NULL,
    company_id uuid,
    tier text DEFAULT 'free'::text,
    invited_by_user_id uuid,
    active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    last_login timestamp with time zone,
    company_name text,
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active'::text,
    joined_at timestamp with time zone,
    notification_preferences jsonb DEFAULT '{"app": true, "sms": false, "email": true}'::jsonb,
    profile_photo_url text,
    street_address text,
    city text,
    state text,
    zip_code text,
    hire_date date,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relationship text,
    pto_balance_hours numeric(5,2) DEFAULT 0,
    certifications jsonb DEFAULT '[]'::jsonb,
    department text,
    employee_id text,
    date_of_birth date,
    social_security_number text,
    first_name text,
    last_name text,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'employee'::text]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending_invite'::text]))),
    CONSTRAINT users_tier_check CHECK ((tier = ANY (ARRAY['free'::text, 'pro'::text, 'enterprise'::text])))
);


--
-- Name: sales_performance; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_performance AS
 SELECT t.id AS target_id,
    t.user_id,
    u.email AS user_email,
    t.target_amount,
    t.achieved_amount,
    t.start_date,
    t.end_date,
    ((t.achieved_amount / NULLIF(t.target_amount, (0)::numeric)) * (100)::numeric) AS achievement_percent
   FROM (public.sales_targets t
     LEFT JOIN public.users u ON ((u.id = t.user_id)));


--
-- Name: sales_rep_commission_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_rep_commission_summary AS
 SELECT ic.company_id,
    ic.sales_rep_id,
    count(*) AS total_invoices,
    sum(i.total_amount) AS total_sales,
    sum(ic.commission_amount) AS total_commission_earned,
    sum(
        CASE
            WHEN (ic.commission_status = 'paid'::text) THEN ic.commission_amount
            ELSE (0)::numeric
        END) AS commission_paid,
    sum(
        CASE
            WHEN (ic.commission_status = 'pending'::text) THEN ic.commission_amount
            ELSE (0)::numeric
        END) AS commission_pending,
    avg(ic.commission_rate) AS average_commission_rate
   FROM ((public.invoice_commissions ic
     JOIN public.invoices i ON ((ic.invoice_id = i.id)))
     JOIN public.users u ON ((ic.sales_rep_id = u.id)))
  GROUP BY ic.company_id, ic.sales_rep_id;


--
-- Name: schedule_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    user_id uuid,
    title text NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    company_name text,
    created_by uuid,
    employee_id uuid,
    customer_id uuid,
    event_type text DEFAULT 'appointment'::text,
    status text DEFAULT 'scheduled'::text,
    updated_at timestamp with time zone DEFAULT now(),
    quote_id uuid,
    work_order_id uuid
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: service_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    company_id uuid,
    title text,
    details text,
    recurrence text,
    next_due_date date,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    company_name text
);


--
-- Name: service_request_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_request_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_request_id uuid NOT NULL,
    contractor_company_id uuid NOT NULL,
    user_id uuid,
    message text,
    estimated_arrival timestamp with time zone,
    quoted_amount numeric(12,2),
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT service_request_responses_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text])))
);


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    company_id uuid,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    urgency text DEFAULT 'normal'::text,
    latitude double precision,
    longitude double precision,
    requested_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'open'::text,
    service_address_line_1 text,
    service_address_line_2 text,
    service_city text,
    service_state text,
    service_zip_code text,
    service_country text DEFAULT 'United States'::text,
    claimed_by_company_id uuid,
    claimed_by_user_id uuid,
    claimed_at timestamp with time zone,
    matched_companies uuid[] DEFAULT '{}'::uuid[],
    CONSTRAINT service_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'claimed'::text, 'scheduled'::text, 'closed'::text, 'cancelled'::text]))),
    CONSTRAINT service_requests_urgency_check CHECK ((urgency = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'emergency'::text])))
);


--
-- Name: service_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    display_name text
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid,
    default_hourly_rate numeric DEFAULT 0,
    default_overtime_rate numeric DEFAULT 0,
    parts_markup_percent numeric DEFAULT 0,
    allow_tech_notes boolean DEFAULT true,
    timezone text DEFAULT 'America/Los_Angeles'::text,
    currency text DEFAULT 'USD'::text,
    quote_terms text DEFAULT ''::text,
    invoice_footer text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    default_tax_rate numeric,
    labor_markup_percentage numeric DEFAULT 0,
    travel_fee numeric DEFAULT 0,
    send_auto_reminders boolean DEFAULT false,
    send_quote_notifications boolean DEFAULT true,
    preferred_contact_method text DEFAULT 'email'::text,
    date_format text DEFAULT 'MM/DD/YYYY'::text,
    offline_mode_enabled boolean DEFAULT true,
    auto_sync_enabled boolean DEFAULT true,
    dark_mode boolean DEFAULT false,
    default_invoice_terms text DEFAULT 'Net 15 days'::text,
    quickbooks_api_key text DEFAULT ''::text,
    twilio_account_sid text DEFAULT ''::text,
    twilio_auth_token text DEFAULT ''::text,
    sendgrid_api_key text DEFAULT ''::text,
    google_calendar_token text DEFAULT ''::text,
    outlook_calendar_token text DEFAULT ''::text,
    hubspot_api_key text DEFAULT ''::text,
    zoho_crm_token text DEFAULT ''::text,
    dropbox_access_token text DEFAULT ''::text,
    gdrive_access_token text DEFAULT ''::text,
    zapier_webhook_url text DEFAULT ''::text,
    job_buffer_minutes integer DEFAULT 60,
    company_name text,
    logo_url text,
    theme_color text,
    default_invoice_due_days integer,
    scheduling_buffer_minutes integer DEFAULT 0,
    licenses jsonb DEFAULT '[]'::jsonb,
    industry_tags jsonb DEFAULT '[]'::jsonb,
    company_logo_url text,
    allow_technician_notes boolean DEFAULT true,
    enable_offline_mode boolean DEFAULT false,
    enable_auto_sync boolean DEFAULT true,
    invoice_prefix text DEFAULT 'INV-'::text,
    next_invoice_number integer DEFAULT 1001,
    invoice_terms text DEFAULT ''::text,
    payment_instructions text DEFAULT ''::text,
    po_number_prefix text DEFAULT 'PO-'::text,
    next_po_number integer DEFAULT 1001,
    po_default_terms text DEFAULT 'NET_30'::text,
    po_require_approval boolean DEFAULT false,
    po_approval_threshold numeric DEFAULT 1000.00,
    CONSTRAINT ck_settings_default_invoice_due_days_nonneg CHECK (((default_invoice_due_days IS NULL) OR (default_invoice_due_days >= 0))),
    CONSTRAINT ck_settings_default_invoice_terms_allowed CHECK ((default_invoice_terms = ANY (ARRAY['DUE_ON_RECEIPT'::text, 'NET_7'::text, 'NET_15'::text, 'NET_30'::text, 'NET_45'::text, 'NET_60'::text, 'CUSTOM'::text]))),
    CONSTRAINT settings_default_invoice_due_days_check CHECK (((default_invoice_due_days IS NULL) OR (default_invoice_due_days >= 0))),
    CONSTRAINT settings_scheduling_buffer_minutes_check CHECK ((scheduling_buffer_minutes >= 0))
);


--
-- Name: COLUMN settings.default_tax_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.settings.default_tax_rate IS 'Deprecated: use rates_pricing_settings.default_tax_rate instead.';


--
-- Name: shared_document_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_document_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tags text[] DEFAULT '{}'::text[]
);


--
-- Name: signature_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signature_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    document_id uuid NOT NULL,
    recipient_email text NOT NULL,
    recipient_name text NOT NULL,
    message text,
    status text DEFAULT 'sent'::text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    viewed_at timestamp with time zone,
    signed_at timestamp with time zone,
    declined_at timestamp with time zone,
    expired_at timestamp with time zone,
    signature_data jsonb,
    ip_address inet,
    user_agent text,
    external_provider character varying(50),
    external_request_id text,
    external_envelope_id text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT signature_requests_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'viewed'::text, 'signed'::text, 'declined'::text, 'expired'::text])))
);


--
-- Name: TABLE signature_requests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.signature_requests IS 'Manages e-signature requests and tracking';


--
-- Name: subcontractor_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcontractor_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subcontractor_id uuid NOT NULL,
    doc_type text NOT NULL,
    file_url text NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now(),
    expiration_date date
);


--
-- Name: subcontractor_timesheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcontractor_timesheets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subcontractor_id uuid NOT NULL,
    work_order_id uuid,
    work_date date NOT NULL,
    clock_in timestamp with time zone,
    clock_out timestamp with time zone,
    total_hours numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: subcontractor_work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcontractor_work_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subcontractor_id uuid NOT NULL,
    work_order_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'ASSIGNED'::text,
    notes text,
    CONSTRAINT subcontractor_work_orders_status_check CHECK ((status = ANY (ARRAY['ASSIGNED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text])))
);


--
-- Name: subcontractors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcontractors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    trade text,
    status text DEFAULT 'ACTIVE'::text,
    insurance_expiration date,
    license_number text,
    license_expiration date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subcontractors_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])))
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text DEFAULT 'CUSTOM'::text,
    is_curated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tags_category_check CHECK ((category = ANY (ARRAY['TRADE'::text, 'SMB'::text, 'CUSTOM'::text])))
);


--
-- Name: technician_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.technician_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    latitude numeric,
    longitude numeric,
    recorded_at timestamp with time zone DEFAULT now(),
    company_name text,
    company_id uuid NOT NULL
);


--
-- Name: tool_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_key text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tool_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    user_id uuid,
    tool_name text NOT NULL,
    usage_count integer DEFAULT 1,
    last_used timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ui_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ui_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    dark_mode boolean DEFAULT false NOT NULL,
    theme_color text,
    logo_url text,
    company_logo_url text
);


--
-- Name: user_dashboard_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_dashboard_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    widget_order jsonb DEFAULT '[]'::jsonb,
    notification_prefs jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    can_view_quotes boolean DEFAULT false,
    can_create_jobs boolean DEFAULT false,
    can_access_customers boolean DEFAULT false,
    can_edit_documents boolean DEFAULT false,
    can_manage_employees boolean DEFAULT false,
    can_access_settings boolean DEFAULT false,
    can_manage_permissions boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    can_access_scheduling boolean DEFAULT false,
    can_access_documents boolean DEFAULT false,
    can_access_quotes boolean DEFAULT false,
    can_access_invoices boolean DEFAULT false,
    can_access_employees boolean DEFAULT false,
    can_access_reports boolean DEFAULT false,
    company_name text
);


--
-- Name: vendor_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    supplier_part_number text NOT NULL,
    supplier_description text,
    inventory_item_id uuid,
    unit_cost numeric(12,4) DEFAULT 0,
    minimum_order_qty integer DEFAULT 1,
    lead_time_days integer DEFAULT 0,
    is_active boolean DEFAULT true,
    last_ordered_at timestamp with time zone,
    last_cost_update timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    preferred_contact_method text,
    created_at timestamp with time zone DEFAULT now(),
    notes text,
    preferred_payment_terms text,
    preferred_times text,
    street_address text,
    city text,
    state text,
    zip_code text,
    country text DEFAULT 'United States'::text,
    latitude double precision,
    longitude double precision,
    last_order_date date,
    rating integer DEFAULT 5,
    lifetime_spend numeric DEFAULT 0,
    total_orders integer DEFAULT 0,
    status text DEFAULT 'ACTIVE'::text,
    preferred_delivery_time text,
    special_instructions text,
    company_name text,
    status_reason text,
    status_changed_at timestamp with time zone,
    updated_by uuid,
    vendor_type text DEFAULT 'SUPPLIER'::text,
    billing_address_line_1 text,
    billing_address_line_2 text,
    billing_city text,
    billing_state text,
    billing_zip_code text,
    billing_country text DEFAULT 'United States'::text,
    tax_id text,
    payment_terms text DEFAULT 'NET_30'::text,
    credit_limit numeric DEFAULT 0,
    account_number text,
    website text,
    primary_contact_name text,
    primary_contact_phone text,
    primary_contact_email text,
    accounts_payable_contact text,
    accounts_payable_phone text,
    accounts_payable_email text,
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vendors_payment_terms_check CHECK ((payment_terms = ANY (ARRAY['NET_15'::text, 'NET_30'::text, 'NET_45'::text, 'NET_60'::text, 'COD'::text, 'PREPAID'::text, '2_10_NET_30'::text]))),
    CONSTRAINT vendors_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text, 'SUSPENDED'::text, 'CREDIT_HOLD'::text, 'DO_NOT_ORDER'::text]))),
    CONSTRAINT vendors_type_check CHECK ((vendor_type = ANY (ARRAY['SUPPLIER'::text, 'CONTRACTOR'::text, 'SERVICE_PROVIDER'::text, 'MANUFACTURER'::text, 'DISTRIBUTOR'::text])))
);


--
-- Name: vendor_catalog_v; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vendor_catalog_v AS
 SELECT vi.id,
    vi.company_id,
    vi.vendor_id,
    v.name AS vendor_name,
    vi.supplier_part_number,
    vi.supplier_description,
    vi.unit_cost,
    vi.minimum_order_qty,
    vi.lead_time_days,
    vi.is_active,
    vi.last_ordered_at,
    ii.id AS inventory_item_id,
    ii.sku AS internal_sku,
    ii.name AS item_name,
    ii.description AS internal_description,
    ii.cost AS internal_cost,
    ii.sell_price,
    ii.reorder_point,
    COALESCE(stock_summary.total_on_hand, (0)::numeric) AS stock_on_hand,
        CASE
            WHEN (ii.id IS NULL) THEN 'NOT_STOCKED'::text
            WHEN (COALESCE(stock_summary.total_on_hand, (0)::numeric) = (0)::numeric) THEN 'OUT_OF_STOCK'::text
            WHEN (COALESCE(stock_summary.total_on_hand, (0)::numeric) <= (COALESCE(ii.reorder_point, 5))::numeric) THEN 'LOW_STOCK'::text
            ELSE 'IN_STOCK'::text
        END AS stock_status,
    vi.created_at,
    vi.updated_at
   FROM (((public.vendor_items vi
     LEFT JOIN public.vendors v ON ((vi.vendor_id = v.id)))
     LEFT JOIN public.inventory_items ii ON ((vi.inventory_item_id = ii.id)))
     LEFT JOIN ( SELECT inventory_stock.item_id,
            sum(inventory_stock.quantity) AS total_on_hand
           FROM public.inventory_stock
          GROUP BY inventory_stock.item_id) stock_summary ON ((ii.id = stock_summary.item_id)))
  WHERE (vi.is_active = true);


--
-- Name: vendor_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6B7280'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendor_category_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_category_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    category_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendor_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    name text NOT NULL,
    title text,
    phone text,
    email text,
    is_primary boolean DEFAULT false,
    department text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendor_pricing_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_pricing_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    inventory_item_id uuid,
    supplier_part_number text NOT NULL,
    unit_cost numeric(12,4) NOT NULL,
    minimum_order_qty integer DEFAULT 1,
    lead_time_days integer DEFAULT 0,
    purchase_order_id uuid,
    ordered_date timestamp with time zone DEFAULT now(),
    delivery_performance_score numeric(3,2) DEFAULT 5.0,
    quality_score numeric(3,2) DEFAULT 5.0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vendors_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    from_status text,
    to_status text NOT NULL,
    reason text,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vw_employee_pto_ledger; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_employee_pto_ledger AS
 SELECT l.id,
    e.full_name,
    e.company_id,
    l.entry_type,
    l.hours,
    l.created_at,
    l.policy_id
   FROM (public.pto_ledger l
     JOIN public.employees e ON ((l.employee_id = e.id)))
  ORDER BY l.created_at DESC;


--
-- Name: vw_timesheet_reports; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_timesheet_reports AS
 SELECT et.id AS timesheet_id,
    u.company_id,
    u.id AS user_id,
    u.full_name,
    u.role,
    et.work_date,
    et.clock_in,
    et.clock_out,
    (((EXTRACT(epoch FROM (et.clock_out - et.clock_in)) / 3600.0) - ((COALESCE(et.break_minutes, 0))::numeric / 60.0)) + et.overtime_hours) AS total_hours,
    et.status,
    et.approved_by,
    et.approved_at,
    et.denial_reason
   FROM (public.employee_timesheets et
     JOIN public.users u ON ((et.user_id = u.id)));


--
-- Name: wo_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wo_audit (
    id bigint NOT NULL,
    wo_id uuid NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    action text NOT NULL,
    details jsonb
);


--
-- Name: wo_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wo_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wo_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wo_audit_id_seq OWNED BY public.wo_audit.id;


--
-- Name: work_order_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    planned_hours numeric(8,2) DEFAULT NULL::numeric,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid NOT NULL
);


--
-- Name: work_order_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_audit (
    id bigint NOT NULL,
    work_order_id uuid NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    action text NOT NULL,
    details jsonb
);


--
-- Name: work_order_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_order_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_order_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_order_audit_id_seq OWNED BY public.work_order_audit.id;


--
-- Name: work_order_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    company_id uuid,
    action text NOT NULL,
    old_status text,
    new_status text,
    user_id uuid,
    user_name text,
    customer_name text,
    customer_email text,
    ip_address text,
    user_agent text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: work_order_labor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_labor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    employee_id uuid,
    work_date date NOT NULL,
    hours numeric(8,2) NOT NULL,
    rate numeric(10,2),
    overtime_hours numeric(8,2) DEFAULT 0,
    overtime_rate numeric(10,2),
    note text,
    created_at timestamp with time zone DEFAULT now(),
    company_id uuid NOT NULL,
    CONSTRAINT work_order_labor_hours_check CHECK ((hours >= (0)::numeric)),
    CONSTRAINT work_order_labor_overtime_hours_check CHECK ((overtime_hours >= (0)::numeric))
);


--
-- Name: work_order_crew_v; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.work_order_crew_v AS
 SELECT wol.work_order_id,
    jsonb_agg(jsonb_build_object('employee_id', wol.employee_id, 'name', u.full_name, 'work_date', wol.work_date, 'hours', wol.hours, 'rate', wol.rate) ORDER BY u.full_name) AS crew
   FROM (public.work_order_labor wol
     LEFT JOIN public.users u ON ((u.id = wol.employee_id)))
  GROUP BY wol.work_order_id;


--
-- Name: work_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    item_name text NOT NULL,
    description text,
    item_type text DEFAULT 'labor'::text NOT NULL,
    quantity numeric(10,2) DEFAULT 1 NOT NULL,
    rate numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    is_overtime boolean DEFAULT false,
    part_number text,
    supplier text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    photo_url text,
    attachments jsonb DEFAULT '[]'::jsonb,
    inventory_item_id uuid,
    is_generic boolean DEFAULT false,
    generic_name text,
    generic_unit text,
    CONSTRAINT work_order_items_item_type_check CHECK ((item_type = ANY (ARRAY['labor'::text, 'material'::text, 'part'::text, 'service'::text]))),
    CONSTRAINT work_order_items_type_check CHECK ((item_type = ANY (ARRAY['labor'::text, 'material'::text, 'part'::text, 'fee'::text, 'discount'::text])))
);


--
-- Name: work_order_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    amount numeric,
    percentage numeric,
    sort_order integer DEFAULT 0 NOT NULL,
    due_date date,
    required boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT work_order_milestones_amount_or_percentage_chk CHECK ((((amount IS NOT NULL) AND (percentage IS NULL)) OR ((amount IS NULL) AND (percentage IS NOT NULL))))
);


--
-- Name: work_order_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_order_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_order_id uuid,
    company_id uuid,
    version integer NOT NULL,
    title text,
    description text,
    subtotal numeric(10,2),
    total_amount numeric(10,2),
    items jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: work_orders_history; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.work_orders_history AS
 SELECT id,
    company_id,
    company_name,
    title,
    description,
    customer_id,
    status,
    assigned_technician_id,
    start_time,
    end_time,
    estimated_duration,
    work_location,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    quote_number,
    quote_sent_date,
    quote_expires_date,
    job_number,
    actual_start_time,
    actual_end_time,
    invoice_number,
    invoice_date,
    due_date,
    amount_paid,
    created_at,
    updated_at,
    created_by,
    notes,
    internal_notes,
    attachments,
    stage,
    labor_subtotal,
    labor_summary,
    reason,
    invoice_id,
    pricing_model,
    flat_rate_amount,
    unit_count,
    unit_price,
    percentage,
    recurring_interval,
    percentage_base_amount,
    recurring_start_date,
    recurring_end_date,
    recurring_custom_interval_days,
    recurring_rate,
    milestone_base_amount,
    service_address_id,
    service_address_line_1,
    service_address_line_2,
    service_city,
    service_state,
    service_zip_code,
    service_country,
    access_instructions,
    completed_at,
    version,
    accepted_at,
    accepted_by,
    accepted_ip,
    sent_at,
    sent_to,
    applied_tax_rate,
    progress_percent,
    priority,
    tags,
    parent_job_id,
    expected_completion,
    is_visible_to_customer,
    is_recurring,
    recurrence_rule,
    customer_notified,
    last_notified_at,
    reminder_sent_at,
    reminder_method,
    confirmation_sent_at,
    customer_confirmed_at,
    reschedule_requested_at,
    recurring_parent_id,
    recurring_sequence,
    is_sent,
    marketplace_request_id,
    marketplace_response_id,
    preferred_time_option
   FROM public.work_orders;


--
-- Name: workflow_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    company_id uuid NOT NULL,
    approver_email text NOT NULL,
    approver_name text,
    approver_user_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    comments text,
    signature_data jsonb,
    ip_address inet,
    user_agent text,
    delegated_to text,
    delegated_at timestamp with time zone,
    delegation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workflow_approvals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'delegated'::text])))
);


--
-- Name: TABLE workflow_approvals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.workflow_approvals IS 'Tracks individual approvals within workflows';


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
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


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
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


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
-- Name: wo_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wo_audit ALTER COLUMN id SET DEFAULT nextval('public.wo_audit_id_seq'::regclass);


--
-- Name: work_order_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit ALTER COLUMN id SET DEFAULT nextval('public.work_order_audit_id_seq'::regclass);


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
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: auto_accept_rules auto_accept_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_accept_rules
    ADD CONSTRAINT auto_accept_rules_pkey PRIMARY KEY (id);


--
-- Name: auto_patches auto_patches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_patches
    ADD CONSTRAINT auto_patches_pkey PRIMARY KEY (id);


--
-- Name: business_settings business_settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_company_id_key UNIQUE (company_id);


--
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- Name: companies companies_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_email_unique UNIQUE (email);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_approval_settings company_approval_settings_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_approval_settings
    ADD CONSTRAINT company_approval_settings_company_id_key UNIQUE (company_id);


--
-- Name: company_approval_settings company_approval_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_approval_settings
    ADD CONSTRAINT company_approval_settings_pkey PRIMARY KEY (id);


--
-- Name: company_customers company_customers_company_id_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_customers
    ADD CONSTRAINT company_customers_company_id_customer_id_key UNIQUE (company_id, customer_id);


--
-- Name: company_customers company_customers_company_id_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_customers
    ADD CONSTRAINT company_customers_company_id_customer_id_unique UNIQUE (company_id, customer_id);


--
-- Name: company_customers company_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_customers
    ADD CONSTRAINT company_customers_pkey PRIMARY KEY (id);


--
-- Name: company_document_templates company_document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_document_templates
    ADD CONSTRAINT company_document_templates_pkey PRIMARY KEY (id);


--
-- Name: company_service_tags company_service_tags_company_id_service_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_service_tags
    ADD CONSTRAINT company_service_tags_company_id_service_tag_id_key UNIQUE (company_id, service_tag_id);


--
-- Name: company_service_tags company_service_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_service_tags
    ADD CONSTRAINT company_service_tags_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: company_tags company_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_tags
    ADD CONSTRAINT company_tags_pkey PRIMARY KEY (company_id, tag_id);


--
-- Name: contractor_ratings contractor_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_ratings
    ADD CONSTRAINT contractor_ratings_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_communications customer_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_communications
    ADD CONSTRAINT customer_communications_pkey PRIMARY KEY (id);


--
-- Name: customer_messages customer_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_pkey PRIMARY KEY (id);


--
-- Name: customer_portal_accounts customer_portal_accounts_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: customer_portal_accounts customer_portal_accounts_invitation_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_invitation_token_key UNIQUE (invitation_token);


--
-- Name: customer_portal_accounts customer_portal_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_pkey PRIMARY KEY (id);


--
-- Name: customer_reviews customer_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_reviews
    ADD CONSTRAINT customer_reviews_pkey PRIMARY KEY (id);


--
-- Name: customer_service_agreements customer_service_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_service_agreements
    ADD CONSTRAINT customer_service_agreements_pkey PRIMARY KEY (id);


--
-- Name: customer_signatures customer_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_signatures
    ADD CONSTRAINT customer_signatures_pkey PRIMARY KEY (id);


--
-- Name: customer_tags customer_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_tags
    ADD CONSTRAINT customer_tags_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers_status_history customers_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_status_history
    ADD CONSTRAINT customers_status_history_pkey PRIMARY KEY (id);


--
-- Name: decline_reason_codes decline_reason_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decline_reason_codes
    ADD CONSTRAINT decline_reason_codes_pkey PRIMARY KEY (code);


--
-- Name: default_expense_categories default_expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.default_expense_categories
    ADD CONSTRAINT default_expense_categories_pkey PRIMARY KEY (id);


--
-- Name: document_access_log document_access_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_access_log
    ADD CONSTRAINT document_access_log_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: document_versions document_versions_document_id_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_document_id_version_key UNIQUE (document_id, version);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);


--
-- Name: document_workflows document_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT document_workflows_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: employee_certifications employee_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_certifications
    ADD CONSTRAINT employee_certifications_pkey PRIMARY KEY (id);


--
-- Name: employee_compensation employee_compensation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_compensation
    ADD CONSTRAINT employee_compensation_pkey PRIMARY KEY (id);


--
-- Name: employee_development_goals employee_development_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_pkey PRIMARY KEY (id);


--
-- Name: employee_pay_rates employee_pay_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pay_rates
    ADD CONSTRAINT employee_pay_rates_pkey PRIMARY KEY (id);


--
-- Name: employee_performance_reviews employee_performance_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_performance_reviews
    ADD CONSTRAINT employee_performance_reviews_pkey PRIMARY KEY (id);


--
-- Name: employee_pto_balances employee_pto_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_balances
    ADD CONSTRAINT employee_pto_balances_pkey PRIMARY KEY (id);


--
-- Name: employee_pto_policies employee_pto_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_policies
    ADD CONSTRAINT employee_pto_policies_pkey PRIMARY KEY (id);


--
-- Name: employee_recognition employee_recognition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_recognition
    ADD CONSTRAINT employee_recognition_pkey PRIMARY KEY (id);


--
-- Name: employee_skills employee_skills_company_id_employee_id_skill_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_company_id_employee_id_skill_name_key UNIQUE (company_id, employee_id, skill_name);


--
-- Name: employee_skills employee_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_pkey PRIMARY KEY (id);


--
-- Name: employee_time_off employee_time_off_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_pkey PRIMARY KEY (id);


--
-- Name: employee_time_summary employee_time_summary_company_id_employee_id_summary_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_summary
    ADD CONSTRAINT employee_time_summary_company_id_employee_id_summary_month_key UNIQUE (company_id, employee_id, summary_month);


--
-- Name: employee_time_summary employee_time_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_summary
    ADD CONSTRAINT employee_time_summary_pkey PRIMARY KEY (id);


--
-- Name: employee_timesheets employee_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: esignatures esignatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esignatures
    ADD CONSTRAINT esignatures_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_company_id_name_key UNIQUE (company_id, name);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expense_reimbursements expense_reimbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_reimbursements
    ADD CONSTRAINT expense_reimbursements_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: integration_settings integration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);


--
-- Name: integration_tokens integration_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_tokens
    ADD CONSTRAINT integration_tokens_pkey PRIMARY KEY (id);


--
-- Name: inventory_batches inventory_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_pkey PRIMARY KEY (id);


--
-- Name: inventory_cycle_count_items inventory_cycle_count_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_cycle_count_items
    ADD CONSTRAINT inventory_cycle_count_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_cycle_counts inventory_cycle_counts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_cycle_counts
    ADD CONSTRAINT inventory_cycle_counts_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


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
-- Name: inventory_scan_log inventory_scan_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_scan_log
    ADD CONSTRAINT inventory_scan_log_pkey PRIMARY KEY (id);


--
-- Name: inventory_serial_numbers inventory_serial_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_serial_numbers
    ADD CONSTRAINT inventory_serial_numbers_pkey PRIMARY KEY (id);


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
-- Name: invoice_commissions invoice_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_commissions
    ADD CONSTRAINT invoice_commissions_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_payments invoice_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: items_catalog items_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_catalog
    ADD CONSTRAINT items_catalog_pkey PRIMARY KEY (id);


--
-- Name: job_assignments job_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_assignments
    ADD CONSTRAINT job_assignments_pkey PRIMARY KEY (id);


--
-- Name: job_photos job_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_pkey PRIMARY KEY (id);


--
-- Name: job_triggers job_triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_triggers
    ADD CONSTRAINT job_triggers_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: marketplace_cancellations marketplace_cancellations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_cancellations
    ADD CONSTRAINT marketplace_cancellations_pkey PRIMARY KEY (id);


--
-- Name: marketplace_notifications marketplace_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_notifications
    ADD CONSTRAINT marketplace_notifications_pkey PRIMARY KEY (id);


--
-- Name: marketplace_request_decline_stats marketplace_request_decline_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_decline_stats
    ADD CONSTRAINT marketplace_request_decline_stats_pkey PRIMARY KEY (id);


--
-- Name: marketplace_request_decline_stats marketplace_request_decline_stats_request_id_reason_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_decline_stats
    ADD CONSTRAINT marketplace_request_decline_stats_request_id_reason_code_key UNIQUE (request_id, reason_code);


--
-- Name: marketplace_request_roles marketplace_request_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_roles
    ADD CONSTRAINT marketplace_request_roles_pkey PRIMARY KEY (id);


--
-- Name: marketplace_request_tags marketplace_request_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_tags
    ADD CONSTRAINT marketplace_request_tags_pkey PRIMARY KEY (request_id, tag_id);


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
-- Name: marketplace_reviews marketplace_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: notification_settings one_setting_per_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT one_setting_per_company UNIQUE (company_id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: po_approval_actions po_approval_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_actions
    ADD CONSTRAINT po_approval_actions_pkey PRIMARY KEY (id);


--
-- Name: po_approval_rules po_approval_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_rules
    ADD CONSTRAINT po_approval_rules_pkey PRIMARY KEY (id);


--
-- Name: po_approval_workflows po_approval_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_workflows
    ADD CONSTRAINT po_approval_workflows_pkey PRIMARY KEY (id);


--
-- Name: po_approval_workflows po_approval_workflows_purchase_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_workflows
    ADD CONSTRAINT po_approval_workflows_purchase_order_id_key UNIQUE (purchase_order_id);


--
-- Name: po_approvals po_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approvals
    ADD CONSTRAINT po_approvals_pkey PRIMARY KEY (id);


--
-- Name: po_items po_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_pkey PRIMARY KEY (id);


--
-- Name: po_status_history po_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_pkey PRIMARY KEY (id);


--
-- Name: preferred_relationships preferred_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_relationships
    ADD CONSTRAINT preferred_relationships_pkey PRIMARY KEY (id);


--
-- Name: preferred_relationships preferred_relationships_requester_customer_id_requester_com_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_relationships
    ADD CONSTRAINT preferred_relationships_requester_customer_id_requester_com_key UNIQUE (requester_customer_id, requester_company_id, preferred_company_id);


--
-- Name: pto_ledger pto_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pto_ledger
    ADD CONSTRAINT pto_ledger_pkey PRIMARY KEY (id);


--
-- Name: pto_policies pto_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pto_policies
    ADD CONSTRAINT pto_policies_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_company_id_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_po_number_key UNIQUE (company_id, po_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


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
-- Name: quote_follow_ups quote_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: quote_templates quote_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);


--
-- Name: quote_tool_access quote_tool_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_access
    ADD CONSTRAINT quote_tool_access_pkey PRIMARY KEY (id);


--
-- Name: quote_tool_tiers quote_tool_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_tiers
    ADD CONSTRAINT quote_tool_tiers_pkey PRIMARY KEY (id);


--
-- Name: quote_tool_usage quote_tool_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_usage
    ADD CONSTRAINT quote_tool_usage_pkey PRIMARY KEY (id);


--
-- Name: quote_tools quote_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tools
    ADD CONSTRAINT quote_tools_pkey PRIMARY KEY (id);


--
-- Name: rates_pricing_settings rates_pricing_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rates_pricing_settings
    ADD CONSTRAINT rates_pricing_settings_pkey PRIMARY KEY (id);


--
-- Name: recurring_jobs recurring_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_jobs
    ADD CONSTRAINT recurring_jobs_pkey PRIMARY KEY (id);


--
-- Name: reimbursement_requests reimbursement_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_pkey PRIMARY KEY (id);


--
-- Name: reimbursement_requests reimbursement_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_request_number_key UNIQUE (request_number);


--
-- Name: request_tags request_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_tags
    ADD CONSTRAINT request_tags_pkey PRIMARY KEY (request_id, tag_id);


--
-- Name: route_optimizations route_optimizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_optimizations
    ADD CONSTRAINT route_optimizations_pkey PRIMARY KEY (id);


--
-- Name: sales_activities sales_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_pkey PRIMARY KEY (id);


--
-- Name: sales_targets sales_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (id);


--
-- Name: schedule_events schedule_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_contracts service_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_contracts
    ADD CONSTRAINT service_contracts_pkey PRIMARY KEY (id);


--
-- Name: service_request_responses service_request_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_responses
    ADD CONSTRAINT service_request_responses_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: service_tags service_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tags
    ADD CONSTRAINT service_tags_name_key UNIQUE (name);


--
-- Name: service_tags service_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tags
    ADD CONSTRAINT service_tags_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shared_document_templates shared_document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_document_templates
    ADD CONSTRAINT shared_document_templates_pkey PRIMARY KEY (id);


--
-- Name: signature_requests signature_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signature_requests
    ADD CONSTRAINT signature_requests_pkey PRIMARY KEY (id);


--
-- Name: subcontractor_documents subcontractor_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_documents
    ADD CONSTRAINT subcontractor_documents_pkey PRIMARY KEY (id);


--
-- Name: subcontractor_timesheets subcontractor_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_timesheets
    ADD CONSTRAINT subcontractor_timesheets_pkey PRIMARY KEY (id);


--
-- Name: subcontractor_work_orders subcontractor_work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_work_orders
    ADD CONSTRAINT subcontractor_work_orders_pkey PRIMARY KEY (id);


--
-- Name: subcontractors subcontractors_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_email_key UNIQUE (email);


--
-- Name: subcontractors subcontractors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: technician_locations technician_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technician_locations
    ADD CONSTRAINT technician_locations_pkey PRIMARY KEY (id);


--
-- Name: tool_preferences tool_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_preferences
    ADD CONSTRAINT tool_preferences_pkey PRIMARY KEY (id);


--
-- Name: tool_preferences tool_preferences_user_id_tool_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_preferences
    ADD CONSTRAINT tool_preferences_user_id_tool_key_key UNIQUE (user_id, tool_key);


--
-- Name: tool_usage tool_usage_company_id_user_id_tool_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage
    ADD CONSTRAINT tool_usage_company_id_user_id_tool_name_key UNIQUE (company_id, user_id, tool_name);


--
-- Name: tool_usage tool_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage
    ADD CONSTRAINT tool_usage_pkey PRIMARY KEY (id);


--
-- Name: ui_preferences ui_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ui_preferences
    ADD CONSTRAINT ui_preferences_pkey PRIMARY KEY (id);


--
-- Name: inventory_stock unique_item_location_company; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT unique_item_location_company UNIQUE (item_id, location_id, company_id);


--
-- Name: marketplace_responses unique_request_response; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT unique_request_response UNIQUE (request_id, company_id);


--
-- Name: work_order_labor unique_work_order_employee_date; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT unique_work_order_employee_date UNIQUE (work_order_id, employee_id, work_date);


--
-- Name: user_dashboard_settings user_dashboard_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendor_categories vendor_categories_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_categories
    ADD CONSTRAINT vendor_categories_company_id_name_key UNIQUE (company_id, name);


--
-- Name: vendor_categories vendor_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_categories
    ADD CONSTRAINT vendor_categories_pkey PRIMARY KEY (id);


--
-- Name: vendor_category_assignments vendor_category_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_category_assignments
    ADD CONSTRAINT vendor_category_assignments_pkey PRIMARY KEY (id);


--
-- Name: vendor_category_assignments vendor_category_assignments_vendor_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_category_assignments
    ADD CONSTRAINT vendor_category_assignments_vendor_id_category_id_key UNIQUE (vendor_id, category_id);


--
-- Name: vendor_contacts vendor_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_contacts
    ADD CONSTRAINT vendor_contacts_pkey PRIMARY KEY (id);


--
-- Name: vendor_items vendor_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_items
    ADD CONSTRAINT vendor_items_pkey PRIMARY KEY (id);


--
-- Name: vendor_items vendor_items_vendor_id_supplier_part_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_items
    ADD CONSTRAINT vendor_items_vendor_id_supplier_part_number_key UNIQUE (vendor_id, supplier_part_number);


--
-- Name: vendor_pricing_history vendor_pricing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricing_history
    ADD CONSTRAINT vendor_pricing_history_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: vendors_status_history vendors_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors_status_history
    ADD CONSTRAINT vendors_status_history_pkey PRIMARY KEY (id);


--
-- Name: wo_audit wo_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wo_audit
    ADD CONSTRAINT wo_audit_pkey PRIMARY KEY (id);


--
-- Name: work_order_assignments work_order_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_assignments
    ADD CONSTRAINT work_order_assignments_pkey PRIMARY KEY (id);


--
-- Name: work_order_audit_log work_order_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_pkey PRIMARY KEY (id);


--
-- Name: work_order_audit work_order_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit
    ADD CONSTRAINT work_order_audit_pkey PRIMARY KEY (id);


--
-- Name: work_order_items work_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_pkey PRIMARY KEY (id);


--
-- Name: work_order_labor work_order_labor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_pkey PRIMARY KEY (id);


--
-- Name: work_order_milestones work_order_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_milestones
    ADD CONSTRAINT work_order_milestones_pkey PRIMARY KEY (id);


--
-- Name: work_order_versions work_order_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_invoice_number_key UNIQUE (invoice_number);


--
-- Name: work_orders work_orders_job_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_job_number_key UNIQUE (job_number);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_quote_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_quote_number_key UNIQUE (quote_number);


--
-- Name: workflow_approvals workflow_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_pkey PRIMARY KEY (id);


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
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


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
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


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
-- Name: auto_accept_rules_requester_company_id_trade_tag_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auto_accept_rules_requester_company_id_trade_tag_idx ON public.auto_accept_rules USING btree (requester_company_id, trade_tag);


--
-- Name: customers_status_history_changed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_status_history_changed_at_idx ON public.customers_status_history USING btree (changed_at);


--
-- Name: customers_status_history_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_status_history_customer_idx ON public.customers_status_history USING btree (customer_id);


--
-- Name: idx_attachments_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_company ON public.attachments USING btree (company_id);


--
-- Name: idx_attachments_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_job_id ON public.attachments USING btree (job_id);


--
-- Name: idx_business_settings_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_settings_company_id ON public.business_settings USING btree (company_id);


--
-- Name: idx_business_settings_company_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_business_settings_company_po ON public.business_settings USING btree (company_id) WHERE (po_number_prefix IS NOT NULL);


--
-- Name: idx_companies_industry_tags_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_industry_tags_gin ON public.companies USING gin (industry_tags);


--
-- Name: idx_companies_licenses_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_companies_licenses_gin ON public.companies USING gin (licenses);


--
-- Name: idx_company_settings_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_settings_company_id ON public.company_settings USING btree (company_id);


--
-- Name: idx_company_tags_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_tags_company_id ON public.company_tags USING btree (company_id);


--
-- Name: idx_customer_addresses_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_company_id ON public.customer_addresses USING btree (company_id);


--
-- Name: idx_customer_addresses_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);


--
-- Name: idx_customer_communications_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_communications_customer_id ON public.customer_communications USING btree (customer_id);


--
-- Name: idx_customer_messages_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_messages_company_id ON public.customer_messages USING btree (company_id);


--
-- Name: idx_customer_messages_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_messages_customer_id ON public.customer_messages USING btree (customer_id);


--
-- Name: idx_customer_messages_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_messages_sent_at ON public.customer_messages USING btree (sent_at);


--
-- Name: idx_customer_portal_accounts_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_portal_accounts_active ON public.customer_portal_accounts USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_customer_portal_accounts_auth_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_portal_accounts_auth_user ON public.customer_portal_accounts USING btree (auth_user_id);


--
-- Name: idx_customer_portal_accounts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_portal_accounts_email ON public.customer_portal_accounts USING btree (email);


--
-- Name: idx_customer_reviews_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_reviews_job_id ON public.customer_reviews USING btree (job_id);


--
-- Name: idx_customers_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_company_id ON public.customers USING btree (company_id);


--
-- Name: idx_customers_created_via; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_created_via ON public.customers USING btree (created_via);


--
-- Name: idx_customers_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_id ON public.customers USING btree (id);


--
-- Name: idx_document_access_log_document; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_access_log_document ON public.document_access_log USING btree (document_id, created_at);


--
-- Name: idx_document_versions_document; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_versions_document ON public.document_versions USING btree (document_id, version);


--
-- Name: idx_document_workflows_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_workflows_status ON public.document_workflows USING btree (company_id, status, due_date);


--
-- Name: idx_documents_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_company_id ON public.documents USING btree (company_id);


--
-- Name: idx_documents_company_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_company_type ON public.documents USING btree (company_id, type);


--
-- Name: idx_documents_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_current ON public.documents USING btree (company_id, is_current_version) WHERE (is_current_version = true);


--
-- Name: idx_documents_linked_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_linked_to ON public.documents USING btree (linked_to);


--
-- Name: idx_documents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_type ON public.documents USING btree (type);


--
-- Name: idx_documents_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_version ON public.documents USING btree (parent_document_id, version) WHERE (parent_document_id IS NOT NULL);


--
-- Name: idx_employee_certifications_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_certifications_company_id ON public.employee_certifications USING btree (company_id);


--
-- Name: idx_employee_certifications_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_certifications_employee_id ON public.employee_certifications USING btree (employee_id);


--
-- Name: idx_employee_certifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_certifications_status ON public.employee_certifications USING btree (status);


--
-- Name: idx_employee_compensation_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_compensation_user_id ON public.employee_compensation USING btree (user_id);


--
-- Name: idx_employee_development_goals_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_development_goals_employee_id ON public.employee_development_goals USING btree (employee_id);


--
-- Name: idx_employee_performance_reviews_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_performance_reviews_employee_id ON public.employee_performance_reviews USING btree (employee_id);


--
-- Name: idx_employee_policies_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_policies_current ON public.employee_pto_policies USING btree (employee_id, effective_date) WHERE (end_date IS NULL);


--
-- Name: idx_employee_recognition_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_recognition_employee_id ON public.employee_recognition USING btree (employee_id);


--
-- Name: idx_employee_skills_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_skills_company_id ON public.employee_skills USING btree (company_id);


--
-- Name: idx_employee_skills_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_skills_employee_id ON public.employee_skills USING btree (employee_id);


--
-- Name: idx_employee_time_summary_employee_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_time_summary_employee_month ON public.employee_time_summary USING btree (employee_id, summary_month);


--
-- Name: idx_employee_timesheets_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_approved_by ON public.employee_timesheets USING btree (approved_by);


--
-- Name: idx_employee_timesheets_denied_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_denied_by ON public.employee_timesheets USING btree (denied_by);


--
-- Name: idx_employee_timesheets_employee_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_employee_date ON public.employee_timesheets USING btree (employee_id, work_date);


--
-- Name: idx_employee_timesheets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_status ON public.employee_timesheets USING btree (status);


--
-- Name: idx_employee_timesheets_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_user_date ON public.employee_timesheets USING btree (user_id, work_date);


--
-- Name: idx_employee_timesheets_work_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_timesheets_work_date ON public.employee_timesheets USING btree (work_date);


--
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- Name: idx_expenses_company_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_company_date ON public.expenses USING btree (company_id, date);


--
-- Name: idx_expenses_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_company_id ON public.expenses USING btree (company_id);


--
-- Name: idx_expenses_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);


--
-- Name: idx_expenses_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_user_date ON public.expenses USING btree (user_id, date);


--
-- Name: idx_expenses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);


--
-- Name: idx_inventory_batches_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_batches_item ON public.inventory_batches USING btree (inventory_item_id);


--
-- Name: idx_inventory_items_abc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_abc ON public.inventory_items USING btree (abc_classification);


--
-- Name: idx_inventory_items_barcode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_barcode ON public.inventory_items USING btree (barcode);


--
-- Name: idx_inventory_items_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_company_id ON public.inventory_items USING btree (company_id);


--
-- Name: idx_inventory_items_qr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_qr ON public.inventory_items USING btree (qr_code);


--
-- Name: idx_inventory_items_upc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_items_upc ON public.inventory_items USING btree (upc_code);


--
-- Name: idx_inventory_locations_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_locations_company_id ON public.inventory_locations USING btree (company_id);


--
-- Name: idx_inventory_movements_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_movements_company_id ON public.inventory_movements USING btree (company_id);


--
-- Name: idx_inventory_scan_log_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_scan_log_item ON public.inventory_scan_log USING btree (inventory_item_id);


--
-- Name: idx_inventory_serial_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_inventory_serial_unique ON public.inventory_serial_numbers USING btree (inventory_item_id, serial_number);


--
-- Name: idx_inventory_stock_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_stock_company_id ON public.inventory_stock USING btree (company_id);


--
-- Name: idx_invoice_commissions_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_commissions_company_id ON public.invoice_commissions USING btree (company_id);


--
-- Name: idx_invoice_commissions_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_commissions_invoice_id ON public.invoice_commissions USING btree (invoice_id);


--
-- Name: idx_invoice_commissions_sales_rep_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_commissions_sales_rep_id ON public.invoice_commissions USING btree (sales_rep_id);


--
-- Name: idx_invoice_items_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);


--
-- Name: idx_invoice_items_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_sort_order ON public.invoice_items USING btree (sort_order);


--
-- Name: idx_invoice_payments_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments USING btree (invoice_id);


--
-- Name: idx_invoices_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_company ON public.invoices USING btree (company_id);


--
-- Name: idx_invoices_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_customer_id ON public.invoices USING btree (customer_id);


--
-- Name: idx_invoices_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_id ON public.invoices USING btree (id);


--
-- Name: idx_job_assignments_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_assignments_employee_id ON public.job_assignments USING btree (employee_id);


--
-- Name: idx_job_assignments_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_assignments_work_order_id ON public.job_assignments USING btree (work_order_id);


--
-- Name: idx_job_photos_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_photos_company ON public.job_photos USING btree (company_id);


--
-- Name: idx_job_photos_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_photos_job_id ON public.job_photos USING btree (job_id);


--
-- Name: idx_job_photos_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_photos_work_order_id ON public.job_photos USING btree (work_order_id);


--
-- Name: idx_job_triggers_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_job_triggers_company_id ON public.job_triggers USING btree (company_id);


--
-- Name: idx_leads_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_source ON public.leads USING btree (source);


--
-- Name: idx_leads_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_stage ON public.leads USING btree (stage);


--
-- Name: idx_leads_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_status ON public.leads USING btree (status);


--
-- Name: idx_marketplace_requests_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_requests_created_at ON public.marketplace_requests USING btree (created_at DESC);


--
-- Name: idx_marketplace_responses_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_marketplace_responses_request_id ON public.marketplace_responses USING btree (request_id);


--
-- Name: idx_messages_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_company ON public.messages USING btree (company_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_job_id ON public.messages USING btree (work_order_id);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id, company_id);


--
-- Name: idx_messages_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_work_order ON public.messages USING btree (work_order_id, message_type);


--
-- Name: idx_notifications_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_company_id ON public.notifications USING btree (company_id);


--
-- Name: idx_notifications_company_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_company_user_read ON public.notifications USING btree (company_id, user_id, is_read, created_at DESC);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_opportunities_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opportunities_stage ON public.opportunities USING btree (stage);


--
-- Name: idx_opportunities_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_opportunities_status ON public.opportunities USING btree (status);


--
-- Name: idx_payments_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_company ON public.payments USING btree (company_id);


--
-- Name: idx_payments_company_paidat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_company_paidat ON public.payments USING btree (company_id, paid_at DESC);


--
-- Name: idx_payments_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_invoice_id ON public.payments USING btree (invoice_id);


--
-- Name: idx_payrates_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payrates_company ON public.employee_pay_rates USING btree (company_id);


--
-- Name: idx_po_approval_actions_workflow; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_approval_actions_workflow ON public.po_approval_actions USING btree (workflow_id);


--
-- Name: idx_po_approval_workflows_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_approval_workflows_company ON public.po_approval_workflows USING btree (company_id, status);


--
-- Name: idx_po_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_company ON public.purchase_orders USING btree (company_id);


--
-- Name: idx_po_company_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_company_status_created ON public.purchase_orders USING btree (company_id, status, created_at DESC);


--
-- Name: idx_po_company_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_company_vendor ON public.purchase_orders USING btree (company_id, vendor_id);


--
-- Name: idx_po_items_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_items_po ON public.po_items USING btree (company_id, purchase_order_id);


--
-- Name: idx_po_items_supplier_part; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_items_supplier_part ON public.po_items USING btree (supplier_part_number) WHERE (supplier_part_number IS NOT NULL);


--
-- Name: idx_po_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_number ON public.purchase_orders USING btree (company_id, po_number);


--
-- Name: idx_po_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_status ON public.purchase_orders USING btree (company_id, status);


--
-- Name: idx_po_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_vendor ON public.purchase_orders USING btree (company_id, vendor_id);


--
-- Name: idx_pto_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pto_company ON public.employee_time_off USING btree (company_id);


--
-- Name: idx_pto_emp_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pto_emp_time ON public.employee_time_off USING btree (employee_id, starts_at, ends_at);


--
-- Name: idx_pto_ledger_company_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pto_ledger_company_category ON public.pto_ledger USING btree (company_id, category_code);


--
-- Name: idx_pto_ledger_employee_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pto_ledger_employee_date ON public.pto_ledger USING btree (employee_id, effective_date);


--
-- Name: idx_pto_policies_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pto_policies_company ON public.pto_policies USING btree (company_id);


--
-- Name: idx_purchase_orders_approval_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_approval_status ON public.purchase_orders USING btree (company_id, approval_status);


--
-- Name: idx_purchase_orders_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_work_order ON public.purchase_orders USING btree (related_work_order_id) WHERE (related_work_order_id IS NOT NULL);


--
-- Name: idx_rates_pricing_settings_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rates_pricing_settings_company_id ON public.rates_pricing_settings USING btree (company_id);


--
-- Name: idx_recurring_jobs_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_jobs_active ON public.recurring_jobs USING btree (is_active, next_occurrence) WHERE (is_active = true);


--
-- Name: idx_recurring_jobs_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recurring_jobs_company ON public.recurring_jobs USING btree (company_id, is_active);


--
-- Name: idx_request_tags_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_request_tags_request_id ON public.request_tags USING btree (request_id);


--
-- Name: idx_requests_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_requests_customer_id ON public.marketplace_requests USING btree (customer_id);


--
-- Name: idx_reviews_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_company ON public.customer_reviews USING btree (company_id);


--
-- Name: idx_route_optimizations_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_optimizations_date ON public.route_optimizations USING btree (company_id, optimization_date, technician_id);


--
-- Name: idx_sales_activities_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_activities_company ON public.sales_activities USING btree (company_id);


--
-- Name: idx_sales_targets_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_targets_company ON public.sales_targets USING btree (company_id);


--
-- Name: idx_schedule_events_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_schedule_events_company ON public.schedule_events USING btree (company_id);


--
-- Name: idx_service_contracts_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_contracts_company ON public.service_contracts USING btree (company_id);


--
-- Name: idx_service_contracts_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_contracts_customer_id ON public.service_contracts USING btree (customer_id);


--
-- Name: idx_service_requests_claimed_by_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_requests_claimed_by_company ON public.service_requests USING btree (claimed_by_company_id);


--
-- Name: idx_service_requests_zip_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_requests_zip_code ON public.service_requests USING btree (service_zip_code);


--
-- Name: idx_service_tags_lower_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_service_tags_lower_name ON public.service_tags USING btree (lower(name));


--
-- Name: idx_settings_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_company ON public.settings USING btree (company_id);


--
-- Name: idx_settings_company_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_settings_company_po ON public.settings USING btree (company_id) WHERE (po_number_prefix IS NOT NULL);


--
-- Name: idx_signature_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signature_requests_status ON public.signature_requests USING btree (company_id, status, created_at);


--
-- Name: idx_tags_name_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_tags_name_lower ON public.tags USING btree (lower(name));


--
-- Name: idx_techloc_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_techloc_company ON public.technician_locations USING btree (company_id);


--
-- Name: idx_timeoff_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeoff_company ON public.employee_time_off USING btree (company_id);


--
-- Name: idx_timesheets_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timesheets_company ON public.employee_timesheets USING btree (company_id);


--
-- Name: idx_timesheets_company_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timesheets_company_status_date ON public.employee_timesheets USING btree (company_id, status, work_date);


--
-- Name: idx_user_permissions_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_permissions_company ON public.user_permissions USING btree (company_id);


--
-- Name: idx_users_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_company ON public.users USING btree (company_id);


--
-- Name: idx_users_company_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_company_status ON public.users USING btree (company_id, status);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department ON public.users USING btree (department);


--
-- Name: idx_users_hire_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_hire_date ON public.users USING btree (hire_date);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_vendor_items_company_vendor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_items_company_vendor ON public.vendor_items USING btree (company_id, vendor_id);


--
-- Name: idx_vendor_items_inventory; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_items_inventory ON public.vendor_items USING btree (inventory_item_id) WHERE (inventory_item_id IS NOT NULL);


--
-- Name: idx_vendor_items_supplier_part; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_items_supplier_part ON public.vendor_items USING btree (supplier_part_number);


--
-- Name: idx_vendor_pricing_history_vendor_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_pricing_history_vendor_item ON public.vendor_pricing_history USING btree (vendor_id, inventory_item_id);


--
-- Name: idx_wol_company_workorder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wol_company_workorder ON public.work_order_labor USING btree (company_id, work_order_id);


--
-- Name: idx_wol_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wol_date ON public.work_order_labor USING btree (work_date);


--
-- Name: idx_wol_employee_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wol_employee_date ON public.work_order_labor USING btree (employee_id, work_date);


--
-- Name: idx_wol_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wol_work_order ON public.work_order_labor USING btree (work_order_id);


--
-- Name: idx_work_order_assignments_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_assignments_company ON public.work_order_assignments USING btree (company_id);


--
-- Name: idx_work_order_audit_log_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_audit_log_company_id ON public.work_order_audit_log USING btree (company_id);


--
-- Name: idx_work_order_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_audit_log_created_at ON public.work_order_audit_log USING btree (created_at);


--
-- Name: idx_work_order_audit_log_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_audit_log_work_order_id ON public.work_order_audit_log USING btree (work_order_id);


--
-- Name: idx_work_order_audit_wo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_audit_wo ON public.work_order_audit USING btree (work_order_id, at DESC);


--
-- Name: idx_work_order_items_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_items_company_id ON public.work_order_items USING btree (company_id);


--
-- Name: idx_work_order_items_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_items_work_order_id ON public.work_order_items USING btree (work_order_id);


--
-- Name: idx_work_order_labor_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_labor_company ON public.work_order_labor USING btree (company_id);


--
-- Name: idx_work_order_labor_company_work_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_labor_company_work_order ON public.work_order_labor USING btree (company_id, work_order_id);


--
-- Name: idx_work_order_versions_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_versions_company_id ON public.work_order_versions USING btree (company_id);


--
-- Name: idx_work_order_versions_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_versions_version ON public.work_order_versions USING btree (work_order_id, version);


--
-- Name: idx_work_order_versions_work_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_order_versions_work_order_id ON public.work_order_versions USING btree (work_order_id);


--
-- Name: idx_work_orders_assigned_technician; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_assigned_technician ON public.work_orders USING btree (assigned_technician_id);


--
-- Name: idx_work_orders_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_company_id ON public.work_orders USING btree (company_id);


--
-- Name: idx_work_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_created_at ON public.work_orders USING btree (created_at);


--
-- Name: idx_work_orders_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_customer_id ON public.work_orders USING btree (customer_id);


--
-- Name: idx_work_orders_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_invoice_id ON public.work_orders USING btree (invoice_id);


--
-- Name: idx_work_orders_recurring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_recurring ON public.work_orders USING btree (is_recurring, recurring_parent_id) WHERE (is_recurring = true);


--
-- Name: idx_work_orders_reminders; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_reminders ON public.work_orders USING btree (reminder_sent_at, start_time) WHERE (reminder_sent_at IS NOT NULL);


--
-- Name: idx_work_orders_service_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_service_address_id ON public.work_orders USING btree (service_address_id);


--
-- Name: idx_work_orders_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_start_time ON public.work_orders USING btree (start_time);


--
-- Name: idx_work_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);


--
-- Name: idx_workflow_approvals_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workflow_approvals_pending ON public.workflow_approvals USING btree (workflow_id, status) WHERE (status = 'pending'::text);


--
-- Name: items_catalog_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX items_catalog_company_idx ON public.items_catalog USING btree (company_id);


--
-- Name: marketplace_requests_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX marketplace_requests_status_idx ON public.marketplace_requests USING btree (status);


--
-- Name: marketplace_responses_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX marketplace_responses_company_id_idx ON public.marketplace_responses USING btree (company_id);


--
-- Name: marketplace_responses_request_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX marketplace_responses_request_id_idx ON public.marketplace_responses USING btree (request_id);


--
-- Name: po_approval_rules_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX po_approval_rules_company_idx ON public.po_approval_rules USING btree (company_id);


--
-- Name: po_approvals_approver_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX po_approvals_approver_idx ON public.po_approvals USING btree (approver_user_id);


--
-- Name: po_approvals_po_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX po_approvals_po_idx ON public.po_approvals USING btree (purchase_order_id);


--
-- Name: quote_analytics_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_analytics_company_idx ON public.quote_analytics USING btree (company_id);


--
-- Name: quote_analytics_conversion_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_analytics_conversion_stage_idx ON public.quote_analytics USING btree (conversion_stage);


--
-- Name: quote_analytics_sent_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_analytics_sent_date_idx ON public.quote_analytics USING btree (quote_sent_date);


--
-- Name: quote_analytics_work_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_analytics_work_order_idx ON public.quote_analytics USING btree (work_order_id);


--
-- Name: quote_approval_workflows_approver_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_approval_workflows_approver_idx ON public.quote_approval_workflows USING btree (approver_user_id);


--
-- Name: quote_approval_workflows_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_approval_workflows_company_idx ON public.quote_approval_workflows USING btree (company_id);


--
-- Name: quote_approval_workflows_sequence_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_approval_workflows_sequence_idx ON public.quote_approval_workflows USING btree (work_order_id, sequence_order);


--
-- Name: quote_approval_workflows_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_approval_workflows_status_idx ON public.quote_approval_workflows USING btree (status);


--
-- Name: quote_approval_workflows_work_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_approval_workflows_work_order_idx ON public.quote_approval_workflows USING btree (work_order_id);


--
-- Name: quote_follow_ups_assigned_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_follow_ups_assigned_user_idx ON public.quote_follow_ups USING btree (assigned_user_id);


--
-- Name: quote_follow_ups_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_follow_ups_company_idx ON public.quote_follow_ups USING btree (company_id);


--
-- Name: quote_follow_ups_scheduled_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_follow_ups_scheduled_date_idx ON public.quote_follow_ups USING btree (scheduled_date);


--
-- Name: quote_follow_ups_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_follow_ups_status_idx ON public.quote_follow_ups USING btree (status);


--
-- Name: quote_follow_ups_work_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_follow_ups_work_order_idx ON public.quote_follow_ups USING btree (work_order_id);


--
-- Name: quote_templates_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quote_templates_company_idx ON public.quote_templates USING btree (company_id);


--
-- Name: tags_name_lower_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tags_name_lower_unique ON public.tags USING btree (lower(name));


--
-- Name: tags_name_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tags_name_trgm_idx ON public.tags USING gin (name public.gin_trgm_ops);


--
-- Name: uq_invoices_company_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_invoices_company_invoice_number ON public.invoices USING btree (company_id, invoice_number);


--
-- Name: ux_pto_emp_range; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_pto_emp_range ON public.employee_time_off USING btree (employee_id, starts_at, ends_at);


--
-- Name: ux_wo_assign; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_wo_assign ON public.work_order_assignments USING btree (work_order_id, employee_id);


--
-- Name: vendor_contacts_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_contacts_company_idx ON public.vendor_contacts USING btree (company_id);


--
-- Name: vendor_contacts_vendor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_contacts_vendor_idx ON public.vendor_contacts USING btree (vendor_id);


--
-- Name: vendors_company_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_company_id_idx ON public.vendors USING btree (company_id);


--
-- Name: vendors_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_email_idx ON public.vendors USING btree (company_id, email);


--
-- Name: vendors_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_name_idx ON public.vendors USING btree (company_id, name);


--
-- Name: vendors_status_history_changed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_status_history_changed_at_idx ON public.vendors_status_history USING btree (changed_at);


--
-- Name: vendors_status_history_vendor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_status_history_vendor_idx ON public.vendors_status_history USING btree (vendor_id);


--
-- Name: vendors_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_status_idx ON public.vendors USING btree (company_id, status);


--
-- Name: vendors_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_type_idx ON public.vendors USING btree (company_id, vendor_type);


--
-- Name: wom_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wom_company_idx ON public.work_order_milestones USING btree (company_id);


--
-- Name: wom_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wom_sort_idx ON public.work_order_milestones USING btree (work_order_id, sort_order);


--
-- Name: wom_work_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wom_work_order_idx ON public.work_order_milestones USING btree (work_order_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


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
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: invoice_items invoice_items_recalc_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoice_items_recalc_trigger BEFORE INSERT OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.invoice_items_recalc();


--
-- Name: invoices invoices_auto_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_auto_status_trigger AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.invoices_auto_status();


--
-- Name: invoices invoices_paid_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_paid_trigger AFTER UPDATE OF status ON public.invoices FOR EACH ROW WHEN (((new.status = 'PAID'::text) AND (old.status IS DISTINCT FROM new.status))) EXECUTE FUNCTION public.update_calendar_on_invoice();

ALTER TABLE public.invoices DISABLE TRIGGER invoices_paid_trigger;


--
-- Name: invoice_items invoices_update_total_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_update_total_trigger AFTER INSERT OR DELETE OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.invoices_update_total();


--
-- Name: invoices invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.invoices_updated_at_fn();


--
-- Name: messages messages_context_check; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER messages_context_check BEFORE INSERT OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.enforce_message_context();


--
-- Name: schedule_events schedule_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER schedule_events_updated_at BEFORE UPDATE ON public.schedule_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: attachments trg_attachments_company; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attachments_company BEFORE INSERT OR UPDATE ON public.attachments FOR EACH ROW EXECUTE FUNCTION public.enforce_attachments_company_match();


--
-- Name: employee_time_off trg_deduct_pto; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_deduct_pto AFTER UPDATE ON public.employee_time_off FOR EACH ROW EXECUTE FUNCTION public.deduct_pto_on_approval();


--
-- Name: marketplace_responses trg_enforce_response_cap; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enforce_response_cap BEFORE INSERT ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION public.enforce_response_cap();


--
-- Name: invoice_payments trg_invoice_payments_status_bump; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_invoice_payments_status_bump AFTER INSERT OR DELETE OR UPDATE ON public.invoice_payments FOR EACH ROW EXECUTE FUNCTION public.invoices_auto_status();


--
-- Name: customers trg_log_customer_status_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_customer_status_change BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.log_customer_status_change();


--
-- Name: work_orders trg_log_work_order_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_work_order_change AFTER INSERT OR UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.log_work_order_change();


--
-- Name: marketplace_cancellations trg_marketplace_request_cancel; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_marketplace_request_cancel AFTER INSERT ON public.marketplace_cancellations FOR EACH ROW EXECUTE FUNCTION public.trg_cancel_request();


--
-- Name: marketplace_responses trg_marketplace_response_decline; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_marketplace_response_decline AFTER INSERT OR UPDATE ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION public.trg_log_decline_reason();


--
-- Name: marketplace_reviews trg_marketplace_review_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_marketplace_review_delete AFTER DELETE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.trg_review_delete();


--
-- Name: marketplace_reviews trg_marketplace_review_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_marketplace_review_insert AFTER INSERT ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.trg_review_insert();


--
-- Name: marketplace_reviews trg_marketplace_review_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_marketplace_review_update AFTER UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.trg_review_update();


--
-- Name: tags trg_normalize_tag; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_normalize_tag BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.normalize_tag();


--
-- Name: tags trg_normalize_tag_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_normalize_tag_name BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.normalize_tag_name();


--
-- Name: marketplace_requests trg_notify_new_request; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notify_new_request AFTER INSERT ON public.marketplace_requests FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_request();


--
-- Name: marketplace_responses trg_notify_new_response; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notify_new_response AFTER INSERT ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_response();


--
-- Name: marketplace_responses trg_notify_response_accept; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notify_response_accept AFTER UPDATE ON public.marketplace_responses FOR EACH ROW WHEN (((new.response_status = 'ACCEPTED'::public.marketplace_response_status_enum) AND (old.response_status IS DISTINCT FROM 'ACCEPTED'::public.marketplace_response_status_enum))) EXECUTE FUNCTION public.notify_on_response_accept();


--
-- Name: work_order_labor trg_recalc_labor; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_recalc_labor AFTER INSERT OR DELETE OR UPDATE ON public.work_order_labor FOR EACH ROW EXECUTE FUNCTION public.recalc_labor_trigger();


--
-- Name: users trg_set_joined_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_joined_at BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_joined_at();


--
-- Name: reimbursement_requests trg_set_reimbursement_request_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_reimbursement_request_number BEFORE INSERT ON public.reimbursement_requests FOR EACH ROW EXECUTE FUNCTION public.set_reimbursement_request_number();


--
-- Name: company_customers trg_update_company_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_company_customers_updated_at BEFORE UPDATE ON public.company_customers FOR EACH ROW EXECUTE FUNCTION public.update_company_customers_updated_at();


--
-- Name: contractor_ratings trg_update_company_rating; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_company_rating AFTER INSERT ON public.contractor_ratings FOR EACH ROW EXECUTE FUNCTION public.update_company_rating();


--
-- Name: service_request_responses trg_update_service_request_responses_created_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_service_request_responses_created_at BEFORE INSERT ON public.service_request_responses FOR EACH ROW EXECUTE FUNCTION public.set_service_request_responses_created_at();


--
-- Name: service_requests trg_update_service_requests_requested_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_service_requests_requested_at BEFORE INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_service_requests_requested_at();


--
-- Name: purchase_orders trigger_auto_generate_po_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_auto_generate_po_number BEFORE INSERT ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.auto_generate_po_number();


--
-- Name: purchase_orders trigger_po_status_update_costs; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_po_status_update_costs AFTER UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.trigger_update_vendor_costs();


--
-- Name: workflow_approvals trigger_process_workflow_approval; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_process_workflow_approval AFTER INSERT OR UPDATE ON public.workflow_approvals FOR EACH ROW EXECUTE FUNCTION public.process_workflow_approval();


--
-- Name: inventory_movements trigger_update_inventory_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_inventory_stock AFTER INSERT OR DELETE ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.update_inventory_stock();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: purchase_orders update_vendor_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendor_stats_trigger AFTER INSERT OR DELETE OR UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_vendor_stats();


--
-- Name: work_order_items update_work_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_order_items_updated_at BEFORE UPDATE ON public.work_order_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: work_orders update_work_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendors vendors_status_change_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER vendors_status_change_trigger BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.log_vendor_status_change();


--
-- Name: work_order_labor wol_aiu_recalc; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER wol_aiu_recalc AFTER INSERT OR DELETE OR UPDATE ON public.work_order_labor FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_labor();


--
-- Name: work_order_items work_order_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER work_order_items_updated_at BEFORE UPDATE ON public.work_order_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: work_orders work_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


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
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: auto_accept_rules auto_accept_rules_requester_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_accept_rules
    ADD CONSTRAINT auto_accept_rules_requester_company_id_fkey FOREIGN KEY (requester_company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: business_settings business_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_approval_settings company_approval_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_approval_settings
    ADD CONSTRAINT company_approval_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_customers company_customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_customers
    ADD CONSTRAINT company_customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_customers company_customers_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_customers
    ADD CONSTRAINT company_customers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: company_document_templates company_document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_document_templates
    ADD CONSTRAINT company_document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_service_tags company_service_tags_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_service_tags
    ADD CONSTRAINT company_service_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_service_tags company_service_tags_service_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_service_tags
    ADD CONSTRAINT company_service_tags_service_tag_id_fkey FOREIGN KEY (service_tag_id) REFERENCES public.service_tags(id) ON DELETE CASCADE;


--
-- Name: company_settings company_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_tags company_tags_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_tags
    ADD CONSTRAINT company_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_tags company_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_tags
    ADD CONSTRAINT company_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.service_tags(id) ON DELETE CASCADE;


--
-- Name: contractor_ratings contractor_ratings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_ratings
    ADD CONSTRAINT contractor_ratings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: contractor_ratings contractor_ratings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_ratings
    ADD CONSTRAINT contractor_ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: contractor_ratings contractor_ratings_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contractor_ratings
    ADD CONSTRAINT contractor_ratings_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: coupons coupons_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_messages customer_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_messages
    ADD CONSTRAINT customer_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: customer_portal_accounts customer_portal_accounts_auth_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_auth_user_fk FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: customer_portal_accounts customer_portal_accounts_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: customer_portal_accounts customer_portal_accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_portal_accounts customer_portal_accounts_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT customer_portal_accounts_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.companies(id);


--
-- Name: customer_reviews customer_reviews_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_reviews
    ADD CONSTRAINT customer_reviews_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- Name: customer_reviews customer_reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_reviews
    ADD CONSTRAINT customer_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_signatures customer_signatures_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_signatures
    ADD CONSTRAINT customer_signatures_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_signatures customer_signatures_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_signatures
    ADD CONSTRAINT customer_signatures_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: customers customers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customers customers_portal_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_portal_account_fk FOREIGN KEY (portal_account_id) REFERENCES public.customer_portal_accounts(id) ON DELETE SET NULL;


--
-- Name: customers customers_portal_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_portal_account_id_fkey FOREIGN KEY (portal_account_id) REFERENCES public.customer_portal_accounts(id);


--
-- Name: customers customers_preferred_tech_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_preferred_tech_id_fkey FOREIGN KEY (preferred_technician) REFERENCES public.users(id);


--
-- Name: customers_status_history customers_status_history_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_status_history
    ADD CONSTRAINT customers_status_history_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: document_access_log document_access_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_access_log
    ADD CONSTRAINT document_access_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: document_access_log document_access_log_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_access_log
    ADD CONSTRAINT document_access_log_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_access_log document_access_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_access_log
    ADD CONSTRAINT document_access_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: document_templates document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: document_versions document_versions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: document_versions document_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: document_versions document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_versions document_versions_previous_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_previous_version_id_fkey FOREIGN KEY (previous_version_id) REFERENCES public.document_versions(id);


--
-- Name: document_workflows document_workflows_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT document_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: document_workflows document_workflows_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT document_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: document_workflows document_workflows_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_workflows
    ADD CONSTRAINT document_workflows_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: documents documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: documents documents_parent_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_parent_document_id_fkey FOREIGN KEY (parent_document_id) REFERENCES public.documents(id);


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employee_certifications employee_certifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_certifications
    ADD CONSTRAINT employee_certifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_certifications employee_certifications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_certifications
    ADD CONSTRAINT employee_certifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_compensation employee_compensation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_compensation
    ADD CONSTRAINT employee_compensation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_development_goals employee_development_goals_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: employee_development_goals employee_development_goals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_development_goals employee_development_goals_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_development_goals
    ADD CONSTRAINT employee_development_goals_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_pay_rates employee_pay_rates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pay_rates
    ADD CONSTRAINT employee_pay_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_pay_rates employee_pay_rates_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pay_rates
    ADD CONSTRAINT employee_pay_rates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_performance_reviews employee_performance_reviews_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_performance_reviews
    ADD CONSTRAINT employee_performance_reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_performance_reviews employee_performance_reviews_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_performance_reviews
    ADD CONSTRAINT employee_performance_reviews_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_performance_reviews employee_performance_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_performance_reviews
    ADD CONSTRAINT employee_performance_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: employee_pto_balances employee_pto_balances_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_balances
    ADD CONSTRAINT employee_pto_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: employee_pto_balances employee_pto_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_balances
    ADD CONSTRAINT employee_pto_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id);


--
-- Name: employee_pto_policies employee_pto_policies_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_policies
    ADD CONSTRAINT employee_pto_policies_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_pto_policies employee_pto_policies_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_pto_policies
    ADD CONSTRAINT employee_pto_policies_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.pto_policies(id);


--
-- Name: employee_recognition employee_recognition_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_recognition
    ADD CONSTRAINT employee_recognition_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_recognition employee_recognition_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_recognition
    ADD CONSTRAINT employee_recognition_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_recognition employee_recognition_given_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_recognition
    ADD CONSTRAINT employee_recognition_given_by_fkey FOREIGN KEY (given_by) REFERENCES public.users(id);


--
-- Name: employee_skills employee_skills_assessed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_assessed_by_fkey FOREIGN KEY (assessed_by) REFERENCES public.users(id);


--
-- Name: employee_skills employee_skills_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_skills employee_skills_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_time_off employee_time_off_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_time_off employee_time_off_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_off
    ADD CONSTRAINT employee_time_off_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.pto_policies(id);


--
-- Name: employee_time_summary employee_time_summary_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_summary
    ADD CONSTRAINT employee_time_summary_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_time_summary employee_time_summary_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_time_summary
    ADD CONSTRAINT employee_time_summary_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: employee_timesheets employee_timesheets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_denied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_denied_by_fkey FOREIGN KEY (denied_by) REFERENCES public.users(id);


--
-- Name: employee_timesheets employee_timesheets_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: employee_timesheets employee_timesheets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_timesheets
    ADD CONSTRAINT employee_timesheets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: esignatures esignatures_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esignatures
    ADD CONSTRAINT esignatures_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: esignatures esignatures_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esignatures
    ADD CONSTRAINT esignatures_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: esignatures esignatures_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.esignatures
    ADD CONSTRAINT esignatures_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: expense_categories expense_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: expense_reimbursements expense_reimbursements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_reimbursements
    ADD CONSTRAINT expense_reimbursements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: expense_reimbursements expense_reimbursements_expense_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_reimbursements
    ADD CONSTRAINT expense_reimbursements_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: attachments fk_attachments_company_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT fk_attachments_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: customer_portal_accounts fk_customer_portal_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_portal_accounts
    ADD CONSTRAINT fk_customer_portal_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: job_photos fk_job_photos_company_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT fk_job_photos_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_requests fk_marketplace_requests_booked_response; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT fk_marketplace_requests_booked_response FOREIGN KEY (booked_response_id) REFERENCES public.marketplace_responses(id) ON DELETE SET NULL;


--
-- Name: po_items fk_po_items_po; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT fk_po_items_po FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders fk_po_vendor; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- Name: work_orders fk_wo_marketplace_request; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT fk_wo_marketplace_request FOREIGN KEY (marketplace_request_id) REFERENCES public.marketplace_requests(id) ON DELETE SET NULL;


--
-- Name: work_orders fk_wo_marketplace_response; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT fk_wo_marketplace_response FOREIGN KEY (marketplace_response_id) REFERENCES public.marketplace_responses(id) ON DELETE SET NULL;


--
-- Name: integration_settings integration_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_settings
    ADD CONSTRAINT integration_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: integration_tokens integration_tokens_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integration_tokens
    ADD CONSTRAINT integration_tokens_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: inventory_batches inventory_batches_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_cycle_count_items inventory_cycle_count_items_cycle_count_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_cycle_count_items
    ADD CONSTRAINT inventory_cycle_count_items_cycle_count_id_fkey FOREIGN KEY (cycle_count_id) REFERENCES public.inventory_cycle_counts(id) ON DELETE CASCADE;


--
-- Name: inventory_cycle_count_items inventory_cycle_count_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_cycle_count_items
    ADD CONSTRAINT inventory_cycle_count_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_cycle_counts inventory_cycle_counts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_cycle_counts
    ADD CONSTRAINT inventory_cycle_counts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


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
-- Name: inventory_movements inventory_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id);


--
-- Name: inventory_movements inventory_movements_related_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_related_work_order_id_fkey FOREIGN KEY (related_work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: inventory_scan_log inventory_scan_log_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_scan_log
    ADD CONSTRAINT inventory_scan_log_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: inventory_scan_log inventory_scan_log_scanned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_scan_log
    ADD CONSTRAINT inventory_scan_log_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_serial_numbers inventory_serial_numbers_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_serial_numbers
    ADD CONSTRAINT inventory_serial_numbers_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_stock inventory_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_stock
    ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id) ON DELETE CASCADE;


--
-- Name: invoice_commissions invoice_commissions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_commissions
    ADD CONSTRAINT invoice_commissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: invoice_commissions invoice_commissions_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_commissions
    ADD CONSTRAINT invoice_commissions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_commissions invoice_commissions_sales_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_commissions
    ADD CONSTRAINT invoice_commissions_sales_rep_id_fkey FOREIGN KEY (sales_rep_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_payments invoice_payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_payments
    ADD CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: job_assignments job_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_assignments
    ADD CONSTRAINT job_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: job_assignments job_assignments_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_assignments
    ADD CONSTRAINT job_assignments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: job_photos job_photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: job_photos job_photos_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_photos
    ADD CONSTRAINT job_photos_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: job_triggers job_triggers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_triggers
    ADD CONSTRAINT job_triggers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leads leads_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_cancellations marketplace_cancellations_canceled_by_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_cancellations
    ADD CONSTRAINT marketplace_cancellations_canceled_by_company_id_fkey FOREIGN KEY (canceled_by_company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: marketplace_cancellations marketplace_cancellations_canceled_by_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_cancellations
    ADD CONSTRAINT marketplace_cancellations_canceled_by_customer_id_fkey FOREIGN KEY (canceled_by_customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: marketplace_cancellations marketplace_cancellations_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_cancellations
    ADD CONSTRAINT marketplace_cancellations_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_request_decline_stats marketplace_request_decline_stats_reason_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_decline_stats
    ADD CONSTRAINT marketplace_request_decline_stats_reason_code_fkey FOREIGN KEY (reason_code) REFERENCES public.decline_reason_codes(code);


--
-- Name: marketplace_request_decline_stats marketplace_request_decline_stats_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_decline_stats
    ADD CONSTRAINT marketplace_request_decline_stats_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_request_roles marketplace_request_roles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_roles
    ADD CONSTRAINT marketplace_request_roles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: marketplace_request_roles marketplace_request_roles_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_roles
    ADD CONSTRAINT marketplace_request_roles_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_request_tags marketplace_request_tags_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_tags
    ADD CONSTRAINT marketplace_request_tags_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_request_tags marketplace_request_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_request_tags
    ADD CONSTRAINT marketplace_request_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.service_tags(id) ON DELETE CASCADE;


--
-- Name: marketplace_requests marketplace_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: marketplace_requests marketplace_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_requests
    ADD CONSTRAINT marketplace_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: marketplace_responses marketplace_responses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_responses marketplace_responses_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: marketplace_responses marketplace_responses_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_responses
    ADD CONSTRAINT marketplace_responses_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.marketplace_request_roles(id);


--
-- Name: marketplace_reviews marketplace_reviews_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: marketplace_reviews marketplace_reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: marketplace_reviews marketplace_reviews_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_reviews
    ADD CONSTRAINT marketplace_reviews_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: messages messages_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- Name: messages messages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: messages messages_recipient_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_fkey FOREIGN KEY (recipient_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_fkey FOREIGN KEY (sender_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;


--
-- Name: messages messages_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: notification_settings notification_settings_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: notifications notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: opportunities opportunities_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: opportunities opportunities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: opportunities opportunities_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: opportunities opportunities_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: opportunities opportunities_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;


--
-- Name: payments payments_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: po_approval_actions po_approval_actions_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_actions
    ADD CONSTRAINT po_approval_actions_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: po_approval_actions po_approval_actions_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_actions
    ADD CONSTRAINT po_approval_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.po_approval_workflows(id) ON DELETE CASCADE;


--
-- Name: po_approval_rules po_approval_rules_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_rules
    ADD CONSTRAINT po_approval_rules_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.users(id);


--
-- Name: po_approval_rules po_approval_rules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_rules
    ADD CONSTRAINT po_approval_rules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: po_approval_rules po_approval_rules_vendor_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_rules
    ADD CONSTRAINT po_approval_rules_vendor_category_id_fkey FOREIGN KEY (vendor_category_id) REFERENCES public.vendor_categories(id);


--
-- Name: po_approval_workflows po_approval_workflows_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_workflows
    ADD CONSTRAINT po_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: po_approval_workflows po_approval_workflows_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_workflows
    ADD CONSTRAINT po_approval_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: po_approval_workflows po_approval_workflows_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approval_workflows
    ADD CONSTRAINT po_approval_workflows_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: po_approvals po_approvals_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approvals
    ADD CONSTRAINT po_approvals_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.users(id);


--
-- Name: po_approvals po_approvals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approvals
    ADD CONSTRAINT po_approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: po_approvals po_approvals_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approvals
    ADD CONSTRAINT po_approvals_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: po_approvals po_approvals_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_approvals
    ADD CONSTRAINT po_approvals_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.po_approval_rules(id);


--
-- Name: po_items po_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: po_items po_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: po_items po_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_items
    ADD CONSTRAINT po_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: po_status_history po_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: po_status_history po_status_history_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: po_status_history po_status_history_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: preferred_relationships preferred_relationships_preferred_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_relationships
    ADD CONSTRAINT preferred_relationships_preferred_company_id_fkey FOREIGN KEY (preferred_company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: preferred_relationships preferred_relationships_requester_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_relationships
    ADD CONSTRAINT preferred_relationships_requester_company_id_fkey FOREIGN KEY (requester_company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: preferred_relationships preferred_relationships_requester_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferred_relationships
    ADD CONSTRAINT preferred_relationships_requester_customer_id_fkey FOREIGN KEY (requester_customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: pto_ledger pto_ledger_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pto_ledger
    ADD CONSTRAINT pto_ledger_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: pto_ledger pto_ledger_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pto_ledger
    ADD CONSTRAINT pto_ledger_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.pto_policies(id);


--
-- Name: pto_policies pto_policies_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pto_policies
    ADD CONSTRAINT pto_policies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: purchase_orders purchase_orders_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_related_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_related_work_order_id_fkey FOREIGN KEY (related_work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


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
    ADD CONSTRAINT quote_approval_workflows_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: quote_approval_workflows quote_approval_workflows_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: quote_approval_workflows quote_approval_workflows_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_approval_workflows
    ADD CONSTRAINT quote_approval_workflows_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: quote_follow_ups quote_follow_ups_assigned_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_follow_ups
    ADD CONSTRAINT quote_follow_ups_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: quote_tool_access quote_tool_access_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_access
    ADD CONSTRAINT quote_tool_access_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.quote_tools(id) ON DELETE CASCADE;


--
-- Name: quote_tool_tiers quote_tool_tiers_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_tiers
    ADD CONSTRAINT quote_tool_tiers_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.quote_tools(id) ON DELETE CASCADE;


--
-- Name: quote_tool_usage quote_tool_usage_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_usage
    ADD CONSTRAINT quote_tool_usage_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quote_tool_usage quote_tool_usage_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_usage
    ADD CONSTRAINT quote_tool_usage_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.quote_tool_tiers(id) ON DELETE SET NULL;


--
-- Name: quote_tool_usage quote_tool_usage_tool_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tool_usage
    ADD CONSTRAINT quote_tool_usage_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.quote_tools(id) ON DELETE SET NULL;


--
-- Name: quote_tools quote_tools_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_tools
    ADD CONSTRAINT quote_tools_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: rates_pricing_settings rates_pricing_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rates_pricing_settings
    ADD CONSTRAINT rates_pricing_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: recurring_jobs recurring_jobs_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_jobs
    ADD CONSTRAINT recurring_jobs_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: recurring_jobs recurring_jobs_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_jobs
    ADD CONSTRAINT recurring_jobs_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: recurring_jobs recurring_jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_jobs
    ADD CONSTRAINT recurring_jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: recurring_jobs recurring_jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_jobs
    ADD CONSTRAINT recurring_jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: reimbursement_requests reimbursement_requests_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reimbursement_requests reimbursement_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reimbursement_requests reimbursement_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reimbursement_requests reimbursement_requests_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reimbursement_requests
    ADD CONSTRAINT reimbursement_requests_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: request_tags request_tags_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_tags
    ADD CONSTRAINT request_tags_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.marketplace_requests(id) ON DELETE CASCADE;


--
-- Name: request_tags request_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request_tags
    ADD CONSTRAINT request_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: route_optimizations route_optimizations_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_optimizations
    ADD CONSTRAINT route_optimizations_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: route_optimizations route_optimizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_optimizations
    ADD CONSTRAINT route_optimizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: route_optimizations route_optimizations_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_optimizations
    ADD CONSTRAINT route_optimizations_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES auth.users(id);


--
-- Name: sales_activities sales_activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: sales_activities sales_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_activities
    ADD CONSTRAINT sales_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: sales_targets sales_targets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: sales_targets sales_targets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: schedule_events schedule_events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: schedule_events schedule_events_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: schedule_events schedule_events_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_events
    ADD CONSTRAINT schedule_events_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: service_contracts service_contracts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_contracts
    ADD CONSTRAINT service_contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_contracts service_contracts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_contracts
    ADD CONSTRAINT service_contracts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: service_request_responses service_request_responses_contractor_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_responses
    ADD CONSTRAINT service_request_responses_contractor_company_id_fkey FOREIGN KEY (contractor_company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_request_responses service_request_responses_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_responses
    ADD CONSTRAINT service_request_responses_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;


--
-- Name: service_request_responses service_request_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_responses
    ADD CONSTRAINT service_request_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: service_requests service_requests_claimed_by_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_claimed_by_company_id_fkey FOREIGN KEY (claimed_by_company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: service_requests service_requests_claimed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_claimed_by_user_id_fkey FOREIGN KEY (claimed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: service_requests service_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: service_requests service_requests_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: settings settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: signature_requests signature_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signature_requests
    ADD CONSTRAINT signature_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: signature_requests signature_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signature_requests
    ADD CONSTRAINT signature_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: signature_requests signature_requests_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signature_requests
    ADD CONSTRAINT signature_requests_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: subcontractor_documents subcontractor_documents_subcontractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_documents
    ADD CONSTRAINT subcontractor_documents_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES public.subcontractors(id) ON DELETE CASCADE;


--
-- Name: subcontractor_timesheets subcontractor_timesheets_subcontractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_timesheets
    ADD CONSTRAINT subcontractor_timesheets_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES public.subcontractors(id) ON DELETE CASCADE;


--
-- Name: subcontractor_timesheets subcontractor_timesheets_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_timesheets
    ADD CONSTRAINT subcontractor_timesheets_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: subcontractor_work_orders subcontractor_work_orders_subcontractor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_work_orders
    ADD CONSTRAINT subcontractor_work_orders_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES public.subcontractors(id) ON DELETE CASCADE;


--
-- Name: subcontractor_work_orders subcontractor_work_orders_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractor_work_orders
    ADD CONSTRAINT subcontractor_work_orders_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: subcontractors subcontractors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcontractors
    ADD CONSTRAINT subcontractors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: technician_locations technician_locations_company_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technician_locations
    ADD CONSTRAINT technician_locations_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- Name: technician_locations technician_locations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technician_locations
    ADD CONSTRAINT technician_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tool_preferences tool_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_preferences
    ADD CONSTRAINT tool_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tool_usage tool_usage_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage
    ADD CONSTRAINT tool_usage_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: tool_usage tool_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage
    ADD CONSTRAINT tool_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ui_preferences ui_preferences_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ui_preferences
    ADD CONSTRAINT ui_preferences_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_settings user_dashboard_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: users users_invited_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_invited_by_user_id_fkey FOREIGN KEY (invited_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vendor_categories vendor_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_categories
    ADD CONSTRAINT vendor_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: vendor_category_assignments vendor_category_assignments_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_category_assignments
    ADD CONSTRAINT vendor_category_assignments_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.vendor_categories(id) ON DELETE CASCADE;


--
-- Name: vendor_category_assignments vendor_category_assignments_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_category_assignments
    ADD CONSTRAINT vendor_category_assignments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_contacts vendor_contacts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_contacts
    ADD CONSTRAINT vendor_contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: vendor_contacts vendor_contacts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_contacts
    ADD CONSTRAINT vendor_contacts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_items vendor_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_items
    ADD CONSTRAINT vendor_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: vendor_items vendor_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_items
    ADD CONSTRAINT vendor_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: vendor_items vendor_items_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_items
    ADD CONSTRAINT vendor_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_pricing_history vendor_pricing_history_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricing_history
    ADD CONSTRAINT vendor_pricing_history_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: vendor_pricing_history vendor_pricing_history_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricing_history
    ADD CONSTRAINT vendor_pricing_history_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: vendor_pricing_history vendor_pricing_history_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricing_history
    ADD CONSTRAINT vendor_pricing_history_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- Name: vendor_pricing_history vendor_pricing_history_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricing_history
    ADD CONSTRAINT vendor_pricing_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: vendors vendors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vendors_status_history vendors_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors_status_history
    ADD CONSTRAINT vendors_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: vendors_status_history vendors_status_history_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors_status_history
    ADD CONSTRAINT vendors_status_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: work_order_assignments work_order_assignments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_assignments
    ADD CONSTRAINT work_order_assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_assignments work_order_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_assignments
    ADD CONSTRAINT work_order_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: work_order_assignments work_order_assignments_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_assignments
    ADD CONSTRAINT work_order_assignments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_audit_log work_order_audit_log_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_audit_log work_order_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: work_order_audit_log work_order_audit_log_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit_log
    ADD CONSTRAINT work_order_audit_log_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_audit work_order_audit_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_audit
    ADD CONSTRAINT work_order_audit_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_items work_order_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_items work_order_items_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE SET NULL;


--
-- Name: work_order_items work_order_items_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_items
    ADD CONSTRAINT work_order_items_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_labor work_order_labor_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_labor work_order_labor_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id);


--
-- Name: work_order_labor work_order_labor_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_labor
    ADD CONSTRAINT work_order_labor_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_milestones work_order_milestones_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_milestones
    ADD CONSTRAINT work_order_milestones_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_order_versions work_order_versions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: work_order_versions work_order_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: work_order_versions work_order_versions_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_order_versions
    ADD CONSTRAINT work_order_versions_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_assigned_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_technician_id_fkey FOREIGN KEY (assigned_technician_id) REFERENCES public.users(id);


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
-- Name: work_orders work_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: work_orders work_orders_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_parent_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_parent_job_id_fkey FOREIGN KEY (parent_job_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;


--
-- Name: work_orders work_orders_service_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES public.customer_addresses(id);


--
-- Name: workflow_approvals workflow_approvals_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: workflow_approvals workflow_approvals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: workflow_approvals workflow_approvals_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_approvals
    ADD CONSTRAINT workflow_approvals_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.document_workflows(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


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
-- Name: expense_categories Admins can manage expense categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expense_categories.company_id = expense_categories.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[]))))));


--
-- Name: employee_skills Admins can manage skills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage skills" ON public.employee_skills USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_skills.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));


--
-- Name: notifications Company can see own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Company can see own notifications" ON public.notifications FOR SELECT USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: employee_performance_reviews Reviewers can manage reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewers can manage reviews" ON public.employee_performance_reviews USING (((reviewer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_performance_reviews.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: documents Users can access documents for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access documents for their company" ON public.documents USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: work_order_audit_log Users can access work order audit logs for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access work order audit logs for their company" ON public.work_order_audit_log USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: work_order_versions Users can access work order versions for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can access work order versions for their company" ON public.work_order_versions USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: expenses Users can create own expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own expenses" ON public.expenses FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: customer_addresses Users can delete customer addresses for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete customer addresses for their company" ON public.customer_addresses FOR DELETE USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: expenses Users can delete expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete expenses" ON public.expenses FOR DELETE USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));


--
-- Name: employee_recognition Users can give recognition; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can give recognition" ON public.employee_recognition FOR INSERT WITH CHECK (((given_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id))))));


--
-- Name: quote_approval_workflows Users can insert approval workflows for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert approval workflows for their company" ON public.quote_approval_workflows FOR INSERT WITH CHECK ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: customer_addresses Users can insert customer addresses for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert customer addresses for their company" ON public.customer_addresses FOR INSERT WITH CHECK ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: quote_follow_ups Users can insert follow-ups for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert follow-ups for their company" ON public.quote_follow_ups FOR INSERT WITH CHECK ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: quote_analytics Users can insert quote analytics for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert quote analytics for their company" ON public.quote_analytics FOR INSERT WITH CHECK ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: employee_certifications Users can manage own certifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own certifications" ON public.employee_certifications USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_certifications.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: tool_usage Users can track own tool usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can track own tool usage" ON public.tool_usage USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (tool_usage.company_id = tool_usage.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));


--
-- Name: quote_approval_workflows Users can update approval workflows for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update approval workflows for their company" ON public.quote_approval_workflows FOR UPDATE USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: customer_addresses Users can update customer addresses for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update customer addresses for their company" ON public.customer_addresses FOR UPDATE USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: expenses Users can update expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));


--
-- Name: quote_follow_ups Users can update follow-ups for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update follow-ups for their company" ON public.quote_follow_ups FOR UPDATE USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: employee_development_goals Users can update own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own goals" ON public.employee_development_goals FOR UPDATE USING (((employee_id = auth.uid()) OR (assigned_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_development_goals.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: quote_analytics Users can update quote analytics for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update quote analytics for their company" ON public.quote_analytics FOR UPDATE USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: quote_approval_workflows Users can view approval workflows for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view approval workflows for their company" ON public.quote_approval_workflows FOR SELECT USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: expense_categories Users can view company expense categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view company expense categories" ON public.expense_categories FOR SELECT USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expense_categories.company_id = expense_categories.company_id)))));


--
-- Name: expenses Users can view company expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view company expenses" ON public.expenses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id)))));


--
-- Name: work_order_items Users can view company work order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view company work order items" ON public.work_order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = work_order_items.company_id)))));


--
-- Name: customer_addresses Users can view customer addresses for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view customer addresses for their company" ON public.customer_addresses FOR SELECT USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: quote_follow_ups Users can view follow-ups for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view follow-ups for their company" ON public.quote_follow_ups FOR SELECT USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: employee_certifications Users can view own certifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own certifications" ON public.employee_certifications FOR SELECT USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_certifications.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: employee_development_goals Users can view own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own goals" ON public.employee_development_goals FOR SELECT USING (((employee_id = auth.uid()) OR (assigned_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_development_goals.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: employee_performance_reviews Users can view own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reviews" ON public.employee_performance_reviews FOR SELECT USING (((employee_id = auth.uid()) OR (reviewer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_performance_reviews.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: employee_skills Users can view own skills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own skills" ON public.employee_skills FOR SELECT USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_skills.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: employee_time_summary Users can view own time summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own time summary" ON public.employee_time_summary FOR SELECT USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_time_summary.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: quote_analytics Users can view quote analytics for their company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quote analytics for their company" ON public.quote_analytics FOR SELECT USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: employee_recognition Users can view recognition; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view recognition" ON public.employee_recognition FOR SELECT USING (((employee_id = auth.uid()) OR (given_by = auth.uid()) OR ((is_public = true) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id))))) OR (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));


--
-- Name: customer_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_messages customer_messages_company_isolation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY customer_messages_company_isolation ON public.customer_messages USING ((company_id = ( SELECT users.company_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: document_access_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

--
-- Name: document_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: document_workflows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_certifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_development_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_development_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: messages employee_message_access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY employee_message_access ON public.messages FOR SELECT USING (((work_order_id IN ( SELECT work_orders.id
   FROM public.work_orders
  WHERE (work_orders.company_id = auth.uid()))) OR (recipient_id = auth.uid()) OR (sender_id = auth.uid())));


--
-- Name: employee_performance_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_performance_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_recognition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_recognition ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: employee_time_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.employee_time_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: expense_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_approval_workflows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_approval_workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_follow_ups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_follow_ups ENABLE ROW LEVEL SECURITY;

--
-- Name: recurring_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recurring_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: route_optimizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.route_optimizations ENABLE ROW LEVEL SECURITY;

--
-- Name: sales_activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: sales_targets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

--
-- Name: signature_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: tool_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: work_order_labor wol_mod_in_company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY wol_mod_in_company ON public.work_order_labor USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid)) WITH CHECK ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: work_order_labor wol_select_in_company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY wol_select_in_company ON public.work_order_labor FOR SELECT USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));


--
-- Name: work_order_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.work_order_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: work_order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: work_order_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.work_order_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow all authenticated deletes from company-files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow all authenticated deletes from company-files" ON storage.objects FOR DELETE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow all authenticated updates to company-files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow all authenticated updates to company-files" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow all authenticated uploads to company-files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow all authenticated uploads to company-files" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file deletes; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow company file deletes" ON storage.objects FOR DELETE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file updates; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow company file updates" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow company file uploads; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow company file uploads" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'company-files'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Allow public read access to company files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow public read access to company files" ON storage.objects FOR SELECT USING ((bucket_id = 'company-files'::text));


--
-- Name: objects Allow public read from company-files; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Allow public read from company-files" ON storage.objects FOR SELECT USING ((bucket_id = 'company-files'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: objects company-assets auth delete; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "company-assets auth delete" ON storage.objects FOR DELETE USING (((bucket_id = 'company-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects company-assets auth insert; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "company-assets auth insert" ON storage.objects FOR INSERT WITH CHECK ((bucket_id = 'company-assets'::text));


--
-- Name: objects company-assets auth update; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "company-assets auth update" ON storage.objects FOR UPDATE USING (((bucket_id = 'company-assets'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects company-assets public read; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "company-assets public read" ON storage.objects FOR SELECT USING ((bucket_id = 'company-assets'::text));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

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

\unrestrict cbhcfQi03KM0nB3kYKtV8oh98RHORQ0NkHMVFMPUmwoqenVt7cyBeqT5FpZ6Zmn

