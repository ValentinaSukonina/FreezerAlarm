import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Navigate } from "react-router-dom";
import {
    fetchUsers,
    updateUser,
    deleteUser,
    fetchFreezersByUser,
    deleteFreezerFromUser,
} from "../services/api";

import {
    sanitizeByField,
    formatPhoneSE,
    validateUser,
} from "../services/utils";
import "../assets/styles.css";
import AddUserForm from "./AddUserForm";
import UserCard from "./UserCard";

// ---- small helpers ----
const asArray = (v) => (Array.isArray(v) ? v : []);

const StaffContent = () => {
    // -------- state --------
    const [message, setMessage] = useState({ text: "", kind: "" }); // top banner (Add form only)
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [deletedUserIds, setDeletedUserIds] = useState([]);
    const [users, setUsers] = useState([]);
    const [rowMessages, setRowMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [editErrors, setEditErrors] = useState({});

    const [sortOrder, setSortOrder] = useState("asc");
    const sortedUsers = [...users].sort((a, b) =>
        sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
    );

    // drafts/errors for inline edit rows
    const [drafts, setDrafts] = useState({});        // { [id]: {...fields} }

    // Inline confirm for removing a freezer from a user
    const [confirmingFreezer, setConfirmingFreezer] = useState(null); // { userId, freezerId } | null

    const [showAddForm, setShowAddForm] = useState(false);

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

    // -------- handlers: edit inline --------
    const handleEditChange = (e, userId) => {
        const { name, value } = e.target;
        setDrafts((prev) => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {}),
                [name]: sanitizeByField(name, value, { live: true }),
            },
        }));
        // clear that field's error as user types
        setEditErrors((prev) => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), [name]: "" },
        }));
    };

    const handleEditPhoneChange = (userId) => (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setDrafts((prev) => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), phone_number: e164 },
        }));
        setEditErrors((prev) => ({
            ...prev,
            [userId]: { ...(prev[userId] || {}), phone_number: "" },
        }));
    };

    // confirmation for removing a freezer (inline)
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
            setConfirmingFreezer(null);
            showRowMsg(userId, "✅ Freezer removed from user.", "success");
        } catch (err) {
            setConfirmingFreezer(null);
            showRowMsg(userId, "❌ Failed to remove freezer.", "error");
        }
    };

    // delete User
    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            setDeletedUserIds((prev) => [...prev, userId]);

            // remove after delay
            setTimeout(() => {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                setDeletedUserIds((prev) => prev.filter((id) => id !== userId));
            }, 2000);
        } catch (err) {
            showRowMsg(userId, "❌ Failed to delete user.", "error");
        }
    };

    const handleSave = async (userId) => {
        const original = users.find((u) => u.id === userId);
        const draft = drafts[userId] || {};
        const candidate = { ...original, ...draft };

        // run unified validator
        const { cleaned, errors, valid } = validateUser(candidate, {
            mode: "edit",
            original,
        });
        if (!valid) {
            setEditErrors((prev) => ({ ...prev, [userId]: errors }));
            return;
        }

        const payload = {
            name: cleaned.name,
            email: cleaned.email,
            phone_number: cleaned.phone_number,
            user_rank: cleaned.user_rank,
            role: cleaned.role,
            freezers: Array.isArray(original.freezers)
                ? original.freezers.map((f) => f.id)
                : [],
        };

        try {
            const updated = await updateUser(userId, payload);
            // commit to users
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, ...updated } : u))
            );
            // clear edit mode/drafts/errors
            setEditingUserId(null);
            setDrafts((prev) => {
                const n = { ...prev };
                delete n[userId];
                return n;
            });
            setEditErrors((prev) => {
                const n = { ...prev };
                delete n[userId];
                return n;
            });
            showRowMsg(userId, "✅ User updated successfully!", "success");
        } catch (err) {
            const text = err?.data || err?.message || "";
            const fieldErrs = {};
            if (/name\s*already\s*exists|duplicate\s*name|user\s*already\s*exists/i.test(text)) {
                fieldErrs.name = "This full name is already taken.";
            }
            if (/email\s*already\s*exists|duplicate\s*email/i.test(text)) {
                fieldErrs.email = "This email is already in use.";
            }
            setEditErrors((prev) => ({
                ...prev,
                [userId]: { ...(prev[userId] || {}), ...fieldErrs },
            }));
            if (!Object.keys(fieldErrs).length) {
                showRowMsg(userId, `❌ ${err?.message || "Update failed."}`, "error");
            }
        }
    };

    if (!role) return <Navigate to="/login" replace />;

    // -------- render --------
    return (
        <main className="container py-4 px-1">
            <h2 className="text-center mb-2 mb-sm-4">Registered Personnel
                <button className="sort-btn mx-3" onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}>
                    {sortOrder === "asc" ? <i className="bi bi-sort-alpha-down"></i> : <i className="bi bi-sort-alpha-up"></i>}
                </button>
            </h2>

            {/* TOP banner — used by Add form only */}
            {message.text && (
                <div
                    className={`alert ${
                        message.kind === "success" ? "alert-success" : "alert-error"
                    }`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}

            <div className="d-flex justify-content-center mb-2 mb-sm-3">
                <button
                    className="btn mx-auto py-1"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "Hide Form" : "Add New User"}
                </button>
            </div>

            {showAddForm && (
                <AddUserForm
                    users={users}
                    roleOptions={[
                        { value: "user", label: "user" },
                        { value: "admin", label: "admin" },
                    ]}
                    onUserCreated={(createdWithFreezers) => {
                        setUsers(prev => [...prev, createdWithFreezers]);
                    }}
                    onClose={() => setShowAddForm(false)}
                    setTopMessage={(m) => setMessage(m)}
                />
            )}

    {loading ? (
        <div className="my-3">Loading users...</div>
    ) : users.length > 0 ? (
        <div>
            {sortedUsers.map((u) =>
                deletedUserIds.includes(u.id) ? (
                    <div key={u.id} className="alert alert-success text-center my-2">
                        ✅ User <strong>{u.name}</strong> deleted successfully!
                    </div>
                ) : (
                <UserCard
                    key={u.id}
                    user={u}

                    onUpdate={async (id, fields) => {
                        const updated = await updateUser(id, fields);
                        setUsers((prev) => prev.map(x => (x.id === id ? { ...x, ...updated } : x)));
                    }}
                    onDelete={handleDelete}

                    onRemoveFreezer={async (userId, freezerId) => {
                        await deleteFreezerFromUser(userId, freezerId);
                        setUsers(prev =>
                            prev.map(x =>
                                x.id === userId
                                    ? { ...x, freezers: asArray(x.freezers).filter(f => f.id !== freezerId) }
                                    : x
                            )
                        );
                    }}
                />
            ))}
        </div>
    ) : (
        !loading && <p className="text-center">No users found.</p>
    )}

            {/*{loading ? (*/}
            {/*    <div className="my-3">Loading users...</div>*/}
            {/*) : users.length > 0 ? (*/}
            {/*    <div className="table-responsive">*/}
            {/*        <table className="table table-bordered table-sm text-center">*/}
            {/*            <thead style={{ backgroundColor: "#A9C46C", color: "white" }}>*/}
            {/*            <tr>*/}
            {/*                <th>Name</th>*/}
            {/*                <th>Email</th>*/}
            {/*                <th className="d-none d-md-table-cell">Phone</th>*/}
            {/*                <th className="d-none d-lg-table-cell">Rank</th>*/}
            {/*                <th className="d-none d-lg-table-cell">Role</th>*/}
            {/*                <th className="d-none d-lg-table-cell">Assigned freezers</th>*/}
            {/*                <th className="d-none d-md-table-cell">Actions</th>*/}
            {/*            </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody>*/}
            {/*            {users.map((user) => {*/}
            {/*                const isEditing = editingUserId === user.id;*/}
            {/*                const isExpanded = expandedUserId === user.id;*/}
            {/*                const row = isEditing ? (drafts[user.id] || user) : user;*/}
            {/*                const errs = editErrors[user.id] || {};*/}

            {/*                return (*/}
            {/*                    <React.Fragment key={user.id}>*/}
            {/*                        <tr>*/}
            {/*                        <td className="text-start d-flex justify-content-between align-items-center">*/}
            {/*                            {isEditing ? (*/}
            {/*                                <>*/}
            {/*                                    <input*/}
            {/*                                        name="name"*/}
            {/*                                        className={`form-control ${errs.name ? "is-invalid" : ""}`}*/}
            {/*                                        value={row.name || ""}*/}
            {/*                                        onChange={(e) => handleEditChange(e, user.id)}*/}
            {/*                                    />*/}
            {/*                                    {errs.name && (*/}
            {/*                                        <div className="invalid-feedback">{errs.name}</div>*/}
            {/*                                    )}*/}
            {/*                                </>*/}
            {/*                            ) : (*/}
            {/*                                <>*/}
            {/*                                    {user.name}*/}
            {/*                                    <button*/}
            {/*                                        className="btn btn-sm d-md-none ms-auto"*/}
            {/*                                        onClick={() => toggleExpand(user.id)}*/}
            {/*                                        style={{ backgroundColor: "#A9C46C", color: "white" }}*/}
            {/*                                    >*/}
            {/*                                        {isExpanded ? "▲" : "▼"}*/}
            {/*                                    </button>*/}
            {/*                                </>*/}
            {/*                            )}*/}
            {/*                        </td>*/}

            {/*                            /!* Email *!/*/}
            {/*                            <td>*/}
            {/*                                {isEditing ? (*/}
            {/*                                    <>*/}
            {/*                                        <input*/}
            {/*                                            name="email"*/}
            {/*                                            className={`form-control ${errs.email ? "is-invalid" : ""}`}*/}
            {/*                                            value={row.email || ""}*/}
            {/*                                            onChange={(e) => handleEditChange(e, user.id)}*/}
            {/*                                        />*/}
            {/*                                        {errs.email && (*/}
            {/*                                            <div className="invalid-feedback">{errs.email}</div>*/}
            {/*                                        )}*/}
            {/*                                    </>*/}
            {/*                                ) : (*/}
            {/*                                    user.email*/}
            {/*                                )}*/}
            {/*                            </td>*/}

            {/*                            /!* Phone *!/*/}
            {/*                            <td className="d-none d-md-table-cell">*/}
            {/*                                {isEditing ? (*/}
            {/*                                    <>*/}
            {/*                                        <PhoneInput*/}
            {/*                                            country="se"*/}
            {/*                                            onlyCountries={["se"]}*/}
            {/*                                            disableDropdown*/}
            {/*                                            countryCodeEditable={false}*/}
            {/*                                            masks={{ se: "..-... .. .." }}*/}
            {/*                                            placeholder="+46 XX-XXX XX XX"*/}
            {/*                                            value={row.phone_number || ""}*/}
            {/*                                            onChange={handleEditPhoneChange(user.id)}*/}
            {/*                                            inputClass={`form-control ${*/}
            {/*                                                errs.phone_number ? "is-invalid" : ""*/}
            {/*                                            }`}*/}
            {/*                                            containerClass="w-100"*/}
            {/*                                        />*/}
            {/*                                        {errs.phone_number && (*/}
            {/*                                            <div className="invalid-feedback d-block">*/}
            {/*                                                {errs.phone_number}*/}
            {/*                                            </div>*/}
            {/*                                        )}*/}
            {/*                                    </>*/}
            {/*                                ) : (*/}
            {/*                                    formatPhoneSE(user.phone_number)*/}
            {/*                                )}*/}
            {/*                            </td>*/}

            {/*                            /!* Rank *!/*/}
            {/*                            <td className="d-none d-lg-table-cell">*/}
            {/*                                {isEditing ? (*/}
            {/*                                    <>*/}
            {/*                                        <input*/}
            {/*                                            name="user_rank"*/}
            {/*                                            className={`form-control ${*/}
            {/*                                                errs.user_rank ? "is-invalid" : ""*/}
            {/*                                            }`}*/}
            {/*                                            value={row.user_rank || ""}*/}
            {/*                                            onChange={(e) => handleEditChange(e, user.id)}*/}
            {/*                                        />*/}
            {/*                                        {errs.user_rank && (*/}
            {/*                                            <div className="invalid-feedback">*/}
            {/*                                                {errs.user_rank}*/}
            {/*                                            </div>*/}
            {/*                                        )}*/}
            {/*                                    </>*/}
            {/*                                ) : (*/}
            {/*                                    user.user_rank*/}
            {/*                                )}*/}
            {/*                            </td>*/}

            {/*                            /!* Role *!/*/}
            {/*                            <td className="d-none d-lg-table-cell">*/}
            {/*                                {isEditing ? (*/}
            {/*                                    <>*/}
            {/*                                        <select*/}
            {/*                                            name="role"*/}
            {/*                                            className={`form-select ${errs.role ? "is-invalid" : ""}`}*/}
            {/*                                            value={row.role || "user"}*/}
            {/*                                            onChange={(e) => handleEditChange(e, user.id)}*/}
            {/*                                        >*/}
            {/*                                            <option value="user">user</option>*/}
            {/*                                            <option value="admin">admin</option>*/}
            {/*                                        </select>*/}
            {/*                                        {errs.role && (*/}
            {/*                                            <div className="invalid-feedback">{errs.role}</div>*/}
            {/*                                        )}*/}
            {/*                                    </>*/}
            {/*                                ) : (*/}
            {/*                                    user.role*/}
            {/*                                )}*/}
            {/*                            </td>*/}

            {/*                            /!* Assigned Freezers *!/*/}
            {/*                            <td className="d-none d-lg-table-cell freezer-numbers" style={{ width: "80px" }}>*/}
            {/*                                {isEditing ? (*/}
            {/*                                    <div className="d-flex flex-column">*/}
            {/*                                        {asArray(user.freezers).map((freezer) => {*/}
            {/*                                            const isAsking =*/}
            {/*                                                confirmingFreezer &&*/}
            {/*                                                confirmingFreezer.userId === user.id &&*/}
            {/*                                                confirmingFreezer.freezerId === freezer.id;*/}

            {/*                                            return (*/}
            {/*                                                <div key={freezer.id} className="d-flex align-items-center mb-2">*/}
            {/*                      <span className="form-control me-2" style={{ width: "80px" }}>*/}
            {/*                        {freezer.number}*/}
            {/*                      </span>*/}
            {/*                                                    {isAsking ? (*/}
            {/*                                                        <div className="d-flex align-items-center gap-2">*/}
            {/*                          <span className="text-danger small fw-semibold">*/}
            {/*                            Remove?*/}
            {/*                          </span>*/}
            {/*                                                            <button*/}
            {/*                                                                className="btn btn-sm btn-danger"*/}
            {/*                                                                onClick={() =>*/}
            {/*                                                                    handleDeleteFreezer(user.id, freezer.id)*/}
            {/*                                                                }*/}
            {/*                                                            >*/}
            {/*                                                                Yes*/}
            {/*                                                            </button>*/}
            {/*                                                            <button*/}
            {/*                                                                className="btn btn-sm btn-secondary"*/}
            {/*                                                                onClick={cancelRemoveFreezer}*/}
            {/*                                                            >*/}
            {/*                                                                Cancel*/}
            {/*                                                            </button>*/}
            {/*                                                        </div>*/}
            {/*                                                    ) : (*/}
            {/*                                                        <button*/}
            {/*                                                            className="btn btn-danger btn-sm"*/}
            {/*                                                            onClick={() => askRemoveFreezer(user.id, freezer.id)}*/}
            {/*                                                            title="Remove this freezer from the user"*/}
            {/*                                                        >*/}
            {/*                                                            X*/}
            {/*                                                        </button>*/}
            {/*                                                    )}*/}
            {/*                                                </div>*/}
            {/*                                            );*/}
            {/*                                        })}*/}
            {/*                                    </div>*/}
            {/*                                ) : (*/}
            {/*                                    asArray(user.freezers).map((freezer) => (*/}
            {/*                                        <div key={freezer.id}>{freezer.number}</div>*/}
            {/*                                    ))*/}
            {/*                                )}*/}
            {/*                            </td>*/}

            {/*                            /!* Actions *!/*/}
            {/*                            <td className="d-none d-md-table-cell">*/}
            {/*                                <div className="d-flex justify-content-center gap-2">*/}
            {/*                                    {isEditing ? (*/}
            {/*                                        <>*/}
            {/*                                            <button*/}
            {/*                                                className="btn btn-sm"*/}
            {/*                                                style={{ backgroundColor: "#7BAE3F", color: "white" }}*/}
            {/*                                                onClick={() => handleSave(user.id)}*/}
            {/*                                            >*/}
            {/*                                                Save*/}
            {/*                                            </button>*/}
            {/*                                            <button*/}
            {/*                                                className="btn btn-sm btn-secondary"*/}
            {/*                                                onClick={() => {*/}
            {/*                                                    setEditingUserId(null);*/}
            {/*                                                    setDrafts((prev) => {*/}
            {/*                                                        const next = { ...prev };*/}
            {/*                                                        delete next[user.id];*/}
            {/*                                                        return next;*/}
            {/*                                                    });*/}
            {/*                                                    setEditErrors((prev) => {*/}
            {/*                                                        const next = { ...prev };*/}
            {/*                                                        delete next[user.id];*/}
            {/*                                                        return next;*/}
            {/*                                                    });*/}
            {/*                                                }}*/}
            {/*                                            >*/}
            {/*                                                Cancel*/}
            {/*                                            </button>*/}
            {/*                                        </>*/}
            {/*                                    ) : (*/}
            {/*                                        <>*/}
            {/*                                            <button*/}
            {/*                                                className="btn btn-sm"*/}
            {/*                                                style={{ backgroundColor: "#5D8736", color: "white" }}*/}
            {/*                                                onClick={() => {*/}
            {/*                                                    setDrafts((prev) => ({ ...prev, [user.id]: { ...user } }));*/}
            {/*                                                    setEditErrors((prev) => ({ ...prev, [user.id]: {} }));*/}
            {/*                                                    setEditingUserId(user.id);*/}
            {/*                                                }}*/}
            {/*                                            >*/}
            {/*                                                Edit*/}
            {/*                                            </button>*/}
            {/*                                            <button*/}
            {/*                                                className="btn btn-sm"*/}
            {/*                                                style={{*/}
            {/*                                                    backgroundColor: "#A9C46C",*/}
            {/*                                                    color: "white",*/}
            {/*                                                    border: "1px solid #c3e6cb",*/}
            {/*                                                }}*/}
            {/*                                                onClick={() => confirmDelete(user.id)}*/}
            {/*                                            >*/}
            {/*                                                Delete*/}
            {/*                                            </button>*/}
            {/*                                        </>*/}
            {/*                                    )}*/}
            {/*                                </div>*/}
            {/*                            </td>*/}
            {/*                        </tr>*/}

            {/*                        /!* Mobile expanded row *!/*/}
            {/*                        {isExpanded && (*/}
            {/*                            <tr className="d-md-none">*/}
            {/*                                <td colSpan="7" className="text-start bg-light">*/}
            {/*                                    <div>*/}
            {/*                                        <strong>Phone:</strong> {formatPhoneSE(user.phone_number)}*/}
            {/*                                    </div>*/}
            {/*                                    <div>*/}
            {/*                                        <strong>Rank:</strong> {user.user_rank}*/}
            {/*                                    </div>*/}
            {/*                                    <div>*/}
            {/*                                        <strong>Role:</strong> {user.role}*/}
            {/*                                    </div>*/}
            {/*                                    <div>*/}
            {/*                                        <strong>Assigned Freezers:</strong>*/}
            {/*                                    </div>*/}
            {/*                                    {asArray(user.freezers).map((freezer) => (*/}
            {/*                                        <div key={freezer.id}>{freezer.number}</div>*/}
            {/*                                    ))}*/}
            {/*                                </td>*/}
            {/*                            </tr>*/}
            {/*                        )}*/}

            {/*                        /!* INLINE DELETE CONFIRMATION under the row *!/*/}
            {/*                        {deletingUserId === user.id && (*/}
            {/*                            <tr>*/}
            {/*                                <td colSpan="7">*/}
            {/*                                    <div className="alert alert-warning d-flex justify-content-between align-items-center my-2">*/}
            {/*                                        <span>Are you sure you want to delete this user?</span>*/}
            {/*                                        <span className="d-flex gap-2">*/}
            {/*                  <button*/}
            {/*                      className="btn btn-danger btn-sm"*/}
            {/*                      onClick={() => handleDelete(user.id)}*/}
            {/*                  >*/}
            {/*                    Yes, delete*/}
            {/*                  </button>*/}
            {/*                  <button*/}
            {/*                      className="btn btn-secondary btn-sm"*/}
            {/*                      onClick={() => setDeletingUserId(null)}*/}
            {/*                  >*/}
            {/*                    Cancel*/}
            {/*                  </button>*/}
            {/*                </span>*/}
            {/*                                    </div>*/}
            {/*                                </td>*/}
            {/*                            </tr>*/}
            {/*                        )}*/}

            {/*                        /!* INLINE ROW MESSAGE (edit/delete/freezer feedback) *!/*/}
            {/*                        {rowMessages[user.id] && (*/}
            {/*                            <tr>*/}
            {/*                                <td colSpan="7">*/}
            {/*                                    <div className={`alert ${msgClass(rowMessages[user.id].kind)} my-2`}>*/}
            {/*                                        {rowMessages[user.id].text}*/}
            {/*                                    </div>*/}
            {/*                                </td>*/}
            {/*                            </tr>*/}
            {/*                        )}*/}
            {/*                    </React.Fragment>*/}
            {/*                );*/}
            {/*            })}*/}
            {/*            </tbody>*/}
            {/*        </table>*/}
            {/*    </div>*/}
            {/*) : (*/}
            {/*    !loading && <p className="text-center">No users found.</p>*/}
            {/*)}*/}
        </main>
    );
};

export default StaffContent;
