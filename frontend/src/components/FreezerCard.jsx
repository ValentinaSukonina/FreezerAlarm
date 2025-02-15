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
                    <h5 className="display-4 fw-bold lh-1 text-body-emphasis">Freezer: {freezer.number}</h5>
                    <p className="lead">Room: {freezer.room}.</p>
                    <p className="lead">Location: {freezer.address}</p>
                    <p className="lead">Type: {freezer.type}.</p>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-4 mb-lg-3">
                        <button type="button" className="btn btn-primary btn-lg px-4 me-md-2 fw-bold">Primary</button>
                        <button type="button" className="btn btn-outline-secondary btn-lg px-4">Default</button>
                    </div>
                </div>
                <div className="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
                    <img className="rounded-lg-3" src="bootstrap-docs.png" alt="" width="720"/>
                </div>
                <Link to={`/freezers/${freezer.id}`} className="btn btn-primary">
                    View Details
                </Link>
            </div>
        </div>
    );
}

export default FreezerCard;
