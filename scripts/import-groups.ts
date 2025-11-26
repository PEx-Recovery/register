// Import groups from CSV file into Supabase database
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import csv from 'csv-parser';
import { geocodeAddress, delay } from './geocode';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface CSVRow {
    '🔒 Row ID': string;
    'Status/Status': string;
    'Group/Name Override': string;
    'Group/Format': string;
    'Group/Specialisation': string;
    'Location/Street Address Input': string;
    'Location/Suburb Input': string;
    'Location/City Input': string;
    'Location/Postal Code Input': string;
    'Temp/Country': string;
    'Location/Country Input': string;
    'Date & Time/Day of Week': string;
    'Date & Time/Start Time Input': string;
    'Affiliate/RID': string;
}

function buildAddress(row: CSVRow): string {
    // Use Location/Country Input if available, fallback to Temp/Country
    const country = row['Location/Country Input'] || row['Temp/Country'] || 'South Africa';

    const parts = [
        row['Location/Street Address Input'],
        row['Location/Suburb Input'],
        row['Location/City Input'],
        row['Location/Postal Code Input'],
        country,
    ].filter(p => p && p.trim() !== '');

    return parts.join(', ');
}

function parseTime(timeStr: string): string | null {
    if (!timeStr) return null;

    // Handle formats like "19:00", "7:00 PM", "18:30", etc.
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}:00`;
    }

    return null;
}

async function importGroups() {
    const csvPath = 'BRI Groups List v2.csv';
    const groups: any[] = [];

    console.log('📖 Reading CSV file...');

    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row: CSVRow) => {
                groups.push(row);
            })
            .on('end', async () => {
                console.log(`✅ Parsed ${groups.length} groups from CSV`);

                let successCount = 0;
                let errorCount = 0;
                let geocodedCount = 0;

                for (const row of groups) {
                    const name = row['Group/Name Override'];
                    const format = row['Group/Format'];
                    const isArchived = row['Status/Status'] === 'Archived';

                    if (!name) {
                        console.log('⚠️  Skipping row with no name');
                        continue;
                    }

                    console.log(`\n📍 Processing: ${name} (${format})${isArchived ? ' [ARCHIVED]' : ''}`);

                    let latitude: number | null = null;
                    let longitude: number | null = null;

                    // Only geocode in-person groups
                    if (format === 'In-person') {
                        const address = buildAddress(row);
                        if (address) {
                            console.log(`   Address: ${address}`);

                            // Respect rate limit: 1 request per second
                            await delay(1100);

                            const coords = await geocodeAddress(address);
                            if (coords) {
                                latitude = coords.latitude;
                                longitude = coords.longitude;
                                geocodedCount++;
                                console.log(`   ✓ Geocoded: ${latitude}, ${longitude}`);
                            } else {
                                console.log(`   ✗ Geocoding failed`);
                            }
                        }
                    } else {
                        console.log(`   → Online group, skipping geocoding`);
                    }

                    const meetingTime = parseTime(row['Date & Time/Start Time Input']);

                    const groupData = {
                        name,
                        format,
                        specialisation: row['Group/Specialisation'] || null,
                        latitude,
                        longitude,
                        meeting_day: row['Date & Time/Day of Week'] || null,
                        meeting_time: meetingTime,
                        is_archived: isArchived,
                        row_id: row['🔒 Row ID'] || null,
                        affiliate_rid: row['Affiliate/RID'] || null,
                    };

                    const { error } = await supabase
                        .from('groups')
                        .insert(groupData);

                    if (error) {
                        console.error(`   ❌ Error inserting group:`, error.message);
                        errorCount++;
                    } else {
                        console.log(`   ✅ Inserted successfully`);
                        successCount++;
                    }
                }

                console.log('\n' + '='.repeat(60));
                console.log('📊 Import Summary:');
                console.log(`   Total groups processed: ${groups.length}`);
                console.log(`   Successfully inserted: ${successCount}`);
                console.log(`   Geocoded addresses: ${geocodedCount}`);
                console.log(`   Errors: ${errorCount}`);
                console.log('='.repeat(60));

                resolve();
            })
            .on('error', reject);
    });
}

// Run the import
importGroups()
    .then(() => {
        console.log('\n✅ Import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    });
