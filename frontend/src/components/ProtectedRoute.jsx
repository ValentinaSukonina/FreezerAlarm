// components/ProtectedRoute.jsx
import {Navigate} from "react-router-dom";
import {useSyncSession} from "../services/useSyncSession";

const ProtectedRoute = ({children, requiredRole}) => {
    const loading = useSyncSession(); // wait for session sync

    if (loading) {
        return <div className="text-center mt-5">🔄 Loading session...</div>;
    }
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const userRole = sessionStorage.getItem("role");

    if (!isLoggedIn) {
        return <Navigate to="/unauthorized"/>;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized"/>;
    }

    return children;
};

export default ProtectedRoute;
