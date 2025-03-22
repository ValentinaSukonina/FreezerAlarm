import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles.css";



const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchNumber, setSearchNumber] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem("isLoggedIn");
        setIsLoggedIn(loggedInUser === "true");
    }, []);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (searchNumber.trim() && isLoggedIn) {
            navigate(`/freezers/${searchNumber}`);
            setSearchNumber(""); // Clear search field after searching
            setIsOpen(false); // Close navbar on mobile
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn");
        window.location.href = "http://localhost:8000/logout";
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top py-2" style={{ backgroundColor: "#5D8736" }}>
            <div className="container-fluid px-3">
                <a className="navbar-brand text-white fw-bold" href="/">
                    Freezer Alarm Management
                </a>

                {/* Search Bar (Large Screens) */}
                <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                    <form className="d-flex w-auto mx-auto" onSubmit={handleSearch}>
                        <input
                            className="form-control mx-3"
                            type="search"
                            placeholder={isLoggedIn ? "Search for freezer" : "Login to search"}
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            disabled={!isLoggedIn}
                            style={{ backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px" }}
                        />
                        <button
                            className="btn"
                            type="submit"
                            disabled={!isLoggedIn}
                            style={{ backgroundColor: "#A9C46C", color: "#fff" }}>
                            Search
                        </button>
                    </form>
                </div>

                {/* Mobile Menu Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleNavbar}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Items */}
                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
                    <ul className="navbar-nav ms-auto d-flex align-items-center text-center">
                        <li className="nav-item">
                            <a
                                className={`nav-link text-white ${!isLoggedIn ? "disabled" : ""}`}
                                href={isLoggedIn ? "/freezers" : "#"}
                                onClick={(e) => !isLoggedIn && e.preventDefault()}
                                style={!isLoggedIn ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                                Freezers
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link text-white ${!isLoggedIn ? "disabled" : ""}`}
                                href={isLoggedIn ? "/personal" : "#"}
                                onClick={(e) => !isLoggedIn && e.preventDefault()}
                                style={!isLoggedIn ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                                Personal
                            </a>
                        </li>

                        {/* Conditionally render Login/Logout */}
                        <li className="nav-item">
                            {isLoggedIn ? (
                                <a
                                    className="nav-link text-white"
                                    href="#"
                                    onClick={handleLogout}
                                    style={{ cursor: "pointer" }}>
                                    Logout
                                </a>
                            ) : (
                                <a className="nav-link text-white fw-bold" href="/create-account">
                                    Login
                                </a>
                            )}
                        </li>
                    </ul>

                    {/* Search Bar for Mobile - Appears inside menu when open */}
                    {isOpen && (
                        <form className="d-flex d-lg-none my-3 justify-content-center" onSubmit={handleSearch}>
                            <input
                                className="form-control"
                                type="search"
                                placeholder={isLoggedIn ? "Search for freezer" : "Login to search"}
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                                disabled={!isLoggedIn}
                                style={{ backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px" }}
                            />
                            <button
                                className="btn ms-2"
                                type="submit"
                                disabled={!isLoggedIn}
                                style={{ backgroundColor: "#A9C46C", color: "#fff" }}>
                                Search
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;




