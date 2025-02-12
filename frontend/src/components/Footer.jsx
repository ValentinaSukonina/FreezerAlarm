import React from "react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="d-flex justify-content-center align-items-center border-top"
            style={{
                backgroundColor: "#5D8736",
                width: "100vw",
                minHeight: "40px",
                padding: "5px 0",
            }}
        >
            <p className="text-white text-center mb-0 small">
                Copyright ⓒ {currentYear} ITHS Gothenburg
            </p>
        </footer>
    );
};

export default Footer;
