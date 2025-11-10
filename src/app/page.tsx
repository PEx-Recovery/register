"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface GeolocationError {
  code: number;
  message: string;
}

export default function Home() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isNoEmail, setIsNoEmail] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "error" | "success" | "idle" | "submitting"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchGroups = (position: GeolocationPosition | null) => {
      if (!functionsUrl) {
        console.error("Functions URL is not defined!");
        setErrorMessage(
          "Configuration error: Missing functions URL. Check environment variables."
        );
        setStatus("error");
        return;
      }

      if (!supabaseAnonKey) {
        console.error("Supabase anon key is not defined!");
        setErrorMessage(
          "Configuration error: Missing Supabase key. Check environment variables."
        );
        setStatus("error");
        return;
      }

      let url = "";
      let options: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ✅ FIXED: Include both apikey AND Authorization header
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
      };

      if (position) {
        url = `${functionsUrl}/get-groups-by-distance`;
        options.body = JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        url = `${functionsUrl}/get-groups-by-day`;
        const sundayZeroToSaturdaySix = new Date().getUTCDay();
        const isoOneToSeven = ((sundayZeroToSaturdaySix + 6) % 7) + 1;
        options.body = JSON.stringify({ day_of_week: isoOneToSeven });
      }

      fetch(url, options)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          setGroups(data.groups || []);
          setStatus("success");
        })
        .catch((err) => {
          console.error("Failed to fetch groups:", err);
          setErrorMessage(`Failed to fetch groups: ${err.message}`);
          setStatus("error");
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          fetchGroups(position);
        },
        (err: GeolocationError) => {
          setErrorMessage(
            `Geolocation failed (${err.message}). Sorting by day.`
          );
          fetchGroups(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setErrorMessage("Geolocation not supported. Sorting by day.");
      fetchGroups(null);
    }
  }, [functionsUrl, supabaseAnonKey]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setStatus("submitting");

    if (!selectedGroup || (!email && !isNoEmail)) {
      setErrorMessage("Please select a group and enter your email (or check the box).");
      setStatus("idle");
      return;
    }

    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) {
      setErrorMessage("Selected group not found.");
      setStatus("idle");
      return;
    }

    if (group.format === "In-person") {
      if (!userLocation || group.distance_meters === null) {
        setErrorMessage(
          "Could not verify your location for this in-person group."
        );
        setStatus("idle");
        return;
      }

      if (group.distance_meters > 200) {
        setErrorMessage(
          `You are too far away (${Math.round(
            group.distance_meters
          )}m) to sign in. You must be within 200m.`
        );
        setStatus("idle");
        return;
      }
    }
    
    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: isNoEmail ? null : email,
          groupId: selectedGroup,
          isNoEmail: isNoEmail, 
          geolocation: userLocation, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'An error occurred during sign-in.');
        setStatus('idle');
        return;
      }

      switch (data.status) {
        case 'CHECKIN_COMPLETE':
          router.push('/complete');
          break;
        case 'ORIENTATION_REQUIRED':
          router.push('/orientation');
          break;
        case 'NO_EMAIL_INFO_REQUIRED':
          router.push('/orientation'); 
          break;
      }

    } catch (error) {
      console.error('Sign-in fetch error:', error);
      setErrorMessage('Could not connect to the server. Please try again.');
      setStatus('idle');
    }
  };

  const getDayOfWeek = (day: string) => {
    const days: { [key: string]: string } = {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3.0": "Wednesday",
      "4.0": "Thursday",
      "5.0": "Friday",
      "6.0": "Saturday",
    };
    return days[day] || "Unknown Day";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Welcome to the Register
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please select your group and enter your email to sign in.
        </p>

        {status === "loading" && (
          <p className="text-blue-600 text-center">
            Fetching groups... Please wait.
          </p>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4">
            {errorMessage}
          </div>
        )}
        
        {status !== "loading" && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="group"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Group
              </label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  {groups.length > 0
                    ? "Please select a group..."
                    : "No groups found"}
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} (
                    {group.format === "Online"
                      ? "Online"
                      : `${Math.round(group.distance_meters || 0)}m away`}
                    , {getDayOfWeek(group.meeting_day)} @ {group.meeting_time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isNoEmail}
                disabled={isNoEmail}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isNoEmail"
                name="isNoEmail"
                type="checkbox"
                checked={isNoEmail}
                onChange={(e) => setIsNoEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="isNoEmail" className="ml-2 block text-sm text-gray-900">
                I don't have an email address
              </label>
            </div>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {status === "submitting" ? "Signing In..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}