import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchNumber, setSearchNumber] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
        const storedRole = sessionStorage.getItem("role");

        setIsLoggedIn(loggedIn);
        setRole(storedRole || "");

        // If logged in but no role in sessionStorage, fetch from backend
        if (loggedIn && !storedRole) {
            fetch("http://localhost:8000/api/auth/role", {
                credentials: "include"
            })
                .then((res) => res.text())
                .then((fetchedRole) => {
                    sessionStorage.setItem("role", fetchedRole);
                    setRole(fetchedRole);
                })
                .catch((err) => console.error("Failed to fetch role", err));
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchNumber.trim() && isLoggedIn) {
            navigate(`/freezers/${searchNumber}`);
            setSearchNumber("");
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("role");
        window.location.href = "http://localhost:8000/logout";
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top py-2" style={{ backgroundColor: "#5D8736" }}>
            <div className="container-fluid px-3">
                <a className="navbar-brand text-white fw-bold" href="/">
                    Freezer Alarm Management
                </a>

                {/* Desktop Search */}
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
                            style={{ backgroundColor: "#A9C46C", color: "#fff" }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Mobile Toggle */}
                <button className="navbar-toggler" type="button" onClick={() => setIsOpen(!isOpen)}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Items */}
                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
                    <ul className="navbar-nav ms-auto text-center">
                        <li className="nav-item">
                            <a
                                className={`nav-link text-white ${!isLoggedIn ? "disabled" : ""}`}
                                href={isLoggedIn ? "/freezers" : "#"}
                                onClick={(e) => !isLoggedIn && e.preventDefault()}
                                style={!isLoggedIn ? {opacity: 0.5, cursor: "not-allowed"} : {}}
                            >
                                Freezers
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className={`nav-link text-white ${!isLoggedIn ? "disabled" : ""}`}
                                href={isLoggedIn ? "/my-account" : "#"}
                                onClick={(e) => !isLoggedIn && e.preventDefault()}
                                style={!isLoggedIn ? {opacity: 0.5, cursor: "not-allowed"} : {}}
                            >
                                My Account
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className={`nav-link text-white ${!isLoggedIn || role !== "admin" ? "disabled" : ""}`}
                                href={isLoggedIn && role === "admin" ? "/personal" : "#"}
                                onClick={(e) => (!isLoggedIn || role !== "admin") && e.preventDefault()}
                                style={!isLoggedIn || role !== "admin" ? {opacity: 0.5, cursor: "not-allowed"} : {}}
                            >
                                Personal
                            </a>
                        </li>

                        <li className="nav-item">
                            {isLoggedIn ? (
                                <a className="nav-link text-white" href="#" onClick={handleLogout}>
                                    Logout
                                </a>
                            ) : (
                                <a className="nav-link text-white fw-bold" href="/create-account">
                                    Login
                                </a>
                            )}
                        </li>
                    </ul>


                    {/* Mobile Search */}
                    {isOpen && (
                        <form className="d-flex d-lg-none my-3 justify-content-center" onSubmit={handleSearch}>
                            <input
                                className="form-control"
                                type="search"
                                placeholder={isLoggedIn ? "Search for freezer" : "Login to search"}
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                                disabled={!isLoggedIn}
                                style={{backgroundColor: "#F4FFC3", color: "#5D8736", width: "200px"}}
                            />
                            <button
                                className="btn ms-2"
                                type="submit"
                                disabled={!isLoggedIn}
                                style={{backgroundColor: "#A9C46C", color: "#fff"}}
                            >
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











