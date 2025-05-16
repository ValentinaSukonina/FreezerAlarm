export const sanitizeInput = (value) => {
    return value
        .replace(/<script.*?>.*?<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/[<>]/g, "")
        .trim();
}

// Sanitize input
export const sanitizeInputSec = (value, field) => {
    const trimmed = value.trim();

    switch (field) {
        case "name":
            return trimmed.replace(/[^a-zA-Z\s]/g, ""); // letters & spaces

        case "email":
            return trimmed.replace(/[^\w.@+-]/g, ""); // allow user@domain.com format

        case "phone_number":
            return trimmed.replace(/[^\d+]/g, ""); // allow numbers and plus sign

        case "user_rank":
            return trimmed.replace(/[^0-9]/g, ""); // digits only

        default:
            return trimmed;
    }
};