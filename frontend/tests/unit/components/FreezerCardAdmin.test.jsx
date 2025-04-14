import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import FreezerCardAdmin from "../../../src/components/FreezerCardAdmin";
import * as api from "../../../src/services/api";
import { BrowserRouter } from "react-router-dom";

// Mock the necessary API calls
vi.mock("../../../src/services/api", async () => {
    const actual = await vi.importActual("../../../src/services/api");
    return {
        ...actual,
        updateFreezerWithUsers: vi.fn(),
        deleteFreezer: vi.fn(),
        fetchUsers: vi.fn().mockResolvedValue([{ id: 1, name: "User 1" }]),
        sendEmail: vi.fn(),
    };
});

// Helper wrapper for components using useNavigate
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("FreezerCardAdmin", () => {
    const freezer = {
        id: 1,
        number: "F123",
        room: "Lab A",
        address: "Cold Street",
        type: "-80C",
        users: [
            { id: 1, name: "User 1", email: "user1@example.com", phone_number: "123", user_rank: "Tech" },
        ],
    };

    const setup = (props = {}) =>
        renderWithRouter(
            <FreezerCardAdmin
                freezer={freezer}
                onFreezerUpdated={vi.fn()}
                onFreezerDeleted={vi.fn()}
                onMessage={vi.fn()}
                {...props}
            />
        );

    beforeEach(() => {
        sessionStorage.setItem("role", "admin");
        sessionStorage.setItem("username", "Test Admin");
        sessionStorage.setItem("email", "admin@example.com");
    });

    test("renders freezer info", () => {
        setup();
        expect(screen.getByText(/Freezer: F123/i)).toBeInTheDocument();
        expect(screen.getByText(/Room:/i)).toBeInTheDocument();
        expect(screen.getByText(/Lab A/i)).toBeInTheDocument();
    });

    test("enters edit mode and cancels", () => {
        setup();

        fireEvent.click(screen.getByText("Edit"));
        expect(screen.getByDisplayValue("Lab A")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Cancel")); // cancels editing
        expect(screen.queryByDisplayValue("Lab A")).not.toBeInTheDocument();
    });

    test("triggers onFreezerUpdated after saving", async () => {
        const onFreezerUpdated = vi.fn();
        api.updateFreezerWithUsers.mockResolvedValueOnce(true);

        setup({ onFreezerUpdated });

        fireEvent.click(screen.getByText("Edit"));
        fireEvent.click(screen.getByText("Save"));

        await waitFor(() => {
            expect(api.updateFreezerWithUsers).toHaveBeenCalledWith(
                1,
                expect.anything(),
                expect.anything()
            );
            expect(onFreezerUpdated).toHaveBeenCalledWith("refetch");
        });
    });

    test("shows delete confirmation and cancels it", () => {
        setup();

        fireEvent.click(screen.getByText("Delete"));
        expect(screen.getByText(/Confirm delete/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByText(/Confirm delete/i)).not.toBeInTheDocument();
    });

    test("sends email and navigates", async () => {
        const onMessage = vi.fn();
        api.sendEmail.mockResolvedValueOnce();

        renderWithRouter(
            <FreezerCardAdmin
                freezer={{
                    ...freezer,
                    users: [
                        {
                            ...freezer.users[0],
                            selectedEmail: false, // still starts false
                        },
                    ],
                }}
                onMessage={onMessage}
            />
        );

        // Click the checkbox to select email for notification
        const emailCheckbox = screen.getAllByRole("checkbox")[0]; // assumes first is email
        fireEvent.click(emailCheckbox);

        fireEvent.click(screen.getByText("Send notification"));

        await waitFor(() => {
            expect(api.sendEmail).toHaveBeenCalled();
        });
    });



});
