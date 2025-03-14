import React from "react";
import {useNavigate} from "react-router-dom";

const HomeContent = () => {
    const navigate = useNavigate();
    return (
        <div className="container d-flex justify-content-center align-items-center text-center py-5 mt-3">
            <div className="col-md-8">
                <h2>Why Use This System?</h2>

                <ul className="list-unstyled">
                    <li className="list-item">
                        <span className="check-mark">✔ </span>
                        <span className="list-text"><strong>Search Freezer by Number</strong> – Instantly find freezer details by entering its unique number.</span>
                    </li>
                    <li className="list-item">
                        <span className="check-mark">✔ </span>
                        <span className="list-text"><strong>View Ownership Information</strong> – See the freezer’s owner, users, and contact details.</span>
                    </li>
                    <li className="list-item">
                        <span className="check-mark">✔ </span>
                        <span className="list-text"><strong>Send Notifications</strong> – System administrators can directly send SMS or email alerts in case of temperature fluctuations or emergencies.</span>
                    </li>
                    <li className="list-item">
                        <span className="check-mark">✔ </span>
                        <span className="list-text"><strong>Access detailed temperature logs and reports</strong></span>
                    </li>
                </ul>

                <h2>Start using it now</h2>
                <button
                    type="button"
                    className="btn btn-lg mt-3"
                    style={{backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white"}}
                    onClick={() => navigate("/create-account")}
                >
                    Log in
                </button>

            </div>
        </div>
    );
};

export default HomeContent;


