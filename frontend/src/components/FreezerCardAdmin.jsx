import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {updateFreezer, deleteFreezer} from "../services/api";
import "../assets/styles.css";
import {sanitizeInput} from "../services/utils";

const FreezerCardAdmin = ({freezer, onFreezerUpdated, onFreezerDeleted}) => {
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({...freezer});
    const [notificationPrefs, setNotificationPrefs] = useState(
        Array.isArray(freezer?.users)
            ? freezer.users.map((user) => ({
                ...user,
                selectedEmail: false,
                selectedSms: false,
            }))
            : []
    );

    const [selectAllEmail, setSelectAllEmail] = useState(false);
    const [selectAllSms, setSelectAllSms] = useState(false);

    const navigate = useNavigate();
    const role = sessionStorage.getItem("role");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditData((prev) => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        try {
            const updatedFreezer = {
                ...freezer,                // original data
                room: editData.room,       // updated fields
                address: editData.address,
            };

            const updated = await updateFreezer(freezer.id, updatedFreezer);
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
        setEditData({...freezer});
        setEditing(false);
    };

    const toggleUserSelection = (userId, type) => {
        setNotificationPrefs((prev) =>
            prev.map((user) =>
                user.id === userId ? {...user, [type]: !user[type]} : user
            )
        );
    };

    const toggleAll = (type) => {
        const isSelectAll = type === "selectedEmail" ? !selectAllEmail : !selectAllSms;
        const updated = notificationPrefs.map((user) => ({
            ...user,
            [type]: isSelectAll,
        }));

        setNotificationPrefs(updated);
        type === "selectedEmail" ? setSelectAllEmail(isSelectAll) : setSelectAllSms(isSelectAll);
    };

    const handleSend = () => {
        const selectedRecipients = notificationPrefs.filter(user => user.selectedEmail || user.selectedSms);
        navigate("/confirmation", {
            state: {
                freezerNumber: editData.number,
                recipients: selectedRecipients
            }
        });
    };

    const {number, room, address, type} = editData;

    const handleSanitizedFieldChange = (field) => (e) => {
        const sanitized = sanitizeInput(e.target.value);
        handleChange({target: {name: field, value: sanitized}});
    };

    return (
        <div className="freezer-card mx-auto my-2 px-3 py-1">
            <div className="p-3 p-md-3 p-lg-4 align-items-center rounded-3 border shadow-lg">
                <div className="p-2 pt-lg-2 text-start">

                    {/* Top bar */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-bold mb-0">Freezer: {number}</h5>

                        {role === "admin" && (
                            <button
                                className="btn btn-sm btn-send rounded-5 shadow-sm"
                                onClick={handleSend}
                            >
                                Send notification
                            </button>
                        )}
                    </div>

                    <p className="mb-1">
                        <strong>Room:</strong>{" "}
                        {editing ? (
                            <input
                                name="room"
                                className="form-control"
                                value={room}
                                onChange={handleSanitizedFieldChange("room")}
                            />
                        ) : (
                            room
                        )}
                    </p>
                    <p className="mb-1">
                        <strong>Address:</strong>{" "}
                        {editing ? (
                            <input
                                name="address"
                                className="form-control"
                                value={address}
                                onChange={handleSanitizedFieldChange("address")}
                            />
                        ) : (
                            address
                        )}
                    </p>

                    <p><strong>Type:</strong> {type}</p>
                    {/* Assigned Users */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <h6 className="fw-bold mb-0">Assigned Users:</h6>
                        <span className="small fw-normal text-end">Email &nbsp;&nbsp; SMS</span>
                    </div>

                    <ul className="list-unstyled">
                        {notificationPrefs.map((user) => (
                            <li key={user.id} className="border-bottom py-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <p className="fw-bold mb-0">• {user.name} ({user.user_rank || "No rank"})</p>
                                    <div className="d-flex gap-4">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={user.selectedEmail}
                                            onChange={() => toggleUserSelection(user.id, "selectedEmail")}
                                        />
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={user.selectedSms}
                                            onChange={() => toggleUserSelection(user.id, "selectedSms")}
                                        />
                                    </div>
                                </div>
                                <p className="mb-0 ms-2">{user.email}</p>
                                <p className="mb-1 ms-2">{user.phone_number}</p>
                            </li>
                        ))}
                    </ul>

                    {/* Select all checkboxes */}
                    <div className="d-flex justify-content-end align-items-center mt-2">
                        <p className="fw-bold mb-0 me-4">Select all</p>
                        <div className="d-flex gap-4">
                            <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={selectAllEmail}
                                onChange={() => toggleAll("selectedEmail")}
                            />
                            <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={selectAllSms}
                                onChange={() => toggleAll("selectedSms")}
                            />
                        </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="d-flex justify-content-start align-items-center mt-4">
                        {!editing ? (
                            <>
                                <button
                                    className="btn btn-sm me-2"
                                    style={{backgroundColor: "#5D8736", color: "white", border: "none"}}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{
                                        backgroundColor: "#A9C46C",
                                        color: "#ffffff",
                                        border: "1px solid #c3e6cb"
                                    }}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-sm me-2"
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreezerCardAdmin;