-- Fix get_groups_sorted_by_distance to exclude archived groups
-- This function was missed in the previous update

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
