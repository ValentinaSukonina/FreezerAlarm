import React from "react";

const HomeContent = () => {
    return (

        <div className="container d-flex justify-content-center align-items-center text-center py-5 mt-3">
            <div className="col-md-8">

                <h2>Welcome to the Freezer Alarm Management System</h2>
                <p>
                    This system helps monitor and manage freezer temperatures in real-time.
                    Get alerts, view logs, and ensure optimal storage conditions.
                </p>
                <h2>Why Use This System?</h2>
                <ul className="list-unstyled">
                    <li>✔ Monitor freezer temperatures in real-time</li>
                    <li>✔ Receive instant alerts for temperature fluctuations</li>
                    <li>✔ Access detailed temperature logs and reports</li>
                </ul>
                <h2>How It Works</h2>
                <p>
                    Our system connects to sensors placed inside freezers. When temperature
                    changes beyond the safe range, alerts are triggered, and corrective actions
                    can be taken immediately.
                </p>
                <button
                    type="button"
                    className="btn btn-lg mt-3"
                    style={{backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white"}}
                >
                    Create Account
                </button>

            </div>
        </div>
    );
};

export default HomeContent;


