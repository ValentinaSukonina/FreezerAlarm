import { useEffect, useState } from "react";
import React from "react";
import {
    fetchUsers,
    updateUser,
    deleteUser,
    createUser,
    fetchFreezersByUser,
    deleteFreezerFromUser,
} from "../services/api";
import { Navigate } from "react-router-dom";
import Select from "react-select";
import { sanitizeByField } from "../services/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// helper so .map/.filter never crash if freezers is not an array
const asArray = (v) => (Array.isArray(v) ? v : []);

const StaffContent = () => {
    // -------- state --------
    //const [message, setMessage] = useState(""); // TOP banner (Add form only)
    const [message, setMessage] = useState({ text: "", kind: "" });
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [rowMessages, setRowMessages] = useState({}); // { [userId]: { text, kind } }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);

    // Inline confirm for removing a freezer from a user
    // shape: { userId, freezerId } | null
    const [confirmingFreezer, setConfirmingFreezer] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        firstname: "",
        surname: "",
        name: "",
        email: "",
        phone_number: "+46",
        user_rank: "",
        role: "",
    });

    // field-level errors for Add form
    const [newErrors, setNewErrors] = useState({
        firstname: "",
        surname: "",
        email: "",
        phone_number: "",
        user_rank: "",
        role: "",
    });

    const roleOptions = [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
    ];

    const [role, setRole] = useState(sessionStorage.getItem("role") || "");

    // -------- row message helpers --------
    const showRowMsg = (userId, text, kind = "info", ttl = 3000) => {
        setRowMessages((prev) => ({ ...prev, [userId]: { text, kind } }));
        if (ttl) {
            setTimeout(() => {
                setRowMessages((prev) => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            }, ttl);
        }
    };
    const msgClass = (kind) =>
        kind === "success"
            ? "alert-success"
            : kind === "error"
                ? "alert-danger"
                : kind === "warning"
                    ? "alert-warning"
                    : "alert-info";

    // -------- effects --------
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchUsers();
                const usersWithFreezers = await Promise.all(
                    data.map(async (user) => {
                        try {
                            const freezers = await fetchFreezersByUser(user.id);
                            return { ...user, freezers: asArray(freezers) };
                        } catch {
                            return { ...user, freezers: [] };
                        }
                    })
                );
                setUsers(usersWithFreezers);
            } catch (err) {
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    useEffect(() => {
        if (message.text) {
            const hideTimer = setTimeout(() => setMessage({ text: "", kind: "" }), 3000);
            return () => clearTimeout(hideTimer);
        }
    }, [message]);

    useEffect(() => {
        const fetchRoleIfNeeded = async () => {
            if (!role) {
                try {
                    const res = await fetch("http://localhost:8000/api/auth/role", {
                        credentials: "include",
                    });
                    if (res.ok) {
                        const fetchedRole = await res.text();
                        sessionStorage.setItem("role", fetchedRole);
                        setRole(fetchedRole);
                    }
                } catch (err) {
                    console.error("Failed to fetch role", err);
                }
            }
        };

        fetchRoleIfNeeded();
    }, [role]);

    // -------- utils & validators --------
    const toggleExpand = (userId) => {
        setExpandedUserId((prev) => (prev === userId ? null : userId));
    };
    const confirmDelete = (userId) => setDeletingUserId(userId);

    const validateEmail = (email) => {
        if (!email || /\s/.test(email)) return false;
        if (email.includes("+")) return false; // your rule: no '+'
        const at = email.indexOf("@");
        if (at < 1) return false;
        const dot = email.lastIndexOf(".");
        if (dot < at + 2 || dot === email.length - 1) return false;
        return true;
    };

    const NAME_ALLOWED_STRIP = /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g;
    const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    const validateNamePart = (v) => NAME_RE.test((v || "").trim());

    // Required: Sweden E.164 (+46 followed by 9 digits)
    const validatePhone = (phone) => /^\+46\d{9}$/.test(phone);
    const validateRank = (rank) => /^\d+$/.test(rank);
    const recomputeName = (draft) =>
        `${(draft.firstname || "").trim()} ${(draft.surname || "").trim()}`.trim();
    const validateNewUser = (draft) => {
        const errs = {
            firstname: "",
            surname: "",
            email: "",
            phone_number: "",
            user_rank: "",
            role: "",
        };
        if (!draft.firstname?.trim()) errs.firstname = "Firstname is required.";
        else if (!validateNamePart(draft.firstname)) errs.firstname = "Invalid firstname.";

        if (!draft.surname?.trim()) errs.surname = "Surname is required.";
        else if (!validateNamePart(draft.surname)) errs.surname = "Invalid surname.";

        if (!draft.email?.trim()) errs.email = "Email is required.";
        else if (!validateEmail(draft.email)) errs.email = "Invalid email format.";

        if (!draft.role) errs.role = "Role is required.";

        if (!validatePhone(draft.phone_number))
            errs.phone_number = "Invalid phone number (must be Swedish like +46 70-123 45 67).";

        if (!draft.user_rank?.trim()) errs.user_rank = "Rank is required.";
        else if (!validateRank(draft.user_rank))
            errs.user_rank = "Rank must contain digits only.";
        return errs;
    };

    // -------- handlers: edit inline --------
    const handleEditChange = (e, userId) => {
        const { name, value } = e.target;
        if (name === "phone_number") return; // phone controlled by PhoneInput
        let next;
        try {
            if (name === "name") {
                next = (value ?? "").replace(NAME_ALLOWED_STRIP, "").trim();
            } else if (name === "firstname" || name === "surname") {
                // (in case you later split name in edit too)
                next = (value ?? "").replace(NAME_ALLOWED_STRIP, "").trim();
            } else {
                next = sanitizeByField(name, value);
            }
        } catch {
            next = (value ?? "").trim();
        }
        setUsers((prev) =>
            prev.map((user) => (user.id === userId ? { ...user, [name]: next } : user))
        );
    };

    // store "+digits" (or "" while clearing). Country is locked to SE, so dial code stays +46.
    const handleEditPhoneChange = (userId) => (val /* digits only string */, country) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, phone_number: e164 } : u))
        );
    };

    const handleFreezerChange = (e, userId, index) => {
        const { value } = e.target;
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        freezers: asArray(user.freezers).map((f, i) =>
                            i === index ? { ...f, number: value } : f
                        ),
                    }
                    : user
            )
        );
    };

    // ask/cancel confirmation for removing a freezer (inline)
    const askRemoveFreezer = (userId, freezerId) => {
        setConfirmingFreezer({ userId, freezerId });
    };
    const cancelRemoveFreezer = () => setConfirmingFreezer(null);

    const handleDeleteFreezer = async (userId, freezerId) => {
        try {
            await deleteFreezerFromUser(userId, freezerId);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            freezers: asArray(user.freezers).filter((f) => f.id !== freezerId),
                        }
                        : user
                )
            );
            setConfirmingFreezer(null); // close the inline confirm UI
            showRowMsg(userId, "✅ Freezer removed from user.", "success");
        } catch (err) {
            setConfirmingFreezer(null);
            showRowMsg(userId, "❌ Failed to remove freezer.", "error");
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            showRowMsg(userId, "✅ User deleted successfully!", "success", 1500);
            setDeletingUserId(null);
            setTimeout(() => {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
            }, 1500);
        } catch (err) {
            showRowMsg(userId, "❌ Failed to delete user.", "error");
        }
    };

    const handleSave = async (userId) => {
        const userToUpdate = users.find((u) => u.id === userId);
        // quick guards
        if (!userToUpdate?.name?.trim()) {
            showRowMsg(userId, "❌ Name is required.", "error");
            return;
        }
        if (!NAME_RE.test(userToUpdate.name)) {
            showRowMsg(userId, "❌ Name can only include letters, spaces, hyphens, and apostrophes.", "error");
            return;
        }
        if (!userToUpdate?.email?.trim()) {
            showRowMsg(userId, "❌ Email is required.", "error");
            return;
        }
        const emailOk =
            userToUpdate.email &&
            !/\s/.test(userToUpdate.email) &&
            !userToUpdate.email.includes("+") &&
            userToUpdate.email.includes("@") &&
            /\.[A-Za-z]{2,}$/.test(userToUpdate.email);
        if (!emailOk) {
            showRowMsg(userId, "❌ Invalid email format.", "error");
            return;
        }
        if (!validatePhone(userToUpdate.phone_number)) {
            showRowMsg(userId, "❌ Phone must start with +46 and have 9 digits after", "error");
            return;
        }
        if (!userToUpdate.user_rank || !/^\d+$/.test(userToUpdate.user_rank)) {
            showRowMsg(userId, "❌ Rank is required and must be digits.", "error");
            return;
        }

        const allowedFields = {
            name: userToUpdate.name,
            email: userToUpdate.email,
            phone_number: userToUpdate.phone_number,
            user_rank: userToUpdate.user_rank,
            role: userToUpdate.role,
            freezers: asArray(userToUpdate.freezers).map((f) => f.id),
        };

        try {
            await updateUser(userId, allowedFields);
            setEditingUserId(null);
            showRowMsg(userId, "✅ User updated successfully!", "success");
        } catch (err) {
            const serverMsg =
                err?.response?.data ||
                err?.message ||
                "Review the form input. Some fields are not valid.";
            showRowMsg(userId, `❌ ${serverMsg}`, "error");
        }
    };

    // -------- handlers: add form --------
    const handleNewChange = (e) => {
        const { name, value } = e.target;
        // Phone is handled by PhoneInput
        if (name === "phone_number") return;
        let sanitized;
        try {
            // block invalid characters before printing
            if (name === "firstname" || name === "surname") {
                sanitized = (value ?? "").replace(NAME_ALLOWED_STRIP, "");
            } else {
                sanitized = sanitizeByField(name, value);
            }
        } catch {
            sanitized = (value ?? "").trim();
        }
        setNewUser((prev) => {
            const updated = { ...prev, [name]: sanitized };
            if (name === "firstname" || name === "surname") {
                updated.name = recomputeName(updated);
            }
            // per-field errors
            setNewErrors((prevErrs) => {
                const next = { ...prevErrs };
                if (name === "firstname") {
                    next.firstname = updated.firstname?.trim()
                        ? ""
                        : "Firstname is required.";
                } else if (name === "surname") {
                    next.surname = updated.surname?.trim()
                        ? ""
                        : "Surname is required.";
                } else if (name === "email") {
                    next.email = !updated.email
                        ? "Email is required."
                        : validateEmail(updated.email)
                            ? ""
                            : "Invalid email format.";
                } else if (name === "user_rank") {
                    next.user_rank = updated.user_rank
                        ? (validateRank(updated.user_rank) ? "" : "Digits only.")
                        : "Rank is required.";
                }
                return next;
            });
            return updated;
        });
    };

    // IMPORTANT (Add form): allow clearing; only add "+" when digits exist
    const handlePhoneChange = (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setNewUser((prev) => {
            const updated = { ...prev, phone_number: e164 };
            setNewErrors((prevErrs) => ({
                ...prevErrs,
                phone_number: validatePhone(updated.phone_number)
                    ? ""
                    : "Phone must start with +46 and have 9 digits after",
            }));
            return updated;
        });
    };

    const handleRoleChange = (selectedOption) => {
        const roleValue = selectedOption?.value || "";
        setNewUser((prev) => {
            const updated = { ...prev, role: roleValue };
            setNewErrors((prevErrs) => ({
                ...prevErrs,
                role: updated.role ? "" : "Role is required.",
            }));
            return updated;
        });
    };

    const handleAddUser = async () => {
        // final validation
        const draft = { ...newUser, name: recomputeName(newUser) };
        const errs = validateNewUser(draft);
        setNewErrors(errs);
        if (Object.values(errs).some(Boolean)) return;

        const payload = {
            firstname: draft.firstname,
            surname: draft.surname,
            name: draft.name,
            email: draft.email,
            phone_number: draft.phone_number,
            user_rank: draft.user_rank,
            role: draft.role,
        };

        try {
            const created = await createUser(payload);
            let freezers = await fetchFreezersByUser(created.id);
            freezers = asArray(freezers);
            setUsers((prev) => [...prev, { ...created, freezers }]);

            setNewUser({
                firstname: "",
                surname: "",
                name: "",
                email: "",
                phone_number: "+46",
                user_rank: "",
                role: "",
            });
            setNewErrors({
                firstname: "",
                surname: "",
                email: "",
                phone_number: "",
                user_rank: "",
                role: "",
            });
            setShowAddForm(false);
            setMessage({ text: "✅ New user created successfully!", kind: "success" });
        } catch (err) {
            const errorText = err?.response?.data;
            if (
                typeof errorText === "string" &&
                errorText.includes("Email already exists")
            ) {
                setNewErrors((prev) => ({
                    ...prev,
                    email: "This email is already in use.",
                }));
                //setMessage("❌ This email is already in use.");
                setMessage({ text: "❌ This email is already in use.", kind: "error" });
            } else {
                //setMessage("❌ Failed to create user.");
                setMessage({ text: "❌ Failed to create user.", kind: "error" });
            }
        }
    };

    if (!role) return <Navigate to="/login" replace />;

    // -------- render --------
    return (
        <main className="container py-4">
            <h2 className="text-center  mb-2 mb-sm-4">Registered Personnel</h2>

            {/* TOP banner — used by Add form only */}
            {message.text && (
                <div className={`alert ${message.kind === "success" ? "alert-success" : "alert-error"}`} role="alert">
                    {message.text}
                </div>
            )}

            <div className="d-flex justify-content-center mb-3">
                <button
                    className="btn mx-auto"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "Hide Form" : "Add New User"}
                </button>
            </div>

            {showAddForm && (
                <div
                    className="border p-3 rounded mb-4"
                    style={{ backgroundColor: "#f8fff0", maxWidth: "500px", margin: "0 auto" }}
                >
                    <h5 className="mb-3">Add New User</h5>
                    <div className="d-flex flex-column gap-2">
                        <input
                            name="firstname"
                            className={`form-control ${newErrors.firstname ? "is-invalid" : ""}`}
                            placeholder="Firstname"
                            value={newUser.firstname}
                            onChange={handleNewChange}
                        />
                        {newErrors.firstname && (
                            <div className="text-danger small">{newErrors.firstname}</div>
                        )}
                        <input
                            name="surname"
                            className={`form-control ${newErrors.surname ? "is-invalid" : ""}`}
                            placeholder="Surname"
                            value={newUser.surname}
                            onChange={handleNewChange}
                        />
                        {newErrors.surname && (
                            <div className="text-danger small">{newErrors.surname}</div>
                        )}

                        <input
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            className={`form-control ${newErrors.email ? "is-invalid" : ""}`}
                            placeholder="Email"
                            value={newUser.email}
                            onChange={handleNewChange}
                        />
                        {newErrors.email && (
                            <div className="text-danger small">{newErrors.email}</div>
                        )}

                        <PhoneInput
                            country="se"
                            onlyCountries={["se"]}
                            disableDropdown
                            countryCodeEditable={false}
                            masks={{ se: "..-... .. .." }}             // 2-3 2 2 groups
                            placeholder="+46 XX-XXX XX XX"
                            value={newUser.phone_number || ""}
                            onChange={(val) => handlePhoneChange(val)}
                            inputClass={`form-control ${newErrors.phone_number ? "is-invalid" : ""}`}
                            containerClass="w-100"
                        />
                        {newErrors.phone_number && (
                            <div className="text-danger small">{newErrors.phone_number}</div>
                        )}

                        <select
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
                        {newErrors.user_rank && (
                            <div className="text-danger small">{newErrors.user_rank}</div>
                        )}

                        <Select
                            className="role-type-select"
                            classNamePrefix="ft"
                            options={roleOptions}
                            placeholder="Select role"
                            value={roleOptions.find((opt) => opt.value === newUser.role) || null}
                            onChange={handleRoleChange}
                            isSearchable={false}
                        />
                        {newErrors.role && (
                            <div className="text-danger small">{newErrors.role}</div>
                        )}
                    </div>

                    <div className="d-flex justify-content-between mt-3">
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
                                setShowAddForm(false);
                                setNewUser({
                                    firstname: "",
                                    surname: "",
                                    name: "",
                                    email: "",
                                    phone_number: "+46",
                                    user_rank: "",
                                    role: "",
                                });
                                setNewErrors({
                                    firstname: "",
                                    surname: "",
                                    email: "",
                                    phone_number: "",
                                    user_rank: "",
                                    role: "",
                                });
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div>Loading users...</div>
            ) : users.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-bordered table-sm text-center">
                        <thead style={{ backgroundColor: "#A9C46C", color: "white" }}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th className="d-none d-md-table-cell">Phone</th>
                            <th className="d-none d-lg-table-cell">Rank</th>
                            <th className="d-none d-lg-table-cell">Role</th>
                            <th className="d-none d-lg-table-cell">Assigned freezers</th>
                            <th className="d-none d-md-table-cell">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => {
                            const isEditing = editingUserId === user.id;
                            const isExpanded = expandedUserId === user.id;
                            const phoneInvalid = isEditing && !validatePhone(user.phone_number || "");

                            return (
                                <React.Fragment key={user.id}>
                                    <tr>
                                        <td className="text-start d-flex justify-content-between align-items-center">
                                            {isEditing ? (
                                                <input
                                                    name="name"
                                                    className="form-control"
                                                    value={user.name}
                                                    onChange={(e) => handleEditChange(e, user.id)}
                                                />
                                            ) : (
                                                <>
                                                    {user.name}
                                                    <button
                                                        className="btn btn-sm d-md-none ms-auto"
                                                        onClick={() => toggleExpand(user.id)}
                                                        style={{ backgroundColor: "#A9C46C", color: "white" }}
                                                    >
                                                        {isExpanded ? "▲" : "▼"}
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    name="email"
                                                    className="form-control"
                                                    value={user.email}
                                                    onChange={(e) => handleEditChange(e, user.id)}
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </td>

                                        <td className="d-none d-md-table-cell">
                                            {isEditing ? (
                                                <PhoneInput
                                                    country="se"
                                                    onlyCountries={["se"]}
                                                    disableDropdown
                                                    countryCodeEditable={false}
                                                    masks={{ se: "..-... .. .." }}
                                                    placeholder="+46 XX-XXX XX XX"
                                                    value={user.phone_number || ""}
                                                    onChange={handleEditPhoneChange(user.id)}
                                                    inputClass={`form-control ${phoneInvalid ? "is-invalid" : ""}`}
                                                    containerClass="w-100"
                                                />
                                            ) : (
                                                user.phone_number
                                            )}
                                        </td>

                                        <td className="d-none d-lg-table-cell">
                                            {isEditing ? (
                                                <select
                                                    name="user_rank"
                                                    className="form-control"
                                                    value={user.user_rank || ""}
                                                    onChange={(e) => handleEditChange(e, user.id)}
                                                >
                                                    <option value="">Choose rank…</option>
                                                    {[...Array(10)].map((_, i) => {
                                                        const v = String(i + 1);
                                                        return (
                                                            <option key={v} value={v}>
                                                                {v}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            ) : (
                                                user.user_rank
                                            )}
                                        </td>

                                        <td className="d-none d-lg-table-cell">
                                            {isEditing ? (
                                                <input
                                                    name="role"
                                                    className="form-control"
                                                    value={user.role}
                                                    onChange={(e) => handleEditChange(e, user.id)}
                                                />
                                            ) : (
                                                user.role
                                            )}
                                        </td>

                                        <td
                                            className="d-none d-lg-table-cell freezer-numbers"
                                            style={{ width: "80px" }}
                                        >
                                            {isEditing ? (
                                                <div className="d-flex flex-column">
                                                    {asArray(user.freezers).map((freezer) => {
                                                        const isAsking =
                                                            confirmingFreezer &&
                                                            confirmingFreezer.userId === user.id &&
                                                            confirmingFreezer.freezerId === freezer.id;

                                                        return (
                                                            <div
                                                                key={freezer.id}
                                                                className="d-flex align-items-center mb-2"
                                                            >
                                  <span
                                      className="form-control me-2"
                                      style={{ width: "80px" }}
                                  >
                                    {freezer.number}
                                  </span>
                                                                {isAsking ? (
                                                                    <div className="d-flex align-items-center gap-2">
                                      <span className="text-danger small fw-semibold">
                                        Remove?
                                      </span>
                                                                        <button
                                                                            className="btn btn-sm btn-danger"
                                                                            onClick={() =>
                                                                                handleDeleteFreezer(user.id, freezer.id)
                                                                            }
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
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() =>
                                                                            askRemoveFreezer(user.id, freezer.id)
                                                                        }
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
                                                asArray(user.freezers).map((freezer) => (
                                                    <div key={freezer.id}>{freezer.number}</div>
                                                ))
                                            )}
                                        </td>

                                        <td className="d-none d-md-table-cell">
                                            <div className="d-flex justify-content-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ backgroundColor: "#7BAE3F", color: "white" }}
                                                            onClick={() => handleSave(user.id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => setEditingUserId(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ backgroundColor: "#5D8736", color: "white" }}
                                                            onClick={() => setEditingUserId(user.id)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{
                                                                backgroundColor: "#A9C46C",
                                                                color: "white",
                                                                border: "1px solid #c3e6cb",
                                                            }}
                                                            onClick={() => confirmDelete(user.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Mobile expanded row */}
                                    {isExpanded && (
                                        <tr className="d-md-none">
                                            <td colSpan="7" className="text-start bg-light">
                                                <div>
                                                    <strong>Phone:</strong> {user.phone_number}
                                                </div>
                                                <div>
                                                    <strong>Rank:</strong> {user.user_rank}
                                                </div>
                                                <div>
                                                    <strong>Role:</strong> {user.role}
                                                </div>
                                                <div>
                                                    <strong>Assigned Freezers:</strong>
                                                </div>
                                                {asArray(user.freezers).map((freezer) => (
                                                    <div key={freezer.id}>{freezer.number}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    )}

                                    {/* INLINE DELETE CONFIRMATION under the row */}
                                    {deletingUserId === user.id && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="alert alert-warning d-flex justify-content-between align-items-center my-2">
                                                    <span>Are you sure you want to delete this user?</span>
                                                    <span className="d-flex gap-2">
                              <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(user.id)}
                              >
                                Yes, delete
                              </button>
                              <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setDeletingUserId(null)}
                              >
                                Cancel
                              </button>
                            </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* INLINE ROW MESSAGE (edit/delete/freezer feedback) */}
                                    {rowMessages[user.id] && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className={`alert ${msgClass(rowMessages[user.id].kind)} my-2`}>
                                                    {rowMessages[user.id].text}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p className="text-center">No users found.</p>
            )}
        </main>
    );
};

export default StaffContent;
