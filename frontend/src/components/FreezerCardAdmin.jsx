import React, { useState } from "react";
import { updateFreezer, deleteFreezer } from "../services/api";
import "../assets/styles.css";

const FreezerCardAdmin = ({ freezer, onFreezerUpdated, onFreezerDeleted }) => {
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ ...freezer });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const updated = await updateFreezer(editData.id, editData);
            setEditing(false);
            onFreezerUpdated?.(updated);
        } catch (err) {
            alert("Failed to save changes.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this freezer?")) {
            try {
                await deleteFreezer(freezer.id);
                onFreezerDeleted?.(freezer.id);
            } catch (err) {
                alert("Failed to delete freezer.");
            }
        }
    };

    const handleCancel = () => {
        setEditData({ ...freezer });
        setEditing(false);
    };

    const { number, room, address, type, users = [] } = editData;

    return (
        <div className="freezer-card mx-auto my-2 px-3 py-1">
            <div className="row p-3 p-md-3 p-lg-4 align-items-center rounded-3 border shadow-lg">
                <div className="p-2 pt-lg-2 text-start">
                    <div className="d-flex justify-content-between align-items-center">
                        {editing ? (
                            <input name="number" className="form-control fw-bold" value={number} onChange={handleChange} />
                        ) : (
                            <h5 className="mb-2 fw-bold">Freezer: {number}</h5>
                        )}

                        {!editing ? (
                            <div>
                                <button
                                    className="btn btn-sm me-2"
                                    style={{ backgroundColor: "#5D8736", color: "white", border: "none" }}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm me-2"
                                    style={{
                                        backgroundColor: "#A9C46C",
                                        color: "#ffffff",
                                        border: "1px solid #c3e6cb",
                                        fontWeight: "500",
                                        transition: "color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.color = "#fff700")}
                                    onMouseLeave={(e) => (e.target.style.color = "#ffffff")}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-sm"
                                    style={{backgroundColor: "#7BAE3F", color: "white", border: "none"}}
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{backgroundColor: "#6c757d", color: "white", border: "none"}}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </div>

                        )}
                    </div>

                    <p className="mb-1">
                        <strong>Room:</strong>{" "}
                        {editing ? (
                            <input name="room" className="form-control" value={room} onChange={handleChange}/>
                        ) : room}
                    </p>
                    <p className="mb-1">
                        <strong>Address:</strong>{" "}
                        {editing ? (
                            <input name="address" className="form-control" value={address} onChange={handleChange} />
                        ) : address}
                    </p>
                    <p>
                        <strong>Type:</strong>{" "}
                        {editing ? (
                            <input name="type" className="form-control" value={type} onChange={handleChange} />
                        ) : type}
                    </p>

                    <h6 className="fw-bold mt-3">Assigned Users:</h6>
                    <ul className="list-unstyled">
                        {users.map((user) => (
                            <li key={user.id} className="border-bottom py-2">
                                <p className="fw-bold mb-0">• {user.name} ({user.user_rank || "No rank"})</p>
                                <p className="mb-0 ms-2">{user.email}</p>
                                <p className="mb-1 ms-2">{user.phone_number}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FreezerCardAdmin;

