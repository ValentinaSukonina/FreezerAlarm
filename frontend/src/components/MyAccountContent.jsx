import React, { useEffect, useState } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { fetchUsers, updateUser, fetchAllFreezersWithUsers, fetchUserByName } from "../services/api";
import { sanitizeByField, formatPhoneSE } from "../services/utils";
const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [rowMessages, setRowMessages] = useState({});
    const [error, setError] = useState(null);

    const [phoneError, setPhoneError] = useState("");
    const validatePhone = (phone) => /^\+46\d{9}$/.test(phone);

    const [editingPhone, setEditingPhone] = useState(false);
    const [originalPhone, setOriginalPhone] = useState("");

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

    const handlePhoneChange = (val) => {
        const digits = (val || "").replace(/\D/g, "");
        const e164 = digits ? `+${digits}` : "";
        setUser(prev => {
            const updated = { ...prev, phone_number: e164 };
            setPhoneError(
                validatePhone(updated.phone_number)
                    ? ""
                    : "Phone must start with +46 and have 9 digits after"
            );
            return updated;
        });
    };

    const handleSave = async () => {
        if (!validatePhone(user.phone_number)) {
            setPhoneError("Phone must start with +46 and have 9 digits after");
            return;
        }

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
    if (loading) return null;

    if (!user) return <p className="text-danger text-center mt-5">User not found.</p>;

    return (
        <div className="container my-3 my-sm-4" style={{ maxWidth: "600px" }}>
            <h3 className="mt-2 mt-sm-3 mb-2 text-center">My Account</h3>

            {/*{message && <div className="alert alert-info text-center">{message}</div>}
*/}         {message && (
            <div className="text-center mb-3"
                 style={{
                     backgroundColor: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
                     color: message.startsWith("✅") ? "#155724" : "#721c24",
                     border: message.startsWith("✅") ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
                     padding: "10px 16px",
                     borderRadius: "5px",
                     maxWidth: "500px",
                     margin: "0 auto"
                 }}
            >
                {message}
            </div>
        )}
            {/* Main Content */}
            <div className="form-group mb-2 ">
                <label><strong>Name</strong></label>
                <input className="form-control py-1 py-sm-1.5" value={user.name} disabled />
            </div>

            <div className="form-group mb-2">
                <label><strong>Email</strong></label>
                <input className="form-control py-1 py-sm-1.5" value={user.email || ""} disabled />
            </div>

            <div className="form-group mb-2">
                <label htmlFor="phone_number"><strong>Phone Number</strong></label>

                {editingPhone ? (
                    <>
                        <PhoneInput
                            country="se"
                            onlyCountries={["se"]}
                            disableDropdown
                            countryCodeEditable={false}
                            masks={{ se: "..-... .. .." }}
                            placeholder="+46 XX-XXX XX XX"
                            value={user.phone_number || ""}
                            onChange={handlePhoneChange}
                            inputClass={`form-control ${phoneError ? "is-invalid" : ""}`}
                            containerClass="w-100"
                        />
                        {phoneError && <div className="text-danger small">{phoneError}</div>}

                        <div className="mt-2">
                            <button
                                className="btn btn-sm me-2"
                                style={{backgroundColor: "#7BAE3F", color: "white", border: "none"}}
                                onClick={async () => {
                                    await handleSave();
                                    if (!phoneError) {
                                        setEditingPhone(false);
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-sm"
                                style={{backgroundColor: "#6c757d", color: "white", border: "none"}}
                                onClick={() => {
                                    // restore original value
                                    setUser(prev => ({ ...prev, phone_number: originalPhone }));
                                    setPhoneError("");
                                    setEditingPhone(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="d-flex align-items-center">
                        <input
                            className="form-control rounded me-3"
                            value={formatPhoneSE(user.phone_number)}
                            disabled
                            readOnly
                            aria-label="Phone Number"
                        />
                        <button
                            className="btn px-3 rounded"
                            style={{
                                backgroundColor: "#5D8736",
                                color: "white",
                                border: "none",
                                height: "100%",
                            }}
                            onClick={() => {
                                setOriginalPhone(user.phone_number);
                                setEditingPhone(true);
                            }}
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group mb-2">
                <label><strong>Rank</strong></label>
                <input className="form-control py-1 py-sm-1.5" value={user.user_rank || ""} disabled />
            </div>

            <div className="form-group mb-2">
                <label><strong>Role</strong></label>
                <input className="form-control py-1 py-sm-1.5" value={user.role} disabled />
            </div>

            <div className="form-group mb-2">
                <label><strong>Currently Assigned Freezers</strong></label>
                {user.freezerIds.length > 0 ? (
                    <table className="table table-sm table-bordered mt-2 text-center" style={{ width: "auto" }}>
                        <thead className="table-light">
                        <tr>
                            <th style={{ width: "100px" }}>Freezer</th>
                            <th style={{ width: "100px" }}>Type</th>
                            <th style={{ width: "120px" }}>Room</th>
                        </tr>
                        </thead>
                        <tbody>
                        {freezers
                            .filter(fz => user.freezerIds.includes(String(fz.id)))
                            .map(fz => (
                                <tr key={fz.id}>
                                    <td>{fz.number}</td>
                                    <td>{fz.type}</td>
                                    <td>{fz.room}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-muted mt-2">You are not assigned to any freezers yet.</div>
                )}
            </div>

        </div>
    );
};

export default MyAccount;