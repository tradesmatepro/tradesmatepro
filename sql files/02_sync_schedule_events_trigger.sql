-- RUN SECOND
-- Keep schedule_events times in sync with the authoritative work_orders.start_time/end_time
-- Adjust the foreign key below if your schedule_events references work_order_id instead of quote_id

CREATE OR REPLACE FUNCTION public.sync_schedule_event()
RETURNS trigger AS $$
BEGIN
  -- Try quote_id mapping first
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW()
  WHERE quote_id = NEW.id;

  -- Optionally, also update by work_order_id if your schema uses that column
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW()
  WHERE work_order_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_sync_calendar ON public.work_orders;
CREATE TRIGGER t_sync_calendar
AFTER UPDATE OF start_time, end_time ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_event();

