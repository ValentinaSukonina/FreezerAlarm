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

    const handlePhoneChange = (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";

        setDraft(prev => {
            const updated = { ...prev, phone_number: e164 };
            const { errors } = validateUser(updated, { mode: "edit", original: user });
            setErrors(prevErrs => ({ ...prevErrs, phone_number: errors.phone_number || "" }));
            return updated;
        });
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
        <div className="user-card container-fluid px-0 px-sm-3 mx-auto" style={{ maxWidth: 600 }}>
            <div className="card my-1 shadow-sm">
                {/* Header */}
                <div className="card-header bg-white p-1 p-sm-2">

                    <div className={`d-flex flex-wrap align-items-start header-row ${expanded && editing ? "edit-mode" : ""}`}>
                        <button
                            type="button"
                            className="toggle-btn mt-1 p-0"
                            onClick={toggle}
                            aria-label={expanded ? "Collapse" : "Expand"}
                        >
                            {expanded ? "▲" : "▼"}
                        </button>

                        <div className="flex-grow-1 name-phone-container">
                            {/* Name */}
                            <div className="name-section text-truncate fw-semibold">
                                {expanded && editing ? (
                                    <>
                                        <input
                                            name="name"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            value={draft.name || ""}
                                            onChange={handleChange}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback d-block">
                                                {errors.name}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    user.name
                                )}
                            </div>


                            {/* Phone */}
                            <div className="phone-section">
                                {expanded && editing ? (
                                    <>
                                        <PhoneInput
                                            country="se"
                                            onlyCountries={["se"]}
                                            disableDropdown
                                            countryCodeEditable={false}
                                            masks={{ se: "..-... .. .." }}
                                            placeholder="+46 XX-XXX XX XX"
                                            value={draft.phone_number || ""}
                                            onChange={handlePhoneChange}
                                            inputClass={`form-control form-control-sm ${
                                                errors.phone_number ? "is-invalid" : ""
                                            }`}
                                            inputStyle={{ width: "120px", height: "15px" }}
                                        />
                                        {errors.phone_number && (
                                            <div className="invalid-feedback d-block">
                                                {errors.phone_number}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <a
                                        href={`tel:${user.phone_number}`}
                                        className="phone-link"
                                        title={`Call ${user.name}`}
                                    >
                                        <i className="bi bi-telephone me-1"></i>
                                        {formatPhoneSE(user.phone_number)}
                                    </a>
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
                        <div className="mb-2">
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
                          <span className="form-control assigned-freezer-input me-2" style={{ width: "50px" }}>
                            {f.number}
                          </span>
                                                    {isAsking ? (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="small fw-semibold"
                                                                  style={{ color: "#AD1212FF" }}
                                                            >Remove?</span>
                                                            <button
                                                                className="btn btn-sm py-0"
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
                                                                className="btn btn-sm btn-secondary py-0"
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
                            // <div className="alert alert-warning p-1 mb-1 text-center">
                            //     <div className="mb-2">Are you sure you want to delete this user?</div>
                            //     <div className="d-flex justify-content-center gap-2">
                            //         <button
                            //             className="btn btn-danger btn-sm"
                            //             onClick={async () => {
                            //                 if (deleting) return;
                            //                 setDeleting(true);
                            //                 try {
                            //                     await onDelete?.(user.id);
                            //                 } catch (err) {
                            //                     console.error("Failed to delete user:", err);
                            //                 } finally {
                            //                     setDeleting(false);
                            //                     setConfirmDelete(false);
                            //                 }
                            //             }}
                            //         >
                            //             {deleting ? "Deleting…" : "Yes, delete"}
                            //         </button>
                            //         <button
                            //             className="btn btn-secondary btn-sm"
                            //             onClick={() => setConfirmDelete(false)}
                            //         >
                            //             Cancel
                            //         </button>
                            //     </div>
                            // </div>

                            <div className="confirm-delete-section d-flex align-items-center">
                                <span className="me-2 alert-circle">!</span>
                                <span className="fw-bold text-danger me-2" style={{color: "#b00000"}}>
                                    Confirm delete user?
                                </span>
                                <button
                                    className="btn btn-sm me-2 px-3"
                                    style={{backgroundColor: "#A9C46C", color: "white", border: "1px solid #c3e6cb"}}
                                    onClick={async () => {
                                        if (deleting) return;
                                        setDeleting(true);
                                        try {
                                            await onDelete?.(user.id);
                                            setRowMessage({ text: "✅ User deleted successfully!", kind: "success" });
                                        } catch (err) {
                                            console.error("Failed to delete user:", err);
                                            setRowMessage({
                                                text: "❌ Failed to delete user.",
                                                kind: "error",
                                            });
                                        } finally {
                                            setDeleting(false);
                                            setConfirmDelete(false);
                                            setTimeout(() => setRowMessage({ text: "", kind: "" }), 3000);
                                        }
                                    }}
                                >
                                    {deleting ? "Deleting…" : "Yes, delete"}
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{backgroundColor: "#5D8736", color: "white", border: "none"}}
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
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
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {!confirmDelete && (
                                        <>
                                            <button
                                                className="btn btn-sm py-1"
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
                                                className="btn btn-sm py-1"
                                                style={{
                                                    backgroundColor: "#A9C46C",
                                                    color: "white",
                                                    border: "1px solid #c3e6cb",
                                                }}
                                                onClick={() => setConfirmDelete(true)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
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