// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userRole = sessionStorage.getItem("role");

    if (!isLoggedIn) {
        return <Navigate to="/unauthorized" />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;
