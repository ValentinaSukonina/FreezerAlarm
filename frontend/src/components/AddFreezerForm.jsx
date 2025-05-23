import React, {useImperativeHandle, useState, forwardRef} from "react";
import Select from "react-select";
import {fetchUsers} from "../services/api";
import {sanitizeInput} from "../services/utils";

const AddFreezerForm = forwardRef(({newFreezer, onChange, onAdd, onCancel, formError}, ref) => {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const typeOptions = [
        {value: "-80C", label: "-80°C"},
        {value: "-150C", label: "-150°C"}
    ];

    // Expose a function to parent using the ref
    useImperativeHandle(ref, () => ({
        resetCheckboxes() {
            setSelectedUserIds([]);
        },
        closeForm() {
            setShowForm(false);
            setShowUserDropdown(false);
        }
    }));

    const handleCancel = () => {
        setSelectedUserIds([]);
        setShowForm(false);
        setShowUserDropdown(false);
        onCancel(); // clear form + error
    };


    const handleUserToggle = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async () => {
        const freezerData = {
            ...newFreezer,
            userIds: selectedUserIds,
        };

        const success = await onAdd(freezerData);

        if (success) {
            // only reset and close form if add succeeded
            setSelectedUserIds([]);
            setShowForm(false);
            setShowUserDropdown(false);
        }
    };

    const handleShowForm = async () => {
        setShowForm(true);
        if (!users || users.length === 0) {
            const fetched = await fetchUsers();
            setUsers(fetched);
        }
    };

    const handleHideForm = () => {
        setShowForm(false); // no reset when form is closed
    };

    const handleSanitizedChange = (name) => (e) => {
        const sanitized = sanitizeInput(e.target.value);
        onChange({target: {name, value: sanitized}});
    };

    return (
        <div className="text-center mb-4 mb-sm-2">
            {!showForm ? (
                <button className="btn" style={{backgroundColor: "#5D8736", color: "white"}} onClick={handleShowForm}>
                    Add New Freezer
                </button>
            ) : (
                <>
                    <button className="btn mb-4 mb-sm-2" style={{backgroundColor: "#5D8736", color: "white"}}
                            onClick={handleHideForm}>
                        Hide Form
                    </button>

                    <div className="mx-auto p-4 rounded" style={{
                        backgroundColor: "#f8fff0",
                        maxWidth: "600px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.05)"
                    }}>
                        <h5 className="mb-3 text-start fw-bold">Add New Freezer</h5>

                        <input
                            type="text"
                            name="number"
                            className="form-control mb-2"
                            placeholder="Enter unique 4-digit freezer code"
                            value={newFreezer.number}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d{0,4}$/.test(value)) {
                                    onChange(e); // only update state if valid
                                }
                            }}
                            maxLength={4}
                            required
                        />
                        <input name="room" className="form-control mb-2" placeholder="Room"
                               value={newFreezer.room}
                               onChange={handleSanitizedChange("room")}
                               required/>
                        <input
                            name="address"
                            className="form-control mb-2"
                            placeholder="Address"
                            value={newFreezer.address}
                            onChange={handleSanitizedChange("address")}
                        />
                        <Select
                            className="freezer-type-select"
                            classNamePrefix="ft"
                            options={typeOptions}
                            placeholder="Select Freezer Type"
                            value={typeOptions.find(opt => opt.value === newFreezer.type) || null}
                            onChange={(selectedOption) => onChange({
                                target: {
                                    name: "type",
                                    value: selectedOption.value
                                }
                            })}
                        />

                        <div className="text-start mb-2 my-2">
                            <button type="button"
                                    className="form-control text-start assign-users-toggle"
                                    style={{backgroundColor: "#e6f2d9",}}
                                    onClick={() => setShowUserDropdown(prev => !prev)}>
                                {showUserDropdown ? "Hide Users" : "Assign Users"}
                            </button>
                        </div>

                        {showUserDropdown && (
                            <div className="user-dropdown-list mt-2">
                                {users.map(user => (
                                    <div key={user.id} className="user-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            id={`user-${user.id}`}
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                        />
                                        <label htmlFor={`user-${user.id}`}>{user.name}</label>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="d-flex justify-content-between">
                            <button className="btn" style={{backgroundColor: "#5D8736", color: "white"}}
                                    onClick={handleSubmit}>
                                Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                        {formError && (
                            <div className="text-center my-3" style={{
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                border: "1px solid #f5c6cb",
                                padding: "10px 16px",
                                borderRadius: "5px",
                                maxWidth: "500px",
                                margin: "0 auto"
                            }}>
                                {formError}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
});

export default AddFreezerForm;
