export const sanitizeInput = (value) => {
    return value
        .replace(/<script.*?>.*?<\/script>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/[<>]/g, "")
        .trim();
};