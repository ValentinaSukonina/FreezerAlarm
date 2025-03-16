import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";


const AlertConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const {freezerNumber, recipients} = location.state || {freezerNumber: "", recipients: []};

    return (
        <div className="container mt-4">
            <div className="card p-4 shadow-lg">
                <h3 className="fw-bold">Alarm notification</h3>
                <p className="fw-bold">for Freezer {freezerNumber} was sent to:</p>

                <ul className="list-unstyled">
                    {recipients.length > 0 ? (
                        recipients.map((user, index) => (
                            <li key={index} className="border-bottom py-2">
                                <p className="mb-0 fw-bold">{user.name}</p>

                                {/* Show email with Bootstrap icon if selected */}
                                {user.selectedEmail && (
                                    <p className="mb-0">
                                        <i className="bi bi-envelope me-1"></i> {user.email}
                                    </p>
                                )}

                                {/* Show phone with Bootstrap icon if selected */}
                                {user.selectedSms && (
                                    <p>
                                        <i className="bi bi-phone me-1"></i> {user.phone_number}
                                    </p>
                                )}
                            </li>
                        ))
                    ) : (
                        <p>No recipients selected.</p>
                    )}
                </ul>

                <button className="btn mt-3 btn-sm btn-home rounded-3 border shadow-lg" onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default AlertConfirmation;
