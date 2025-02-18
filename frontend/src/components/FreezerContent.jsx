import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {fetchFreezerWithUsers} from "../services/api";
import FreezerCard from "../components/FreezerCard";

const FreezerContent = () => {
    const {freezerNumber} = useParams();
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getFreezer = async () => {
            try {
                const data = await fetchFreezerWithUsers(freezerNumber);
                setFreezer(data);
            } catch (err) {
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        getFreezer();
    }, [freezerNumber]);

    if (loading) return <p>Loading freezer data...</p>;

    return (
        <div className="content-wrapper">
            {error ? (
                <p className="m-3">Error: {error}</p>
            ) : freezer ? (
                <>
                    <FreezerCard freezer={freezer}/>
                </>
            ) : (
                <p>No freezer data found.</p>
            )}
        </div>
    );
};

export default FreezerContent;
