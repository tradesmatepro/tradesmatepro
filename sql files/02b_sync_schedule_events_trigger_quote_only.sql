-- RUN SECOND (Alternative to 02_sync_schedule_events_trigger.sql for your current schema)
-- This version updates schedule_events by quote_id only (per your current schema.csv)

CREATE OR REPLACE FUNCTION public.sync_schedule_event()
RETURNS trigger AS $$
BEGIN
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW()
  WHERE quote_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_sync_calendar ON public.work_orders;
CREATE TRIGGER t_sync_calendar
AFTER UPDATE OF start_time, end_time ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_event();

