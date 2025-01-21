import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080', // Replace with your backend URL
});

export const fetchFreezers = async () => {
    try {
        const response = await API.get('/freezers'); // Replace with the actual endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching freezers:', error);
        throw error;
    }
};
