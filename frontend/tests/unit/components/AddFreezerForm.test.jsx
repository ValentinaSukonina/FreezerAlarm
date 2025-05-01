import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AddFreezerForm from "../../../src/components/AddFreezerForm";
import { fetchUsers } from "../../../src/services/api";

vi.mock("../../../src/services/api", () => ({
    fetchUsers: vi.fn().mockResolvedValue([
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" },
    ]),
}));

describe("AddFreezerForm", () => {
    let onChangeMock, onAddMock, onCancelMock;

    beforeEach(() => {
        onChangeMock = vi.fn();
        onAddMock = vi.fn().mockResolvedValue(true);
        onCancelMock = vi.fn();
    });

    test("renders the form and displays 'Add New Freezer' button", () => {
        render(
            <AddFreezerForm
                newFreezer={{ number: "", room: "", address: "", type: "-80C" }}
                onChange={onChangeMock}
                onAdd={onAddMock}
                onCancel={onCancelMock}
                formError={null}
            />
        );

        expect(screen.getByText("Add New Freezer")).toBeInTheDocument();
    });

    test("shows form and hides the button when clicked", async () => {
        render(
            <AddFreezerForm
                newFreezer={{ number: "", room: "", address: "", type: "-80C" }}
                onChange={onChangeMock}
                onAdd={onAddMock}
                onCancel={onCancelMock}
                formError={null}
            />
        );

        fireEvent.click(screen.getByText("Add New Freezer"));

        expect(await screen.findByText("Hide Form")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter unique 4-digit freezer code")).toBeInTheDocument();
    });


    test("calls onAdd with correct data on submit", async () => {
        render(
            <AddFreezerForm
                newFreezer={{ number: "1234", room: "Room 1", address: "Address", type: "-80C" }}
                onChange={onChangeMock}
                onAdd={onAddMock}
                onCancel={onCancelMock}
                formError={null}
            />
        );

        fireEvent.click(screen.getByText("Add New Freezer"));

        fireEvent.click(screen.getByText("Add"));

        await waitFor(() => {
            expect(onAddMock).toHaveBeenCalledWith({
                number: "1234",
                room: "Room 1",
                address: "Address",
                type: "-80C",
                userIds: [],
            });
        });
    });




    test("calls onCancel and resets form", async () => {
        let freezerData = {
            number: "1234",
            room: "Lab A",
            address: "Address",
            type: "-80C",
        };

        const onChangeMock = vi.fn((e) => {
            freezerData = { ...freezerData, [e.target.name]: e.target.value };
        });

        const onCancelMock = vi.fn(() => {
            freezerData = {
                number: "",
                room: "",
                address: "",
                type: "-80C",
            };
        });

        const { rerender } = render(
            <AddFreezerForm
                newFreezer={freezerData}
                onChange={onChangeMock}
                onAdd={vi.fn()}
                onCancel={onCancelMock}
                formError={null}
            />
        );

        // Open form
        await waitFor(() => {
            fireEvent.click(screen.getByText("Add New Freezer"));
        });

        // Ensure field has initial value
        const numberInput = await screen.findByPlaceholderText(
            "Enter unique 4-digit freezer code"
        );
        expect(numberInput.value).toBe("1234");

        // Click cancel
        await waitFor(() => {
            fireEvent.click(screen.getByText("Cancel"));
        });

        expect(onCancelMock).toHaveBeenCalled();

        // Rerender with reset values
        rerender(
            <AddFreezerForm
                newFreezer={freezerData}
                onChange={onChangeMock}
                onAdd={vi.fn()}
                onCancel={onCancelMock}
                formError={null}
            />
        );

        // Open form again and check values are reset
        await waitFor(() => {
            fireEvent.click(screen.getByText("Add New Freezer"));
        });
        expect(screen.getByPlaceholderText("Enter unique 4-digit freezer code").value).toBe("");
        expect(screen.getByPlaceholderText("Room").value).toBe("");
        expect(screen.getByPlaceholderText("Address").value).toBe("");
    });




});


