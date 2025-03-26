import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser, createUser } from '../services/api';
import { Navigate } from "react-router-dom";

const PersonalContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "", email: "", phone_number: "", user_rank: "", role: ""
    });

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
            setUsers(data);
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

    const handleSave = async (userId) => {
        const userToUpdate = users.find((user) => user.id === userId);
        try {
            await updateUser(userId, userToUpdate);
            setEditingUserId(null);
        } catch (err) {
            alert("Failed to update user");
        }
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

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.role) {
            alert("Name, email, and role are required.");
            return;
        }

        try {
            const created = await createUser(newUser);
            setUsers((prev) => [...prev, created]);
            setNewUser({ name: "", email: "", phone_number: "", role: "", user_rank: "" });
        } catch (err) {
            alert("Failed to create user");
        }
    };

    if (role && role !== "admin") {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <main className="container mt-5">
            <h2 className="text-center">List of Registered Personnel</h2>
            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            <div className="mb-4 mt-3 border p-3 rounded" style={{ backgroundColor: "#f8fff0" }}>
                <h5>Add New User</h5>
                <div className="row g-2">
                    <input name="name" className="form-control col" placeholder="Name" value={newUser.name} onChange={handleNewChange} />
                    <input name="email" className="form-control col" placeholder="Email" value={newUser.email} onChange={handleNewChange} />
                    <input name="phone_number" className="form-control col" placeholder="Phone" value={newUser.phone_number} onChange={handleNewChange} />
                    <input name="user_rank" className="form-control col" placeholder="Rank" value={newUser.user_rank} onChange={handleNewChange} />
                    <input name="role" className="form-control col" placeholder="Role" value={newUser.role} onChange={handleNewChange} />
                    <button
                        className="btn btn-sm"
                        style={{
                            backgroundColor: "#5D8736",
                            color: "white",
                            border: "none",
                            padding: "6px 16px",
                            fontSize: "14px",
                            borderRadius: "5px",
                            width: "auto",
                            height: "38px"
                        }}
                        onClick={handleAddUser}
                    >
                        Add
                    </button>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="table-responsive mt-4 px-2">
                    <table className="table table-bordered table-hover text-center" style={{ backgroundColor: "#F4FFC3", color: "#5D8736", border: "2px solid #5D8736", width: "100%" }}>
                        <thead style={{ backgroundColor: "#5D8736", color: "white" }}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Rank</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{editingUserId === user.id ? <input name="name" value={user.name} onChange={(e) => handleEditChange(e, user.id)} /> : user.name}</td>
                                <td>{editingUserId === user.id ? <input name="email" value={user.email} onChange={(e) => handleEditChange(e, user.id)} /> : user.email}</td>
                                <td>{editingUserId === user.id ? <input name="phone_number" value={user.phone_number} onChange={(e) => handleEditChange(e, user.id)} /> : user.phone_number}</td>
                                <td>{editingUserId === user.id ? <input name="user_rank" value={user.user_rank} onChange={(e) => handleEditChange(e, user.id)} /> : user.user_rank}</td>
                                <td>{editingUserId === user.id ? <input name="role" value={user.role} onChange={(e) => handleEditChange(e, user.id)} /> : user.role}</td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <>
                                            <button className="btn btn-sm me-2" style={{ backgroundColor: "#7BAE3F", color: "white", border: "none" }} onClick={() => handleSave(user.id)}>Save</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: "#6c757d", color: "white", border: "none" }} onClick={() => setEditingUserId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm me-2" style={{ backgroundColor: "#5D8736", color: "white", border: "none" }} onClick={() => setEditingUserId(user.id)}>Edit</button>
                                            <button className="btn btn-sm me-2" style={{ backgroundColor: "#A9C46C", color: "#ffffff", border: "1px solid #c3e6cb", fontWeight: "500", transition: "color 0.2s ease" }} onMouseEnter={(e) => e.target.style.color = "#fff700"} onMouseLeave={(e) => e.target.style.color = "#ffffff"} onClick={() => handleDelete(user.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (!loading && <p className="text-center">No users found.</p>)}
        </main>
    );
};

export default PersonalContent;



