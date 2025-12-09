// src/app/check-in-v2/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    TypeformLayout,
    TypeformHeader,
    TypeformFooter,
    TypeformContent,
} from "@/components/ui/typeform-layout";
import { StepContainer } from "@/components/ui/step-container";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Toaster } from "@/components/ui/toaster";
import { filterGroups, Group } from "@/lib/group-utils";



// Email validation schema
const emailSchema = z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .or(z.literal(""));

const getDayOfWeek = (day: string): string => {
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

export default function CheckInV2Page() {
    const router = useRouter();
    const supabase = createClient();

    // Form state
    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState("");
    const [isNoEmail, setIsNoEmail] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState("");

    // Location state
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [locationDenied, setLocationDenied] = useState(false);

    // Groups state
    const [groups, setGroups] = useState<Group[]>([]);
    const [fetchStatus, setFetchStatus] = useState<"loading" | "success" | "error">("loading");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps = ["email", "group"];
    const totalSteps = steps.length;
    const progressPercent = ((currentStep + 1) / totalSteps) * 100;

    // Try to get location on page load
    useEffect(() => {
        attemptLocationFetch();
    }, []);

    const attemptLocationFetch = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationEnabled(true);
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    fetchGroupsByDistance(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied or failed:", error.message);
                    setLocationEnabled(false);
                    setLocationDenied(true);
                    fetchGroupsByDay();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            console.warn("Geolocation not supported");
            setLocationEnabled(false);
            fetchGroupsByDay();
        }
    };

    const fetchGroupsByDistance = async (lat: number, lon: number) => {
        try {
            setFetchStatus("loading");
            const { data, error } = await supabase.functions.invoke("get-groups-by-distance", {
                body: { latitude: lat, longitude: lon },
            });

            if (error) throw error;

            setGroups(data.groups || []);
            setFetchStatus("success");
        } catch (err: any) {
            console.error("Failed to fetch groups by distance:", err);
            toast.error("Failed to load groups. Please try again.");
            setFetchStatus("error");
        }
    };

    const fetchGroupsByDay = async () => {
        try {
            setFetchStatus("loading");
            const sundayZeroToSaturdaySix = new Date().getUTCDay();
            const isoOneToSeven = ((sundayZeroToSaturdaySix + 6) % 7) + 1;

            const { data, error } = await supabase.functions.invoke("get-groups-by-day", {
                body: { day_of_week: isoOneToSeven },
            });

            if (error) throw error;

            setGroups(data.groups || []);
            setFetchStatus("success");
        } catch (err: any) {
            console.error("Failed to fetch groups by day:", err);
            toast.error("Failed to load groups. Please try again.");
            setFetchStatus("error");
        }
    };

    const handleLocationToggle = () => {
        if (locationEnabled) {
            // Disable location
            setLocationEnabled(false);
            setUserLocation(null);
            fetchGroupsByDay();
            toast.info("Location sorting disabled. Showing groups by day.");
        } else {
            // Enable location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocationEnabled(true);
                        setLocationDenied(false);
                        setUserLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                        fetchGroupsByDistance(position.coords.latitude, position.coords.longitude);
                        toast.success("Location enabled! Showing nearby groups.");
                    },
                    (error) => {
                        console.warn("Location permission denied:", error);
                        toast.error("Location permission denied. Showing groups by day.");
                        setLocationDenied(true);
                        setLocationEnabled(false);
                        fetchGroupsByDay();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            } else {
                toast.error("Geolocation is not supported by your browser");
            }
        }
    };

    const validateCurrentStep = (): boolean => {
        const stepName = steps[currentStep];

        if (stepName === "email") {
            if (!isNoEmail) {
                const result = emailSchema.safeParse(email);
                if (!result.success) {
                    toast.error(result.error.errors[0].message);
                    return false;
                }
                if (email.trim().length === 0) {
                    toast.error("Please enter your email or check 'I don't have an email'");
                    return false;
                }
            }
        }

        if (stepName === "group") {
            if (!selectedGroupId) {
                toast.error("Please select a group");
                return false;
            }

            const group = groups.find((g) => g.id === selectedGroupId);
            if (!group) {
                toast.error("Selected group not found");
                return false;
            }

            // Only validate distance if location is enabled
            if (locationEnabled && group.format === "In-person") {
                if (!userLocation || group.distance_meters === null) {
                    toast.error("Could not verify your location for this in-person group");
                    return false;
                }

                if (group.distance_meters > 200) {
                    toast.error(
                        `You are too far away (${Math.round(group.distance_meters)}m). You must be within 200m.`
                    );
                    return false;
                }
            }
        }

        return true;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: isNoEmail ? null : email.trim(),
                    groupId: selectedGroupId,
                    isNoEmail: isNoEmail,
                    geolocation: userLocation,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "An error occurred during check-in");
                setIsSubmitting(false);
                return;
            }

            switch (data.status) {
                case "CHECKIN_COMPLETE":
                    toast.success("Check-in complete!");
                    router.push("/complete");
                    break;
                case "ORIENTATION_REQUIRED":
                case "NO_EMAIL_INFO_REQUIRED":
                    router.push("/orientation-v2");
                    break;
                default:
                    toast.error("Unexpected response from server");
                    setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Check-in error:", error);
            toast.error("Could not connect to the server. Please try again.");
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const stepName = steps[currentStep];

        switch (stepName) {
            case "email":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-2xl font-semibold text-gray-900 mb-4">
                                    What's your email address?
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    disabled={isNoEmail}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="isNoEmail"
                                    type="checkbox"
                                    checked={isNoEmail}
                                    onChange={(e) => setIsNoEmail(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                                <label htmlFor="isNoEmail" className="text-base text-gray-700">
                                    I don't have an email address
                                </label>
                            </div>

                            <p className="text-sm text-gray-500 mt-4">
                                Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to continue
                            </p>
                        </div>
                    </StepContainer>
                );

            case "group":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-2xl font-semibold text-gray-900 mb-4">
                                    Which group are you attending?
                                </label>

                                {fetchStatus === "loading" && (
                                    <p className="text-base text-gray-600 mb-4">Loading groups...</p>
                                )}

                                {fetchStatus === "success" && groups.length > 0 && (
                                    <SearchableSelect
                                        value={selectedGroupId}
                                        onValueChange={(value) => {
                                            setSelectedGroupId(value);
                                            // Auto-advance after selection with delay
                                            setTimeout(() => {
                                                handleNext();
                                            }, 200);
                                        }}
                                        options={filterGroups(groups, locationEnabled).map((g) => ({
                                            value: g.id,
                                            label: `${g.name} (${g.format}, ${getDayOfWeek(g.meeting_day)} @ ${g.meeting_time})`,
                                            distance: locationEnabled ? g.distance_meters : null,
                                        }))}
                                        placeholder="Search for your group..."
                                    />
                                )}

                                {fetchStatus === "success" && groups.length === 0 && (
                                    <p className="text-base text-gray-600">No groups available.</p>
                                )}

                                {fetchStatus === "error" && (
                                    <p className="text-base text-red-600">Failed to load groups.</p>
                                )}
                            </div>

                            {/* Location toggle button */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleLocationToggle}
                                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                >
                                    {locationEnabled ? (
                                        <>
                                            🚫 <span>Disable Location Sorting</span>
                                        </>
                                    ) : (
                                        <>
                                            📍 <span>Enable Location for Nearby Groups</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {locationEnabled && userLocation && (
                                <p className="text-xs text-gray-500">
                                    Showing groups sorted by distance from your location
                                </p>
                            )}

                            {!locationEnabled && (
                                <p className="text-xs text-gray-500">
                                    Showing groups sorted by day of the week
                                </p>
                            )}
                        </div>
                    </StepContainer>
                );

            default:
                return null;
        }
    };

    return (
        <TypeformLayout>
            <Toaster />

            {/* Header with Progress Bar */}
            <TypeformHeader>
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-semibold text-gray-900">Check In</h1>
                    <span className="text-sm text-gray-600">
                        {currentStep + 1} of {totalSteps}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </TypeformHeader>

            {/* Content */}
            <TypeformContent>{renderStep()}</TypeformContent>

            {/* Footer with Navigation */}
            <TypeformFooter>
                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        variant="outline"
                        className="min-w-[100px]"
                    >
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting || fetchStatus === "loading"}
                        className="min-w-[100px] bg-black hover:bg-gray-800"
                    >
                        {currentStep === totalSteps - 1
                            ? isSubmitting
                                ? "Checking In..."
                                : "Check In"
                            : "Next"}
                    </Button>
                </div>
            </TypeformFooter>
        </TypeformLayout>
    );
}
