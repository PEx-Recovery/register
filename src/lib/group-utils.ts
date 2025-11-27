export interface Group {
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
    locationEnabled: boolean
): Group[] {
    if (locationEnabled) {
        // Scenario A: User Location is Enabled
        // Logic: Sort by geolocation distance (ascending).
        // Output: Return only the 5 closest groups.
        // Note: The API already sorts by distance (In-person first, then Online).
        // We just need to take the top 5.
        return groups.slice(0, 5);
    } else {
        // Scenario B: User Location is Disabled (or "Filter by Day")
        // Logic: Prioritize groups meeting on the day closest to "Today" AND include Online groups.
        // Output: Return a list containing the groups meeting on the nearest upcoming date,
        // plus ensure 5 Online Groups are included.

        if (groups.length === 0) return [];

        // 1. Identify "Today" (or nearest upcoming date).
        // Since the API sorts by day proximity, the first group's day is the nearest day.
        const nearestDay = groups[0].meeting_day;

        // Filter for groups meeting on the nearest day
        const nearestDayGroups = groups.filter(
            (g) => g.meeting_day === nearestDay
        );

        // 2. Identify Online Groups
        // We need to ensure 5 Online Groups are included.
        // We'll take the first 5 Online groups found in the list.
        // (The list is sorted by day proximity, so these will be the "soonest" online groups).
        const onlineGroups = groups.filter((g) => g.format === "Online");
        const top5OnlineGroups = onlineGroups.slice(0, 5);

        // 3. Combine lists
        // We want nearestDayGroups + top5OnlineGroups.
        // We must remove duplicates (e.g. if an online group is also meeting today).
        const combinedGroups = [...nearestDayGroups];

        top5OnlineGroups.forEach((onlineGroup) => {
            if (!combinedGroups.find((g) => g.id === onlineGroup.id)) {
                combinedGroups.push(onlineGroup);
            }
        });

        return combinedGroups;
    }
}
