import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const AlertConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const freezerNumber = location.state?.freezerNumber || "";
    const recipients = location.state?.recipients || [];

    const emailStatus = location.state?.emailStatus || {
        ok: false,
        status: 500,
        message: "No status received from server.",
    };
    const cleanMessage =
        emailStatus.message?.split("com.google.api.client")[0]?.trim() ||
        emailStatus.message;


    const shortenedError = emailStatus.message?.includes("HttpResponseException")
        ? "com.google.api.client.http.HttpResponseException: 400 Bad Request"
        : cleanMessage;

    return (
        <div className="container mt-4">
            <div className="card p-4 shadow-lg">
                <h3 className="fw-bold">Alarm notification</h3>

                {/* ✅ Recipient info only on success */}
                {emailStatus.ok && (
                    <>
                        <p className="fw-bold">for Freezer {freezerNumber} was sent to:</p>
                        <ul className="list-unstyled">
                            {recipients.length > 0 ? (
                                recipients.map((user, index) => (
                                    <li key={index} className="border-bottom py-2">
                                        <p className="mb-0 fw-bold">{user.name}</p>
                                        {user.selectedEmail && (
                                            <p className="mb-0">
                                                <i className="bi bi-envelope me-1"></i> {user.email}
                                            </p>
                                        )}
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
                    </>
                )}

                {/* ✅ Main status alert */}
                {!emailStatus.ok && (
                    <div
                        className={`alert mt-4 ${
                            emailStatus.status === 400 ? "alert-danger" : "alert-warning"
                        }`}
                        role="alert"
                    >
                        <strong>Error {emailStatus.status}:</strong> Failed to send email: {shortenedError}
                    </div>
                )}

                {/* Delivery disclaimer shown only on success */}
                {emailStatus.ok && (
                    <div className="alert alert-warning mt-2" role="alert">
                        <strong>Note:</strong> Email was successfully sent. However, delivery isn't
                        guaranteed — some invalid or unreachable addresses may fail without
                        notification.
                    </div>
                )}

                <div className="text-center">
                    <button
                        className="btn btn-sm btn-home rounded-3 border shadow-lg mt-3"
                        style={{ padding: "6px 16px", fontSize: "0.9rem", width: "fit-content" }}
                        onClick={() => navigate(-1)}>
                        Back to Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertConfirmation;