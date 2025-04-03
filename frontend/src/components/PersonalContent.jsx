import { useEffect, useState } from "react";
import {fetchUsers, updateUser, deleteUser, createUser, fetchFreezersByUser} from '../services/api';
import { Navigate } from "react-router-dom";

const PersonalContent = () => {
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
    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            // For each user, fetch the freezers assigned to them
            const usersWithFreezers = await Promise.all(
                data.map(async (user) => {
                    const freezers = await fetchFreezersByUser(user.id);
                    return { ...user, freezers }; // Add freezers to the user object
                })
            );
            setUsers(usersWithFreezers);  // Set the users state with the users and their freezers
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



    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((user) => user.id !== userId));
        } catch (err) {
            alert("Failed to delete user");
        }
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
            role: userToUpdate.role
        };

        try {
            await updateUser(userId, allowedFields);
            setEditingUserId(null);
        } catch (err) {
            alert("Failed to update user");
        }
    };


    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.role) {
            alert("Name, email, and role are required.");
            return;
        }

        try {
            const created = await createUser(newUser);
            setUsers((prev) => [...prev, created]);
            setNewUser({ name: "", email: "", phone_number: "", user_rank: "", role: "" });
            setShowAddForm(false);
        } catch (err) {
            alert("Failed to create user");
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
                        <input name="role" className="form-control" placeholder="Role" value={newUser.role} onChange={handleNewChange} />
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

            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {users.length > 0 ? (
                <div className="table-responsive mt-4">
                    <table className="table table-bordered table-hover text-center">
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

                            return (
                                <>
                                    <tr key={user.id}>
                                        <td className="text-start d-flex justify-content-between align-items-center">
                                            {isEditing ? (
                                                <input name="name" value={user.name} onChange={(e) => handleEditChange(e, user.id)} />
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
                                        <td>{isEditing ? <input name="email" value={user.email} onChange={(e) => handleEditChange(e, user.id)} /> : user.email}</td>
                                        <td className="d-none d-md-table-cell">{isEditing ? <input name="phone_number" value={user.phone_number} onChange={(e) => handleEditChange(e, user.id)} /> : user.phone_number}</td>
                                        <td className="d-none d-lg-table-cell">{isEditing ? <input name="user_rank" value={user.user_rank} onChange={(e) => handleEditChange(e, user.id)} /> : user.user_rank}</td>
                                        <td className="d-none d-lg-table-cell">{isEditing ? <input name="role" value={user.role} onChange={(e) => handleEditChange(e, user.id)} /> : user.role}</td>
                                        <td className="d-none d-lg-table-cell freezer-numbers">
                                            {user.freezers?.map(freezer => (
                                                <div key={freezer.id}>
                                                    {freezer.number} - {freezer.room}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            {isEditing ? (
                                                <>
                                                    <button className="btn btn-sm me-2" style={{ backgroundColor: "#7BAE3F", color: "white" }} onClick={() => handleSave(user.id)}>Save</button>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingUserId(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-sm me-2" style={{ backgroundColor: "#5D8736", color: "white" }} onClick={() => setEditingUserId(user.id)}>Edit</button>
                                                    <button className="btn btn-sm" style={{ backgroundColor: "#A9C46C", color: "white", border: "1px solid #c3e6cb" }} onClick={() => handleDelete(user.id)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Mobile-only expanded section with action buttons */}
                                    {isExpanded && (
                                        <tr className="d-md-none">
                                            <td colSpan="6" className="text-start bg-light">
                                                <div><strong>Phone:</strong> {user.phone_number}</div>
                                                <div><strong>Rank:</strong> {user.user_rank}</div>
                                                <div><strong>Role:</strong> {user.role}</div>
                                                <div><strong>Assigned Freezers:</strong></div>
                                                {user.freezers?.map(freezer => (
                                                    <div key={freezer.id}>
                                                        {freezer.number} - {freezer.room}
                                                    </div>
                                                ))}

                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (!loading && <p className="text-center">No users found.</p>)}
        </main>
    );
};

export default PersonalContent;










