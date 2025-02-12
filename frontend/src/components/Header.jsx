import React, { useState } from "react";
import "../assets/styles.css";

console.log("Header.tsx: Rendering Header component...");

const Header = () => {
    const [isOpen, setIsOpen] = useState(false); // State menu visibility

    const toggleNavbar = () => {
        setIsOpen(!isOpen); // Toggle open/close state
    };

    return (
        <>
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

                    {/* Navbar Toggler - Uses onClick to toggle menu */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={toggleNavbar} // Handles toggle manually
                        aria-expanded={isOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navbar Items */}
                    <div className={`collapse navbar-collapse ${isOpen ? "show" : ""} justify-content-lg-end text-center`} id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link text-white" href="#">Freezers</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white" href="/personal">Personal</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white fw-bold" href="#">Login</a>
                            </li>
                        </ul>

                        {/* Search Bar - Only visible when menu is expanded on mobile */}
                        <div className="d-lg-none text-center mt-2">
                            <form className="d-flex justify-content-center">
                                <input
                                    className="form-control"
                                    type="search"
                                    placeholder="Search for freezer"
                                    aria-label="Search"
                                    style={{
                                        backgroundColor: "#F4FFC3",
                                        color: "#5D8736",
                                        width: "200px",
                                    }}
                                />
                                <button
                                    className="btn ms-2"
                                    type="submit"
                                    style={{
                                        backgroundColor: "#A9C46C",
                                        color: "#fff",
                                    }}>
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;



