import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import FreezersAll from "../../../src/components/FreezersAll";
import * as api from "../../../src/services/api";

// Mock child components
vi.mock("../../../src/components/FreezerCardUser", () => ({
    default: ({ freezer }) => <div>UserCard {freezer.number}</div>,
}));

// MOCK AddFreezerForm
vi.mock("../../../src/pages/AddFreezerForm", async () => {
    const React = await import("react");

    return {
        __esModule: true,
        default: React.forwardRef((props, ref) => {
            return (
                <div ref={ref}>
                    <div data-testid="mocked-addfreezerform">Mocked AddFreezerForm</div>
                    <button onClick={() => props.onAdd({ number: "123", room: "A" })}>Add</button>
                    <button onClick={props.onCancel}>Cancel</button>
                </div>
            );
        }),
    };
});

vi.mock("../../../src/services/api", async () => ({
    fetchAllFreezersWithUsers: vi.fn(),
    createFreezer: vi.fn(),
}));

describe("FreezersAll", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
    });

    test("displays loading initially", () => {
        render(<FreezersAll />);
        expect(screen.getByText(/loading freezers/i)).toBeInTheDocument();
    });

    test("renders freezers after loading", async () => {
        sessionStorage.setItem("role", "user");

        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([
            { id: 1, number: "F123", users: [] },
        ]);

        render(<FreezersAll />);

        await waitFor(() => {
            expect(screen.getByText(/usercard f123/i)).toBeInTheDocument();
        });
    });

    test("shows error if API fails", async () => {
        api.fetchAllFreezersWithUsers.mockRejectedValueOnce(new Error("Failed to load"));

        render(<FreezersAll />);

        await waitFor(() => {
            expect(screen.getByText(/error: failed to load/i)).toBeInTheDocument();
        });
    });


});






