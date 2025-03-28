import React from "react";
import FreezerCardAdmin from "./FreezerCardAdmin";
import FreezerCardUser from "./FreezerCardUser";

const FreezerCard = ({ freezer }) => {
    const role = sessionStorage.getItem("role");

    if (!freezer) return <p>No freezer data available.</p>;

    return role === "admin"
        ? <FreezerCardAdmin freezer={freezer} />
        : <FreezerCardUser freezer={freezer} />;
};

export default FreezerCard;

