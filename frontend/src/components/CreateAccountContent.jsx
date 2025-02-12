import React, { useState } from "react";

const CreateAccountContent = () => {
    // State to store user input
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: ""
    });

    const [submittedData, setSubmittedData] = useState(null); // Stores submitted data
    const [message, setMessage] = useState(""); // Stores success message

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents page refresh

        if (formData.fullName && formData.email && formData.phoneNumber) {
            setSubmittedData(formData); // Save the submitted data
            setMessage("✅ User Created Successfully!"); // Show success message

            // Reset form fields after submission
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: ""
            });
        } else {
            setMessage("❌ Please fill in all fields."); // Error message for empty fields
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="col-md-6">
                <h2 className="text-center mb-4">Create Account</h2>

                <form className="row g-3" onSubmit={handleSubmit}>
                    {/* Full Name Field */}
                    <div className="col-12">
                        <label htmlFor="inputName" className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="inputName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email Field */}
                    <div className="col-12">
                        <label htmlFor="inputEmail" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="inputEmail"
                            name="email"
                            placeholder="example@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Phone Number Field */}
                    <div className="col-12">
                        <label htmlFor="inputPhone" className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="inputPhone"
                            name="phoneNumber"
                            placeholder="+46 123 456 789"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-3">
                        <button
                            type="submit"
                            className="btn btn-lg"
                            style={{ backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white" }}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* Success/Error Message */}
                {message && (
                    <div className="alert mt-4 text-center"
                         style={{
                             backgroundColor: submittedData ? "#D4EDDA" : "#F8D7DA",
                             color: submittedData ? "#155724" : "#721C24",
                             padding: "10px",
                             borderRadius: "5px"
                         }}>
                        {message}
                    </div>
                )}

                {/* Display Submitted Data Only After Button Click */}
                {submittedData && (
                    <div className="mt-4 p-3 border rounded text-center" style={{ backgroundColor: "#F4FFC3", color: "#5D8736" }}>
                        <h5>User Information</h5>
                        <p><strong>Full Name:</strong> {submittedData.fullName}</p>
                        <p><strong>Email:</strong> {submittedData.email}</p>
                        <p><strong>Phone Number:</strong> {submittedData.phoneNumber}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateAccountContent;






