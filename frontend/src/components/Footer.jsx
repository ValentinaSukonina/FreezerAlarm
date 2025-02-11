import React from "react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="footer d-flex justify-content-center align-items-center py-3 my-0 border-top"
            style={{
                backgroundColor: "#5D8736",
                width: "100vw",
                minHeight: "30px",
            }}
        >
            <p className="text-white mb-0" style={{lineHeight: "1.2"}}>
                Copyright ⓒ {currentYear} ITHS
            </p>
        </footer>
    );
};

export default Footer;
