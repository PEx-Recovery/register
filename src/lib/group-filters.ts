interface Group {
    id: string;
    name: string;
    format: string;
    meeting_day: string;
    meeting_time: string;
    latitude: number | null;
    longitude: number | null;
    distance_meters: number | null;
}

export function filterGroups(
    groups: Group[],
    userLocation: { latitude: number; longitude: number } | null,
    locationEnabled: boolean
): Group[] {
    // Scenario A: Location is Enabled
    if (locationEnabled && userLocation) {
        // Sort by distance (ascending)
        // Note: Groups fetched by 'get-groups-by-distance' are usually already sorted,
        // but we ensure it here just in case.
        const sortedByDistance = [...groups].sort((a, b) => {
            const distA = a.distance_meters ?? Infinity;
            const distB = b.distance_meters ?? Infinity;
            return distA - distB;
        });

        // Return top 5 closest groups
        return sortedByDistance.slice(0, 5);
    }

    // Scenario B: Location is Disabled (or "Filter by Day")
    // Logic: Prioritize groups meeting on the day closest to "Today" AND include Online groups.

    const today = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
    // Convert JS day (0=Sun) to our DB day format if needed. 
    // Assuming DB uses 1=Monday...7=Sunday based on previous context, 
    // OR 0=Sunday...6=Saturday. Let's verify standard JS usage first.
    // Standard JS: 0=Sun, 1=Mon, ..., 6=Sat
    // ISO Day (often used in DBs): 1=Mon, ..., 7=Sun

    // Let's assume standard JS day for calculation relative to today.

    // Helper to calculate days until next meeting
    const getDaysUntil = (meetingDayStr: string) => {
        // Parse meeting day. Assuming it might be a number or string like "1" or "Monday"
        // Based on previous code: "0": "Sunday", "1": "Monday"...
        const meetingDay = parseFloat(meetingDayStr);
        if (isNaN(meetingDay)) return 7; // Push to end if invalid

        // Convert our DB day (0=Sun, 1=Mon...) to match JS getDay() (0=Sun, 1=Mon...)
        // It seems they match! 

        let diff = meetingDay - today;
        if (diff < 0) diff += 7; // It's next week
        return diff;
    };

    // Sort by:
    // 1. Days until meeting (closest first)
    // 2. Online status (Online groups prioritized if days are equal? Or just mixed in?)
    // Requirement: "Return a list containing the groups meeting on the nearest upcoming date, plus ensure 5 Online Groups are included"

    // Let's separate Online groups first to ensure we have them
    const onlineGroups = groups.filter(g => g.format.toLowerCase().includes('online'));
    const inPersonGroups = groups.filter(g => !g.format.toLowerCase().includes('online'));

    // Sort all groups by "closeness to today"
    const sortedGroups = [...groups].sort((a, b) => {
        const daysA = getDaysUntil(a.meeting_day);
        const daysB = getDaysUntil(b.meeting_day);
        return daysA - daysB;
    });

    // Get the "nearest upcoming date" groups
    // Find the minimum days until
    if (sortedGroups.length === 0) return [];

    const minDays = getDaysUntil(sortedGroups[0].meeting_day);

    // Get all groups happening on that nearest day
    const nearestDayGroups = sortedGroups.filter(g => getDaysUntil(g.meeting_day) === minDays);

    // Get top 5 Online groups (sorted by day as well)
    const topOnlineGroups = onlineGroups
        .sort((a, b) => getDaysUntil(a.meeting_day) - getDaysUntil(b.meeting_day))
        .slice(0, 5);

    // Combine them: Nearest Day Groups + Top 5 Online Groups
    // Use a Set or Map to remove duplicates
    const combinedMap = new Map<string, Group>();

    nearestDayGroups.forEach(g => combinedMap.set(g.id, g));
    topOnlineGroups.forEach(g => combinedMap.set(g.id, g));

    // Convert back to array and sort again by day/time for display
    return Array.from(combinedMap.values()).sort((a, b) => {
        const daysA = getDaysUntil(a.meeting_day);
        const daysB = getDaysUntil(b.meeting_day);
        if (daysA !== daysB) return daysA - daysB;
        // Secondary sort by time?
        return a.meeting_time.localeCompare(b.meeting_time);
    });
}
