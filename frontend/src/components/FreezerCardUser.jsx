import React from "react";
import "../assets/styles.css";

const FreezerCardUser = ({freezer}) => {
    if (!freezer) {
        return <p>No freezer data available.</p>;
    }

    const {number, room, address, type, users = []} = freezer;

    return (
        <div className="freezer-card mx-auto my-2 px-3 py-1">
            <div className="p-3 p-md-3 p-lg-4 align-items-center rounded-3 border shadow-lg"
                 style={{width: "100%"}}>
                <div className="p-2 pt-lg-2 text-start">
                    {/* Freezer Info */}
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-2 fw-bold">Freezer: {number}</h5>
                    </div>
                    <p className="mb-1"><strong>Room:</strong> {room}</p>
                    <p className="mb-1"><strong>Address:</strong> {address}</p>
                    <p><strong>Type:</strong> {type}</p>

                    {/* Assigned Users */}
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Assigned Users:</h6>
                    </div>

                    {users.length > 0 ? (
                        <ul className="list-unstyled">
                            {users.map(user => (
                                <li key={user.id || user.name} className="border-bottom py-2">
                                    <p className="fw-bold mb-0">• {user.name} ({user.user_rank || "No rank"})</p>
                                    <p className="mb-0 ms-2">{user.email}</p>
                                    <p className="mb-1 ms-2">{user.phone_number}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No assigned users.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreezerCardUser;

