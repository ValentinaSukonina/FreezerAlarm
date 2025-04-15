export const sanitizeInput = (value) => {
    return value
        .replace(/<script.*?>.*?<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/[<>]/g, "")
        .trim();
}

// Sanitize input to only allow specific characters
 export const sanitizeInputSec = (value, type) => {
    switch (type) {
        case "name":
            // Only allow letters and spaces in the name
            return value.replace(/[^a-zA-Z\s]/g, "").trim();
        case "email":
            // For email, check that the value is a valid email format
            return value.trim();
        case "phone_number":
            // Only allow numbers for the phone number
            return value.replace(/[^0-9]/g, "").trim();
        case "rank":
            // Only allow numbers for rank
            return value.replace(/[^0-9]/g, "").trim();
        default:
            return value;
    }
};