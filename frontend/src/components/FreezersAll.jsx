import React, {useEffect, useState, useRef} from "react";
import {fetchAllFreezersWithUsers, createFreezer} from "../services/api";
import FreezerCardUser from "../components/FreezerCardUser";
import AddFreezerForm from "./AddFreezerForm";
//import "../assets/sorting.ico;

const FreezersAll = () => {
    const [successMessage, setSuccessMessage] = useState("");
    const [freezers, setFreezers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState(sessionStorage.getItem("role"));
    const [formError, setFormError] = useState("");
    const formRef = useRef();
    const [sortOrder, setSortOrder] = useState("asc");

    const [newFreezer, setNewFreezer] = useState({
        number: "",
        room: "",
        address: "",
        type: "",
        file: ""
    });

    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    };

    const sortedFreezers = [...freezers].sort((a, b) => {
        if (sortOrder === "asc") return a.number - b.number;
        return b.number - a.number;
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
        const {name, value} = e.target;
        setNewFreezer((prev) => ({...prev, [name]: value}));
    };

    const handleAddFreezer = async (freezerData) => {
        if (!freezerData.number || !freezerData.room) {
            return { ok: false, message: "Freezer number and room are required." };
        }

        try {
            const created = await createFreezer(freezerData);

            const updatedFreezers = await fetchAllFreezersWithUsers();
            setFreezers(updatedFreezers);

            setNewFreezer({ number: "", room: "", address: "", type: "", file: "" });
            formRef.current?.resetCheckboxes();

            setSuccessMessage(`✅ Freezer ${created.number} added successfully!`);
            setTimeout(() => setSuccessMessage(""), 3000);

            return { ok: true }; // success
        } catch (err) {
            console.error("Failed to create freezer:", err);
            return { ok: false, message: err.message || "Failed to add freezer." };
        }
    };

    const handleCancelForm = () => {
        setNewFreezer({number: "", room: "", address: "", type: "", file: ""});
        setFormError("");
        formRef.current?.resetCheckboxes();
        formRef.current?.closeForm();
    };

    if (loading) return <p className="text-center my-4">Loading freezers...</p>;
    if (error) return <p className="text-center my-4">Error: {error}</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center my-2 my-sm-3 ">Freezers Biomedicine
                <button
                    className="sort-btn mx-4"
                    onClick={toggleSortOrder}
                    title={`Sort by number (${sortOrder === "asc" ? "descending" : "ascending"})`}
                >
                    {sortOrder === "asc" ? (
                        <i className="bi bi-sort-down"></i>
                    ) : (
                        <i className="bi bi-sort-up"></i>
                    )}
                </button>
            </h2>
            {role === "admin" && (
                <>
                    <div className="freezer-form-container">
                        <AddFreezerForm
                            ref={formRef}
                            newFreezer={newFreezer}
                            onChange={handleNewFreezerChange}
                            onAdd={handleAddFreezer}
                            onCancel={handleCancelForm}
                            formError={formError}
                            onClearFormError={() => setFormError("")}
                            existingNumbers={freezers.map(f => String(f.number))}
                        />

                        {successMessage && (
                            <div className="success-message text-center mx-auto my-3">
                                {successMessage}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Card Layout */}
            <div className="freezer-grid mt-1 mt-sm-3">

                {sortedFreezers.map((freezer) => (
                    <div key={freezer.id} className="freezer-card">
                        <FreezerCardUser freezer={freezer}/>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default FreezersAll;