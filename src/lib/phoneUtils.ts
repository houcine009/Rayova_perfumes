/**
 * Formats a Moroccan phone number for WhatsApp links.
 * Converts "06XXXXXXXX" or "07XXXXXXXX" to "2126XXXXXXXX" or "2127XXXXXXXX".
 */
export const formatWhatsAppLink = (phone: string | null | undefined): string => {
    if (!phone) return "";

    // Remove all non-numeric characters (spaces, +, -, etc)
    let cleaned = phone.replace(/\D/g, "");

    // If it starts with 0 and is 10 digits (Standard Moroccan 06/07)
    if (cleaned.startsWith("0") && cleaned.length === 10) {
        return "212" + cleaned.substring(1);
    }

    // If it's already got 212 but maybe starts with +212
    if (cleaned.startsWith("212") && (cleaned.length === 12)) {
        return cleaned;
    }

    // Return as is if we can't identify the pattern
    return cleaned;
};

/**
 * Formats a phone number for display.
 * Ensures it looks like 06 12 34 56 78
 */
export const formatPhoneDisplay = (phone: string | null | undefined): string => {
    if (!phone) return "";

    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 10 && cleaned.startsWith("0")) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
    }

    return phone;
};
