import React, { useState } from "react";

const AddFreezerForm = ({ newFreezer, onChange, onAdd }) => {
    const [showForm, setShowForm] = useState(false);

    const handleCancel = () => {
        setShowForm(false);
    };

    return (
        <div className="text-center mb-4">
            {!showForm ? (
                <button
                    className="btn"
                    style={{ backgroundColor: "#5D8736", color: "white" }}
                    onClick={() => setShowForm(true)}
                >
                    Add New Freezer
                </button>
            ) : (
                <>
                    <button
                        className="btn mb-3"
                        style={{ backgroundColor: "#5D8736", color: "white" }}
                        onClick={() => setShowForm(false)}
                    >
                        Hide Form
                    </button>

                    <div
                        className="mx-auto p-4 rounded"
                        style={{
                            backgroundColor: "#f8fff0",
                            maxWidth: "600px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.05)"
                        }}
                    >
                        <h5 className="mb-3 text-start fw-bold">Add New Freezer</h5>

                        <input
                            name="number"
                            className="form-control mb-2"
                            placeholder="Number"
                            value={newFreezer.number}
                            onChange={onChange}
                        />
                        <input
                            name="room"
                            className="form-control mb-2"
                            placeholder="Room"
                            value={newFreezer.room}
                            onChange={onChange}
                        />
                        <input
                            name="address"
                            className="form-control mb-2"
                            placeholder="Address"
                            value={newFreezer.address}
                            onChange={onChange}
                        />
                        <input
                            name="type"
                            className="form-control mb-3"
                            placeholder="Type"
                            value={newFreezer.type}
                            onChange={onChange}
                        />

                        <div className="d-flex justify-content-between">
                            <button
                                className="btn"
                                style={{ backgroundColor: "#5D8736", color: "white" }}
                                onClick={onAdd}
                            >
                                Add
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AddFreezerForm;







