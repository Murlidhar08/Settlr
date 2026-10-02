import { Currency, UserStatus, UserDocumentType } from "../generated/prisma/enums";
import { tran } from "../languages/i18n";

export const currencyItems: Record<Currency, string> = {
    USD: "USD ($)",
    INR: "INR (₹)",
    EUR: "EUR (€)",
};

export const localeItems: Record<string, string> = {
    "en-IN": "English (India)",
    "en-US": "English (United States)",
    "de-DE": "German (Germany)",
    "fr-FR": "French (France)"
};

export const dateFormatItems = [
    { label: "DD/MM/YYYY", value: "dd/MM/yyyy" },
    { label: "MM/DD/YYYY", value: "MM/dd/yyyy" },
    { label: "YYYY-MM-DD", value: "yyyy-MM-dd" },
    { label: "DD MMM, YYYY", value: "dd MMM, yyyy" },
];

export const timeFormatItems = [
    { label: "12 Hour", value: "hh:mm a" },
    { label: "24 Hour", value: "HH:mm" },
];

export const languageItems = [
    { label: tran("languages.en"), value: "en" },
    { label: tran("languages.hi"), value: "hi" },
];

export const userStatusList = [
    { label: "Approved", value: UserStatus.approved },
    { label: "Pending Approval", value: UserStatus.pendingapproval },
    { label: "Suspended", value: UserStatus.suspended },
    { label: "Banned", value: UserStatus.banned },
];

export const emailVerifiedOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
];

export const userDocumentTypeItems = [
    { label: "Aadhar Card", value: UserDocumentType.aadhar_card },
    { label: "PAN Card", value: UserDocumentType.pan_card },
    { label: "Election Card", value: UserDocumentType.election_card },
    { label: "Other", value: UserDocumentType.other },
];

export const getLabelFromValue = (value: string, list: { label: string, value: string }[]) => {
    const item = list.find((item) => item.value === value);
    return item ? item.label : value;
}