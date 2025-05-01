import { vi } from "vitest";
import * as api from "../../../src/services/api";
import axios from "axios";

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

beforeEach(() => {
    vi.clearAllMocks();
    // Suppress all console.error and console.log output to keep test logs clean
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

});

import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchFreezerWithUsers,
    fetchAllFreezersWithUsers,
    fetchUserRole,
    updateFreezerWithUsers,
    deleteFreezer,
    fetchUserByName,
    fetchFreezersByUser,
    deleteFreezerFromUser,
    createFreezer,
    sendEmail
} from "../../../src/services/api";
import axios from "axios";

describe('API functions', () => {

    test('fetchUsers returns list of users', async () => {
        axios.get.mockResolvedValue({
            data: [{ id: 1, name: "Test User" }]
        });

        const users = await fetchUsers();
        expect(users).toEqual([{ id: 1, name: "Test User" }]);
    });

    test('fetchUsers returns empty array on error', async () => {
        const error = new Error("Network error");
        error.response = { data: "Request failed" };

        axios.get.mockRejectedValueOnce(error);

        const users = await fetchUsers();
        expect(users).toEqual([]); // should return fallback value
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

    test('createUser throws and logs error on failure', async () => {
        const mockError = new Error("User already exists");

        axios.post.mockRejectedValueOnce(mockError);

        await expect(createUser({ name: "New User" })).rejects.toThrow("User already exists");
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

    test("updateUser throws and logs error on failure", async () => {
        const error = new Error("Request failed");
        error.response = { data: "User already exists" };

        axios.put.mockRejectedValueOnce(error);

        await expect(updateUser(1, { name: "Existing User" }))
            .rejects.toThrow("Request failed");

        expect(axios.put).toHaveBeenCalledWith("/users/1", { name: "Existing User" });
    });

    test('deleteUser should send DELETE request', async () => {
        const userId = 1;

        axios.delete.mockResolvedValue({});

        await deleteUser(userId);
        expect(axios.delete).toHaveBeenCalledWith(`/users/${userId}`);
    });

    test("deleteUser throws and logs error on failure", async () => {
        const error = new Error("Request failed");
        error.response = { data: "User not found" };

        axios.delete.mockRejectedValueOnce(error);

        await expect(deleteUser(1)).rejects.toThrow("Request failed");

        expect(axios.delete).toHaveBeenCalledWith("/users/1");
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

    test("fetchAllFreezersWithUsers returns array of freezers", async () => {
        const mockFreezers = [{ id: 1, number: "F100" }];
        axios.get.mockResolvedValueOnce({ data: mockFreezers });

        const result = await fetchAllFreezersWithUsers();
        expect(result).toEqual(mockFreezers);
    });

    test("fetchUserRole returns role on success", async () => {
        axios.get.mockResolvedValueOnce({ data: { role: "admin" } });

        const result = await fetchUserRole();
        expect(result).toBe("admin");
        expect(axios.get).toHaveBeenCalledWith("/users/user");
    });

    test("fetchUserRole returns null on missing role", async () => {
        axios.get.mockResolvedValueOnce({ data: {} });

        const result = await fetchUserRole();
        expect(result).toBeNull();
    });

    test("fetchUserRole returns null and logs on error", async () => {
        const error = new Error("Unauthorized");
        error.response = { data: "Not logged in" };

        axios.get.mockRejectedValueOnce(error);

        const result = await fetchUserRole();
        expect(result).toBeNull();
    });

    test("updateFreezerWithUsers sends correct PUT request and returns data", async () => {
        const id = 42;
        const updatedData = {
            number: "F123",
            address: "A1",
            room: "Lab B",
            type: "Ultra-low",
            file: "manual.pdf"
        };
        const userIds = [1, 2];

        const expectedPayload = {
            id,
            number: "F123",
            address: "A1",
            room: "Lab B",
            type: "Ultra-low",
            file: "manual.pdf",
            userIds: [1, 2]
        };

        const mockResponse = { id: 42, status: "updated" };
        axios.put.mockResolvedValueOnce({ data: mockResponse });

        const result = await updateFreezerWithUsers(id, updatedData, userIds);

        expect(axios.put).toHaveBeenCalledWith(`/freezers/42/with-users`, expectedPayload);
        expect(result).toEqual(mockResponse);
    });

    test("deleteFreezer sends DELETE request to correct endpoint", async () => {
        axios.delete.mockResolvedValueOnce({});

        await expect(deleteFreezer(123)).resolves.toBeUndefined();
        expect(axios.delete).toHaveBeenCalledWith("/freezers/123");
    });



    test("fetchUserByName returns null on failed fetch", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
                text: () => Promise.resolve("User not found"),
            })
        );

        await expect(fetchUserByName("missinguser")).rejects.toThrow("Failed to fetch user");
    });



    test("fetchFreezersByUser returns list of freezers for a user", async () => {
        const mockFreezers = [{ id: 1, number: "F101" }];
        axios.get.mockResolvedValueOnce({ data: mockFreezers });

        const result = await fetchFreezersByUser(123);
        expect(result).toEqual(mockFreezers);
        expect(axios.get).toHaveBeenCalledWith("/users/123/freezers");
    });

    test("fetchFreezersByUser throws error on failure", async () => {
        const error = new Error("Network error");
        axios.get.mockRejectedValueOnce(error);

        await expect(fetchFreezersByUser(123)).rejects.toThrow("Network error");
    });

    test("deleteFreezerFromUser should send DELETE request", async () => {
        axios.delete.mockResolvedValue({});

        await expect(api.deleteFreezerFromUser(1, 4)).resolves.toBeUndefined();

        expect(axios.delete).toHaveBeenCalledWith("/freezer-user/users/1/freezers/4");
    });

    test("createFreezer sends correct payload and returns response", async () => {
        const freezerData = {
            number: "F200",
            room: "Lab A",
            type: "Ultra-low",
            address: "B1",
            userIds: [1, 2],
        };

        const expectedPayload = {
            ...freezerData,
            users: [{ id: 1 }, { id: 2 }],
        };

        const mockResponse = { id: 100, ...expectedPayload };
        axios.post.mockResolvedValueOnce({ data: mockResponse });

        const result = await createFreezer(freezerData);

        expect(axios.post).toHaveBeenCalledWith('/freezers/with-users', expectedPayload);
        expect(result).toEqual(mockResponse);
    });

    test("createFreezer throws with backend error message", async () => {
        axios.post.mockRejectedValueOnce({
            response: {
                data: { message: "Validation failed: room is required" }
            }
        });

        await expect(createFreezer({ userIds: [] })).rejects.toThrow("Validation failed: room is required");
    });

    test("createFreezer throws with generic network error", async () => {
        axios.post.mockRejectedValueOnce(new Error("Network unreachable"));

        await expect(createFreezer({ userIds: [] })).rejects.toThrow("Something went wrong while creating the freezer.");
    });





    describe("sendEmail", () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });

        test("sends POST request and returns success text", async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve("Email sent successfully"),
                })
            );

            const data = { to: "user@example.com", subject: "Test", body: "Hello" };
            const result = await sendEmail(data);

            expect(fetch).toHaveBeenCalledWith("http://localhost:8000/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            expect(result).toBe("Email sent successfully");
        });

        test("throws error when response is not ok", async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    text: () => Promise.resolve("Server error"),
                })
            );

            const data = { to: "fail@example.com", subject: "Error", body: "Broken" };

            await expect(sendEmail(data)).rejects.toThrow("Server error");
        });

        test("throws generic error if no error message is returned", async () => {
            global.fetch = vi.fn(() =>
                Promise.resolve({
                    ok: false,
                    text: () => Promise.resolve(""),
                })
            );

            const data = { to: "fail@example.com", subject: "Error", body: "No message" };

            await expect(sendEmail(data)).rejects.toThrow("Email send failed");
        });
    });
});