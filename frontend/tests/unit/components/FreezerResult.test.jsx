import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FreezerResult from "../../../src/components/FreezerResult";
import * as api from "../../../src/services/api";

// Mocks to capture callbacks
const mockUpdateHandler = vi.fn();
const mockDeleteHandler = vi.fn();

// Mock child components
vi.mock("../../../src/components/FreezerCardAdmin", () => ({
    default: ({ freezer, onFreezerUpdated, onFreezerDeleted, onMessage }) => {
        // Expose callbacks to be manually triggered in tests
        mockUpdateHandler.mockImplementation(() => {
            onFreezerUpdated?.({
                number: "1234",
                room: "Updated Room",
                address: "Updated Address",
                type: "-80C",
                users: [],
            });
        });

        mockDeleteHandler.mockImplementation(() => {
            onFreezerDeleted?.();
        });

        return <div>Admin Card {freezer.number}</div>;
    },
}));

vi.mock("../../../src/components/FreezerCardUser", () => ({
    default: ({ freezer }) => <div>User Card {freezer.number}</div>,
}));

// Mock API
vi.mock("../../../src/services/api", async () => {
    return {
        fetchFreezerWithUsers: vi.fn(),
    };
});

describe("FreezerResult", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
    });

    test("displays loading state initially", () => {
        render(<FreezerResult freezerNumber="1234" />, { wrapper: MemoryRouter });
        expect(screen.getByText(/loading freezer data/i)).toBeInTheDocument();
    });

    test("displays error if freezer is not found", async () => {
        api.fetchFreezerWithUsers.mockRejectedValueOnce(new Error("Not found"));

        render(<FreezerResult freezerNumber="1234" />, { wrapper: MemoryRouter });

        await waitFor(() =>
            expect(screen.getByText(/no freezer found/i)).toBeInTheDocument()
        );
    });

    test("renders FreezerCardAdmin for admin role", async () => {
        sessionStorage.setItem("role", "admin");

        api.fetchFreezerWithUsers.mockResolvedValueOnce({
            number: "1234",
            room: "Lab",
            address: "A1",
            type: "-80C",
            users: [],
        });

        render(<FreezerResult freezerNumber="1234" />, { wrapper: MemoryRouter });

        await waitFor(() => screen.getByText(/admin card 1234/i));
    });

    test("renders FreezerCardUser for user role", async () => {
        sessionStorage.setItem("role", "user");

        api.fetchFreezerWithUsers.mockResolvedValueOnce({
            number: "5678",
            room: "Cold",
            address: "B2",
            type: "-20C",
            users: [],
        });

        render(<FreezerResult freezerNumber="5678" />, { wrapper: MemoryRouter });

        await waitFor(() => screen.getByText(/user card 5678/i));
    });

    test("displays success message after freezer update", async () => {
        sessionStorage.setItem("role", "admin");

        api.fetchFreezerWithUsers.mockResolvedValueOnce({
            number: "1234",
            room: "Initial Room",
            address: "Initial Address",
            type: "-80C",
            users: [],
        });

        render(<FreezerResult freezerNumber="1234" />, { wrapper: MemoryRouter });

        // Wait for Admin card to render
        await waitFor(() => screen.getByText(/admin card 1234/i));

        // Trigger the update via the mocked callback
        mockUpdateHandler();

        // Wait for success message to appear
        await waitFor(() =>
            expect(screen.getByText(/updated successfully/i)).toBeInTheDocument()
        );
    });
});


