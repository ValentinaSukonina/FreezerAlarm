import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // 🔥
});


export const fetchFreezers = async () => {
    try {
        const response = await API.get('/api/freezers');
        return response.data;
    } catch (error) {
        console.error('Error fetching freezers:', error);
        throw error;
    }
};


