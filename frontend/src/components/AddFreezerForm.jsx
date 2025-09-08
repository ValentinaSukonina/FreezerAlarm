import React, { useImperativeHandle, useState, forwardRef, useEffect } from "react";
import Select from "react-select";
import { fetchUsers } from "../services/api";
import { sanitizeByField } from "../services/utils";

const AddFreezerForm = forwardRef(
    ({ newFreezer, onChange, onAdd, onCancel, formError, onClearFormError }, ref) => {
        const [users, setUsers] = useState([]);
        const [selectedUserIds, setSelectedUserIds] = useState([]);
        const [showForm, setShowForm] = useState(false);
        const [showUserDropdown, setShowUserDropdown] = useState(false);

        // field-level errors
        const [numberError, setNumberError] = useState("");
        const [roomError, setRoomError] = useState("");
        const [addressError, setAddressError] = useState("");
        const [typeError, setTypeError] = useState("");

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
                        // optional: swallow; banner is for freezer add, not fetching users
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
                    (typeof result === "object" && result?.message) ||
                    (parentMsg ? parentMsg : `❌ Freezer with number ${newFreezer.number} already exists.`);
                setLocalFormError(resMsg);
            } catch (err) {
                // axios-style errors
                const status = err?.response?.status;
                const serverMsg =
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    err?.message;

                if (status === 409) {
                    setLocalFormError(`❌ Freezer with number ${newFreezer.number} already exists.`);
                } else {
                    setLocalFormError(
                        `❌ Failed to add freezer${serverMsg ? `: ${String(serverMsg)}` : "."}`
                    );
                }
            }
        };

        return (
            <div className="text-center mb-4 mb-sm-2">
                {!showForm ? (
                    <button
                        className="btn"
                        style={{ backgroundColor: "#5D8736", color: "white" }}
                        onClick={handleShowForm}
                    >
                        Add New Freezer
                    </button>
                ) : (
                    <>
                        <button
                            className="btn mb-4 mb-sm-2"
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

                            <div className="d-flex justify-content-between mt-3">
                                <button
                                    className="btn"
                                    style={{ backgroundColor: "#5D8736", color: "white" }}
                                    onClick={handleSubmit}
                                >
                                    Add
                                </button>
                                <button className="btn btn-secondary" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>

                            {/* error banner (parent-driven or local fallback) */}
                            {bannerError && (
                                <div
                                    className="text-center my-3"
                                    style={{
                                        backgroundColor: "#f8d7da",
                                        color: "#721c24",
                                        border: "1px solid #f5c6cb",
                                        padding: "10px 16px",
                                        borderRadius: "5px",
                                        maxWidth: "500px",
                                        margin: "0 auto",
                                    }}
                                >
                                    {bannerError}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }
);

export default AddFreezerForm;
