import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import HomeContent from "../../../src/components/HomeContent";
import { BrowserRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("HomeContent", () => {
    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
        mockNavigate.mockReset();
    });

    const renderWithRouter = () => render(
        <BrowserRouter>
            <HomeContent />
        </BrowserRouter>
    );

    test("renders explanation content", () => {
        renderWithRouter();
        expect(screen.getByText(/why use this system/i)).toBeInTheDocument();
        expect(screen.getByText(/search freezer by number/i)).toBeInTheDocument();
        expect(screen.getByText(/University of Gothenburg/i)).toBeInTheDocument();
    });

    test("shows login button when not logged in", () => {
        renderWithRouter();
        const button = screen.getByRole("button", { name: /log in/i });
        expect(button).toBeInTheDocument();
    });

    test("shows logout button when logged in", () => {
        sessionStorage.setItem("isLoggedIn", "true");
        renderWithRouter();
        expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    });

    test("clicking login navigates to /create-account", () => {
        renderWithRouter();
        const loginBtn = screen.getByRole("button", { name: /log in/i });
        fireEvent.click(loginBtn);
        expect(mockNavigate).toHaveBeenCalledWith("/create-account");
    });

    test("clicking logout clears session and redirects", () => {
        sessionStorage.setItem("isLoggedIn", "true");

        // Simulate window.location for test
        delete window.location;
        window.location = { href: "" };

        renderWithRouter();
        fireEvent.click(screen.getByRole("button", { name: /logout/i }));

        expect(sessionStorage.getItem("isLoggedIn")).toBeNull();
        expect(window.location.href).toBe("http://localhost:8000/logout");
    });
});
