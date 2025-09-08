// Latin basic + Latin-1 Supplement (å ä ö etc.)
const LATIN = "A-Za-zÀ-ÖØ-öø-ÿ";

export const sanitizeByField = (field, raw, { live = false } = {}) => {
    let v = String(raw ?? "").normalize("NFC").replace(/[\r\n]+/g, " ");

    // Shared helpers
    const stripHtml  = (s) => s.replace(/<\/?[^>]+>/g, "");
    const stripZwsp  = (s) => s.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const toAsciiSpc = (s) => s.replace(/\u00A0/g, " "); // NBSP → space

    switch (field) {
        // Names: letters (with diacritics) + space + ' -
        // This runs on every keystroke → "live block" for invalid chars.
        case "firstname":
        case "surname":
        case "name": {
            let out = v
                .replace(new RegExp(`[^ ${LATIN}'-]+`, "g"), "") // strip numbers/symbols
                .replace(/\s+/g, " ")                            // collapse spaces
                .replace(/['-]{2,}/g, (m) => m[0])               // collapse --- / '''
                .replace(/^['-]+|['-]+$/g, "")                   // no leading/trailing ' or -
                .trim();
            return out;
        }

        // Email: robust against rich-paste junk; ASCII allow-list; lowercase
        case "email": {
            let out = v;
            out = stripHtml(out);
            out = stripZwsp(out);
            out = toAsciiSpc(out);
            out = out.replace(/\s+/g, "");                 // emails must have no spaces
            out = out.replace(/[^A-Za-z0-9._@-]+/g, "");   // allow only safe subset
            out = out.toLowerCase();
            return live ? out : out.trim();
        }

        // Phone (react-phone-input-2 handles formatting; keep + and digits only)
        case "phone_number":
            return v
                .replace(/[^\d+]/g, "")   // allow only digits and +
                .replace(/(?!^)\+/g, "")  // remove all + except at start
                .replace(/^00/, "+")      // normalize 00… → +
                .trim();

        // Rank: digits only
        case "user_rank":
            return v.replace(/\D+/g, "").trim();

        // Role: letters + optional hyphen
        case "role":
            return v.replace(/[^A-Za-z-]+/g, "").trim();

        // Freezer number: exactly 4 digits
        case "number":
            return v.replace(/\D+/g, "").slice(0, 4);

        // Room: A–Z/0–9 only, uppercase, no spaces
        case "room":
            return v.replace(/[^0-9A-Za-z]/g, "").toUpperCase();

        // Address: allow letters (with diacritics), digits, and spaces while typing.
        // Address: allow letters (å/ä/ö etc.), digits, spaces
        // Live: preserve trailing spaces. Final: trim.
        case "address": {
            let out = v
                .replace(new RegExp(`[^ ${LATIN}0-9]+`, "g"), "")
                .replace(/\s{2,}/g, " ");
            return live ? out : out.trim();
        }

        default:
            return live ? v : v.trim();
    }
};
