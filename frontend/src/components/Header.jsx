import React, {useEffect, useState, useRef} from "react";
import {fetchFreezerWithUsers} from "../services/search";
import FreezerCard from "../components/FreezerCard";
import "../assets/styles.css";

console.log("Header.tsx: Rendering Header component...");

const Header = () => {
    const [isOpen, setIsOpen] = useState(false); // State to track menu visibility
    const mobileSearchRef = useRef(null);
    const toggleNavbar = () => {
        setIsOpen(!isOpen); // Toggle open/close state
    };

    //Place focus on search bar on small screen
    useEffect(() => {
        if (isOpen && mobileSearchRef.current) {
            // Optional slight delay if the collapse animation needs time
            setTimeout(() => {
                mobileSearchRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    // Search for freezer with munber
    const SearchFreezer = () => {
        const [searchNumber, setSearchNumber] = useState("");
        const [freezer, setFreezer] = useState(null);
        const [error, setError] = useState(null);

        const handleSearch = async (event) => {
            event.preventDefault();
            setError(null);
            setFreezer(null);

            try {
                const data = await fetchFreezerWithUsers(searchNumber);
                setFreezer(data);
            } catch (err) {
                setError("No freezer found for this number.");
            }
        };
        return null; // You may replace this with a UI component
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

                    {/* Search Bar - Always in the center on large screens */}
                    <div className="d-none d-lg-flex justify-content-center flex-grow-1">
                        <form className="d-flex w-auto mx-auto" onSubmit={handleSearch}>
                            <input
                                className="form-control mx-3"
                                type="search"
                                placeholder="Search for freezer"
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                                aria-label="Search"
                                style={{
                                    backgroundColor: "#F4FFC3",
                                    color: "#5D8736",
                                    width: "200px",
                                }}
                            />
                            <button
                                className="btn"
                                type="submit"
                                style={{
                                    backgroundColor: "#A9C46C",
                                    color: "#fff",
                                }}>
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Navbar Toggler for Mobile Screens */}
                    <button
                        className="navbar-toggler ms-auto me-3 d-lg-none"
                        type="button"
                        onClick={toggleNavbar} // Toggle menu manually
                        aria-expanded={isOpen}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>


                    {/* Navbar Items */}
                    <div
                        className={`collapse navbar-collapse ${isOpen ? "show" : ""} justify-content-lg-end text-center`}
                        id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link text-white" href="/freezers">Freezers</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white" href="/personal">Personal</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-white fw-bold" href="/create-account">Login</a>
                            </li>
                        </ul>

                        {/* Search Bar - Only visible inside the menu on small screens */}
                        <div className="d-lg-none text-center mt-2">
                            <form className="d-flex justify-content-center">
                                <input
                                    ref={mobileSearchRef}
                                    className="form-control"
                                    type="search"
                                    placeholder="Search for freezer"
                                    aria-label="Search"
                                    autoFocus
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