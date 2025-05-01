import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock('axios', () => {
    const axiosMock = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    };
    return {
        default: {
            create: vi.fn(() => axiosMock),
            ...axiosMock,
        },
    };
});

import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchFreezerWithUsers,
} from "../../../src/services/api";
import axios from "axios";

describe('API functions', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('fetchUsers should return list of users', async () => {
        axios.get.mockResolvedValue({
            data: [{ id: 1, name: "Test User" }]
        });

        const users = await fetchUsers();
        expect(users).toEqual([{ id: 1, name: "Test User" }]);
    });

    test('createUser should send POST request and return user', async () => {
        const mockUser = { name: "New User", email: "newuser@example.com" };
        const mockResponse = { id: 1, ...mockUser };

        axios.post.mockResolvedValue({
            data: mockResponse
        });

        const result = await createUser(mockUser);
        expect(axios.post).toHaveBeenCalledWith('/users', mockUser);
        expect(result).toEqual(mockResponse);
    });

    test('updateUser should send PUT request and return updated user', async () => {
        const userId = 1;
        const updatedData = { name: "Updated User" };
        const mockResponse = { id: 1, ...updatedData };

        axios.put.mockResolvedValue({
            data: mockResponse
        });

        const result = await updateUser(userId, updatedData);
        expect(axios.put).toHaveBeenCalledWith(`/users/${userId}`, updatedData);
        expect(result).toEqual(mockResponse);
    });

    test('deleteUser should send DELETE request', async () => {
        const userId = 1;

        axios.delete.mockResolvedValue({});

        await deleteUser(userId);
        expect(axios.delete).toHaveBeenCalledWith(`/users/${userId}`);
    });

    test('fetchFreezerWithUsers should return freezer data on success', async () => {
        const freezerNumber = 1234;
        const freezerData = { id: 1, number: freezerNumber, users: [] };

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve(freezerData),
            })
        ));

        const result = await fetchFreezerWithUsers(freezerNumber);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        expect(fetch).toHaveBeenCalledWith(
            `http://localhost:8000/api/freezers/number/${freezerNumber}/with-users`,
            expect.objectContaining({
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
        );
        expect(result).toEqual(freezerData);
    });
});