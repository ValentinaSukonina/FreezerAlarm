import React from 'react';

console.log('Header.tsx: Rendering Header component...');

const Header = () => {
    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#5D8736' }}> {/* Dark Green */}
            <div className="container-fluid">
                <a className="navbar-brand text-white fw-bold" href="#">Freezer Alarm Management System</a>
                {/* White text for contrast */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link text-white" href="#">Freezers</a> {/* White text */}
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-white" href="#">Link</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle text-white"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Personal list
                            </a>
                            <ul className="dropdown-menu" style={{backgroundColor: '#809D3C'}}> {/* Medium Green */}
                                <li><a className="dropdown-item text-white" href="#">Action</a></li>
                                <li><a className="dropdown-item text-white" href="#">Another action</a></li>
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>
                                <li><a className="dropdown-item text-white" href="#">Something else here</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link disabled text-white" aria-disabled="true">Disabled</a>
                        </li>
                    </ul>
                    <form className="d-flex" role="search">
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search for freezer"
                            aria-label="Search"
                            style={{backgroundColor: '#F4FFC3', color: '#5D8736'}} // Light background, dark text
                        />
                        <button className="btn" type="submit" style={{backgroundColor: '#A9C46C', color: '#fff'}}>
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </nav>
    );
};

export default Header;



