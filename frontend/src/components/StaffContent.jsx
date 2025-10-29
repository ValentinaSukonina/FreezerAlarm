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

const asArray = (v) => (Array.isArray(v) ? v : []);

const StaffContent = () => {
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
    const [drafts, setDrafts] = useState({});

    // Inline confirm for removing a freezer from a user
    const [confirmingFreezer, setConfirmingFreezer] = useState(null);

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

    const toggleExpand = (userId) => {
        setExpandedUserId((prev) => (prev === userId ? null : userId));
    };
    const confirmDelete = (userId) => setDeletingUserId(userId);

    const handleEditChange = (e, userId) => {
        const { name, value } = e.target;
        setDrafts((prev) => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {}),
                [name]: sanitizeByField(name, value, { live: true }),
            },
        }));
        // clear field's error as user types
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

        </main>
    );
};

export default StaffContent;
