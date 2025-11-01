import React, { useImperativeHandle, useState, forwardRef, useEffect } from "react";
import Select from "react-select";
import { fetchUsers } from "../services/api";
import { sanitizeByField } from "../services/utils";
import "../assets/styles.css";

const AddFreezerForm = forwardRef(
    ({ newFreezer, onChange, onAdd, onCancel, formError, onClearFormError, existingNumbers = [] }, ref) => {
        const [users, setUsers] = useState([]);
        const [selectedUserIds, setSelectedUserIds] = useState([]);
        const [showForm, setShowForm] = useState(false);
        const [showUserDropdown, setShowUserDropdown] = useState(false);

        // field-level errors
        const [numberError, setNumberError] = useState("");
        const [roomError, setRoomError] = useState("");
        const [addressError, setAddressError] = useState("");
        const [typeError, setTypeError] = useState("");
        const [submitting, setSubmitting] = useState(false);

        const [localFormError, setLocalFormError] = useState("");
        const bannerError = formError || localFormError;

        const typeOptions = [
            { value: "-80C", label: "-80°C" },
            { value: "-150C", label: "-150°C" },
        ];

        useImperativeHandle(ref, () => ({
            resetCheckboxes() {
                setSelectedUserIds([]);
            },
            closeForm() {
                setShowForm(false);
                setShowUserDropdown(false);
            },
        }));

        // lazy-load users when dropdown is opened the first time
        useEffect(() => {
            if (showUserDropdown && users.length === 0) {
                (async () => {
                    try {
                        const fetched = await fetchUsers();
                        setUsers(Array.isArray(fetched) ? fetched : []);
                    } catch {
                        // optional: swallow; banner is for freezer add
                    }
                })();
            }
        }, [showUserDropdown, users.length]);

        const clearAllErrors = () => {
            setLocalFormError("");
            setNumberError("");
            setRoomError("");
            setAddressError("");
            setTypeError("");
        };

        const handleCancel = () => {
            setSelectedUserIds([]);
            setShowForm(false);
            setShowUserDropdown(false);
            clearAllErrors();
            onCancel?.(); // let parent clear its own formError if it keeps one
        };

        const handleShowForm = () => {
            clearAllErrors();
            onClearFormError?.();
            setShowForm(true);
        };

        const handleHideForm = () => {
            clearAllErrors();
            onClearFormError?.();
            setShowForm(false);
        };

        const handleUserToggle = (userId) => {
            setLocalFormError("");
            setSelectedUserIds((prev) =>
                prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
            );
        };

        const handleNewChange = (e) => {
            const { name, value } = e.target;

            let next;
            try {
                // live mode: preserves trailing space for address, etc.
                next = sanitizeByField(name, value, { live: true });
            } catch {
                next = (value ?? "").trim();
            }

            // update parent state
            onChange({ target: { name, value: next } });

            // clear parent error if user is editing the number
            onClearFormError?.();
            setLocalFormError("");

            // live field-level validation, like your old (commented) code did
            if (name === "number") {
                // show error whenever it's not exactly 4 digits
                setNumberError(next.length === 4 ? "" : "Enter exactly 4 digits.");
            } else if (name === "room") {
                // A–Z / 0–9 only; you already enforce uppercase in sanitizeByField('room')
                setRoomError(next && /^[A-Z0-9]+$/.test(next) ? "" : "Room may contain only letters and digits.");
            } else if (name === "address") {
                // require at least 2 non-space chars (final blur will trim)
                setAddressError(next.trim().length >= 2 ? "" : "Please enter a valid address.");
            } else if (name === "type") {
                setTypeError(next ? "" : "Please select a freezer type.");
            }
            // optional: clear banner when editing
            setLocalFormError("");
        };

        const handleSubmit = async () => {
            if (submitting) return;

            // reset banner
            setLocalFormError("");

            // final validation
            let hasError = false;
            if ((newFreezer.number || "").length !== 4) {
                setNumberError("Enter exactly 4 digits.");
                hasError = true;
            }
            if (!newFreezer.room || !/^[A-Z0-9]+$/.test(newFreezer.room)) {
                setRoomError("Please enter a room number");
                hasError = true;
            }
            if (!newFreezer.address || newFreezer.address.trim().length < 2) {
                setAddressError("Please enter a valid address.");
                hasError = true;
            }
            if (!newFreezer.type) {
                setTypeError("Please select a freezer type.");
                hasError = true;
            }
            if (hasError) return;

            if (existingNumbers.includes(String(newFreezer.number))) {
                setNumberError(`Freezer with number ${newFreezer.number} already exists.`);
                return;
            }

            setSubmitting(true);
            try {
                const result = await onAdd({ ...newFreezer, userIds: selectedUserIds });
                const ok =
                    typeof result === "boolean"
                        ? result
                        : typeof result === "object"
                            ? !!result?.ok
                            : false;

                if (ok) {
                    setSelectedUserIds([]);
                    setShowForm(false);
                    setShowUserDropdown(false);
                    clearAllErrors();
                    setLocalFormError("");
                    onClearFormError?.();
                    return;
                }

                const parentMsg = formError && String(formError);
                const resMsg =
                    (typeof result === "object" && (result?.message || result?.error)) ||
                    parentMsg ||
                    "❌ Failed to add freezer.";

                if (/Freezer with number/i.test(resMsg)) {
                    setNumberError(resMsg.replace(/^❌\s*/, ""));
                } else {
                    setLocalFormError(resMsg.startsWith("❌") ? resMsg : `❌ ${resMsg}`);
                }
            } catch (err) {
                const status = err?.response?.status;
                const serverMsg =
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    err?.message;

                if (status === 409) {
                    setNumberError(`Freezer with number ${newFreezer.number} already exists.`);
                } else {
                    setLocalFormError(
                        `❌ Failed to add freezer${serverMsg ? `: ${String(serverMsg)}` : "."}`
                    );
                }
            } finally {
                setSubmitting(false);
            }
        };

        return (
            <div className="text-center mb-2 mb-sm-3">
                {!showForm ? (
                    <button
                        className="btn py-1"
                        style={{ backgroundColor: "#5D8736", color: "white" }}
                        onClick={handleShowForm}
                    >
                        Add New Freezer
                    </button>
                ) : (
                    <>
                        <button
                            className="btn py-1"
                            style={{ backgroundColor: "#5D8736", color: "white" }}
                            onClick={handleHideForm}
                        >
                            Hide Form
                        </button>

                        <div
                            className="mx-auto p-4 rounded"
                            style={{
                                backgroundColor: "#f8fff0",
                                maxWidth: "600px",
                                boxShadow: "0 0 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            <h5 className="mb-3 text-start fw-bold">Add New Freezer</h5>

                            {/* Freezer number */}
                            <input
                                id="freezer-number"
                                autoComplete="off"
                                type="text"
                                name="number"
                                className={`form-control mb-2 ${numberError ? "is-invalid" : ""}`}
                                placeholder="Enter unique 4-digit freezer code"
                                value={newFreezer.number}
                                //onChange={handleSanitizedChange("number")}
                                onChange={handleNewChange}
                                onBlur={(e) =>
                                    onChange({
                                        target: { name: "number", value: sanitizeByField("number", e.target.value) },
                                    })
                                }
                                maxLength={4}
                                required
                            />
                            {numberError && <div className="text-danger small mb-2">{numberError}</div>}

                            {/* Room */}
                            <input
                                id="room"
                                autoComplete="off"
                                type="text"
                                name="room"
                                className={`form-control mb-2 ${roomError ? "is-invalid" : ""}`}
                                placeholder="Room (e.g., 1310C)"
                                value={newFreezer.room}
                                onChange={handleNewChange}
                                onBlur={(e) =>
                                    onChange({
                                        target: { name: "room", value: sanitizeByField("room", e.target.value) },
                                    })
                                }
                                required
                            />
                            {roomError && <div className="text-danger small mb-2">{roomError}</div>}

                            {/* Address */}
                            <input
                                id="address"
                                autoComplete="off"
                                type="text"
                                name="address"
                                className={`form-control mb-2 ${addressError ? "is-invalid" : ""}`}
                                placeholder="Address"
                                value={newFreezer.address}
                                onChange={handleNewChange}
                                onBlur={(e) =>
                                    onChange({
                                        target: { name: "address", value: sanitizeByField("address", e.target.value) },
                                    })
                                }
                                required
                            />
                            {addressError && <div className="text-danger small mb-2">{addressError}</div>}

                            {/* Type */}
                            <Select
                                className="freezer-type-select"
                                classNamePrefix="ft"
                                options={typeOptions}
                                placeholder="Select Freezer Type"
                                value={typeOptions.find((opt) => opt.value === newFreezer.type) || null}
                                onChange={(selectedOption) => {
                                    setTypeError("");
                                    onChange({
                                        target: { name: "type", value: selectedOption?.value || "" },
                                    });
                                }}
                            />
                            {typeError && <div className="text-danger small mt-1">{typeError}</div>}

                            {/* Assign users */}
                            <div className="text-start mb-2 my-2">
                                <button
                                    type="button"
                                    className="form-control text-start assign-users-toggle"
                                    style={{ backgroundColor: "#e6f2d9" }}
                                    onClick={() => {
                                        setLocalFormError("");
                                        onClearFormError?.();
                                        setShowUserDropdown((prev) => !prev);
                                    }}
                                >
                                    {showUserDropdown ? "Hide Users" : "Assign Users"}
                                </button>
                            </div>

                            {showUserDropdown && (
                                <div className="user-dropdown-list mt-2">
                                    {users.map((user) => (
                                        <div key={user.id} className="user-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-checkbox"
                                                id={`user-${user.id}`}
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={() => handleUserToggle(user.id)}
                                            />
                                            <label htmlFor={`user-${user.id}`}>{user.name}</label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="d-flex justify-content-center gap-3 mt-3">
                                <button
                                    className="btn py-1"
                                    style={{ backgroundColor: "#5D8736", color: "white" }}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? "Adding…" : "Add"}
                                </button>
                                <button className="btn btn-secondary py-1" onClick={handleCancel} disabled={submitting}>
                                    Cancel
                                </button>
                            </div>
                            {localFormError && (
                                <div className="alert alert-error" role="alert">
                                    {localFormError}
                                </div>
                            )}
                            {submitting && !localFormError && (
                                <div className="text-muted small mt-2">Connecting to server…</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }
);

export default AddFreezerForm;
