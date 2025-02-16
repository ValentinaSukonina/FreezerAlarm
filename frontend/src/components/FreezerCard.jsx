import React from "react";
import "../assets/styles.css";

const FreezerCard = ({freezer}) => {
    // Guard clause: if freezer is undefined, return null (or a placeholder)
    if (!freezer) {
        return null;
    }

    // Destructure properties from freezer (ensure the names match the JSON response)
    const {number, room, address, type, users = []} = freezer;

    return (
        <div className="container my-5">
            <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                <div className="col-lg-7 p-3 p-lg-5 pt-lg-3">
                    <h5>Freezer: {number}</h5>
                    <p>Room: {room}</p>
                    <p>Address: {address}</p>
                    <p>Type: {type}</p>

                    <h6>Assigned Users:</h6>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                <p>{user.name}</p>
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
