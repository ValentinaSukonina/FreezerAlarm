import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import FreezerCard from "./FreezerCard";
import {fetchFreezer} from "../services/api"; //

const FreezerSingle = () => {
    const {freezerNumber} = useParams(); // Get freezer number from URL
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getFreezer = async () => {
            try {
                const data = await fetchFreezer(freezerNumber); //
                setFreezer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getFreezer();
    }, [freezerNumber]);

    if (loading) return <p>Loading freezer...</p>;
    if (error) return <p style={{color: "red"}}>{error}</p>;

    return <FreezerCard freezer={freezer}/>;
};

export default FreezerSingle;
