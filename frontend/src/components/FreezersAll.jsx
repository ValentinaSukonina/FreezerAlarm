import React, {useEffect, useState, useRef} from "react";
import {fetchAllFreezersWithUsers, createFreezer} from "../services/api";
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

    const formRef = useRef();

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
            alert("Freezer number and room are required.");
            return;
        }

        try {
            const created = await createFreezer(freezerData);
            setFreezers((prev) => [...prev, created]);
            setNewFreezer({number: "", room: "", address: "", type: "", file: ""});
            formRef.current?.resetCheckboxes(); //  Reset selected users

            setSuccessMessage(`✅ Freezer ${created.number} added successfully!`);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            alert("Failed to create freezer.");
        }
    };

    if (loading) return <p>Loading freezers...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="content-wrapper mx-2 my-1">
            <h2 className="text-center mt-3 mb-4">Freezers Biomedicine</h2>

            {role === "admin" && (
                <>
                    <div className="freezer-form-container">
                        <AddFreezerForm
                            ref={formRef}
                            newFreezer={newFreezer}
                            onChange={handleNewFreezerChange}
                            onAdd={handleAddFreezer}
                        />

                        {successMessage && (
                            <div className="success-message text-center mx-auto my-3">
                                {successMessage}
                            </div>
                        )}
                        {deleteMessage && (
                            <div className="text-center mb-3" style={{
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                border: "1px solid #f5c6cb",
                                padding: "10px 16px",
                                borderRadius: "5px",
                                maxWidth: "500px",
                                margin: "0 auto"
                            }}>
                                {deleteMessage}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Updated Card Layout */}
            <div className="freezer-grid mt-4">

                {freezers.map((freezer) => (
                    <div key={freezer.id} className="freezer-card">
                        <FreezerCardUser freezer={freezer}/>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default FreezersAll;