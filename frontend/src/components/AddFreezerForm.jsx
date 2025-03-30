import React, {useEffect, useState} from "react";
import {fetchUsers} from "../services/api";

const AddFreezerForm = ({newFreezer, onChange, onAdd}) => {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const handleCancel = () => {
        setSelectedUserIds([]);
        setShowForm(false);
        setShowUserDropdown(false);
    };

    useEffect(() => {
        const getUsers = async () => {
            const fetched = await fetchUsers();
            setUsers(fetched);
        };
        getUsers();
    }, []);

    const handleUserToggle = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        const freezerData = {
            ...newFreezer,
            userIds: selectedUserIds,
        };
        onAdd(freezerData);

        // Reset form & users
        setSelectedUserIds([]);
        setShowForm(false);
        setShowUserDropdown(false);
    };

    return (
        <div className="text-center mb-4">
            {!showForm ? (
                <button
                    className="btn"
                    style={{backgroundColor: "#5D8736", color: "white"}}
                    onClick={() => setShowForm(true)}
                >
                    Add New Freezer
                </button>
            ) : (
                <>
                    <button
                        className="btn mb-3"
                        style={{backgroundColor: "#5D8736", color: "white"}}
                        onClick={() => setShowForm(false)}
                    >
                        Hide Form
                    </button>

                    <div
                        className="mx-auto p-4 rounded"
                        style={{
                            backgroundColor: "#f8fff0",
                            maxWidth: "600px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.05)"
                        }}
                    >
                        <h5 className="mb-3 text-start fw-bold">Add New Freezer</h5>

                        <input
                            name="number"
                            className="form-control mb-2"
                            placeholder="Number"
                            value={newFreezer.number}
                            onChange={onChange}
                            required
                        />
                        <input
                            name="room"
                            className="form-control mb-2"
                            placeholder="Room"
                            value={newFreezer.room}
                            onChange={onChange}
                            required
                        />
                        <input
                            name="address"
                            className="form-control mb-2"
                            placeholder="Address"
                            value={newFreezer.address}
                            onChange={onChange}
                        />
                        <select
                            name="type"
                            className="form-control mb-3"
                            style={{
                                height: "32px",
                                fontSize: "13px",
                                border: "1px solid #c8dfb6"
                            }}
                            value={newFreezer.type}
                            onChange={onChange}
                            required
                        >
                            <option value="" disabled>Select Freezer Type</option>
                            <option value="-80C">-80°C</option>
                            <option value="-150C">-150°C</option>
                        </select>
                        {/* Assign Users Button */}
                        <div className="text-start mb-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowUserDropdown((prev) => !prev)}
                            >
                                {showUserDropdown ? "Hide Users" : "Assign Users"}
                            </button>
                        </div>

                        {/* User Dropdown */}
                        {showUserDropdown && (
                            <div
                                className="dropdown-menu show w-100 p-2 border"
                                style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    backgroundColor: "white",
                                }}
                            >
                                {users.map((user) => (
                                    <div key={user.id} className="form-check text-start mb-1">
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            id={`user-${user.id}`}
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                        />
                                        <label
                                            htmlFor={`user-${user.id}`}
                                            className="form-check-label"
                                        >
                                            {user.name}{" "}
                                            <small className="text-muted">(Rank: {user.user_rank})</small>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="d-flex justify-content-between">
                            <button
                                className="btn"
                                style={{backgroundColor: "#5D8736", color: "white"}}
                                onClick={handleSubmit}
                            >
                                Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AddFreezerForm;