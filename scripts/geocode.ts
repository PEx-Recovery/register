// Geocoding utility using OpenStreetMap Nominatim API
// Rate limit: 1 request per second

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'BRI-Register-Import/1.0';

interface GeocodeResult {
    latitude: number;
    longitude: number;
}

/**
 * Geocode an address using OpenStreetMap Nominatim
 * @param address Full address string
 * @returns Coordinates or null if not found
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address || address.trim() === '') {
        return null;
    }

    try {
        const url = new URL('/search', NOMINATIM_BASE_URL);
        url.searchParams.set('q', address);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            console.error(`Geocoding failed for "${address}": ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data.length === 0) {
            console.warn(`No results found for address: "${address}"`);
            return null;
        }

        const result = data[0];
        return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
        };
    } catch (error) {
        console.error(`Error geocoding address "${address}":`, error);
        return null;
    }
}

/**
 * Add delay between requests to respect rate limits (1 req/sec for Nominatim)
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
