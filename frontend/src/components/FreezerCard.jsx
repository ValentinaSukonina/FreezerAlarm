import React from "react";
import "../assets/styles.css";

const FreezerCard = ({freezer}) => {
    if (!freezer) {
        return <p>No freezer data available.</p>;
    }

    const {number, room, address, type, users = []} = freezer;

    return (
        <div className="container my-2 freezer-card d-flex justify-content-center align-items-center">
            <div className="row p-3 p-md-4 p-lg-5 mb-4 align-items-center rounded-3 border shadow-lg">
                <div className="p-2 p-lg-4 pt-lg-3">
                    <h5 className="mb-3 fw-bold">Freezer: {number}</h5>
                    <p><strong>Room:</strong> {room}</p>
                    <p><strong>Address:</strong> {address}</p>
                    <p><strong>Type:</strong> {type}</p>

                    <h6 className="mt-4 mb-3 fw-bold">Assigned Users:</h6>
                    {users.length > 0 ? (
                        <ul>
                            {users.map((user) => (
                                <li key={user.id || user.email}>
                                    <p className="fw-bold">{user.name} ({user.user_rank || "No rank"})</p>
                                    <p>Email: {user.email}</p>
                                    <p>Phone: {user.phone_number}</p>
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

export default FreezerCard;
