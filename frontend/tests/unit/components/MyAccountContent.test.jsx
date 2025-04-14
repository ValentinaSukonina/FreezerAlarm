import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import MyAccount from "../../../src/components/MyAccountContent";
import * as api from "../../../src/services/api";

vi.mock("../../../src/services/api", async () => ({
    fetchUserByName: vi.fn(),
    fetchAllFreezersWithUsers: vi.fn(),
    updateUser: vi.fn(),
}));

beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem("username", "testuser");
});

describe("MyAccountContent", () => {
    test("renders user data after loading", async () => {
        const mockUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            phone_number: "12345678",
            role: "user",
            user_rank: "researcher",
        };

        const mockFreezers = [
            { id: 1, number: "F101", room: "Room A", users: [{ name: "Test User" }] },
        ];

        api.fetchUserByName.mockResolvedValueOnce(mockUser);
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce(mockFreezers);

        render(<MyAccount />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
            expect(screen.getByText(/F101/i)).toBeInTheDocument();
        });
    });

    test("shows error if user is not found", async () => {
        api.fetchUserByName.mockResolvedValueOnce(null);
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([]);

        render(<MyAccount />);

        await waitFor(() => {
            expect(screen.getByText(/user not found/i)).toBeInTheDocument();
        });
    });

    test("allows phone number to be updated", async () => {
        const mockUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            phone_number: "12345678",
            role: "user",
            user_rank: "researcher",
        };

        const mockFreezers = [
            { id: 1, number: "F101", room: "Room A", users: [{ name: "Test User" }] },
        ];

        // Mock API calls
        api.fetchUserByName.mockResolvedValueOnce(mockUser);
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce(mockFreezers);

        // Mock the updateUser function to resolve
        api.updateUser.mockResolvedValueOnce({});

        render(<MyAccount />);

        await waitFor(() => {
            expect(screen.getByDisplayValue("12345678")).toBeInTheDocument();
        });

        // Change the phone number and click save
        fireEvent.change(screen.getByLabelText(/phone number/i), {
            target: { value: "87654321" },
        });

        fireEvent.click(screen.getByText(/save changes/i));

        // Verify the success message is shown
        await waitFor(() => {
            expect(screen.getByText(/phone number updated successfully/i)).toBeInTheDocument();
        });

        // Ensure updateUser was called with the correct parameters
        expect(api.updateUser).toHaveBeenCalledWith(
            1,
            expect.objectContaining({ phone_number: "87654321" })
        );
    });

    test("handles update error", async () => {
        const mockUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            phone_number: "12345678",
            role: "user",
            user_rank: "researcher",
        };

        const mockFreezers = [];

        // Mock the fetch data
        api.fetchUserByName.mockResolvedValueOnce(mockUser);
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce(mockFreezers);

        // Mock the rejection of updateUser API call
        api.updateUser.mockRejectedValueOnce(new Error("Update failed"));

        render(<MyAccount />);

        // Wait for user data to be displayed
        await waitFor(() => {
            expect(screen.getByDisplayValue("12345678")).toBeInTheDocument();
        });

        // Simulate changing the phone number value
        fireEvent.change(screen.getByLabelText(/phone number/i), {
            target: { value: "99999999" },
        });

        // Simulate clicking the save button
        fireEvent.click(screen.getByText(/save changes/i));

        // Wait for error message to appear
        await waitFor(() => {
            expect(screen.getByText(/failed to save changes/i)).toBeInTheDocument();
        });
    });
});



