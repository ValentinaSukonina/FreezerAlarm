import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true
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

// Create a new user
export const createUser = async (userData) => {
    try {
        const response = await API.post('/users', userData);
        console.log("User created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error.response ? error.response.data : error.message);
        throw error;  // Handle error appropriately in your frontend
    }
};

// Update an existing user
export const updateUser = async (id, updatedData) => {
    try {
        const response = await API.put(`/users/${id}`, updatedData);
        console.log("User updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error.response ? error.response.data : error.message);
        throw error;  // Handle error appropriately in your frontend
    }
};

// Delete a user
export const deleteUser = async (id) => {
    try {
        await API.delete(`/users/${id}`);
        console.log("User deleted successfully.");
    } catch (error) {
        console.error("Error deleting user:", error.response ? error.response.data : error.message);
        throw error;  // Handle error appropriately in your frontend
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

// Fetch the authenticated user's role
export const fetchUserRole = async () => {
    try {
        const response = await API.get('/users/user'); // this hits your /api/users/user endpoint
        return response.data?.role || null;
    } catch (error) {
        console.error("Failed to fetch user role:", error.response ? error.response.data : error.message);
        return null;
    }
};

export const updateFreezer = async (id, updatedData) => {
    const response = await API.put(`/freezers/${id}`, updatedData);
    return response.data;
};

export const deleteFreezer = async (id) => {
    await API.delete(`/freezers/${id}`);
};

export const createFreezer = async (freezerData) => {
    const response = await API.post('/freezers/with-users', {
        ...freezerData,
        users: freezerData.userIds.map(id => ({id}))
    });
    return response.data;
};