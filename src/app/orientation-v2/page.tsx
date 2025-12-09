// src/app/orientation-v2/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { FormToggleGroup } from "@/components/ui/form-toggle-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    TypeformLayout,
    TypeformHeader,
    TypeformFooter,
    TypeformContent,
} from "@/components/ui/typeform-layout";
import { StepContainer } from "@/components/ui/step-container";
import { Toaster } from "@/components/ui/toaster";
import { generateAvatar } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";

// Dropdown Options (same as before)
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];
const ETHNICITIES = ["Black", "Coloured", "Indian", "White", "Asian", "Prefer not to say", "Other"];
const REASONS_FOR_ATTENDING = [
    "Seeking Recovery",
    "Addiction Recovery",
    "Supporter Recovery",
    "Other",
];
const SOURCES_OF_DISCOVERY = [
    "Social Media",
    "Google Search",
    "Friend",
    "Family",
    "Church",
    "Other",
];
const SUBSTANCE_BEHAVIOURS = [
    "Alcohol",
    "Cigarettes",
    "Cocaine",
    "Crack Cocaine",
    "Crystal Meth",
    "Drugs",
    "Ecstasy",
    "Gambling",
    "Heroin",
    "Kat",
    "Nicotine",
    "Pain medication",
    "Pornography",
    "Prostitutes",
    "Weed",
    "Food",
    "Other",
];
const TREATMENT_FACILITIES = [
    "None",
    "AC Wellness",
    "ACOC",
    "Akeso",
    "AMCUP",
    "ARCA",
    "Bethal",
    "Careline",
    "Cedars",
    "Havon of Rest",
    "Healing Wings",
    "Judo",
    "Lulama",
    "Palm Gardens",
    "Riverview Manor",
    "Sanca Horizon",
    "SCRC",
    "St Josephs",
    "Wedge Gardens",
    "White River",
    "Other",
];
const PREVIOUS_GROUPS = [
    "None",
    "Project Exodus",
    "Alcoholics Anonymous (AA)",
    "Narcotics Anonymous (NA)",
    "SMART Recovery",
    "Gamblers Anonymous",
    "Sex Addicts Anonymous",
    "Other",
];
const GOALS_FOR_ATTENDING = [
    "Community",
    "Coping Skills",
    "Prayer",
    "Accountability",
    "Supporter Skills",
    "A Better Life",
    "Sobriety",
    "A Better Relationship with God",
    "Healing",
    "Knowledge",
    "Other",
];

interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    ethnicity: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactEmail: string;
    reasonForAttending: string;
    sourceOfDiscovery: string;
    problematicSubstances: string;
    problematicSubstancesOther: string;
    currentlyInTreatment: string;
    currentTreatmentProgramme: string;
    previousTreatment: string;
    previousTreatmentProgrammes: string;
    previousRecoveryGroups: string;
    previousRecoveryGroupsNames: string;
    goalsForAttending: string;
    goalsForAttendingOther: string;
    anythingElseImportant: string;
    howElseHelp: string;
    consentWhatsapp: boolean;
    consentConfidentiality: boolean;
    consentAnonymity: boolean;
    consentLiability: boolean;
    consentVoluntary: boolean;
}

const INITIAL_FORM_DATA: FormData = {
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    ethnicity: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactEmail: "",
    reasonForAttending: "",
    sourceOfDiscovery: "",
    problematicSubstances: "",
    problematicSubstancesOther: "",
    currentlyInTreatment: "",
    currentTreatmentProgramme: "",
    previousTreatment: "",
    previousTreatmentProgrammes: "",
    previousRecoveryGroups: "",
    previousRecoveryGroupsNames: "",
    goalsForAttending: "",
    goalsForAttendingOther: "",
    anythingElseImportant: "",
    howElseHelp: "",
    consentWhatsapp: false,
    consentConfidentiality: false,
    consentAnonymity: false,
    consentLiability: false,
    consentVoluntary: false,
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function OrientationV2Page() {
    const router = useRouter();
    const supabase = createClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [isNoEmailMode, setIsNoEmailMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isHydrated, setIsHydrated] = useState(false);

    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

    // Ref to access latest form data in closures (like setTimeout)
    const formDataRef = useRef(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Hydrate from localStorage and Cookies
    useEffect(() => {
        const status = Cookies.get("app_status");
        const email = Cookies.get("user_email");

        if (status === "NO_EMAIL_INFO_REQUIRED") {
            setIsNoEmailMode(true);
        }

        if (email) {
            setUserEmail(email);
            setAvatarUrl(generateAvatar(email));
        }

        // Load from localStorage
        const savedData = localStorage.getItem("orientation_form_data");
        const savedStep = localStorage.getItem("orientation_current_step");

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData((prev) => ({ ...prev, ...parsedData }));
            } catch (e) {
                console.error("Failed to parse saved form data", e);
            }
        }

        if (savedStep) {
            setCurrentStep(parseInt(savedStep, 10));
        }

        setIsHydrated(true);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("orientation_form_data", JSON.stringify(formData));
            localStorage.setItem("orientation_current_step", currentStep.toString());
        }
    }, [formData, currentStep, isHydrated]);

    const steps = [
        "firstName",
        "lastName",
        "phone",
        "dateOfBirth",
        "gender",
        "ethnicity",
        "reasonForAttending",
        "emergencyContactName",
        "emergencyContactPhone",
        "emergencyContactEmail",
        "sourceOfDiscovery",
        "problematicSubstances",
        "problematicSubstancesOther",
        "currentlyInTreatment",
        "currentTreatmentProgramme",
        "previousTreatment",
        "previousTreatmentProgrammes",
        "previousRecoveryGroups",
        "previousRecoveryGroupsNames",
        "goalsForAttending",
        "goalsForAttendingOther",
        "anythingElseImportant",
        "howElseHelp",
        "consents",
    ];

    const totalSteps = steps.length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSelectChange = (name: string) => (value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-advance after 200ms delay for visual feedback
        setTimeout(() => {
            handleNext();
        }, 200);
    };

    const validateCurrentStep = (): boolean => {
        const stepName = steps[currentStep];
        const data = formDataRef.current;

        switch (stepName) {
            case "firstName":
                if (!data.firstName.trim()) {
                    toast.error("Please enter your first name");
                    return false;
                }
                break;
            case "lastName":
                if (!data.lastName.trim()) {
                    toast.error("Please enter your last name");
                    return false;
                }
                break;
            case "phone":
                if (!data.phone.trim()) {
                    toast.error("Please enter your phone number");
                    return false;
                }
                break;
            case "dateOfBirth":
                if (!data.dateOfBirth) {
                    toast.error("Please select your date of birth");
                    return false;
                }
                break;
            case "gender":
                if (!data.gender) {
                    toast.error("Please select your gender");
                    return false;
                }
                break;
            case "ethnicity":
                if (!data.ethnicity) {
                    toast.error("Please select your ethnicity");
                    return false;
                }
                break;
            case "reasonForAttending":
                if (!data.reasonForAttending) {
                    toast.error("Please select your reason for attending");
                    return false;
                }
                break;
            case "emergencyContactName":
                if (!data.emergencyContactName.trim()) {
                    toast.error("Please enter emergency contact name");
                    return false;
                }
                break;
            case "emergencyContactPhone":
                if (!data.emergencyContactPhone.trim()) {
                    toast.error("Please enter emergency contact phone");
                    return false;
                }
                break;
            case "emergencyContactEmail":
                if (!data.emergencyContactEmail.trim()) {
                    toast.error("Please enter emergency contact email");
                    return false;
                }
                break;
            case "sourceOfDiscovery":
                if (!data.sourceOfDiscovery) {
                    toast.error("Please select where you heard about us");
                    return false;
                }
                break;
            case "problematicSubstances":
                if (!data.problematicSubstances) {
                    toast.error("Please select a substance or behavior");
                    return false;
                }
                break;
            case "problematicSubstancesOther":
                if (data.problematicSubstances === "Other" && !data.problematicSubstancesOther.trim()) {
                    toast.error("Please specify the substance or behavior");
                    return false;
                }
                break;
            case "currentlyInTreatment":
                if (!data.currentlyInTreatment) {
                    toast.error("Please select an option");
                    return false;
                }
                break;
            case "currentTreatmentProgramme":
                if (data.currentlyInTreatment === "Yes" && !data.currentTreatmentProgramme.trim()) {
                    toast.error("Please enter your current treatment programme");
                    return false;
                }
                break;
            case "previousTreatment":
                if (!data.previousTreatment) {
                    toast.error("Please select an option");
                    return false;
                }
                break;
            case "previousTreatmentProgrammes":
                if (data.previousTreatment === "Yes" && !data.previousTreatmentProgrammes) {
                    toast.error("Please select a treatment facility");
                    return false;
                }
                break;
            case "previousRecoveryGroups":
                if (!data.previousRecoveryGroups) {
                    toast.error("Please select an option");
                    return false;
                }
                break;
            case "previousRecoveryGroupsNames":
                if (data.previousRecoveryGroups === "Yes" && !data.previousRecoveryGroupsNames) {
                    toast.error("Please select a recovery group");
                    return false;
                }
                break;
            case "goalsForAttending":
                if (!data.goalsForAttending) {
                    toast.error("Please select your goals");
                    return false;
                }
                break;
            case "goalsForAttendingOther":
                if (data.goalsForAttending === "Other" && !data.goalsForAttendingOther.trim()) {
                    toast.error("Please specify your goals");
                    return false;
                }
                break;
            case "anythingElseImportant":
                if (!data.anythingElseImportant.trim()) {
                    toast.error("Please enter any important information");
                    return false;
                }
                break;
            case "howElseHelp":
                if (!data.howElseHelp.trim()) {
                    toast.error("Please let us know how else we can help");
                    return false;
                }
                break;
            case "consents":
                if (
                    !data.consentConfidentiality ||
                    !data.consentAnonymity ||
                    !data.consentLiability ||
                    !data.consentVoluntary
                ) {
                    toast.error("Please agree to all required consents");
                    return false;
                }
                break;
        }

        return true;
    };

    const shouldShowStep = (stepName: string, data: FormData): boolean => {
        switch (stepName) {
            case "problematicSubstancesOther":
                return data.problematicSubstances === "Other";
            case "currentTreatmentProgramme":
                return data.currentlyInTreatment === "Yes";
            case "previousTreatmentProgrammes":
                return data.previousTreatment === "Yes";
            case "previousRecoveryGroupsNames":
                return data.previousRecoveryGroups === "Yes";
            case "goalsForAttendingOther":
                return data.goalsForAttending === "Other";
            default:
                return true;
        }
    };

    const submitStepData = async (stepName: string, data: FormData) => {
        const memberId = Cookies.get("member_id");
        const groupId = Cookies.get("pending_group_id");
        const orientationId = Cookies.get("orientation_id");

        if (!memberId || !groupId || !orientationId) {
            console.error("Missing required IDs for submission");
            toast.error("Missing user session information. Please restart the check-in process.");
            return false;
        }

        try {
            const response = await fetch("/api/orientation/update-step", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stepName,
                    memberId,
                    groupId,
                    orientationId,
                    data,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save step data");
            }

            return true;
        } catch (error) {
            console.error("Error saving step data:", error);
            toast.error("Failed to save progress. Please try again.");
            return false;
        }
    };

    const handleNext = async () => {
        if (isSubmitting) return;

        if (validateCurrentStep()) {
            setIsSubmitting(true);
            const data = formDataRef.current;
            const currentStepName = steps[currentStep];

            // Submit current step data
            const success = await submitStepData(currentStepName, data);

            if (!success) {
                setIsSubmitting(false);
                return;
            }

            // If this was the last step (consents), handle completion
            if (currentStepName === "consents") {
                await handleFinalCompletion();
                return;
            }

            // Calculate next step
            let nextStep = currentStep + 1;
            while (nextStep < totalSteps && !shouldShowStep(steps[nextStep], data)) {
                nextStep++;
            }

            if (nextStep < totalSteps) {
                setCurrentStep(nextStep);
            } else {
                // Should not happen if logic is correct, but safe fallback
                await handleFinalCompletion();
            }

            setIsSubmitting(false);
        }
    };

    const handlePrevious = () => {
        const data = formDataRef.current;
        let prevStep = currentStep - 1;
        while (prevStep >= 0 && !shouldShowStep(steps[prevStep], data)) {
            prevStep--;
        }

        if (prevStep >= 0) {
            setCurrentStep(prevStep);
        }
    };

    const handleFinalCompletion = async () => {
        setShowConfetti(true);

        // Clear local storage
        localStorage.removeItem("orientation_form_data");
        localStorage.removeItem("orientation_current_step");

        // Set cookies for completion
        Cookies.set("app_status", "CHECKIN_COMPLETE");
        Cookies.remove("member_id");
        Cookies.remove("pending_group_id");
        Cookies.remove("orientation_id");

        setTimeout(() => {
            router.push("/complete");
        }, 3000);
    };

    const renderStep = () => {
        const stepName = steps[currentStep];
        console.log("renderStep called - currentStep:", currentStep, "stepName:", stepName);

        switch (stepName) {
            case "firstName":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your first name? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "lastName":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your last name? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "phone":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your phone number? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "dateOfBirth":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your date of birth? <span className="text-red-600">*</span>
                            </label>
                            <DatePicker
                                date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                                onDateChange={(date) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        dateOfBirth: date
                                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                            : "",
                                    }));
                                }}
                                placeholder="Select your date of birth"
                            />
                        </div>
                    </StepContainer>
                );

            case "gender":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your gender? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.gender}
                                onValueChange={handleSelectChange("gender")}
                                options={GENDERS}
                            />
                        </div>
                    </StepContainer>
                );

            case "ethnicity":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your ethnicity? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.ethnicity}
                                onValueChange={handleSelectChange("ethnicity")}
                                options={ETHNICITIES}
                            />
                        </div>
                    </StepContainer>
                );

            case "reasonForAttending":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Why are you attending today? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.reasonForAttending}
                                onValueChange={handleSelectChange("reasonForAttending")}
                                options={REASONS_FOR_ATTENDING}
                            />
                        </div>
                    </StepContainer>
                );

            case "emergencyContactName":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency Contact Name <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                placeholder="Name"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "emergencyContactPhone":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency Contact Phone <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                                placeholder="Phone number"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "emergencyContactEmail":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency Contact Email <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactEmail"
                                value={formData.emergencyContactEmail}
                                onChange={handleChange}
                                placeholder="Email address"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "sourceOfDiscovery":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                How did you hear about us? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.sourceOfDiscovery}
                                onValueChange={handleSelectChange("sourceOfDiscovery")}
                                options={SOURCES_OF_DISCOVERY}
                            />
                        </div>
                    </StepContainer>
                );

            case "problematicSubstances":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Which substances or behaviors are problematic for you?{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.problematicSubstances}
                                onValueChange={handleSelectChange("problematicSubstances")}
                                options={SUBSTANCE_BEHAVIOURS}
                            />
                        </div>
                    </StepContainer>
                );

            case "problematicSubstancesOther":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Please specify the substance or behavior <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="problematicSubstancesOther"
                                value={formData.problematicSubstancesOther}
                                onChange={handleChange}
                                placeholder="Specify here"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "currentlyInTreatment":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Are you currently in a treatment programme? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.currentlyInTreatment}
                                onValueChange={handleSelectChange("currentlyInTreatment")}
                                options={["No", "Yes"]}
                            />
                        </div>
                    </StepContainer>
                );

            case "currentTreatmentProgramme":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Which programme are you currently in? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="currentTreatmentProgramme"
                                value={formData.currentTreatmentProgramme}
                                onChange={handleChange}
                                placeholder="Programme name"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "previousTreatment":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Have you ever been in a treatment programme? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.previousTreatment}
                                onValueChange={handleSelectChange("previousTreatment")}
                                options={["No", "Yes"]}
                            />
                        </div>
                    </StepContainer>
                );

            case "previousTreatmentProgrammes":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Which treatment programmes have you been in?{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.previousTreatmentProgrammes}
                                onValueChange={handleSelectChange("previousTreatmentProgrammes")}
                                options={TREATMENT_FACILITIES}
                            />
                        </div>
                    </StepContainer>
                );

            case "previousRecoveryGroups":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Have you attended Recovery Groups before? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.previousRecoveryGroups}
                                onValueChange={handleSelectChange("previousRecoveryGroups")}
                                options={["No", "Yes"]}
                            />
                        </div>
                    </StepContainer>
                );

            case "previousRecoveryGroupsNames":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Which recovery groups have you attended? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.previousRecoveryGroupsNames}
                                onValueChange={handleSelectChange("previousRecoveryGroupsNames")}
                                options={PREVIOUS_GROUPS}
                            />
                        </div>
                    </StepContainer>
                );

            case "goalsForAttending":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What do you hope to achieve by attending? <span className="text-red-600">*</span>
                            </label>
                            <FormToggleGroup
                                value={formData.goalsForAttending}
                                onValueChange={handleSelectChange("goalsForAttending")}
                                options={GOALS_FOR_ATTENDING}
                            />
                        </div>
                    </StepContainer>
                );

            case "goalsForAttendingOther":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Please specify your goals <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="goalsForAttendingOther"
                                value={formData.goalsForAttendingOther}
                                onChange={handleChange}
                                placeholder="Specify here"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "anythingElseImportant":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Is there anything else important we should know?{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="anythingElseImportant"
                                value={formData.anythingElseImportant}
                                onChange={handleChange}
                                placeholder="Enter details"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "howElseHelp":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                How else can we help you? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="howElseHelp"
                                value={formData.howElseHelp}
                                onChange={handleChange}
                                placeholder="Enter details"
                                className="h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    </StepContainer>
                );

            case "consents":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold">Please review and agree to the following:</h3>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        name="consentWhatsapp"
                                        checked={formData.consentWhatsapp}
                                        onChange={handleChange}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label className="text-gray-700">
                                        I consent to being added to the WhatsApp group.
                                    </label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        name="consentConfidentiality"
                                        checked={formData.consentConfidentiality}
                                        onChange={handleChange}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label className="text-gray-700">
                                        I agree to maintain confidentiality regarding who I see and what is shared.
                                    </label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        name="consentAnonymity"
                                        checked={formData.consentAnonymity}
                                        onChange={handleChange}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label className="text-gray-700">
                                        I understand that anonymity is a core principle of this group.
                                    </label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        name="consentLiability"
                                        checked={formData.consentLiability}
                                        onChange={handleChange}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label className="text-gray-700">
                                        I release the group and its facilitators from any liability.
                                    </label>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        name="consentVoluntary"
                                        checked={formData.consentVoluntary}
                                        onChange={handleChange}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label className="text-gray-700">
                                        I am attending this group voluntarily.
                                    </label>
                                </div>
                            </div>
                        </div>
                    </StepContainer>
                );

            default:
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Debug: Unknown step "{stepName}"
                            </label>
                            <p className="text-base text-gray-600">
                                Current step index: {currentStep}
                            </p>
                            <p className="text-base text-gray-600">
                                Step name: {stepName}
                            </p>
                            <p className="text-sm text-red-600">
                                This step is not implemented in the renderStep switch statement.
                            </p>
                        </div>
                    </StepContainer>
                );
        }
    };

    return (
        <TypeformLayout>
            {showConfetti && <Confetti />}
            <Toaster />
            <TypeformHeader>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        <h1 className="text-lg font-semibold text-gray-900">Orientation</h1>
                    </div>
                    {avatarUrl && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
                            <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
                        </div>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-black h-1.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    />
                </div>
            </TypeformHeader>

            <TypeformContent>
                {/* <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
                    <p className="text-black font-bold">DEBUG: TypeformContent is rendering</p>
                    <p className="text-black">Current step: {currentStep}</p>
                    <p className="text-black">Step name: {steps[currentStep]}</p>
                </div> */}
                <div className="relative">
                    {renderStep()}
                </div>
            </TypeformContent>

            <TypeformFooter>
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className={currentStep === 0 ? "invisible" : ""}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="bg-black text-white hover:bg-gray-800"
                    >
                        {currentStep === totalSteps - 1 ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
                    </Button>
                </div>
            </TypeformFooter>
        </TypeformLayout>
    );
}
