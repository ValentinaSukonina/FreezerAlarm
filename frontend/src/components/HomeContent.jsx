import React from "react";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const HomeContent = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLogin = () => {
            const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(loggedIn);
        };

        // Initial check
        checkLogin();

        // Optional: Update on storage change (e.g., in other tabs)
        window.addEventListener("storage", checkLogin);

        return () => {
            window.removeEventListener("storage", checkLogin);
        };
    }, []);

    const handleLogin = () => {
        navigate("/create-account");
    };

    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("role");
        window.location.href = "http://localhost:8000/logout";
    };

    return (
        <div className="container text-center mt-4 pt-2">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6">
                    <h2 className="mb-4">Why Use This System?</h2>

                    <ul className="list-unstyled">
                        <li className="list-item">
                            <span className="check-mark">✔ </span>
                            <span className="list-text"><strong>Search Freezer by Number</strong> – Instantly find freezer details by entering its unique number</span>
                        </li>
                        <li className="list-item">
                            <span className="check-mark">✔ </span>
                            <span className="list-text"><strong>View Ownership Information</strong> – See the freezer’s owner, users, and contact details</span>
                        </li>
                        <li className="list-item">
                            <span className="check-mark">✔ </span>
                            <span className="list-text"><strong>Send Notifications</strong> – System administrators can directly send SMS or email alerts in case of temperature fluctuations or emergencies</span>
                        </li>
                    </ul>

                    <p style={{
                        fontStyle: "italic",
                        margin: "1.5rem",
                        backgroundColor: "#EAF6E2",
                        padding: "1rem",
                        borderRadius: "0.5rem"
                    }}>
                        This system is accessible only to staff members of the Institute of Biomedicine at the
                        University of
                        Gothenburg.
                    </p>


                    <h4>Start using it now</h4>
                    <button
                        type="button"
                        className="btn btn-sm mt-2 px-4"
                        style={{backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white"}}
                        onClick={isLoggedIn ? handleLogout : handleLogin}
                    >
                        {isLoggedIn ? "Logout" : "Log in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeContent;


