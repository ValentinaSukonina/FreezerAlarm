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

// Fetch a single freezer with users
export const fetchFreezerWithUsers = async (freezerNumber) => {
    try {
        const response = await API.get(`/freezers/${freezerNumber}/with-users`); // ✅ Adjust to match backend
        return response.data;
    } catch (error) {
        console.error("Error fetching freezer:", error.response ? error.response.data : error.message);
        throw new Error("Freezer not found");
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

// // Fetch all freezers
// export const fetchAllFreezers = async () => {
//     try {
//         console.log("Fetching all freezers...");
//         const response = await API.get(`/freezers`);
//         console.log("All freezers fetched successfully:", response.data);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching freezers:", error.response ? error.response.data : error.message);
//         throw new Error("Could not fetch freezers");
//     }


// export const fetchFreezer = async (freezerNumber) => {
//     try {
//         const response = await API.get(`/freezers/number/${freezerNumber}`);
//         console.log("Freezer fetched successfully:", response.data);
//         return response.data;
//     } catch (error) {
//         if (error.response) {
//             // Server responded but with an error (e.g., 404 Not Found)
//             console.error("Error fetching freezer:", error.response.data);
//             if (error.response.status === 404) {
//                 throw new Error("Freezer not found");
//             } else {
//                 throw new Error(`Error: ${error.response.data.message || "Something went wrong"}`);
//             }
//         } else if (error.request) {
//             // Request was made but no response (server down, network issue)
//             console.error("No response received:", error.request);
//             throw new Error("Server is unreachable. Please try again later.");
//         } else {
//             // Other errors (e.g., config issues)
//             console.error("Unexpected error:", error.message);
//             throw new Error("Unexpected error occurred.");
//         }
//     }
};






