import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AlertConfirmation from "../../../src/components/AlertConfirmation";

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useLocation: vi.fn(),
        useNavigate: vi.fn(),
    };
});

import { useLocation, useNavigate } from "react-router-dom";

describe("AlertConfirmation", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("renders freezer number and recipient list", () => {
        useLocation.mockReturnValue({
            state: {
                freezerNumber: "1234",
                recipients: [
                    {
                        name: "Alice",
                        email: "alice@example.com",
                        phone_number: "123-456-7890",
                        selectedEmail: true,
                        selectedSms: true,
                    },
                ],
                emailStatus: { ok: true, message: "sent" }
            },
        });

        render(<AlertConfirmation />);

        expect(screen.getByText(/for Freezer 1234/i)).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("alice@example.com")).toBeInTheDocument();
        expect(screen.getByText("123-456-7890")).toBeInTheDocument();
        expect(screen.getByText(/Email was successfully sent/i)).toBeInTheDocument();
    });

    test("renders fallback message when no recipients", () => {
        useLocation.mockReturnValue({
            state: {
                freezerNumber: "5678",
                recipients: [],
                emailStatus: {
                    ok: true,
                    message: "Email sent",
                }
            }
        });

        render(<AlertConfirmation />);
        expect(screen.getByText(/No recipients selected/i)).toBeInTheDocument();
    });

    test("navigates to home on button click", () => {
        useLocation.mockReturnValue({
            state: {
                freezerNumber: "9999",
                recipients: [],
            },
        });

        render(<AlertConfirmation />);
        fireEvent.click(screen.getByText(/Back to Search/i));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});
