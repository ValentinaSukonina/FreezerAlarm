import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchUsers, updateUser, fetchAllFreezersWithUsers, fetchUserByName } from "../services/api";

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const username = sessionStorage.getItem("username");

    const loadData = async () => {
        try {
            const currentUser = await fetchUserByName(username);
            if (!currentUser) {
                console.error("User not found.");
                return;
            }

            const allFreezers = await fetchAllFreezersWithUsers();
            const myFreezers = allFreezers.filter(fz =>
                fz.users?.some(u => u.name === currentUser.name)
            );

            setUser({
                ...currentUser,
                freezerIds: myFreezers.map(fz => String(fz.id))
            });

            setFreezers(allFreezers);
        } catch (error) {
            console.error("Error loading account data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/auth/session-user", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.username) sessionStorage.setItem("username", data.username);
                    if (data.role) sessionStorage.setItem("role", data.role);
                    if (data.isLoggedIn === "true") sessionStorage.setItem("isLoggedIn", "true");
                }
            } catch (err) {
                console.error("Failed to fetch session user:", err);
            }
        };

        fetchSessionUser();
    }, []);

    useEffect(() => {
        if (username) loadData();
    }, [username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone_number") {
            setUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            const updatedUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
                user_rank: user.user_rank
            };

            await updateUser(user.id, updatedUser);

            setMessage("✅ Phone number updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Failed to update user", err);
            setMessage("❌ Failed to save changes.");
        }
    };

    // Directly return the content once data is loaded
    if (loading) return null; // or just return a blank element like <></>

    if (!user) return <p className="text-danger text-center">User not found.</p>;

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h3 className="mb-4 text-center">My Account</h3>

            {message && <div className="alert alert-info text-center">{message}</div>}

            {/* Main Content */}
            <div className="form-group mb-3">
                <label><strong>Name</strong></label>
                <input className="form-control" value={user.name} disabled />
            </div>

            <div className="form-group mb-3">
                <label><strong>Email</strong></label>
                <input className="form-control" value={user.email || ""} disabled />
            </div>

            <div className="form-group mb-3">
                <label><strong>Phone Number</strong></label>
                <input name="phone_number" className="form-control" value={user.phone_number || ""} onChange={handleChange} />
            </div>

            <div className="form-group mb-3">
                <label><strong>Rank</strong></label>
                <input className="form-control" value={user.user_rank || ""} disabled />
            </div>

            <div className="form-group mb-3">
                <label><strong>Role</strong></label>
                <input className="form-control" value={user.role} disabled />
            </div>

            <div className="form-group mb-3">
                <label><strong>Currently Assigned Freezers</strong></label>
                {user.freezerIds.length > 0 ? (
                    <ul className="list-group">
                        {freezers
                            .filter(fz => user.freezerIds.includes(String(fz.id)))
                            .map(fz => (
                                <li className="list-group-item" key={fz.id}>
                                    {fz.number} - {fz.room}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <div className="text-muted mt-2">You are not assigned to any freezers yet.</div>
                )}
            </div>

            <div className="text-center mt-4">
                <button
                    className="btn"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={handleSave}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default MyAccount;






