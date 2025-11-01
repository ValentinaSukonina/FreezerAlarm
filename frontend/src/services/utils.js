// -----------------------------
// Character classes & constants
// -----------------------------
export const LATIN = "A-Za-zÀ-ÖØ-öø-ÿ";
export const NAME_ALLOWED_STRIP = new RegExp(`[^ ${LATIN}'-]+`, "g"); // remove everything not allowed
export const NAME_RE = new RegExp(`^[ ${LATIN}'-]+$`);                // validate only allowed

// -----------------------------
// Small helpers
// -----------------------------
export const collapseSpaces = (s = "") => s.replace(/\s+/g, " ").trim();

/** Pretty-print Swedish E.164 phone: +46 XX-XXX XX XX */
export const formatPhoneSE = (e164) => {
    const m = /^\+46(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(e164 || "");
    return m ? `+46 ${m[1]}-${m[2]} ${m[3]} ${m[4]}` : (e164 || "");
};

/** Build full name from parts (used by Add form) */
export const recomputeFullName = (firstname = "", surname = "") =>
    collapseSpaces(
        `${String(firstname || "").trim()} ${String(surname || "").trim()}`
    );

export const sanitizeByField = (field, raw, { live = false } = {}) => {
    // Base normalization & shared stripping
    let v = String(raw ?? "").normalize("NFC").replace(/[\r\n]+/g, " ");
    const stripHtml  = (s) => s.replace(/<\/?[^>]+>/g, "");
    const stripZwsp  = (s) => s.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const toAsciiSpc = (s) => s.replace(/\u00A0/g, " "); // NBSP -> space

    v = stripHtml(v);
    v = stripZwsp(v);
    v = toAsciiSpc(v);

    switch (field) {
        // Names: letters (with diacritics) + space + ' -
        case "firstname":
        case "surname":
        case "name": {
            let out = v
                .replace(NAME_ALLOWED_STRIP, "") // strip numbers/symbols
                .replace(/\s+/g, " ")            // collapse spaces
                .replace(/['-]{2,}/g, (m) => m[0]) // collapse --- / '''
                .replace(/^['-]+|['-]+$/g, "")   // no leading/trailing ' or -
            ;
            return live ? out : out.trim();
        }

        // Email: robust against rich-paste junk; ASCII allow-list; lowercase; no '+'
        case "email": {
            let out = String(raw ?? "").normalize("NFC");

            // remove invisible junk & spaces
            out = stripHtml(out);
            out = stripZwsp(out);
            out = toAsciiSpc(out);
            out = out.replace(/\s+/g, "");

            // allow: letters, digits, dot, underscore, hyphen, @  (NO plus)
            out = out.replace(/[^A-Za-z0-9._@-]+/g, "");

            if (!live) {
                // Only on final: collapse repeats and strip edge dots
                out = out.replace(/@{2,}/g, "@");
                out = out.replace(/\.{2,}/g, ".");
                out = out.replace(/(^\.)|(\.$)/g, ""); // no leading/trailing dot
            }

            out = out.toLowerCase();
            return live ? out : out.trim();
        }

        // Phone: keep canonical E.164-like content (only '+' and digits)
        // Converts 00-prefixed to '+'; ensures a single leading '+'
        // Sweden normalization: 0XXXXXXXXX -> +46XXXXXXXXX
        case "phone_number": {
            let s = v;
            s = s.replace(/^\s*00/, "+");    // 00 -> +
            s = s.replace(/[^\d+]+/g, "");   // keep only + and digits
            if ((s.match(/\+/g) || []).length > 1) {
                s = "+" + s.replace(/\+/g, "");
            }
            if (/^0\d+$/.test(s)) {
                s = "+46" + s.slice(1);        // national to +46
            } else if (!/^\+\d+$/.test(s)) {
                const digits = s.replace(/\D/g, "");
                s = digits ? "+" + digits : "";
            }
            return live ? s : s.trim();
        }

        // Rank: digits only
        case "user_rank":
            return live ? v.replace(/\D+/g, "") : v.replace(/\D+/g, "").trim();

        // Role: allow only known roles ('user' | 'admin'), else empty
        case "role": {
            const t = v.replace(/[^A-Za-z-]+/g, "").trim();
            return ["user", "admin"].includes(t) ? t : "";
        }

        // Freezer number: limit to 4 digits
        case "number":
            return v.replace(/\D+/g, "").slice(0, 4);

        // Room: alnum only, uppercase, no spaces
        case "room":
            return v.replace(/[^0-9A-Za-z]/g, "").toUpperCase();

        // Address: letters (incl. å/ä/ö etc.), digits, spaces; collapse multiples
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

// ------------------------------------
// Unified validator for Add/Edit forms
// ------------------------------------
/**
 * Validates a user object after sanitization.
 * - mode: "create" | "edit"
 * - original: the existing user (for mode="edit") if you need diff-based rules
 *
 * Returns: { cleaned, errors, valid }
 */
export const validateUser = (input, { mode = "create", original = null } = {}) => {
    // 1) sanitize
    const cleaned = {
        name: sanitizeByField("name", input.name ?? ""),
        email: sanitizeByField("email", input.email ?? ""),
        phone_number: sanitizeByField("phone_number", input.phone_number ?? ""),
        user_rank: sanitizeByField("user_rank", input.user_rank ?? ""),
        role: sanitizeByField("role", input.role ?? ""),
        firstname: sanitizeByField("firstname", input.firstname ?? ""),
        surname: sanitizeByField("surname", input.surname ?? ""),
    };

    // 2) recompute name if parts present (Add form UX)
    if (input.firstname || input.surname) {
        cleaned.name = recomputeFullName(cleaned.firstname, cleaned.surname);
    }

    // 3) client-side validations
    const errors = {};

    // name
    if (!cleaned.name) {
        errors.name = "Name is required.";
    } else if (!NAME_RE.test(cleaned.name)) {
        errors.name = "Name can only include letters, spaces, hyphens, and apostrophes.";
    }

    // email (strict but simple)
    if (!cleaned.email) {
        errors.email = "Email is required.";
    } else {
        const emailOk =
            !/\s/.test(cleaned.email) &&
            cleaned.email.includes("@") &&
            /\.[A-Za-z]{2,}$/.test(cleaned.email);
        if (!emailOk) errors.email = "Invalid email format.";
    }

    // phone: Sweden E.164 (+46 + 9 digits)
    if (!/^\+46\d{9}$/.test(cleaned.phone_number || "")) {
        errors.phone_number = "Enter as +46 00-000 00 00";
    }

    // rank
    if (!cleaned.user_rank) {
        errors.user_rank = "Rank is required.";
    } else if (!/^\d+$/.test(cleaned.user_rank)) {
        errors.user_rank = "Digits only.";
    }

    // role
    if (!["user", "admin"].includes(cleaned.role)) {
        errors.role = "Invalid role.";
    }

    return { cleaned, errors, valid: Object.values(errors).every((v) => !v) };
};
