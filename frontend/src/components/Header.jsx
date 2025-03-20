import React, { useEffect, useState, useRef } from "react";
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
        if (searchNumber.trim()) {
            setIsOpen(false);
            navigate(`/freezers/${searchNumber}`);
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
                            placeholder="Search for freezer"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            style={{ backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px" }}
                        />
                        <button className="btn" type="submit" style={{ backgroundColor: "#A9C46C", color: "#fff" }}>
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
                    <ul className="navbar-nav ms-auto text-center">
                        <li className="nav-item">
                            <a className="nav-link text-white" href="/freezers">Freezers</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="/personal">Personal</a>
                        </li>

                        {/* Conditionally render Login/Logout */}
                        <li className="nav-item">
                            {isLoggedIn ? (
                                <button className="btn nav-link text-white" onClick={handleLogout}>
                                    Logout
                                </button>
                            ) : (
                                <a className="nav-link text-white fw-bold" href="/create-account">
                                    Login
                                </a>
                            )}
                        </li>
                    </ul>

                    {/* Mobile Search (Optional - if needed) */}
                    <form className="d-flex d-lg-none my-3 justify-content-center" onSubmit={handleSearch}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="Search for freezer"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            style={{ backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px" }}
                        />
                        <button className="btn ms-2" type="submit" style={{ backgroundColor: "#A9C46C", color: "#fff" }}>
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
};

export default Header;
