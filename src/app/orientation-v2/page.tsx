// src/app/orientation-v2/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

export default function OrientationV2Page() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isNoEmailMode, setIsNoEmailMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const [formData, setFormData] = useState<FormData>({
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
    });

    // Ref to access latest form data in closures (like setTimeout)
    const formDataRef = useRef(formData);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

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
    }, []);

    // Show confetti when user enters their first name
    useEffect(() => {
        if (formData.firstName && !showConfetti && currentStep === 0) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [formData.firstName, currentStep]);

    // All steps definition
    const getAllSteps = () => {
        const baseSteps = [
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
        ];

        const conditionalSteps = [];

        // Add conditional step: If problematicSubstances is "Other"
        if (formData.problematicSubstances === "Other") {
            conditionalSteps.push("problematicSubstancesOther");
        }

        conditionalSteps.push("currentlyInTreatment");

        // Add conditional step: If currentlyInTreatment is "Yes"
        if (formData.currentlyInTreatment === "Yes") {
            conditionalSteps.push("currentTreatmentProgramme");
        }

        conditionalSteps.push("previousTreatment");

        // Add conditional step: If previousTreatment is "Yes"
        if (formData.previousTreatment === "Yes") {
            conditionalSteps.push("previousTreatmentProgrammes");
        }

        conditionalSteps.push("previousRecoveryGroups");

        // Add conditional step: If previousRecoveryGroups is "Yes"
        if (formData.previousRecoveryGroups === "Yes") {
            conditionalSteps.push("previousRecoveryGroupsNames");
        }

        conditionalSteps.push("goalsForAttending");

        // Add conditional step: If goalsForAttending is "Other"
        if (formData.goalsForAttending === "Other") {
            conditionalSteps.push("goalsForAttendingOther");
        }

        conditionalSteps.push("anythingElseImportant");
        conditionalSteps.push("howElseHelp");
        conditionalSteps.push("consents");

        return [...baseSteps, ...conditionalSteps];
    };

    const steps = getAllSteps();
    const totalSteps = steps.length;
    const progressPercent = ((currentStep + 1) / totalSteps) * 100;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
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
                if (!data.problematicSubstancesOther.trim()) {
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
                if (!data.currentTreatmentProgramme.trim()) {
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
                if (!data.previousTreatmentProgrammes) {
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
                if (!data.previousRecoveryGroupsNames) {
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
                if (!data.goalsForAttendingOther.trim()) {
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
            const response = await fetch("/api/orientation/part2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || "An error occurred during submission");
                setIsSubmitting(false);
                return;
            }

            toast.success("Registration complete!");
            router.push("/complete");
        } catch (err) {
            toast.error("Could not connect to the server. Please try again.");
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const stepName = steps[currentStep];

        switch (stepName) {
            case "firstName":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your first name? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                autoComplete="given-name"
                            />
                        </div>
                    </StepContainer>
                );

            case "lastName":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                And your last name? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                autoComplete="family-name"
                            />
                        </div>
                    </StepContainer>
                );

            case "phone":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                What's your phone number? <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                autoComplete="tel"
                            />
                        </div>
                    </StepContainer>
                );

            case "dateOfBirth":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                When were you born? <span className="text-red-600">*</span>
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
                                Why are you attending? <span className="text-red-600">*</span>
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
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency contact: Full name <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactName"
                                type="text"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                placeholder="Enter emergency contact name"
                            />
                        </div>
                    </StepContainer>
                );

            case "emergencyContactPhone":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency contact: Phone number <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactPhone"
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                                placeholder="Enter emergency contact phone"
                            />
                        </div>
                    </StepContainer>
                );

            case "emergencyContactEmail":
                return (
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Emergency contact: Email address <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="emergencyContactEmail"
                                type="email"
                                value={formData.emergencyContactEmail}
                                onChange={handleChange}
                                placeholder="Enter emergency contact email"
                            />
                        </div>
                    </StepContainer>
                );

            case "sourceOfDiscovery":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Where did you hear about us? <span className="text-red-600">*</span>
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
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Please specify: <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="problematicSubstancesOther"
                                type="text"
                                value={formData.problematicSubstancesOther}
                                onChange={handleChange}
                                placeholder="Enter the substance or behavior"
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
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Which treatment programme are you currently in?{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="currentTreatmentProgramme"
                                type="text"
                                value={formData.currentTreatmentProgramme}
                                onChange={handleChange}
                                placeholder="Enter treatment programme name"
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
                                Which Recovery groups have you attended? <span className="text-red-600">*</span>
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
                    <StepContainer stepKey={currentStep} onEnterPress={handleNext}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Please specify your goals: <span className="text-red-600">*</span>
                            </label>
                            <Input
                                name="goalsForAttendingOther"
                                type="text"
                                value={formData.goalsForAttendingOther}
                                onChange={handleChange}
                                placeholder="Enter your goals"
                            />
                        </div>
                    </StepContainer>
                );

            case "anythingElseImportant":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                Is there anything important that we should know?{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                name="anythingElseImportant"
                                value={formData.anythingElseImportant}
                                onChange={handleChange}
                                placeholder="Share anything we should be aware of..."
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-lg shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </StepContainer>
                );

            case "howElseHelp":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-4">
                            <label className="block text-2xl font-semibold text-gray-900">
                                How else would you like to be helped? <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                name="howElseHelp"
                                value={formData.howElseHelp}
                                onChange={handleChange}
                                placeholder="Let us know how we can support you..."
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-lg shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </StepContainer>
                );

            case "consents":
                return (
                    <StepContainer stepKey={currentStep}>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Review and accept consents
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        id="consentWhatsapp"
                                        name="consentWhatsapp"
                                        type="checkbox"
                                        checked={formData.consentWhatsapp}
                                        onChange={handleChange}
                                        className="h-5 w-5 mt-1 rounded border-gray-300"
                                    />
                                    <label htmlFor="consentWhatsapp" className="text-base text-gray-700">
                                        I consent to be added to a WhatsApp Group. (Optional)
                                    </label>
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        id="consentConfidentiality"
                                        name="consentConfidentiality"
                                        type="checkbox"
                                        checked={formData.consentConfidentiality}
                                        onChange={handleChange}
                                        className="h-5 w-5 mt-1 rounded border-gray-300"
                                    />
                                    <label htmlFor="consentConfidentiality" className="text-base text-gray-700">
                                        I agree to the <span className="font-bold">Confidentiality</span> guidelines.{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        id="consentAnonymity"
                                        name="consentAnonymity"
                                        type="checkbox"
                                        checked={formData.consentAnonymity}
                                        onChange={handleChange}
                                        className="h-5 w-5 mt-1 rounded border-gray-300"
                                    />
                                    <label htmlFor="consentAnonymity" className="text-base text-gray-700">
                                        I agree to the <span className="font-bold">Anonymity</span> guidelines.{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        id="consentLiability"
                                        name="consentLiability"
                                        type="checkbox"
                                        checked={formData.consentLiability}
                                        onChange={handleChange}
                                        className="h-5 w-5 mt-1 rounded border-gray-300"
                                    />
                                    <label htmlFor="consentLiability" className="text-base text-gray-700">
                                        I agree to the <span className="font-bold">Liability</span> waiver.{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                </div>
                                <div className="flex items-start gap-3">
                                    <input
                                        id="consentVoluntary"
                                        name="consentVoluntary"
                                        type="checkbox"
                                        checked={formData.consentVoluntary}
                                        onChange={handleChange}
                                        className="h-5 w-5 mt-1 rounded border-gray-300"
                                    />
                                    <label htmlFor="consentVoluntary" className="text-base text-gray-700">
                                        I confirm my attendance is <span className="font-bold">Voluntary</span>.{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                </div>
                            </div>
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
            {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

            {/* Header with Progress Bar */}
            <TypeformHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {avatarUrl && formData.firstName && (
                            <>
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="h-10 w-10 rounded-full"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Welcome, {formData.firstName}! 👋
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            {currentStep + 1} of {totalSteps}
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
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
                        disabled={isSubmitting}
                        className="min-w-[100px] bg-black hover:bg-gray-800"
                    >
                        {currentStep === totalSteps - 1
                            ? isSubmitting
                                ? "Submitting..."
                                : "Submit"
                            : "Next"}
                    </Button>
                </div>
            </TypeformFooter>
        </TypeformLayout>
    );
}
