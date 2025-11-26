"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const signInSchema = z
  .object({
    groupId: z.string().min(1, "Please select a group."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .or(z.literal("")),
    isNoEmail: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.isNoEmail) {
      if (!data.email || data.email.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required unless you confirm you have none.",
        });
      }
    }
  });

type SignInFormValues = z.infer<typeof signInSchema>;

export default function Home() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchStatus, setFetchStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [fetchMessage, setFetchMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Create Supabase client
  const supabase = createClient();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      groupId: "",
      email: "",
      isNoEmail: false,
    },
  });
  const isNoEmail = form.watch("isNoEmail");
  const {
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    const fetchGroups = async (position: GeolocationPosition | null) => {
      try {
        if (position) {
          // User has geolocation - fetch groups sorted by distance
          console.log("Fetching groups by distance with position:", {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          const { data, error } = await supabase.functions.invoke(
            "get-groups-by-distance",
            {
              body: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            }
          );

          if (error) {
            console.error("Error from get-groups-by-distance:", error);
            throw error;
          }

          console.log("Received groups by distance:", data);

          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setGroups(data.groups || []);
        } else {
          // No geolocation - fetch groups sorted by day
          const sundayZeroToSaturdaySix = new Date().getUTCDay();
          const isoOneToSeven = ((sundayZeroToSaturdaySix + 6) % 7) + 1;

          console.log("Fetching groups by day:", isoOneToSeven);

          const { data, error } = await supabase.functions.invoke(
            "get-groups-by-day",
            {
              body: { day_of_week: isoOneToSeven },
            }
          );

          if (error) {
            console.error("Error from get-groups-by-day:", error);
            throw error;
          }

          console.log("Received groups by day:", data);
          setGroups(data.groups || []);
        }

        setFetchStatus("success");
      } catch (err: any) {
        console.error("Failed to fetch groups:", err);
        setFetchMessage(`Failed to fetch groups: ${err.message || "Unknown error"}`);
        setFetchStatus("error");
      }
    };

    // Try to get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          console.log("Geolocation success");
          setFetchMessage("");
          fetchGroups(position);
        },
        (err: GeolocationError) => {
          console.warn("Geolocation failed:", err.message);
          setFetchMessage(`Geolocation failed (${err.message}). Sorting by day.`);
          fetchGroups(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setFetchMessage("Geolocation not supported. Sorting by day.");
      fetchGroups(null);
    }
  }, [supabase]);

  const onSubmit = async (values: SignInFormValues) => {
    setFormError("");
    const normalizedEmail = values.email?.trim() ?? "";
    const group = groups.find((g) => g.id === values.groupId);

    if (!group) {
      const message = "Selected group not found.";
      setFormError(message);
      form.setError("groupId", { type: "manual", message });
      return;
    }

    if (group.format === "In-person") {
      if (!userLocation || group.distance_meters === null) {
        const message =
          "Could not verify your location for this in-person group.";
        setFormError(message);
        form.setError("groupId", { type: "manual", message });
        return;
      }

      if (group.distance_meters > 200) {
        const message = `You are too far away (${Math.round(
          group.distance_meters
        )}m) to sign in. You must be within 200m.`;
        setFormError(message);
        form.setError("groupId", { type: "manual", message });
        return;
      }
    }

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.isNoEmail ? null : normalizedEmail,
          groupId: values.groupId,
          isNoEmail: values.isNoEmail,
          geolocation: userLocation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "An error occurred during sign-in.";
        setFormError(message);
        return;
      }

      switch (data.status) {
        case "CHECKIN_COMPLETE":
          router.push("/complete");
          break;
        case "ORIENTATION_REQUIRED":
        case "NO_EMAIL_INFO_REQUIRED":
          router.push("/orientation");
          break;
        default:
          setFormError("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Sign-in fetch error:", error);
      setFormError("Could not connect to the server. Please try again.");
    }
  };

  const getDayOfWeek = (day: string) => {
    const days: { [key: string]: string } = {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "3.0": "Wednesday",
      "4": "Thursday",
      "4.0": "Thursday",
      "5": "Friday",
      "5.0": "Friday",
      "6": "Saturday",
      "6.0": "Saturday",
      "7": "Sunday",
    };
    return days[day] || "Unknown Day";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 pt-24 bg-gray-50 text-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to the Register
          </CardTitle>
          <CardDescription>
            Please select your group and enter your email to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fetchStatus === "loading" && (
            <p className="text-center text-blue-600">
              Fetching groups... Please wait.
            </p>
          )}

          {fetchMessage && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {fetchMessage}
            </div>
          )}

          {formError && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
              {formError}
            </div>
          )}

          {fetchStatus !== "loading" && (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="group">Select Group</Label>
                <Select
                  value={form.watch("groupId")}
                  onValueChange={(value) => form.setValue("groupId", value)}
                  disabled={groups.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      groups.length > 0
                        ? "Please select a group..."
                        : "No groups found"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} (
                        {group.format === "Online"
                          ? "Online"
                          : group.distance_meters !== null
                            ? `${Math.round(group.distance_meters)}m away`
                            : "In-person"}
                        , {getDayOfWeek(group.meeting_day)} @ {group.meeting_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.groupId && (
                  <p className="text-sm text-red-600">{errors.groupId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isNoEmail}
                  {...form.register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isNoEmail"
                  type="checkbox"
                  className="h-4 w-4 rounded border border-input"
                  {...form.register("isNoEmail")}
                />
                <Label
                  htmlFor="isNoEmail"
                  className="text-sm font-normal text-foreground"
                >
                  I don't have an email address
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full border border-input bg-black text-white hover:bg-black/90"
                disabled={isSubmitting || groups.length === 0}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}