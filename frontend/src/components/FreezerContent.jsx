import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {fetchFreezerWithUsers} from "../services/api";
//import {fetchFreezer} from "../services/api";

import FreezerCard from "../components/FreezerCard"; // Import FreezerCard

const FreezerContent = () => {
    const {freezerNumber} = useParams(); // Get freezer number from URL
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getFreezer = async () => {
            try {
                const data = await fetchFreezerWithUsers(freezerNumber);
                setFreezer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getFreezer();
    }, [freezerNumber]);

    if (loading) return <p>Loading freezer data...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!freezer) return <p>No freezer data found.</p>;

    return (
        <div>
            <h2>Freezer Details</h2>
            <FreezerCard freezer={freezer}/> {/* Pass one freezer */}
        </div>
    );
};

export default FreezerContent;