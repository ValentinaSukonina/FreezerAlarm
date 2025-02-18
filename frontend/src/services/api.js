import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api', // Ensure base URL is correct
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

export const fetchFreezerWithUsers = async (freezerNumber) => {
    try {
        const response = await API.get(`/freezers/number/${freezerNumber}/with-users`);
        return response.data;
    } catch (error) {
        // Optionally, extract a more detailed message from the backend response:
        const errMsg = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : "Freezer not found";
        console.error("Error fetching freezer:", errMsg);
        throw new Error(errMsg);
    }
};

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