import React from "react";
import "../assets/styles.css";
import {Link} from "react-router-dom";
import {fetchUsers} from "../services/api";

import {useEffect, useState} from "react";

console.log("FreezerCard.tsx: Rendering FreezerCard component...");
const FreezerCard = ({freezer}) => {
    return (
        <div className="container my-5">
            <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                <div className="col-lg-7 p-3 p-lg-5 pt-lg-3">
                </div>
            </div>
        </div>
    );
}

export default FreezerCard;
