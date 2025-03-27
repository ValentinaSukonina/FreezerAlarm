import React from "react";

const AddFreezerForm = ({ newFreezer, onChange, onAdd }) => {
    return (
        <div className="d-flex justify-content-center">
            <div
                className="mb-4 mt-3 border p-3 rounded"
                style={{
                    backgroundColor: "#f8fff0",
                    maxWidth: "90%",
                    minWidth: "600px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
                }}
            >
                <h5 className="mb-3 fw-bold">Add New Freezer</h5>
                <div className="row g-2 align-items-center">
                    <div className="col">
                        <input
                            name="number"
                            className="form-control"
                            placeholder="Number"
                            value={newFreezer.number}
                            onChange={onChange}
                        />
                    </div>
                    <div className="col">
                        <input
                            name="room"
                            className="form-control"
                            placeholder="Room"
                            value={newFreezer.room}
                            onChange={onChange}
                        />
                    </div>
                    <div className="col">
                        <input
                            name="address"
                            className="form-control"
                            placeholder="Address"
                            value={newFreezer.address}
                            onChange={onChange}
                        />
                    </div>
                    <div className="col">
                        <input
                            name="type"
                            className="form-control"
                            placeholder="Type"
                            value={newFreezer.type}
                            onChange={onChange}
                        />
                    </div>
                    <div className="col-auto">
                        <button
                            className="btn btn-sm"
                            style={{
                                backgroundColor: "#5D8736",
                                color: "white",
                                border: "none",
                                padding: "6px 16px",
                                fontSize: "14px",
                                borderRadius: "5px",
                                height: "38px",
                            }}
                            onClick={onAdd}
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFreezerForm;





