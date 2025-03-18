import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles.css";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false); // Track menu visibility
    const [searchNumber, setSearchNumber] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
    const mobileSearchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in (Session Storage / Local Storage)
        const loggedInUser = sessionStorage.getItem("isLoggedIn");
        setIsLoggedIn(loggedInUser === "true");
    }, []);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    // Search logic
    const handleSearch = (event) => {
        event.preventDefault();
        if (searchNumber.trim()) {
            setIsOpen(false);
            navigate(`/freezers/${searchNumber}`);
        }
    };

    // Handle Logout
    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn"); // Clear login status
        window.location.href = "http://localhost:8000/logout"; // Redirect to backend logout
    };

    return (
        <nav
            className="navbar navbar-expand-lg w-100 fixed-top py-2"
            style={{
                backgroundColor: "#5D8736",
                width: "100vw",
                minHeight: "60px",
            }}>
            <div className="container-fluid px-3">
                <a className="navbar-brand text-white fw-bold" href="/">
                    Freezer Alarm Management
                </a>

                {/* Centered Search Bar (Large Screens) */}
                <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                    <form className="d-flex w-auto mx-auto" onSubmit={handleSearch}>
                        <input
                            className="form-control mx-3"
                            type="search"
                            placeholder="Search for freezer"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            aria-label="Search"
                            style={{ backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px" }}
                        />
                        <button className="btn" type="submit" style={{ backgroundColor: "#A9C46C", color: "#fff" }}>
                            Search
                        </button>
                    </form>
                </div>

                {/* Mobile Menu Toggler */}
                <button
                    className="navbar-toggler ms-auto me-3 d-lg-none"
                    type="button"
                    onClick={toggleNavbar}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Items */}
                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""} justify-content-lg-end text-center`}>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <a className="nav-link text-white" href="/freezers">Freezers</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="/personal">Personal</a>
                        </li>
                        <li className="nav-item">
                            {isLoggedIn ? (
                                <button className="nav-link text-white btn btn-danger" onClick={handleLogout}>
                                    Logout
                                </button>
                            ) : (
                                <a className="nav-link text-white fw-bold" href="/create-account">
                                    Login
                                </a>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
