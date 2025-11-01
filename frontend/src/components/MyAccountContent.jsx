import React, { useEffect, useState } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { formatPhoneSE, sanitizeByField, validateUser } from "../services/utils";

import { fetchUsers, updateUser, fetchAllFreezersWithUsers, fetchUserByName } from "../services/api";

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [draft, setDraft] = useState({ ...user });
    const [errors, setErrors] = useState({});
    const [editing, setEditing] = useState(false);
    const validatePhone = (phone) => /^\+46\d{9}$/.test(phone);
    const [rowMessage, setRowMessage] = useState({ text: "", kind: "" });

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


    // Directly return the content once data is loaded
    if (loading) return null;

    if (!user) return <p className="text-danger text-center">User not found.</p>;

    return (
        <div className="container my-3 my-sm-4" style={{ maxWidth: "600px" }}>
            <h3 className="mt-2 mt-sm-3 mb-2 text-center">My Account</h3>

            {message && <div className="alert alert-info text-center">{message}</div>}

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
                {editing ? (
                    <>
                        <PhoneInput
                            country="se"
                            onlyCountries={["se"]}
                            disableDropdown
                            countryCodeEditable={false}
                            masks={{ se: "..-... .. .." }}
                            placeholder="+46 XX-XXX XX XX"
                            value={draft.phone_number || ""}
                            onChange={(val) => {
                                const digits = (val || "").replace(/\D/g, "");
                                const e164 = digits ? `+${digits}` : "";
                                setDraft((d) => ({ ...d, phone_number: e164 }));
                                setErrors((e) => ({ ...e, phone_number: "" }));
                            }}
                            inputClass={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                            containerClass="w-100"
                        />
                        {errors.phone_number && (
                            <div className="invalid-feedback d-block">{errors.phone_number}</div>
                        )}

                        <div className="mt-2">
                            <button
                                className="btn btn-sm me-2"
                                style={{ backgroundColor: "#7BAE3F", color: "white", border: "none" }}
                                onClick={async () => {
                                    if (!validatePhone(draft.phone_number)) {
                                        setErrors((e) => ({
                                            ...e,
                                            phone_number: "Phone must start with +46 and have 9 digits after",
                                        }));
                                        return;
                                    }

                                    try {
                                        const updatedUser = { ...user, phone_number: draft.phone_number };
                                        await updateUser(user.id, updatedUser);
                                        setUser(updatedUser);
                                        setEditing(false);
                                        setMessage("✅ Phone updated successfully!");
                                        setTimeout(() => setMessage(""), 3000);
                                    } catch (err) {
                                        console.error(err);
                                        setMessage("❌ Failed to save changes.");
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-sm"
                                style={{ backgroundColor: "#6c757d", color: "white", border: "none" }}
                                onClick={() => {
                                    setDraft({ ...user });
                                    setErrors({});
                                    setEditing(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="d-flex align-items-center">
                        <input
                            className="form-control rounded me-3 p-1"
                            value={formatPhoneSE(user.phone_number)}
                            disabled
                            readOnly
                        />
                        <button
                            className="btn px-3 py-1 rounded"
                            style={{
                                backgroundColor: "#5D8736",
                                color: "white",
                                border: "none",
                                height: "100%",
                            }}
                            onClick={() => {
                                setDraft({ ...user });
                                setEditing(true);
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
                <label><strong>Assigned Freezers</strong></label>
                {user.freezerIds.length > 0 ? (
                    <table className="table table-sm table-bordered mt-2 text-center" style={{ width: "60%" }}>
                        <thead className="table-light">
                        <tr>
                            <th>Freezer</th>
                            <th>Room</th>
                        </tr>
                        </thead>
                        <tbody>
                        {freezers
                            .filter(fz => user.freezerIds.includes(String(fz.id)))
                            .map(fz => (
                                <tr key={fz.id}>
                                    <td>{fz.number}</td>
                                    <td>{fz.room}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-muted mt-2">
                        You are not assigned to any freezers yet.
                    </div>
                )}
            </div>

        </div>
    );
};

export default MyAccount;