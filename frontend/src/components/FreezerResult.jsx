import React, { useEffect, useState } from "react";
import { fetchFreezerWithUsers } from "../services/api";
import FreezerCardAdmin from "../components/FreezerCardAdmin";
import FreezerCardUser from "../components/FreezerCardUser";

const FreezerResult = ({ freezerNumber }) => {
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const role = sessionStorage.getItem("role");

    useEffect(() => {
        const getFreezer = async () => {
            setFreezer(null);
            setError(null);
            setLoading(true);
            setMessage("");

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

    const handleFreezerUpdated = (updated) => {
        setFreezer(updated);
        setMessage(`✅ Freezer ${updated.number} updated successfully!`);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleFreezerDeleted = () => {
        setFreezer(null);
        setMessage("🗑️ Freezer deleted successfully.");
        setTimeout(() => setMessage(""), 3000);
    };

    if (loading) return <p>Loading freezer data...</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center my-4">Search Results</h2>

            {message && (
                <div className="text-center mb-3"
                     style={{
                         backgroundColor: "#d4edda",
                         color: "#155724",
                         border: "1px solid #c3e6cb",
                         padding: "10px 16px",
                         borderRadius: "5px",
                         maxWidth: "500px",
                         margin: "0 auto"
                     }}
                >
                    {message}
                </div>
            )}

            {error ? (
                <p className="alert alert-danger text-center">{error}</p>
            ) : freezer ? (
                role === "admin" ? (
                    <FreezerCardAdmin
                        freezer={freezer}
                        onFreezerUpdated={handleFreezerUpdated}
                        onFreezerDeleted={handleFreezerDeleted}
                    />
                ) : (
                    <FreezerCardUser freezer={freezer} />
                )
            ) : null}
        </div>
    );
};

export default FreezerResult;





