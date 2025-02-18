import React, {useEffect, useState} from "react";
import {fetchAllFreezersWithUsers} from "../services/api"; // API call for all freezers
import FreezerCard from "../components/FreezerCard"; // Import FreezerCard
import axios from "axios";

const FreezersAll = () => {
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getAllFreezers = async () => {
            try {
                const data = await fetchAllFreezersWithUsers(); // Fetch all freezers
                setFreezers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getAllFreezers();
    }, []);

    if (loading) return <p>Loading freezers...</p>;
    if (error) return <p>Error: {error}</p>;
    if (freezers.length === 0) return <p>No freezers available.</p>;

    return (
        <div>
            <h2>All Freezers</h2>
            {freezers.map((freezer) => (
                <FreezerCard key={freezer.id} freezer={freezer}/>
            ))}
        </div>
    );
};

export default FreezersAll;
