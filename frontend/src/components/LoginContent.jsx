import React, {useState} from "react";
import axios from "axios"; // Import axios to make API requests


const LoginContent = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: ""
    });

    const [message, setMessage] = useState("");
    const [isChecking, setIsChecking] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email) {
            setMessage("❌ Please fill in all fields.");
            return;
        }

        try {
            setIsChecking(true);
            const response = await axios.get("http://localhost:8000/api/auth/check-user", {
                params: {
                    name: formData.fullName,
                    email: formData.email
                },
                withCredentials: true
            });

            if (response.data === true) {
                // ✅ Set session email on backend
                await axios.post(
                    "http://localhost:8000/api/auth/set-preauth-email",
                    {email: formData.email},
                    {withCredentials: true}
                );

                setIsAuthorized(true);
                setMessage("✅ You are authorized! Please continue with Google Login.");
            } else {
                setIsAuthorized(false);
                setMessage("❌ Name and email do not match our records. Please contact administration.");
            }
        } catch (error) {
            console.error("Error checking user:", error);
            setMessage("❌ An error occurred. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };


    const handleLogin = () => {
        window.location.href = "http://localhost:8000/oauth2/authorization/google";
    };


    return (
        <div className="container d-flex justify-content-center mt-5">
            <div className="col-md-6">
                <div className="max-w-xl mx-auto bg-gray-50 p-6 rounded-xl shadow-md space-y-3">
                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">🔒 </span>
                            <strong>Authorization verification:</strong> You must be authorized to use this application.
                            Please fill in your details below.
                        </p>
                    </div>

                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">✅ </span>
                            If <strong>authorized</strong>, you can log in using one of the methods available.
                        </p>
                    </div>

                    <div className="flex items-start gap-2">
                        <p><span className="pt-1">❌ </span>
                            If <strong>not authorized</strong>, please contact the administrator for assistance.
                        </p>
                    </div>
                </div>

                {/* Form for user authorization */}
                <form className="row g-3" onSubmit={handleSubmit}>
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


                    <div className="col-12 text-center mt-3">
                        <button
                            type="submit"
                            className="btn btn-lg"
                            style={{backgroundColor: "#5D8736", borderColor: "#5D8736", color: "white"}}
                            disabled={isChecking}
                        >
                            {isChecking ? "Checking..." : "Verify authorization"}
                        </button>
                    </div>
                </form>

                {/* Message */}
                {message && (
                    <div className="alert my-3 my-sm-4 p-1 p-sm-3 text-center"
                         style={{
                             backgroundColor: isAuthorized ? "#D4EDDA" : "#F8D7DA",
                             color: isAuthorized ? "#155724" : "#721C24",
                             borderRadius: "5px"
                         }}>
                        {message}
                    </div>
                )}

                {/* Google Login Button (shown only if authorized) */}
                {isAuthorized && (
                    <div className="text-center mt-4">
                        <button
                            onClick={handleLogin}
                            data-testid="google-login-btn"
                            className="google-btn"
                        >

                            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3">
                                <path fill="#4285f4"
                                      d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.4h147.1c-6.4 34.7-25.5 64-54.5 83.4v68h88.2c51.7-47.6 80.7-117.8 80.7-196.4z"/>
                                <path fill="#34a853"
                                      d="M272 544.3c73.8 0 135.6-24.5 180.8-66.6l-88.2-68c-24.5 16.4-55.8 26-92.6 26-71.3 0-131.7-48-153.4-112.7h-90.4v70.7c45.1 89.2 137.5 150.6 243.8 150.6z"/>
                                <path fill="#fbbc04"
                                      d="M118.6 322.9c-10.3-30.7-10.3-63.7 0-94.4v-70.7H28.3c-42.7 84.5-42.7 184.9 0 269.3l90.3-70.7z"/>
                                <path fill="#ea4335"
                                      d="M272 214.3c39.9 0 75.8 13.8 104.2 40.9l78-78C415.6 127 353.8 96.2 272 96.2c-106.3 0-198.7 61.4-243.8 150.6l90.4 70.7c21.7-64.7 82.1-112.7 153.4-112.7z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginContent;