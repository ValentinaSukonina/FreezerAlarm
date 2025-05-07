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

        if (response.status === 401) {
            alert("You must be logged in to view this content.");
            window.location.href = "http://localhost:8000/oauth2/authorization/google";
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
        const response = await API.get('/users/user');
        return response.data?.role || null;
    } catch (error) {
        console.error("Failed to fetch user role:", error.response ? error.response.data : error.message);
        return null;
    }
};

export const updateFreezerWithUsers = async (id, updatedData, userIds) => {
    const response = await API.put(`/freezers/${id}/with-users`, {
        id,
        number: updatedData.number,
        address: updatedData.address,
        room: updatedData.room,
        type: updatedData.type,
        file: updatedData.file,
        userIds: userIds
    });

    console.log("🔁 Combined update response:", response.data);
    return response.data;
};

export const deleteFreezer = async (id) => {
    await API.delete(`/freezers/${id}`);
};

export const createFreezer = async (freezerData) => {
    const payload = {
        ...freezerData,
        users: freezerData.userIds.map(id => ({id}))
    };

    console.log("📦 Payload being sent to backend:", payload);

    try {
        const response = await API.post('/freezers/with-users', payload);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("❌ Backend error:", error.response.data);

            // Re-throw with backend message to be handled in the component
            throw new Error(error.response.data.message || "Failed to create freezer.");
        } else {
            console.error("❌ Network or unexpected error:", error.message);
            throw new Error("Something went wrong while creating the freezer.");
        }
    }
};

export async function fetchUserByName(username) {
    const response = await fetch(`http://localhost:8000/api/users/by-name/${username}`, {
        credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return await response.json();
}

export const fetchFreezersByUser = async (userId) => {
    try {
        const response = await API.get(`/users/${userId}/freezers`);
        console.log("Freezers fetched for user:", userId, response.data);
        return response.data; // Return the freezers list assigned to this user
    } catch (error) {
        console.error("Error fetching freezers by user:", error.response ? error.response.data : error.message);
        throw error; // Rethrow the error to be handled by the calling component
    }
};

// Delete a freezer from a user
export const deleteFreezerFromUser = async (userId, freezerId) => {
    try {
        await API.delete(`/freezer-user/users/${userId}/freezers/${freezerId}`);
        console.log("Freezer successfully deleted from user");
    } catch (error) {
        console.error("Error deleting freezer from user:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export async function sendEmail(payload) {
    const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const message = await response.text();

    return {
        ok: response.ok,
        status: response.status,
        message: message,
    };
}