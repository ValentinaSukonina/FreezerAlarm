import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PersonalContent from "../../../src/components/PersonalContent";
import * as api from "../../../src/services/api";

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
    value: {
        getItem: vi.fn(() => "admin"),
        setItem: vi.fn(),
    },
});

// Mock the full API module
vi.mock("../../../src/services/api", () => ({
    fetchUsers: vi.fn(),
    fetchFreezersByUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    deleteFreezerFromUser: vi.fn(),
}));

describe("PersonalContent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders loading message initially", async () => {
        api.fetchUsers.mockResolvedValue([]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        expect(screen.getByText(/Loading users/i)).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText(/Loading users/i)).not.toBeInTheDocument());
    });

    test("renders message when no users are found", async () => {
        api.fetchUsers.mockResolvedValue([]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        await waitFor(() => {
            expect(screen.getByText(/No users found/i)).toBeInTheDocument();
        });
    });

    test("displays user info after fetching", async () => {
        const mockUser = {
            id: 1,
            name: "Test User",
            email: "test@example.com",
            phone_number: "1234",
            user_rank: "A",
            role: "admin",
            freezers: [],
        };

        api.fetchUsers.mockResolvedValue([mockUser]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        await screen.findByText("Test User");
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    test("can add a new user and show success message", async () => {
        api.fetchUsers.mockResolvedValue([]);
        api.fetchFreezersByUser.mockResolvedValue([]);
        api.createUser.mockResolvedValue({
            id: 99,
            name: "New Guy",
            email: "new@example.com",
            role: "user",
        });

        render(<PersonalContent />);

        fireEvent.click(screen.getByText("Add New User"));

        fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "New Guy" } });
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "new@example.com" } });

        // For role dropdown, simulate react-select change
        const selectInput = screen.getByText("Select role");
        fireEvent.keyDown(selectInput, { key: "ArrowDown" });
        fireEvent.click(screen.getByText("user"));

        fireEvent.click(screen.getByText("Add"));

        await waitFor(() => {
            expect(screen.getByText("✅ New user created successfully!")).toBeInTheDocument();
        });
    });

    test("can trigger and cancel delete confirmation", async () => {
        const mockUser = {
            id: 1,
            name: "Delete Me",
            email: "del@example.com",
            phone_number: "",
            user_rank: "",
            role: "user",
            freezers: [],
        };

        api.fetchUsers.mockResolvedValue([mockUser]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        await screen.findByText("Delete Me");

        fireEvent.click(screen.getByText("Delete"));

        expect(screen.getByText(/Are you sure you want to delete this user/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() =>
            expect(screen.queryByText(/Are you sure you want to delete this user/i)).not.toBeInTheDocument()
        );
    });

    test("can confirm deletion", async () => {
        const mockUser = {
            id: 1,
            name: "Delete Me",
            email: "del@example.com",
            phone_number: "",
            user_rank: "",
            role: "user",
            freezers: [],
        };

        api.fetchUsers.mockResolvedValue([mockUser]);
        api.fetchFreezersByUser.mockResolvedValue([]);
        api.deleteUser.mockResolvedValue({});

        render(<PersonalContent />);
        await screen.findByText("Delete Me");

        fireEvent.click(screen.getByText("Delete"));
        fireEvent.click(screen.getByText("Yes, Delete"));

        await waitFor(() =>
            expect(screen.queryByText("Delete Me")).not.toBeInTheDocument()
        );
    });

    test("cancels Add User form and resets fields", async () => {
        api.fetchUsers.mockResolvedValue([]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);

        fireEvent.click(screen.getByText("Add New User"));

        fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John" } });
        fireEvent.click(screen.getByText("Cancel"));

        await waitFor(() => {
            expect(screen.queryByPlaceholderText("Name")).not.toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Add New User"));
        expect(screen.getByPlaceholderText("Name").value).toBe(""); // Should be reset
    });

    test("shows validation message if required fields are missing", async () => {
        api.fetchUsers.mockResolvedValue([]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        fireEvent.click(screen.getByText("Add New User"));
        fireEvent.click(screen.getByText("Add"));

        await waitFor(() => {
            expect(screen.getByText("❌ Name, email, and role are required.")).toBeInTheDocument();
        });
    });

    test("edits a user and saves changes", async () => {
        const mockUser = {
            id: 2,
            name: "Old Name",
            email: "old@example.com",
            phone_number: "",
            user_rank: "",
            role: "user",
            freezers: [],
        };

        api.fetchUsers.mockResolvedValue([mockUser]);
        api.fetchFreezersByUser.mockResolvedValue([]);
        api.updateUser.mockResolvedValue({});

        render(<PersonalContent />);
        await screen.findByText("Old Name");

        fireEvent.click(screen.getByText("Edit"));

        const nameInput = screen.getByDisplayValue("Old Name");
        fireEvent.change(nameInput, { target: { value: "New Name" } });

        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => {
            expect(api.updateUser).toHaveBeenCalledWith(2, expect.objectContaining({ name: "New Name" }));
            expect(screen.getByText("✅ User updated successfully!")).toBeInTheDocument();
        });
    });

    test("expands and collapses mobile user details", async () => {
        const mockUser = {
            id: 3,
            name: "Compact User",
            email: "compact@example.com",
            phone_number: "123",
            user_rank: "B",
            role: "user",
            freezers: [],
        };

        api.fetchUsers.mockResolvedValue([mockUser]);
        api.fetchFreezersByUser.mockResolvedValue([]);

        render(<PersonalContent />);
        await screen.findByText("Compact User");

        const toggleButton = screen.getByText("▼");
        fireEvent.click(toggleButton);

        expect(screen.getByText(/Phone:/)).toBeInTheDocument();
        expect(screen.getByText(/Rank:/)).toBeInTheDocument();

        fireEvent.click(toggleButton);
        expect(screen.queryByText(/Phone:/)).not.toBeInTheDocument();
    });

    test("shows error if loading users fails", async () => {
        api.fetchUsers.mockRejectedValue(new Error("API failure"));

        render(<PersonalContent />);
        await waitFor(() => {
            expect(screen.getByText("Failed to load users")).toBeInTheDocument();
        });
    });

});
