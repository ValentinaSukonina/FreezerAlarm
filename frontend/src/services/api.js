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

export const fetchFreezersWithUsers = async () => {
    try {
        const response = await API.get('/freezers/with-users');
        console.log("Freezers fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error.response ? error.response.data : error.message);
        return [];
    }
};

export const fetchAllFreezers = async () => {
    try {
        const response = await API.get('/freezers');
        console.log("Freezers fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error.response ? error.response.data : error.message);
        return [];
    }
};




