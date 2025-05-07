import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
//import FreezersAll from "../../../src/components/FreezersAll";
import * as api from "../../../src/services/api";

// Mock child components
vi.mock("../../../src/components/FreezerCardUser", () => ({
    default: ({ freezer }) => <div>UserCard {freezer.number}</div>,
}));

// MOCK AddFreezerForm
vi.mock("../../../src/components/AddFreezerForm", async () => {
    const React = await import("react");
    return {
        __esModule: true,
        default: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => ({
                resetCheckboxes: vi.fn(),
            }));

            return (
                <div ref={ref} data-testid="mocked-addfreezerform">
                    <div>Mocked AddFreezerForm</div>
                    <button
                        data-testid="add-btn"
                        onClick={() => {
                            const testData = window.__TEST_DATA__ || { number: "F321", room: "A" };
                            props.onAdd(testData);
                        }}
                    >
                        Add
                    </button>
                    <button data-testid="cancel-btn" onClick={props.onCancel}>
                        Cancel
                    </button>
                </div>
            );
        }),
    };
});

import FreezersAll from "../../../src/components/FreezersAll";

vi.mock("../../../src/components/FreezerCardUser", () => ({
    default: ({ freezer }) => <div>UserCard {freezer.number}</div>,
}));

vi.mock("../../../src/services/api", async () => {
    const actual = await vi.importActual("../../../src/services/api");
    return {
        ...actual,
        fetchAllFreezersWithUsers: vi.fn(),
        createFreezer: vi.fn(),
    };
});

describe("FreezersAll", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();

        window.__TEST_DATA__ = null;

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve("admin"),
            })
        );

        api.fetchAllFreezersWithUsers.mockResolvedValue([]);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("displays loading initially", async () => {
        const neverResolves = new Promise(() => {});
        api.fetchAllFreezersWithUsers.mockReturnValueOnce(neverResolves);

        render(<FreezersAll />);
        await waitFor(() => {
            render(<FreezersAll />);
        });

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

    test("fetches role and shows AddFreezerForm for admin", async () => {
        sessionStorage.clear();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve("admin"),
            })
        );

        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([]);

        render(<FreezersAll />);

        await waitFor(() => {
            expect(screen.queryByText(/loading freezers/i)).not.toBeInTheDocument();
        });

        expect(await screen.findByTestId("mocked-addfreezerform")).toBeInTheDocument();
    });

    test("handles role fetch failure", async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error("Network fail")));
        vi.spyOn(console, "error").mockImplementation(() => {});
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([]);

        render(<FreezersAll />);
        await waitFor(() => {
            expect(api.fetchAllFreezersWithUsers).toHaveBeenCalled();
        });
    });

    test("does not call createFreezer if fields are missing", async () => {
        sessionStorage.setItem("role", "admin");
        api.fetchAllFreezersWithUsers.mockResolvedValue([]);

        window.__TEST_DATA__ = { number: "", room: "" };

        render(<FreezersAll />);

        await waitFor(() =>
            expect(screen.getByTestId("mocked-addfreezerform")).toBeInTheDocument()
        );

        fireEvent.click(screen.getByTestId("add-btn"));

        expect(api.createFreezer).not.toHaveBeenCalled(); // should not call with empty fields
    });

    test("handles successful freezer addition", async () => {
        sessionStorage.setItem("role", "admin");

        // First API call (on mount)
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([]);
        // Second API call (after createFreezer)
        api.fetchAllFreezersWithUsers.mockResolvedValueOnce([
            { id: 1, number: "F321", room: "A", users: [] },
        ]);

        api.createFreezer.mockResolvedValue({ number: "F321" });

        render(<FreezersAll />);

        // Wait until loading is done and AddFreezerForm is visible
        await waitFor(() =>
            expect(screen.getByTestId("mocked-addfreezerform")).toBeInTheDocument()
        );

        // Click Add button
        const addButton = screen.getByTestId("add-btn");
        fireEvent.click(addButton);

        // Expect success message
        await waitFor(() =>
            expect(api.createFreezer).toHaveBeenCalledWith({
                number: "F321",
                room: "A"
            })
        );
        expect(api.fetchAllFreezersWithUsers).toHaveBeenCalledTimes(2);

    });


});






