import React, {useEffect, useState} from "react";
import FreezerCard from "../components/FreezerCard"; // Import reusable component

const FreezersAll = () => {
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFreezersWithUsers = async () => {
            try {
                const response = await fetch("/api/freezers/with-users"); // Backend endpoint
                if (!response.ok) {
                    throw new Error("Failed to fetch freezers");
                }
                const data = await response.json();
                setFreezers(data); // Store fetched freezers in state
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFreezersWithUsers();
    }, []);

    if (loading) return <p>Loading freezers...</p>;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return (
        <div>
            {freezers.map((freezer) => (
                <FreezerCard key={freezer.id} freezer={freezer}/>
            ))}
        </div>
    );
};

export default FreezersAll;