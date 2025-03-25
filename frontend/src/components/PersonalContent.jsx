import { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser, createUser } from '../services/api';




console.log("PersonalContent.jsx: Rendering PersonalContent component...");


const PersonalContent = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        name: "", email: "", phone_number: "", role: ""
    });

    useEffect(() => {
        loadUsers();
    }, []);

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
            await updateUser(userToUpdate);
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
            setNewUser({ name: "", email: "", phone_number: "", role: "" });
        } catch (err) {
            alert("Failed to create user");
        }
    };

    return (
        <main className="container mt-5">
            <h2 className="text-center">List of Registered Personnel</h2>

            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {/* Add New User */}
            <div className="mb-4 mt-3 border p-3 rounded" style={{ backgroundColor: "#f8fff0" }}>
                <h5>Add New User</h5>
                <div className="row g-2">
                    <input name="name" className="form-control col" placeholder="Name" value={newUser.name} onChange={handleNewChange} />
                    <input name="email" className="form-control col" placeholder="Email" value={newUser.email} onChange={handleNewChange} />
                    <input name="phone_number" className="form-control col" placeholder="Phone" value={newUser.phone_number} onChange={handleNewChange} />
                    <input name="role" className="form-control col" placeholder="Role" value={newUser.role} onChange={handleNewChange} />
                    <button className="btn btn-success col-2" onClick={handleAddUser}>Add</button>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="table-responsive mt-4 px-2">
                    <table className="table table-bordered table-hover text-center"
                           style={{
                               backgroundColor: "#F4FFC3",
                               color: "#5D8736",
                               border: "2px solid #5D8736",
                               width: "100%",
                           }}>
                        <thead style={{ backgroundColor: "#5D8736", color: "white" }}>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    {editingUserId === user.id ? (
                                        <input name="name" value={user.name} onChange={(e) => handleEditChange(e, user.id)} />
                                    ) : user.name}
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <input name="email" value={user.email} onChange={(e) => handleEditChange(e, user.id)} />
                                    ) : user.email}
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <input name="phone_number" value={user.phone_number} onChange={(e) => handleEditChange(e, user.id)} />
                                    ) : user.phone_number}
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <input name="role" value={user.role} onChange={(e) => handleEditChange(e, user.id)} />
                                    ) : user.role}
                                </td>
                                <td>
                                    {editingUserId === user.id ? (
                                        <>
                                            <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(user.id)}>Save</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingUserId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-primary btn-sm me-2" onClick={() => setEditingUserId(user.id)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && <p className="text-center">No users found.</p>
            )}
        </main>
    );
};

export default PersonalContent;
