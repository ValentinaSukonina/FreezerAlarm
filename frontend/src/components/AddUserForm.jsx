import React from "react";

const AddUserForm = ({newUser, onChange, onAddUser, onCancel}) => {
    const fields = [
        {name: "name", placeholder: "Name"},
        {name: "email", placeholder: "Email"},
        {name: "phone_number", placeholder: "Phone"},
        {name: "user_rank", placeholder: "Rank"},
        {name: "role", placeholder: "Role"},
    ];

    return (
        <div className="mb-4 mt-3 border p-3 rounded" style={{backgroundColor: "#f8fff0"}}>
            <h5 className="mb-3">Add New User</h5>
            <div className="row g-2">
                {fields.map((field) => (
                    <div className="col-12 col-md" key={field.name}>
                        <input
                            name={field.name}
                            className="form-control"
                            placeholder={field.placeholder}
                            value={newUser[field.name]}
                            onChange={onChange}
                        />
                    </div>
                ))}
                <div className="col-12 col-md-auto d-flex align-items-center gap-2 mt-2 mt-md-0">
                    <button
                        className="btn btn-sm w-100"
                        style={{
                            backgroundColor: "#5D8736",
                            color: "white",
                            border: "none",
                            padding: "6px 16px",
                            fontSize: "14px",
                            borderRadius: "5px",
                            height: "38px",
                        }}
                        onClick={onAddUser}
                    >
                        Add
                    </button>
                    {/* Cancel button only shown if onCancel prop exists (i.e., on small screens) */}
                    {onCancel && (
                        <button
                            className="btn btn-sm btn-secondary w-100"
                            style={{
                                padding: "6px 16px",
                                fontSize: "14px",
                                borderRadius: "5px",
                                height: "38px",
                            }}
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddUserForm;

