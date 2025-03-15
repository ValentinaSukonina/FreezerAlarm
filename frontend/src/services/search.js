import axios from "axios";

export const fetchFreezerWithUsers = async (number) => {
    try {
        const response = await axios.get(`/api/freezers/number/${number}/with-users`);
        return response.data;
    } catch (error) {
        console.error("Error fetching freezer:", error);
        throw error;
    }
};