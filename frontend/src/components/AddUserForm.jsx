import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Navigate } from "react-router-dom";
import Select from "react-select";
import { createUser, fetchFreezersByUser } from "../services/api";
import {
    sanitizeByField,
    formatPhoneSE,
    NAME_ALLOWED_STRIP,
    recomputeFullName,
    validateUser
} from "../services/utils";
import "../assets/styles.css";

const normalizeName  = (s = "") => s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
const normalizeEmail = (s = "") => s.normalize("NFC").trim().toLowerCase();

const roleOptionsDefault = [
    { value: "user",  label: "user"  },
    { value: "admin", label: "admin" },
];

const AddUserForm = ({
                         users,                // array of existing users (for duplicate checks)
                         onUserCreated,        // (createdWithFreezers) => void
                         onClose,
                         roleOptions = roleOptionsDefault,
                         setTopMessage,        // UI banner
                     }) => {
    const [newUser, setNewUser] = useState({
        firstname: "",
        surname:   "",
        name:      "",
        email:     "",
        phone_number: "+46",
        user_rank: "",
        role:      "",
    });

    const [newErrors, setNewErrors] = useState({
        firstname: "",
        surname:   "",
        email:     "",
        phone_number: "",
        user_rank: "",
        role:      "",
    });

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone_number") return;

        let sanitized;
        if (name === "firstname" || name === "surname") {
            sanitized = (value ?? "").replace(NAME_ALLOWED_STRIP, "");
        } else if (name === "email") {
            sanitized = sanitizeByField("email", value, { live: true });
        } else {
            sanitized = sanitizeByField(name, value, { live: true });
        }

        setNewUser(prev => {
            const updated = { ...prev, [name]: sanitized };
            if (name === "firstname" || name === "surname") {
                updated.name = recomputeFullName(updated.firstname, updated.surname);
            }

            const { errors } = validateUser(updated, { mode: "create" });
            setNewErrors(prevErrs => ({
                ...prevErrs,
                ...(name === "firstname" ? { firstname: errors.firstname || "" } : {}),
                ...(name === "surname"  ? { surname:  errors.surname  || "" } : {}),
                ...(name === "email"    ? { email:    errors.email    || "" } : {}),
                ...(name === "user_rank"? { user_rank:errors.user_rank|| "" } : {}),
                ...(name === "role"     ? { role:     errors.role     || "" } : {}),
            }));

            return updated;
        });
    };

    const handlePhoneChange = (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setNewUser(prev => {
            const updated = { ...prev, phone_number: e164 };
            const { errors } = validateUser(updated, { mode: "create" });
            setNewErrors(prevErrs => ({ ...prevErrs, phone_number: errors.phone_number || "" }));
            return updated;
        });
    };

    const handleRoleChange = (selected) => {
        const roleValue = selected?.value || "";
        setNewUser(prev => {
            const updated = { ...prev, role: roleValue };
            const { errors } = validateUser(updated, { mode: "create" });
            setNewErrors(prevErrs => ({ ...prevErrs, role: errors.role || "" }));
            return updated;
        });
    };

    const resetForm = () => {
        setNewUser({
            firstname: "",
            surname:   "",
            name:      "",
            email:     "",
            phone_number: "+46",
            user_rank: "",
            role:      "",
        });
        setNewErrors({
            firstname: "",
            surname:   "",
            email:     "",
            phone_number: "",
            user_rank: "",
            role:      "",
        });
    };

    const handleAddUser = async () => {
        const draft = { ...newUser, name: recomputeFullName(newUser.firstname, newUser.surname) };
        const { cleaned, errors, valid } = validateUser(draft, { mode: "create" });

        setNewErrors({
            firstname: errors.firstname || "",
            surname:   errors.surname   || "",
            email:     errors.email     || "",
            phone_number: errors.phone_number || "",
            user_rank: errors.user_rank || "",
            role:      errors.role      || "",
        });
        if (!valid) return;

        // client-side duplicate checks
        const nameExists  = users.some(u => normalizeName(u.name)  === normalizeName(draft.name));
        const emailExists = users.some(u => normalizeEmail(u.email) === normalizeEmail(draft.email));

        if (nameExists || emailExists) {
            setNewErrors(prev => ({
                ...prev,
                ...(nameExists  ? { surname: "A user with this first and last name already exists." } : {}),
                ...(emailExists ? { email:   "This email is already in use." } : {}),
            }));
            return;
        }

        const payload = {
            firstname: cleaned.firstname,
            surname:   cleaned.surname,
            name:      cleaned.name,
            email:     cleaned.email,
            phone_number: cleaned.phone_number,
            user_rank: cleaned.user_rank,
            role:      cleaned.role,
        };

        try {
            const created = await createUser(payload);
            let freezers = await fetchFreezersByUser(created.id);
            freezers = Array.isArray(freezers) ? freezers : [];

            onUserCreated?.({ ...created, freezers });

            resetForm();
            onClose?.();
            setTopMessage?.({ text: "✅ New user created successfully!", kind: "success" });
        } catch (err) {
            const text =
                typeof err?.response?.data === "string"
                    ? err.response.data
                    : err?.message || "";

            const fieldErrs = {};
            if (/name\s*already\s*exists|user\s*already\s*exists|duplicate\s*name/i.test(text)) {
                fieldErrs.surname = "A user with this first and last name already exists.";
            }
            if (/email\s*already\s*exists|duplicate\s*email/i.test(text)) {
                fieldErrs.email = "This email is already in use.";
            }

            if (Object.keys(fieldErrs).length) {
                setNewErrors(prev => ({ ...prev, ...fieldErrs }));
            } else {
                setTopMessage?.({ text: "❌ Failed to create user.", kind: "error" });
            }
        }
    };

    return (
        <div
            className="border p-3 rounded mb-4"
            style={{ backgroundColor: "#f8fff0", maxWidth: "500px", margin: "0 auto" }}
        >
            <h5 className="mb-3">Add New User</h5>
            <div className="d-flex flex-column gap-2">
                <input
                    id="firstname"
                    name="firstname"
                    className={`form-control ${newErrors.firstname ? "is-invalid" : ""}`}
                    placeholder="Firstname"
                    value={newUser.firstname}
                    onChange={handleNewChange}
                />
                {newErrors.firstname && <div className="text-danger small">{newErrors.firstname}</div>}

                <input
                    id="surname"
                    name="surname"
                    className={`form-control ${newErrors.surname ? "is-invalid" : ""}`}
                    placeholder="Surname"
                    value={newUser.surname}
                    onChange={handleNewChange}
                />
                {newErrors.surname && <div className="text-danger small">{newErrors.surname}</div>}

                <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className={`form-control ${newErrors.email ? "is-invalid" : ""}`}
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleNewChange}
                />
                {newErrors.email && <div className="text-danger small">{newErrors.email}</div>}

                <PhoneInput
                    id="phone_number"
                    name="phone_number"
                    inputProps={{ name: "phone_number", id: "phone_number" }}
                    country="se"
                    onlyCountries={["se"]}
                    disableDropdown
                    countryCodeEditable={false}
                    masks={{ se: "..-... .. .." }}
                    placeholder="+46 XX-XXX XX XX"
                    value={newUser.phone_number || ""}
                    onChange={handlePhoneChange}
                    inputClass={`form-control ${newErrors.phone_number ? "is-invalid" : ""}`}
                    containerClass="w-100"
                />
                {newErrors.phone_number && <div className="text-danger small">{newErrors.phone_number}</div>}

                <select
                    id="user_rank"
                    name="user_rank"
                    className={`form-control ${newErrors.user_rank ? "is-invalid" : ""}`}
                    value={newUser.user_rank}
                    onChange={handleNewChange}
                >
                    <option value="">Choose rank…</option>
                    {[...Array(10)].map((_, i) => {
                        const v = String(i + 1);
                        return <option key={v} value={v}>{v}</option>;
                    })}
                </select>
                {newErrors.user_rank && <div className="text-danger small">{newErrors.user_rank}</div>}

                <Select
                    inputId="role"
                    name="role"
                    className="role-type-select"
                    classNamePrefix="ft"
                    options={roleOptions}
                    placeholder="Select role"
                    value={roleOptions.find((opt) => opt.value === newUser.role) || null}
                    onChange={handleRoleChange}
                    isSearchable={false}
                />
                {newErrors.role && <div className="text-danger small">{newErrors.role}</div>}
            </div>

            <div className="d-flex justify-content-start gap-3 mt-3">
                <button
                    className="btn"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={handleAddUser}
                >
                    Add
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        resetForm();
                        onClose?.();
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddUserForm;

