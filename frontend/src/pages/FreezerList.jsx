import React, { useEffect, useState } from "react";
import { fetchFreezers } from "../services/api"; // Import API function

const FreezerList = () => {
    console.log("FreezerList.jsx: Rendering FreezerList component...");

    const [freezers, setFreezers] = useState([]); // State to store API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getFreezers = async () => {
            try {
                console.log("FreezerList.jsx: Fetching freezers...");
                const data = await fetchFreezers(); // Call API
                setFreezers(data); // Store response in state
                console.log("FreezerList.jsx: API response:", data);
            } catch (err) {
                console.error("FreezerList.jsx: Error fetching data", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getFreezers();
    }, []); // Empty dependency array means it runs once when component mounts

    return (
        <main>
            <h2>Freezers</h2>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <h3>Freezers List:</h3>
            <ul>
                {freezers.length > 0 ? (
                    freezers.map((freezer, index) => (
                        <li key={index}>
                            <strong>Freezer number:</strong> {freezer.number},
                            <strong> Room:</strong> {freezer.room}
                        </li>
                    ))
                ) : (
                    !loading && <p>No freezers available.</p>
                )}
            </ul>
        </main>
    );
};

export default FreezerList;
