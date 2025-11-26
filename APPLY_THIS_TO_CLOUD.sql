-- Fix RPC functions - use ISODOW instead of ISOWEEKDAY for PostgreSQL compatibility

-- Update get_groups_sorted_by_day (no args) to work with numeric days
CREATE OR REPLACE FUNCTION get_groups_sorted_by_day()
RETURNS TABLE (
  id UUID,
  name TEXT,
  format TEXT,
  specialisation TEXT,
  meeting_day TEXT,
  meeting_time TIME
) AS $$
DECLARE
    -- Get the current day of the week as a number (ISO standard: 1=Monday...7=Sunday)
    today_iso INT := EXTRACT(ISODOW FROM NOW());
BEGIN
    RETURN QUERY
    SELECT
      g.id,
      g.name,
      g.format,
      g.specialisation,
      g.meeting_day,
      g.meeting_time
    FROM
      public.groups g
    WHERE g.is_archived IS FALSE
      AND g.meeting_day IS NOT NULL
    ORDER BY
      -- Calculate days until next meeting, treating meeting_day as numeric
      ((g.meeting_day::integer - today_iso + 7) % 7),
      g.meeting_time;
END;
$$ LANGUAGE plpgsql;

-- Update get_groups_sorted_by_day (parameterized) to work with numeric days
CREATE OR REPLACE FUNCTION public.get_groups_sorted_by_day(today_iso_day int)
RETURNS TABLE (
  id uuid,
  name text,
  format text,
  specialisation text,
  meeting_day text,
  meeting_time time
) AS $$
  SELECT
    g.id,
    g.name,
    g.format,
    g.specialisation,
    g.meeting_day,
    g.meeting_time
  FROM public.groups g
  WHERE g.is_archived IS FALSE
    AND g.meeting_day IS NOT NULL
  ORDER BY
    -- Calculate days until next meeting, treating meeting_day as numeric
    ((g.meeting_day::integer - today_iso_day + 7) % 7),
    g.meeting_time;
$$ LANGUAGE sql STABLE;
