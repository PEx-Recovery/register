-- Update get_groups_sorted_by_distance to exclude archived groups
CREATE OR REPLACE FUNCTION get_groups_sorted_by_distance(user_lat float, user_lon float)
RETURNS TABLE (
  id UUID,
  name TEXT,
  format TEXT,
  specialisation TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_meters NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  -- First, select all the in-person groups and calculate their distance
  SELECT
    g.id,
    g.name,
    g.format,
    g.specialisation,
    g.latitude,
    g.longitude,
    CAST(
      ST_Distance(
        ST_MakePoint(g.longitude, g.latitude)::geography,
        ST_MakePoint(user_lon, user_lat)::geography
      ) AS NUMERIC
    ) AS distance_meters
  FROM
    public.groups g
  WHERE g.format = 'In-person' 
    AND g.latitude IS NOT NULL 
    AND g.longitude IS NOT NULL
    AND g.is_archived IS FALSE
  
  UNION ALL
  
  -- Then, add all the online groups to the list
  SELECT
    g.id,
    g.name,
    g.format,
    g.specialisation,
    g.latitude,
    g.longitude,
    NULL AS distance_meters -- Online groups have no distance
  FROM
    public.groups g
  WHERE g.format = 'Online'
    AND g.is_archived IS FALSE
  
  -- Sort the final combined list: in-person groups by distance, followed by online groups
  ORDER BY
    distance_meters ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Update get_groups_sorted_by_day (no args) to exclude archived groups
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
    today_iso INT := EXTRACT(ISOWEEKDAY FROM NOW());
BEGIN
    RETURN QUERY
    WITH day_map AS (
      SELECT 
        v.day_name, 
        v.day_num 
      FROM (VALUES 
        ('Monday', 1), 
        ('Tuesday', 2), 
        ('Wednesday', 3), 
        ('Thursday', 4), 
        ('Friday', 5), 
        ('Saturday', 6), 
        ('Sunday', 7)
      ) AS v(day_name, day_num)
    )
    SELECT
      g.id,
      g.name,
      g.format,
      g.specialisation,
      g.meeting_day,
      g.meeting_time
    FROM
      public.groups g
    JOIN day_map dm ON g.meeting_day = dm.day_name
    WHERE g.is_archived IS FALSE
    ORDER BY
      -- This complex ORDER BY calculates the "days until next meeting"
      -- and sorts by that, then by time.
      (dm.day_num - today_iso + 7) % 7,
      g.meeting_time;
END;
$$ LANGUAGE plpgsql;

-- Update get_groups_sorted_by_day (parameterized) to exclude archived groups
CREATE OR REPLACE FUNCTION public.get_groups_sorted_by_day(today_iso_day int)
RETURNS TABLE (
  id uuid,
  name text,
  format text,
  specialisation text,
  meeting_day text,
  meeting_time time
) AS $$
  WITH day_map AS (
    SELECT * FROM (
      VALUES
        ('Monday', 1),
        ('Tuesday', 2),
        ('Wednesday', 3),
        ('Thursday', 4),
        ('Friday', 5),
        ('Saturday', 6),
        ('Sunday', 7)
    ) AS v(day_name, day_num)
  )
  SELECT
    g.id,
    g.name,
    g.format,
    g.specialisation,
    g.meeting_day,
    g.meeting_time
  FROM public.groups g
  JOIN day_map dm ON g.meeting_day = dm.day_name
  WHERE g.is_archived IS FALSE
  ORDER BY
    ((dm.day_num - today_iso_day + 7) % 7),
    g.meeting_time;
$$ LANGUAGE sql STABLE;
