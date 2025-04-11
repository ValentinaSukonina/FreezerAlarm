import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {updateFreezerWithUsers, deleteFreezer,} from "../services/api";
import {sanitizeInput} from "../services/utils";
import {fetchUsers} from "../services/api";
import { sendEmail } from "../services/api";
import "../assets/styles.css";

const FreezerCardAdmin = ({freezer, onFreezerUpdated, onFreezerDeleted, onMessage }) => {
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({...freezer});
    const [confirmingDelete, setConfirmingDelete] = useState(false);
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

    const [users, setUsers] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const [selectedUserIds, setSelectedUserIds] = useState(
        Array.isArray(freezer?.users) ? freezer.users.map(u => u.id) : []
    );

    const handleToggleUserDropdown = async () => {
        setShowUserDropdown(prev => !prev);
        if (users.length === 0) {
            const fetched = await fetchUsers();
            setUsers(fetched);
        }
    };

    const handleUserToggle = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditData((prev) => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        try {
            await updateFreezerWithUsers(editData.id, editData, selectedUserIds);
            console.log("✅ Freezer and user assignments updated");
            setEditing(false);
            onFreezerUpdated?.("refetch"); // signal parent to reload
        } catch (err) {
            console.error("❌ Failed to save changes:", err);
            const message = err?.response?.data?.message || "An unexpected error occurred.";
            onFreezerUpdated?.(null, `❌ Update failed: ${message}`);
        }
    };

    useEffect(() => {
        setEditData({...freezer});
    }, [freezer]);

    const handleDelete = () => {
        setConfirmingDelete(true);
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

    const handleSend = async () => {
        const selectedRecipients = notificationPrefs.filter(user => user.selectedEmail);

        const adminName = sessionStorage.getItem("username");
        const adminEmail = sessionStorage.getItem("email");

        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const invalidEmails = selectedRecipients.filter(user => !isValidEmail(user.email));
        const validRecipients = selectedRecipients.filter(user => isValidEmail(user.email));

        if (invalidEmails.length > 0) {
            onMessage(`❌ Invalid email address(es): ${invalidEmails.map(u => u.email).join(', ')}`);
            return;
        }

        try {
            if (validRecipients.length > 0) {
                const emailList = validRecipients.map(u => u.email).join(", ");

                await sendEmail({
                    to: emailList,
                    subject: `🚨 Alarm: for Freezer ${editData.number}`,
                    body: "Attention!\n\n" +
                        `A temperature increase was reported for freezer ${editData.number} (-150°C), located in room ${editData.room} at ${editData.address}.\n\n` +
                        `This alert was sent by ${adminName} (${adminEmail}).`
                });
            }

            navigate("/confirmation", {
                state: {
                    freezerNumber: editData.number,
                    recipients: validRecipients,
                    message: `✅ Email sent to ${validRecipients.length} user(s).`
                },
            });
        } catch (err) {
            console.error("❌ Failed to send email:", err);
            onMessage("Failed to send email notification.");
        }
    };

    const {number, room, address, type} = editData;

    const handleSanitizedFieldChange = (field) => (e) => {
        const sanitized = sanitizeInput(e.target.value);
        handleChange({target: {name: field, value: sanitized}});
    };

    useEffect(() => {
        if (Array.isArray(freezer?.users)) {
            setNotificationPrefs(
                freezer.users.map(user => ({
                    ...user,
                    selectedEmail: false,
                    selectedSms: false,
                }))
            );
            setSelectedUserIds(freezer.users.map(user => user.id));
        }
    }, [freezer.users]);

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

                    <div className="d-flex align-items-center mb-2">
                        <strong className="me-2" style={{minWidth: "70px"}}>Room:</strong>
                        {editing ? (
                            <input
                                name="room"
                                className="form-control"
                                value={room}
                                onChange={handleSanitizedFieldChange("room")}
                                style={{maxWidth: "300px"}}
                            />
                        ) : (
                            <span>{room}</span>
                        )}
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <strong className="me-2" style={{minWidth: "70px"}}>Address:</strong>
                        {editing ? (
                            <input
                                name="address"
                                className="form-control"
                                value={address}
                                onChange={handleSanitizedFieldChange("address")}
                                style={{maxWidth: "300px"}}
                            />
                        ) : (
                            <span>{address}</span>
                        )}
                    </div>
                    <p><strong>Type:</strong> {type} </p>

                    {editing && (
                        <div style={{maxWidth: "300px"}}>
                            <div className="text-start mb-2 my-2">
                                <button
                                    type="button"
                                    className="form-control text-start assign-users-toggle"
                                    style={{backgroundColor: "#e6f2d9"}}
                                    onClick={handleToggleUserDropdown}
                                >
                                    {showUserDropdown ? "Hide Users" : "Assign new users"}
                                </button>

                                {showUserDropdown && (
                                    <div className="user-dropdown-list mt-2" style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        border: "1px solid #ccc",
                                        padding: "10px",
                                        borderRadius: "6px"
                                    }}>
                                        {users.map((user) => (
                                            <div key={user.id} className="user-checkbox">
                                                <input
                                                    type="checkbox"
                                                    className="custom-checkbox me-2"
                                                    id={`user-${user.id}`}
                                                    checked={selectedUserIds.includes(user.id)}
                                                    onChange={() => handleUserToggle(user.id)}
                                                />
                                                <label htmlFor={`user-${user.id}`}>{user.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


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
                        {!editing && !confirmingDelete ? (
                            <>
                                <button
                                    className="btn btn-sm me-2 px-3"
                                    style={{backgroundColor: "#5D8736", color: "white", border: "none"}}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{backgroundColor: "#A9C46C", color: "#ffffff", border: "1px solid #c3e6cb"}}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </>
                        ) : confirmingDelete ? (
                            <div className="confirm-delete-section d-flex align-items-center">
                                <span className="me-2 alert-circle">!</span>
                                <span className="fw-bold text-danger me-2" style={{color: "#b00000"}}>
            Confirm delete?
        </span>
                                <button
                                    className="btn btn-sm me-2 px-3"
                                    style={{backgroundColor: "#A9C46C", color: "white", border: "1px solid #c3e6cb"}}
                                    onClick={async () => {
                                        try {
                                            await deleteFreezer(freezer.id);
                                            onFreezerDeleted?.(freezer.id);
                                        } catch (err) {
                                            console.error("❌ Failed to delete freezer:", err);
                                            onFreezerUpdated?.(null, "❌ Failed to delete freezer.");
                                        }
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{backgroundColor: "#5D8736", color: "white", border: "none"}}
                                    onClick={() => setConfirmingDelete(false)}
                                >
                                    Cancel
                                </button>
                            </div>
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