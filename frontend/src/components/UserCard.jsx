import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { formatPhoneSE, sanitizeByField, validateUser } from "../services/utils";

const asArray = (v) => (Array.isArray(v) ? v : []);

const UserCard = ({ user, onUpdate, onDelete, onRemoveFreezer }) => {
    // local UI state
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ ...user });
    const [errors, setErrors] = useState({});
    const [confirmingFreezer, setConfirmingFreezer] = useState(null); // { userId, freezerId } | null
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rowMessage, setRowMessage] = useState({ text: "", kind: "" });

    const toggle = () =>
        setExpanded(prev => {
            const next = !prev;
            if (!next && editing) {
                // collapsing while editing → cancel edit
                setDraft({ ...user });
                setErrors({});
                setEditing(false);
            }
            return next;
        });

    // field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraft(d => ({ ...d, [name]: sanitizeByField(name, value, { live: true }) }));
        setErrors(e => ({ ...e, [name]: "" }));
    };

    // phone input
    const handlePhoneChange = (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setDraft(d => ({ ...d, phone_number: e164 }));
        setErrors(e => ({ ...e, phone_number: "" }));
    };

    // save edited user
    const save = async () => {
        const { cleaned, errors: vErrs, valid } = validateUser(draft, { mode: "edit", original: user });
        setErrors(vErrs);
        if (!valid) return;

        try {
            setSaving(true);
            await onUpdate?.(user.id, cleaned);

            setEditing(false);
            setErrors({});
            setRowMessage({ text: "✅ User updated successfully!", kind: "success" });
            setTimeout(() => setRowMessage({ text: "", kind: "" }), 3000);
        } catch (err) {
            const backendError = err?.response?.data;

            if (err?.response?.status === 409 && backendError?.error === "duplicate") {
                const newErrors = {};
                if (/email/i.test(backendError.message)) newErrors.email = "This email is already in use.";
                if (/name/i.test(backendError.message)) newErrors.name = "This full name is already taken.";
                setErrors(prev => ({ ...prev, ...newErrors }));
                return;
            }

            setRowMessage({
                text: `❌ Failed to update user: ${backendError?.message || err?.message || "Unexpected error"}`,
                kind: "error",
            });
        } finally {
            setSaving(false);
        }
    };


    const cancelEdit = () => {
        setDraft({ ...user });
        setErrors({});
        setRowMessage({ text: "", kind: "" });
        setEditing(false);
    };

    // freezer remove inline confirm
    const askRemoveFreezer = (userId, freezerId) => setConfirmingFreezer({ userId, freezerId });
    const cancelRemoveFreezer = () => setConfirmingFreezer(null);
    const handleDeleteFreezer = async (userId, freezerId) => {
        try {
            await onRemoveFreezer?.(userId, freezerId);
        } finally {
            setConfirmingFreezer(null);
        }
    };

    const handleDeleteUser = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await onDelete?.(user.id);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container-fluid px-0 px-sm-3 mx-auto" style={{ maxWidth: 600 }}>
            <div className="card my-1 shadow-sm">
                {/* Header: toggle + name + phone */}
                <div className="card-header bg-white p-1 p-sm-2">
                    <div className="d-flex align-items-center">
                        <button
                            type="button"
                            className="btn btn-sm  "
                            onClick={toggle}
                            aria-label={expanded ? "Collapse" : "Expand"}
                            style={{ backgroundColor: "white", color: "#5D8736" }}
                        >
                            {expanded ? "▲" : "▼"}
                        </button>

                        <div
                            className={`d-flex ${expanded && editing ? "flex-column flex-sm-row" : "flex-row"} 
              align-items-start align-items-sm-center w-100`}
                        >
                            {/* Name */}
                            <div className="fw-semibold flex-grow-1 mb-1 mb-sm-0">
                                {expanded && editing ? (
                                    <>
                                        <input
                                            name="name"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            value={draft.name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </>
                                ) : (
                                    user.name
                                )}
                            </div>

                            {/* Phone */}
                            <div
                                className={`mx-0 mx-sm-3 ${expanded && editing ? "phone-input-container" : ""}`}
                                style={{
                                    textAlign: "right",
                                    minWidth: expanded && editing ? "180px" : "auto"
                                }}
                            >
                                {expanded && editing ? (
                                    <PhoneInput
                                        country="se"
                                        onlyCountries={["se"]}
                                        disableDropdown
                                        countryCodeEditable={false}
                                        masks={{ se: "..-... .. .." }}
                                        placeholder="+46 XX-XXX XX XX"
                                        value={draft.phone_number || ""}
                                        onChange={handlePhoneChange}
                                        inputClass={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                                        containerClass="w-100"
                                    />
                                ) : (
                                    <a
                                        href={`tel:${user.phone_number}`}
                                        className="phone-link"
                                        title={`Call ${user.name}`}
                                    >
                                        <i className="bi bi-telephone me-1"></i>{formatPhoneSE(user.phone_number)}
                                    </a>
                                )}
                                {expanded && editing && errors.phone_number && (
                                    <div className="invalid-feedback d-block">{errors.phone_number}</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Body (collapsible) */}
                {expanded && (
                    <div className="card-body">
                        {/* Email */}
                        <div className="mb-2">
                            <strong>Email:</strong>{" "}
                            {editing ? (
                                <>
                                    <input
                                        name="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        value={draft.email || ""}
                                        onChange={handleChange}
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </>
                            ) : (
                                <span>{user.email}</span>
                            )}
                        </div>

                        {/* Rank */}
                        <div className="mb-2">
                            <strong>Rank:</strong>{" "}
                            {editing ? (
                                <>
                                    <select
                                        name="user_rank"
                                        className={`form-select d-inline-block w-auto ${errors.user_rank ? "is-invalid" : ""}`}
                                        value={draft.user_rank || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Choose…</option>
                                        {[...Array(10)].map((_, i) => {
                                            const v = String(i + 1);
                                            return (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errors.user_rank && (
                                        <div className="invalid-feedback d-block">{errors.user_rank}</div>
                                    )}
                                </>
                            ) : (
                                <span>{user.user_rank}</span>
                            )}
                        </div>

                        {/* Role */}
                        <div className="mb-3">
                            <strong>Role:</strong>{" "}
                            {editing ? (
                                <>
                                    <select
                                        name="role"
                                        className={`form-select d-inline-block w-auto ${errors.role ? "is-invalid" : ""}`}
                                        value={draft.role || "user"}
                                        onChange={handleChange}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                    {errors.role && <div className="invalid-feedback d-block">{errors.role}</div>}
                                </>
                            ) : (
                                <span>{user.role}</span>
                            )}
                        </div>

                        {/* Freezers list + remove */}
                        <div className="mb-3">
                            <div className="fw-semibold mb-2">Assigned Freezers:</div>
                            <div className="list-group">
                                {editing ? (
                                    <div className="d-flex flex-column">
                                        {asArray(user.freezers).map((f) => {
                                            const isAsking =
                                                confirmingFreezer &&
                                                confirmingFreezer.userId === user.id &&
                                                confirmingFreezer.freezerId === f.id;

                                            return (
                                                <div key={f.id} className="d-flex align-items-center mb-2">
                          <span className="form-control me-2" style={{ width: "80px" }}>
                            {f.number}
                          </span>
                                                    {isAsking ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="small fw-semibold"
                                                                  style={{ color: "#AD1212FF" }}
                                                            >Remove?</span>
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{
                                                                    backgroundColor: "#AD1212FF",
                                                                    color: "white",
                                                                    border: "none"
                                                                }}
                                                                onClick={() => handleDeleteFreezer(user.id, f.id)}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={cancelRemoveFreezer}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm mark-to-remove-btn"
                                                            onClick={() => askRemoveFreezer(user.id, f.id)}
                                                            title="Remove this freezer from the user"
                                                        >
                                                            X
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    asArray(user.freezers).map((f) => <div key={f.id}>{f.number}</div>)
                                )}
                            </div>
                        </div>
                        {confirmDelete && (
                            <div className="alert alert-warning d-flex align-items-center justify-content-between p-2 mb-2">
                                <span className="me-3">Are you sure you want to delete this user?</span>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={async () => {
                                            if (deleting) return;
                                            setDeleting(true);
                                            try {
                                                await onDelete?.(user.id);
                                                // Parent will remove the card; if not, you can also close locally:
                                                // setConfirmDelete(false);
                                            } catch (err) {
                                                // Surface error however you handle banners/messages in parent
                                                console.error("Failed to delete user:", err);
                                            } finally {
                                                setDeleting(false);
                                                setConfirmDelete(false);
                                            }
                                        }}
                                    >
                                        {deleting ? "Deleting…" : "Yes, delete"}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer actions */}
                        <div className="d-flex gap-2">
                            {editing ? (
                                <>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: "#7BAE3F", color: "white" }}
                                        onClick={save}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving…" : "Save"}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit} disabled={saving}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: "#5D8736", color: "white" }}
                                        onClick={() => {
                                            setDraft({ ...user });
                                            setErrors({});
                                            setEditing(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: "#A9C46C", color: "white", border: "1px solid #c3e6cb" }}
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Row message at bottom of card */}
                        {rowMessage.text && (
                            <div
                                className={`alert mt-2 ${
                                    rowMessage.kind === "success" ? "alert-success" : "alert-error"
                                }`}
                            >
                                {rowMessage.text}
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default UserCard;