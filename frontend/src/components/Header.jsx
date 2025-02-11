import React from "react";
import "../assets/styles.css";

console.log("Header.tsx: Rendering Header component...");

const Header = () => {
  return (
    <>
        <nav
            className="navbar navbar-expand-lg w-100 fixed-top py-2"
            style={{
                backgroundColor: "#5D8736",
                width: "100vw",
                minHeight: "60px",
            }}>
            <div className="container-fluid d-flex align-items-center px-0">
                <a className="navbar-brand text-white fw-bold ms-3" href="/">
                    Freezer Alarm Management
                </a>

                <div className="d-block d-lg-flex justify-content-center flex-grow-1">
                    <form className="d-flex w-auto mx-auto">
                        <input
                            className="form-control mx-3"
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

                <button
                    className="navbar-toggler d-lg-none align-self-center mx-3"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse justify-content-end mx-3"
                    id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item mx-3">
                            <a className="nav-link text-white" href="#">
                                Freezers
                            </a>
                        </li>
                        <li className="nav-item me-3">
                            <a className="nav-link text-white" href="/personal">
                                 Personal
                            </a>
                        </li>
                        <li className="nav-item me-3">
                            <a className="nav-link text-white fw-bold"  href="#">
                                 Login
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

        </nav>
    </>
  );
};

export default Header;
