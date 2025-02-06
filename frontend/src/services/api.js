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




