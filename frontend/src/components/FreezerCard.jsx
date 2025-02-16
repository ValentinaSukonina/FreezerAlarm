import React from "react";
import "../assets/styles.css";

const FreezerCard = ({freezer}) => {
    if (!freezer) {
        return null;
    }

    const {number, room, address, type, users = []} = freezer;

    return (
        <div className="container my-5">
            <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                <div className="col-lg-7 p-3 p-lg-5 pt-lg-3">
                    <h5>Freezer: {number}</h5>
                    <p>Room: {room}</p>
                    <p>Address: {address}</p>
                    <p>Type: {type}</p>

                    <p style={{fontWeight: "bold"}}>Assigned Users:</p>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id || user.email}> {/* Ensure unique key */}
                                <p style={{fontWeight: "bold"}}>
                                    {user.name} ({user.user_rank})
                                </p>
                                <p>{user.email}</p>
                                <p>{user["phone_number"]}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FreezerCard;
