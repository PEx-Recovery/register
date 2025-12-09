// src/lib/glide-sync.ts
import * as glide from "@glideapps/tables";

// Environment variables
const GLIDE_TOKEN = process.env.GLIDE_API_TOKEN || "";
const GLIDE_APP_ID = process.env.GLIDE_APP_ID || "PggUGcDJWx08ijglpUc7";
const ENABLE_GLIDE_SYNC = process.env.ENABLE_GLIDE_SYNC !== "false";

// Glide Table Definitions
const briV1MeetingRegisterBigTable = glide.table({
    token: GLIDE_TOKEN,
    app: GLIDE_APP_ID,
    table: "native-table-838bc294-2509-40a6-b1b8-a4e2a075a278",
    columns: {
        fullName: { type: "string", name: "Name" },
        gender: { type: "string", name: "AEp1A" },
        age: { type: "string", name: "Qdhoi" },
        ethnicity: { type: "string", name: "dESvz" },
        type: { type: "string", name: "JFgGD" },
        dob: { type: "date-time", name: "iPrrx" },
        memberRid: { type: "string", name: "JAAfG" },
        groupRid: { type: "string", name: "GFd3n" },
        dateCreated: { type: "date-time", name: "LkjSw" },
        dateCreatedBy: { type: "email-address", name: "Vcq2n" },
        dateRegistered: { type: "date-time", name: "mU52w" },
        dateMonthNumber: { type: "string", name: "XY4aH" },
        dateWeekNumber: { type: "string", name: "tzHBr" }
    }
});

const briV1OrientationRegisterBigTable = glide.table({
    token: GLIDE_TOKEN,
    app: GLIDE_APP_ID,
    table: "native-table-f91ade1c-62de-4847-8f08-c08aa7f5ca03",
    columns: {
        personalMemberRid: { type: "string", name: "GXhPU" },
        statusComplete: { type: "boolean", name: "Baj7x" },
        personalFirstName: { type: "string", name: "Name" },
        personalLastName: { type: "string", name: "XeCHw" },
        personalPhone: { type: "phone-number", name: "2WzPt" },
        personalEmail: { type: "email-address", name: "Jp86G" },
        personalGender: { type: "string", name: "2OBsx" },
        personalEthnicity: { type: "string", name: "RBQE9" },
        personalDob: { type: "date-time", name: "5nl60" },
        emergencyContactFullName: { type: "string", name: "0XOGC" },
        emergencyContactPhone: { type: "phone-number", name: "DOkGp" },
        emergencyContactEmail: { type: "email-address", name: "SrTT4" },
        questionsReasonForAttending: { type: "string", name: "at4SP" },
        questionsWhereDidYouHearAboutUs: { type: "string", name: "qGAlX" },
        questionsWhichSubstancesAndOrBehavioursAreProblematicForYou: { type: "string", name: "Y2bW7" },
        questionsAreYouCurrentlyInATreatmentProgramme: { type: "string", name: "BZLRS" },
        questionsWhichTreatmentProgrammeAreYouCurrentlyIn: { type: "string", name: "7TlsY" },
        questionsHaveYouEverBeenInATreatmentProgramme: { type: "string", name: "drAEE" },
        questionsWhichTreatmentProgrammeSHaveYouBeenIn: { type: "string", name: "iprLc" },
        questionsHaveYouAttendedRecoveryGroupsBefore: { type: "string", name: "JRVOM" },
        questionsWhichRecoveryGroupsHaveYouAttended: { type: "string", name: "Z8iQR" },
        questionsWhatDoYouHopeToAchieveByAttendingTheRecoveryGroup: { type: "string", name: "M5KZ6" },
        questionsIsThereAnythingImportantThatWeShouldKnowAboutYouAndYourRecoveryJourney: { type: "string", name: "14R0J" },
        questionsHowElseWouldYouLikeToBeHelped: { type: "string", name: "s5GvS" },
        consentWhatsappGroup: { type: "boolean", name: "l6tPr" },
        consentConfidentiality: { type: "boolean", name: "BBA49" },
        consentAnonymity: { type: "boolean", name: "Gy2b9" },
        consentLiability: { type: "boolean", name: "9n1l5" },
        consentVoluntary: { type: "boolean", name: "vbhT2" },
        affiliateRid: { type: "string", name: "DXmR4" },
        groupRid: { type: "string", name: "af2ux" },
        dateCreated: { type: "date-time", name: "qVmeN" },
        dateOrientated: { type: "date-time", name: "hOGr9" }
    }
});

const briCirV1MembersTable = glide.table({
    token: GLIDE_TOKEN,
    app: GLIDE_APP_ID,
    table: "native-table-z5mhBSb6do8v8BNN3DMa",
    columns: {
        personalPhoto: { type: "image-uri", name: "hlaSe" },
        personalFirstName: { type: "string", name: "Name" },
        personalLastName: { type: "string", name: "MgZqr" },
        personalEmail: { type: "email-address", name: "aArDw" },
        personalPhoneRaw: { type: "phone-number", name: "PnCjh" },
        idStamp: { type: "number", name: "DGANE" },
        cacheProgrammeRid: { type: "string", name: "NAT1Y" },
        cacheSendModulesToFacilitator: { type: "boolean", name: "qYn25" },
        cacheRequestSponsorship: { type: "boolean", name: "FDTSP" },
        cacheSponsorshipContribution: { type: "number", name: "UzFkU" },
        cacheSponsorshipMotivation: { type: "string", name: "mwyDk" },
        cacheSponsorshipRequestedBy: { type: "email-address", name: "GPFC4" },
        cacheApproveSponsorship: { type: "boolean", name: "DRVzh" },
        cacheSponsorshipAgreedAmount: { type: "number", name: "MaK2E" },
        cacheSponsorshipApprovedBy: { type: "email-address", name: "LVBXq" },
        cacheSponsorshipAgreementDate: { type: "string", name: "gxNRN" },
        cacheDiceRollFromUserProfile: { type: "number", name: "AASa0" },
        dateCreated: { type: "date-time", name: "OQSAU" },
        dateCreatedBy: { type: "email-address", name: "Jb9Og" },
        dateModified: { type: "date-time", name: "eByvQ" },
        dateModifiedBy: { type: "email-address", name: "4gooV" },
        countryName: { type: "string", name: "9KS8c" },
        viewsGroupsFinder: { type: "string", name: "khjwz" },
        viewsLocation: { type: "string", name: "srhjz" },
        viewsJourney: { type: "string", name: "tBJj9" },
        viewsProgrammes: { type: "string", name: "mg8gn" },
        orientationRid: { type: "string", name: "eXg3F" },
        orientationAffiliiateRid: { type: "string", name: "x0IEl" },
        orientationGroupRid: { type: "string", name: "DkzH8" },
        orientationComplete: { type: "boolean", name: "2ZGHp" },
        orientationFollowUpCount: { type: "number", name: "74Tmu" }
    }
});

// Helper Functions
function calculateAge(dateOfBirth: string | null): string {
    if (!dateOfBirth) return "";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
}

function getMonthNumber(date: string): string {
    return new Date(date).getMonth() + 1 + "";
}

function getWeekNumber(date: string): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo.toString();
}

// TypeScript Interfaces
interface AttendanceData {
    firstName: string;
    lastName: string;
    gender?: string;
    dateOfBirth?: string;
    ethnicity?: string;
    memberId: string;
    groupId: string;
    attendanceDate: string;
    reasonForAttending?: string;
    email?: string;
}

interface OrientationData {
    memberId: string;
    groupId: string;
    groupRowId?: string | null; // Glide Row ID for the group
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    ethnicity?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactEmail?: string;
    reasonForAttending?: string;
    sourceOfDiscovery?: string;
    problematicSubstances?: string;
    problematicSubstancesOther?: string;
    currentlyInTreatment?: string;
    currentTreatmentProgramme?: string;
    previousTreatment?: string;
    previousTreatmentProgrammes?: string;
    previousRecoveryGroups?: string;
    previousRecoveryGroupsNames?: string;
    goalsForAttending?: string;
    goalsForAttendingOther?: string;
    anythingElseImportant?: string;
    howElseHelp?: string;
    consentWhatsapp?: boolean;
    consentConfidentiality?: boolean;
    consentAnonymity?: boolean;
    consentLiability?: boolean;
    consentVoluntary?: boolean;
}

/**
 * Sync attendance data to Glide Meeting Register table
 * Called after a successful check-in
 */
export async function syncAttendanceRegister(data: AttendanceData): Promise<string | null> {
    if (!ENABLE_GLIDE_SYNC) {
        console.log("[Glide Sync] DISABLED - Skipping attendance sync");
        return null;
    }

    try {
        console.log("[Glide Sync] Syncing attendance to Glide Meeting Register...");

        const glideRowId = await briV1MeetingRegisterBigTable.add({
            fullName: `${data.firstName} ${data.lastName}`.trim(),
            gender: data.gender || "",
            age: calculateAge(data.dateOfBirth || null),
            ethnicity: data.ethnicity || "",
            type: "Member",
            dob: data.dateOfBirth || "",
            memberRid: data.memberId,
            groupRid: data.groupId,
            dateCreated: new Date().toISOString(),
            dateCreatedBy: data.email || "",
            dateRegistered: data.attendanceDate,
            dateMonthNumber: getMonthNumber(data.attendanceDate),
            dateWeekNumber: getWeekNumber(data.attendanceDate)
        });

        console.log("[Glide Sync] Attendance synced successfully. Glide Row ID:", glideRowId);
        return glideRowId;
    } catch (error) {
        console.error("[Glide Sync] ERROR syncing attendance:", error);
        // Non-blocking: log error but don't throw
        return null;
    }
}

/**
 * Sync orientation completion to all three Glide tables
 * Called after a member completes orientation
 */
export async function syncOrientationComplete(data: OrientationData): Promise<{
    memberGlideRowId: string | null;
    orientationGlideRowId: string | null;
    attendanceGlideRowId: string | null;
}> {
    if (!ENABLE_GLIDE_SYNC) {
        console.log("[Glide Sync] DISABLED - Skipping orientation sync");
        return { memberGlideRowId: null, orientationGlideRowId: null, attendanceGlideRowId: null };
    }

    const result = {
        memberGlideRowId: null as string | null,
        orientationGlideRowId: null as string | null,
        attendanceGlideRowId: null as string | null
    };

    try {
        console.log("[Glide Sync] Syncing orientation completion to Glide tables...");

        // 1. Sync to Members Table FIRST (to get member Glide Row ID)
        try {
            const memberGlideRowId = await briCirV1MembersTable.add({
                personalFirstName: data.firstName,
                personalLastName: data.lastName,
                personalEmail: data.email,
                personalPhoneRaw: data.phone || "",
                orientationComplete: true,
                orientationGroupRid: data.groupRowId || data.groupId, // Use Glide Row ID if available
                // Note: orientationRid will be updated after orientation record is created
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString()
            });
            result.memberGlideRowId = memberGlideRowId;
            console.log("[Glide Sync] Members table synced. Row ID:", memberGlideRowId);
        } catch (error) {
            console.error("[Glide Sync] ERROR syncing to Members table:", error);
        }

        // 2. Sync to Orientation Details Table (use member Glide Row ID)
        if (result.memberGlideRowId) {
            try {
                const orientationGlideRowId = await briV1OrientationRegisterBigTable.add({
                    personalMemberRid: result.memberGlideRowId, // Use Glide Row ID from step 1
                    statusComplete: true,
                    personalFirstName: data.firstName,
                    personalLastName: data.lastName,
                    personalPhone: data.phone || "",
                    personalEmail: data.email,
                    personalGender: data.gender || "",
                    personalEthnicity: data.ethnicity || "",
                    personalDob: data.dateOfBirth || "",
                    emergencyContactFullName: data.emergencyContactName || "",
                    emergencyContactPhone: data.emergencyContactPhone || "",
                    emergencyContactEmail: data.emergencyContactEmail || "",
                    questionsReasonForAttending: data.reasonForAttending || "",
                    questionsWhereDidYouHearAboutUs: data.sourceOfDiscovery || "",
                    questionsWhichSubstancesAndOrBehavioursAreProblematicForYou:
                        [data.problematicSubstances, data.problematicSubstancesOther].filter(Boolean).join(", "),
                    questionsAreYouCurrentlyInATreatmentProgramme: data.currentlyInTreatment || "",
                    questionsWhichTreatmentProgrammeAreYouCurrentlyIn: data.currentTreatmentProgramme || "",
                    questionsHaveYouEverBeenInATreatmentProgramme: data.previousTreatment || "",
                    questionsWhichTreatmentProgrammeSHaveYouBeenIn: data.previousTreatmentProgrammes || "",
                    questionsHaveYouAttendedRecoveryGroupsBefore: data.previousRecoveryGroups || "",
                    questionsWhichRecoveryGroupsHaveYouAttended: data.previousRecoveryGroupsNames || "",
                    questionsWhatDoYouHopeToAchieveByAttendingTheRecoveryGroup:
                        [data.goalsForAttending, data.goalsForAttendingOther].filter(Boolean).join(", "),
                    questionsIsThereAnythingImportantThatWeShouldKnowAboutYouAndYourRecoveryJourney: data.anythingElseImportant || "",
                    questionsHowElseWouldYouLikeToBeHelped: data.howElseHelp || "",
                    consentWhatsappGroup: data.consentWhatsapp || false,
                    consentConfidentiality: data.consentConfidentiality || false,
                    consentAnonymity: data.consentAnonymity || false,
                    consentLiability: data.consentLiability || false,
                    consentVoluntary: data.consentVoluntary || false,
                    affiliateRid: "", // TODO: Determine source for affiliate RID
                    groupRid: data.groupRowId || data.groupId, // Use Glide Row ID if available
                    dateCreated: new Date().toISOString(),
                    dateOrientated: new Date().toISOString()
                });
                result.orientationGlideRowId = orientationGlideRowId;
                console.log("[Glide Sync] Orientation Details table synced. Row ID:", orientationGlideRowId);
            } catch (error) {
                console.error("[Glide Sync] ERROR syncing to Orientation Details table:", error);
            }
        }

        // 3. Sync to Attendance Register (use member Glide Row ID and include reason for attending)
        if (result.memberGlideRowId) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const attendanceGlideRowId = await briV1MeetingRegisterBigTable.add({
                    fullName: `${data.firstName} ${data.lastName}`.trim(),
                    gender: data.gender || "",
                    age: calculateAge(data.dateOfBirth || null),
                    ethnicity: data.ethnicity || "",
                    type: data.reasonForAttending || "", // Use reason for attending instead of hardcoded "Member"
                    dob: data.dateOfBirth || "",
                    memberRid: result.memberGlideRowId, // Use Glide Row ID from step 1
                    groupRid: data.groupRowId || data.groupId, // Use Glide Row ID if available
                    dateCreated: new Date().toISOString(),
                    dateCreatedBy: data.email,
                    dateRegistered: today,
                    dateMonthNumber: getMonthNumber(today),
                    dateWeekNumber: getWeekNumber(today)
                });
                result.attendanceGlideRowId = attendanceGlideRowId;
                console.log("[Glide Sync] Attendance Register table synced. Row ID:", attendanceGlideRowId);
            } catch (error) {
                console.error("[Glide Sync] ERROR syncing to Attendance Register table:", error);
            }
        }

        // 4. Update member record in Glide with orientation Row ID (now that we have it)
        if (result.memberGlideRowId && result.orientationGlideRowId) {
            try {
                console.log("[Glide Sync] Updating member with orientation Row ID:", result.orientationGlideRowId);
                await briCirV1MembersTable.update(result.memberGlideRowId, {
                    orientationRid: result.orientationGlideRowId
                });
                console.log("[Glide Sync] Member record updated with orientation Row ID");
            } catch (error) {
                console.error("[Glide Sync] ERROR updating member with orientation Row ID:", error);
            }
        }

        console.log("[Glide Sync] Orientation sync complete:", result);
        return result;
    } catch (error) {
        console.error("[Glide Sync] FATAL ERROR during orientation sync:", error);
        // Non-blocking: return partial results
        return result;
    }
}
