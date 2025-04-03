import { useEffect, useState } from "react";
import {
    fetchUsers,
    updateUser,
    deleteUser,
    createUser,
    fetchFreezersByUser,
    deleteFreezerFromUser
} from '../services/api';
import { Navigate } from "react-router-dom";
import Select from "react-select";

const PersonalContent = () => {
    const [successMessage, setSuccessMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [deletingUserId, setDeletingUserId] = useState(null);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "", email: "", phone_number: "", user_rank: "", role: ""
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [role, setRole] = useState(sessionStorage.getItem("role"));
    const roleOptions = [
        { value: "user", label: "user" },
        { value: "admin", label: "admin" }
    ];

    useEffect(() => {
        const fetchRoleIfNeeded = async () => {
            if (!role) {
                try {
                    const res = await fetch("http://localhost:8000/api/auth/role", {
                        credentials: "include"
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

    useEffect(() => {
        if (role === "admin") {
            loadUsers();
        }
    }, [role]);

    useEffect(() => {
        if (successMessage || formError) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setFormError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, formError]);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            const usersWithFreezers = await Promise.all(
                data.map(async (user) => {
                    const freezers = await fetchFreezersByUser(user.id);
                    return { ...user, freezers: Array.isArray(freezers) ? freezers : [] };
                })
            );
            setUsers(usersWithFreezers);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e, userId) => {
        const { name, value } = e.target;
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, [name]: value } : user
            )
        );
    };

    const handleFreezerChange = (e, userId, index) => {
        const { value } = e.target;
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId
                    ? {
                        ...user,
                        freezers: user.freezers.map((freezer, i) =>
                            i === index ? { ...freezer, number: value } : freezer
                        )
                    }
                    : user
            )
        );
    };

    const handleDeleteFreezer = async (userId, freezerId) => {
        try {
            await deleteFreezerFromUser(userId, freezerId);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            freezers: user.freezers.filter((freezer) => freezer.id !== freezerId)
                        }
                        : user
                )
            );
            setSuccessMessage("Freezer deleted.");
            setFormError("");
        } catch (err) {
            setFormError("Failed to delete freezer.");
            setSuccessMessage("");
            console.error("Error deleting freezer from user:", err);
        }
    };

    const handleDelete = (userId) => {
        setDeletingUserId(userId);
    };

    const confirmDelete = async (userId) => {
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            setSuccessMessage("User deleted.");
            setFormError("");
            setDeletingUserId(null);
        } catch (err) {
            setFormError("Failed to delete user.");
            setSuccessMessage("");
        }
    };

    const cancelDelete = () => {
        setDeletingUserId(null);
    };

    const handleNewChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (userId) => {
        const userToUpdate = users.find((user) => user.id === userId);
        const allowedFields = {
            name: userToUpdate.name,
            email: userToUpdate.email,
            phone_number: userToUpdate.phone_number,
            user_rank: userToUpdate.user_rank,
            role: userToUpdate.role,
            freezers: userToUpdate.freezers.map((freezer) => freezer.id)
        };

        try {
            await updateUser(userId, allowedFields);
            setEditingUserId(null);
            setSuccessMessage("User updated.");
            setFormError("");
        } catch (err) {
            setFormError("Failed to update user.");
            setSuccessMessage("");
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.role) {
            setFormError("Name, email, and role are required.");
            setSuccessMessage("");
            return;
        }

        try {
            const created = await createUser(newUser);
            setUsers((prev) => [...prev, created]);
            setNewUser({ name: "", email: "", phone_number: "", user_rank: "", role: "" });
            setShowAddForm(false);
            setSuccessMessage("User created.");
            setFormError("");
        } catch (err) {
            setFormError("Failed to create user.");
            setSuccessMessage("");
        }
    };

    const toggleExpand = (userId) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
    };

    if (role && role !== "admin") {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <main className="container mt-5">
            <h2 className="text-center mb-4">Registered Personnel</h2>

            {successMessage && (
                <div className="alert alert-success mx-auto text-center small" style={{ maxWidth: '400px' }}>{successMessage}</div>
            )}
            {formError && (
                <div className="alert alert-danger mx-auto text-center small" style={{ maxWidth: '400px' }}>{formError}</div>
            )}

            <div className="text-center mb-3">
                <button
                    className="btn"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "Hide Form" : "Add New User"}
                </button>
            </div>

            {showAddForm && (
                <div className="border p-3 rounded mb-4" style={{ backgroundColor: "#f8fff0", maxWidth: "500px", margin: "0 auto" }}>
                    <h5 className="mb-3">Add New User</h5>
                    <div className="d-flex flex-column gap-2">
                        <input name="name" className="form-control" placeholder="Name" value={newUser.name} onChange={handleNewChange} />
                        <input name="email" className="form-control" placeholder="Email" value={newUser.email} onChange={handleNewChange} />
                        <input name="phone_number" className="form-control" placeholder="Phone" value={newUser.phone_number} onChange={handleNewChange} />
                        <input name="user_rank" className="form-control" placeholder="Rank" value={newUser.user_rank} onChange={handleNewChange} />
                        <Select
                            className="role-type-select"
                            classNamePrefix="ft"
                            options={roleOptions}
                            placeholder="Select role"
                            value={roleOptions.find(opt => opt.value === newUser.role) || null}
                            onChange={(selectedOption) =>
                                setNewUser((prev) => ({
                                    ...prev,
                                    role: selectedOption.value
                                }))
                            }
                        />
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                        <button className="btn" style={{ backgroundColor: "#5D8736", color: "white" }} onClick={handleAddUser}>Add</button>
                        <button className="btn btn-secondary" onClick={() => {
                            setShowAddForm(false);
                            setNewUser({ name: "", email: "", phone_number: "", user_rank: "", role: "" });
                        }}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="table-responsive mt-4">
                <table className="table table-bordered table-hover text-center">
                    <thead style={{ backgroundColor: "#A9C46C", color: "white" }}>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Rank</th>
                        <th>Role</th>
                        <th>Freezers</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => {
                        const isEditing = editingUserId === user.id;
                        return (
                            <tr key={user.id}>
                                <td>{isEditing ? <input name="name" value={user.name} onChange={(e) => handleEditChange(e, user.id)} /> : user.name}</td>
                                <td>{isEditing ? <input name="email" value={user.email} onChange={(e) => handleEditChange(e, user.id)} /> : user.email}</td>
                                <td>{isEditing ? <input name="phone_number" value={user.phone_number} onChange={(e) => handleEditChange(e, user.id)} /> : user.phone_number}</td>
                                <td>{isEditing ? <input name="user_rank" value={user.user_rank} onChange={(e) => handleEditChange(e, user.id)} /> : user.user_rank}</td>
                                <td>{isEditing ? <input name="role" value={user.role} onChange={(e) => handleEditChange(e, user.id)} /> : user.role}</td>
                                <td>
                                    {user.freezers?.map((freezer, index) => (
                                        <div key={freezer.id || index} className="d-flex align-items-center justify-content-center mb-1">
                                            <span className="form-control form-control-sm me-1" style={{ maxWidth: '80px' }}>{freezer.number}</span>
                                            {isEditing && (
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: "#A93226", color: "white" }}
                                                    onClick={() => handleDeleteFreezer(user.id, freezer.id)}
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <>
                                            <button className="btn btn-sm me-2" style={{ backgroundColor: "#5D8736", color: "white" }} onClick={() => handleSave(user.id)}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingUserId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm me-2" style={{ backgroundColor: "#5D8736", color: "white" }} onClick={() => setEditingUserId(user.id)}>Edit</button>
                                            {deletingUserId === user.id ? (
                                                <>
                                                    <button className="btn btn-sm me-2" style={{ backgroundColor: "#A93226", color: "white" }} onClick={() => confirmDelete(user.id)}>Confirm</button>
                                                    <button className="btn btn-sm btn-secondary" onClick={cancelDelete}>Cancel</button>
                                                </>
                                            ) : (
                                                <button className="btn btn-sm" style={{ backgroundColor: "#A9C46C", color: "white" }} onClick={() => handleDelete(user.id)}>Delete</button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default PersonalContent;









