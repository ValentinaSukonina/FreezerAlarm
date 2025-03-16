import React, {useEffect, useState} from "react";
import {fetchFreezerWithUsers} from "../services/api";
import FreezerCard from "../components/FreezerCard";

const FreezerResult = ({freezerNumber}) => {
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getFreezer = async () => {
            setFreezer(null);  // Reset previous freezer data
            setError(null);     // Reset error message
            setLoading(true);   // Ensure loading state is set

            try {
                const data = await fetchFreezerWithUsers(freezerNumber);
                if (!data) {
                    throw new Error("No freezer found for this number.");
                }
                setFreezer(data);
            } catch (err) {
                setError("No freezer found for this number.");
            } finally {
                setLoading(false);
            }
        };
        
        getFreezer();
    }, [freezerNumber]);

    if (loading) return <p>Loading freezer data...</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center my-4">Search Results</h2>
            {error ? (
                <p className="alert alert-danger text-center">{error}</p>
            ) : freezer ? (
                <FreezerCard freezer={freezer}/>
            ) : (
                <p className="text-center">No freezer data found.</p>
            )}
        </div>
    );
};

export default FreezerResult;
