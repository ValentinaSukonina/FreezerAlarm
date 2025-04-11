import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchFreezerWithUsers} from "../services/api";
import FreezerCardAdmin from "../components/FreezerCardAdmin";
import FreezerCardUser from "../components/FreezerCardUser";

const FreezerResult = ({freezerNumber}) => {
    const [freezer, setFreezer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const role = sessionStorage.getItem("role");
    const navigate = useNavigate();

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

    const handleFreezerUpdated = async (updated, errorMessage) => {
        if (updated === "refetch") {
            try {
                const freshData = await fetchFreezerWithUsers(freezerNumber);
                setFreezer(freshData);
                setMessage(`✅ Freezer ${freshData.number ?? "???"} updated successfully!`);
            } catch (err) {
                setMessage("❌ Failed to reload updated freezer.");
            }
        } else if (updated) {
            setFreezer(updated);
            setMessage(`✅ Freezer ${updated.number ?? "???"} updated successfully!`);
        } else {
            setMessage(errorMessage || "❌ Failed to update freezer.");
        }

        setTimeout(() => setMessage(""), 4000);
    };

    const handleFreezerDeleted = () => {
        setFreezer(null);
        setMessage("🗑️ Freezer deleted successfully.");

        setTimeout(() => {
            setMessage("");
            navigate("/freezers"); // Redirect after delay
        }, 2000);
    };


    if (loading) return <p>Loading freezer data...</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center my-3">Search Results</h2>

            {message && (
                <div className="text-center mb-3"
                     style={{
                         backgroundColor: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
                         color: message.startsWith("✅") ? "#155724" : "#721c24",
                         border: message.startsWith("✅") ? "1px solid #c3e6cb" : "1px solid #f5c6cb",
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
                        onMessage={setMessage}
                    />
                ) : (
                    <FreezerCardUser freezer={freezer}/>
                )
            ) : null}
        </div>
    );
};

export default FreezerResult;