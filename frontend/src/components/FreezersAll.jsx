import React, { useEffect, useState } from "react";
import {
    fetchAllFreezersWithUsers,
    createFreezer
} from "../services/api";
import FreezerCardAdmin from "../components/FreezerCardAdmin";
import FreezerCardUser from "../components/FreezerCardUser";
import AddFreezerForm from "./AddFreezerForm";

const FreezersAll = () => {
    const [deleteMessage, setDeleteMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState(sessionStorage.getItem("role"));

    const [newFreezer, setNewFreezer] = useState({
        number: "",
        room: "",
        address: "",
        type: "",
        file: ""
    });

    useEffect(() => {
        const fetchRoleIfNeeded = async () => {
            if (!role) {
                try {
                    const res = await fetch("http://localhost:8000/api/auth/role", {
                        credentials: "include"
                    });
                    if (res.ok) {
                        const fetchedRole = await res.text();
                        sessionStorage.setItem("role", fetchedRole);
                        setRole(fetchedRole);
                    }
                } catch (err) {
                    console.error("Failed to fetch role", err);
                }
            }
        };

        fetchRoleIfNeeded();
    }, [role]);

    useEffect(() => {
        const getAllFreezers = async () => {
            try {
                const data = await fetchAllFreezersWithUsers();
                setFreezers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getAllFreezers();
    }, []);

    const handleNewFreezerChange = (e) => {
        const { name, value } = e.target;
        setNewFreezer((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddFreezer = async () => {
        if (!newFreezer.number || !newFreezer.room) {
            alert("Freezer number and room are required.");
            return;
        }

        try {
            const created = await createFreezer(newFreezer);
            setFreezers((prev) => [...prev, created]);
            setNewFreezer({ number: "", room: "", address: "", type: "", file: "" });

            setSuccessMessage(`✅ Freezer ${created.number} added successfully!`);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            alert("Failed to create freezer.");
        }
    };

    const handleFreezerUpdated = (updatedFreezer) => {
        setFreezers((prev) =>
            prev.map((f) => (f.id === updatedFreezer.id ? updatedFreezer : f))
        );
    };

    const handleFreezerDeleted = (deletedId) => {
        setFreezers((prev) => prev.filter((f) => f.id !== deletedId));
        setDeleteMessage("🗑️ Freezer deleted successfully.");
        setTimeout(() => setDeleteMessage(""), 3000);
    };

    if (loading) return <p>Loading freezers...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center mt-3 mb-2">Freezers Biomedicine</h2>

            {role === "admin" && (
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <AddFreezerForm
                        newFreezer={newFreezer}
                        onChange={handleNewFreezerChange}
                        onAdd={handleAddFreezer}
                    />

                    {successMessage && (
                        <div className="text-center mb-3" style={{
                            backgroundColor: "#d4edda",
                            color: "#155724",
                            border: "1px solid #c3e6cb",
                            padding: "10px 16px",
                            borderRadius: "5px"
                        }}>
                            {successMessage}
                        </div>
                    )}

                    {deleteMessage && (
                        <div className="text-center mb-3" style={{
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            border: "1px solid #f5c6cb",
                            padding: "10px 16px",
                            borderRadius: "5px"
                        }}>
                            {deleteMessage}
                        </div>
                    )}
                </div>
            )}

            <div className="freezer-grid">
                {freezers.map((freezer) =>
                    role === "admin" ? (
                        <FreezerCardAdmin
                            key={freezer.id}
                            freezer={freezer}
                            onFreezerUpdated={handleFreezerUpdated}
                            onFreezerDeleted={handleFreezerDeleted}
                        />
                    ) : (
                        <FreezerCardUser key={freezer.id} freezer={freezer} />
                    )
                )}
            </div>
        </div>
    );
};

export default FreezersAll;






