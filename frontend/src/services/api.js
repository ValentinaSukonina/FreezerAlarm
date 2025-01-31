import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080', // Replace with your backend URL
});

export const fetchFreezers = async () => {
    const response = await API.get('/freezers'); // Replace with your endpoint
    return response.data;
};


