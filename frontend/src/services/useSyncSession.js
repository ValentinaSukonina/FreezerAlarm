import {useEffect, useState} from "react";
import axios from "axios";

export const useSyncSession = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncSession = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/auth/session-user", {
                    withCredentials: true,
                });

                const data = res.data;

                if (data.isLoggedIn === "true") {
                    sessionStorage.setItem("isLoggedIn", "true");
                    sessionStorage.setItem("username", data.username || "");
                    sessionStorage.setItem("role", data.role || "");
                    sessionStorage.setItem("email", data.email || "");
                } else {
                    sessionStorage.clear();
                }
            } catch (err) {
                console.error("Session fetch failed", err);
                sessionStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        syncSession();
    }, []);

    return loading;
};
export default useSyncSession;