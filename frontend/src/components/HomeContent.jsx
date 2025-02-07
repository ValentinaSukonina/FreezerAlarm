import React from "react";

const HomeContent = () => {
    return (
        <div>
            <h2>Welcome to the Freezer Alarm Management System</h2>
            <p>This system helps monitor and manage freezer temperatures in real-time.
                Get alerts, view logs, and ensure optimal storage conditions.</p>
            <h2>Why Use This System?</h2>
                <ul>
                    <li>✔ Monitor freezer temperatures in real-time</li>
                    <li>✔ Receive instant alerts for temperature fluctuations</li>
                    <li>✔ Access detailed temperature logs and reports</li>
                </ul>
            <h2>How It Works</h2>
                <p>Our system connects to sensors placed inside freezers. When temperature
                    changes beyond the safe range, alerts are triggered, and corrective actions
                    can be taken immediately.
                </p>
        </div>
    );
};

export default HomeContent;

