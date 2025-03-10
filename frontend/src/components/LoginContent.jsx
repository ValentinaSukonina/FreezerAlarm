import React, { useState } from "react";
import axios from "axios"; // Import axios to make API requests

const LoginContent = () => {
    // store user input
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: ""
    });

    const [submittedData, setSubmittedData] = useState(null); // Stores submitted data
    const [message, setMessage] = useState(""); // Stores success/error message
    const [isChecking, setIsChecking] = useState(false); // Loading state

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents page refresh

        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            setMessage("❌ Please fill in all fields."); // Error message for empty fields
            return;
        }

        try {
            setIsChecking(true); // Show loading state

            // Make API request to check if the user exists
            const response = await axios.post("http://localhost:8000/api/users/check-user", { name: formData.fullName });


            if (response.data.exists) {
                // If user exists, proceed with account creation
                setSubmittedData(formData); // Save the submitted data
                setMessage("✅ User Created Successfully!"); // Show success message

                // Reset form fields after submission
                setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: ""
                });
            } else {
                // If user does NOT exist, show error message
                setMessage("❌ Please contact administration.");
                setSubmittedData(null); // Prevents account from being created
                setFormData({
                    fullName: "",
                    email: "",
                    phoneNumber: ""
                });
            }
        } catch (error) {
            console.error("Error checking user:", error);
            setMessage("❌ An error occurred. Please try again.");
        } finally {
            setIsChecking(false); // Hide loading state
        }
    };

    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="col-md-6">
                <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-xl shadow-md space-y-3">

                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">🔒 </span>
                            <strong>Authorization verification:</strong> You must be authorized to use this application.
                            Please fill in your detail below.</p>
                    </div>

                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">✅ </span>
                            If <strong>authorized</strong>, you can log in using one of the methods available.</p>
                    </div>

                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">❌ </span>
                            If <strong>not authorized</strong>, please contact the administrator for assistance.</p>
                    </div>
                </div>


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
                            required
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
                            required
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
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-3">
                        <button
                            type="submit"
                            className="btn btn-lg"
                            style={{backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white"}}
                            disabled={isChecking} // Disable button while checking
                        >
                            {isChecking ? "Checking..." : "Verify authorization"}
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

                {/* Display Submitted Data Only After Successful Signup */}
                {submittedData && (
                    <div className="mt-4 p-3 border rounded text-center"
                         style={{backgroundColor: "#F4FFC3", color: "#5D8736"}}>
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

export default LoginContent;







