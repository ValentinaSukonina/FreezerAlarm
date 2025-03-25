import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../assets/styles.css";

const FreezerCard = ({freezer}) => {
    if (!freezer) {
        return <p>No freezer data available.</p>;
    }

    const {number, room, address, type, users = []} = freezer;

    // State for checkboxes
    const [selectedUsers, setSelectedUsers] = useState(users.map(user => ({
        ...user,
        selectedEmail: false,
        selectedSms: false
    })));

    // Select all checkboxes logic
    const [selectAllEmail, setSelectAllEmail] = useState(false);
    const [selectAllSms, setSelectAllSms] = useState(false);

    const toggleEmailForAll = () => {
        setSelectAllEmail(!selectAllEmail);
        setSelectedUsers(selectedUsers.map(user => ({
            ...user,
            selectedEmail: !selectAllEmail
        })));
    };

    const toggleSmsForAll = () => {
        setSelectAllSms(!selectAllSms);
        setSelectedUsers(selectedUsers.map(user => ({
            ...user,
            selectedSms: !selectAllSms
        })));
    };

    // Individual checkbox toggle
    const toggleUserSelection = (userId, type) => {
        setSelectedUsers(selectedUsers.map(user =>
            user.id === userId ? {...user, [type]: !user[type]} : user
        ));
    };

    // Placeholder send function
    const navigate = useNavigate(); // Initialize navigation

    const handleSend = () => {
        const selectedRecipients = selectedUsers.filter(user => user.selectedEmail || user.selectedSms);

        console.log("Sending to selected users:", selectedRecipients);

        // Navigate to confirmation page
        navigate("/confirmation", {
            state: {
                freezerNumber: number,
                recipients: selectedRecipients
            }
        });
    };

    return (
        <div className="container my-2 freezer-card freezer-card mx-auto my-2 px-3 py-3">
            <div className="row p-3 p-md-3 p-lg-4 align-items-center rounded-3 border shadow-lg"
                 style={{width: "100%"}}>
                <div className="p-2 pt-lg-2 text-start">
                    {/* Freezer Info + Send Button */}
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-2 fw-bold">Freezer: {number}</h5>
                        <button className="btn btn-sm btn-send rounded-5 border shadow-lg" onClick={handleSend}>
                            Send notification
                        </button>
                    </div>
                    <p><strong>Room:</strong> {room}</p>
                    <p><strong>Address:</strong> {address}</p>
                    <p><strong>Type:</strong> {type}</p>

                    {/* Assigned Users Section */}
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Assigned Users:</h6>
                        <span className="small fw-normal text-end">Email &nbsp;&nbsp; SMS</span>
                    </div>

                    {selectedUsers.length > 0 ? (
                        <ul className="list-unstyled">
                            {selectedUsers.map((user) => (
                                <li key={user.id || user.email} className="border-bottom py-2">
                                    {/* Row with User Name + Checkboxes for Email & SMS */}
                                    <div className="d-flex justify-content-between align-items-center">
                                        {/* Left: User Name */}
                                        <p className="fw-bold mb-0">• {user.name} ({user.user_rank || "No rank"})</p>

                                        {/* Right: Email & SMS Checkboxes */}
                                        <div className="d-flex gap-4">
                                            <input
                                                type="checkbox" className="custom-checkbox"
                                                checked={user.selectedEmail}
                                                onChange={() => toggleUserSelection(user.id, "selectedEmail")}
                                            />
                                            <input
                                                type="checkbox" className="custom-checkbox"
                                                checked={user.selectedSms}
                                                onChange={() => toggleUserSelection(user.id, "selectedSms")}
                                            />
                                        </div>
                                    </div>

                                    {/* Email and Phone Number under Name */}
                                    <p className="mb-0 ms-2">{user.email}</p>
                                    <p className="mb-1 ms-2">{user.phone_number}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No assigned users.</p>
                    )}

                    {/* Select All Feature */}
                    <div className="d-flex justify-content-end align-items-center mt-2">
                        <p className="fw-bold mb-0 me-4">Select all</p>
                        <div className="d-flex gap-4">
                            <input type="checkbox" className="custom-checkbox" checked={selectAllEmail}
                                   onChange={toggleEmailForAll}/>
                            <input type="checkbox" className="custom-checkbox" checked={selectAllSms}
                                   onChange={toggleSmsForAll}/>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FreezerCard;
