import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true // testa detta
});

export const fetchUsers = async () => {
    try {
        const response = await API.get('/users');
        console.log("Users fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error.response ? error.response.data : error.message);
        return [];
    }
};

export async function fetchFreezerWithUsers(freezerNumber) {
    try {
        const response = await fetch(`http://localhost:8000/api/freezers/number/${freezerNumber}/with-users`, {
            method: "GET",
            credentials: "include", // Ensure cookies/tokens are sent
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) { // Unauthorized, needs login
            alert("You must be logged in to view this content.");
            window.location.href = "http://localhost:8000/oauth2/authorization/google"; // Redirect manually
            return;
        }

        if (!response.ok) {
            throw new Error(`Error fetching freezer: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching freezer:", error);
        throw error;
    }
}

// Fetch all freezers with users
export const fetchAllFreezersWithUsers = async () => {
    try {
        const response = await API.get(`/freezers`);
        return response.data;
    } catch (error) {
        console.error("Error fetching freezers:", error.response ? error.response.data : error.message);
        throw new Error("Could not fetch freezers");
    }

};