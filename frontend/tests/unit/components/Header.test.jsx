// Header.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Header from "../../../src/components/Header";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("Header", () => {
    beforeEach(() => {
        sessionStorage.clear();
        mockNavigate.mockReset();
    });

    const renderWithRouter = () =>
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

    test("renders brand and nav links", () => {
        renderWithRouter();
        expect(screen.getByText(/freezer alarm management/i)).toBeInTheDocument();
    });

    test("renders login link when not logged in", () => {
        renderWithRouter();
        expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    test("renders logout and nav links when logged in", async () => {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("role", "admin");

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText(/logout/i)).toBeInTheDocument();
            expect(screen.getByText(/freezers/i)).toBeInTheDocument();
            expect(screen.getByText(/my account/i)).toBeInTheDocument();
            expect(screen.getByText(/personal/i)).toBeInTheDocument();
        });
    });

    test("disables nav links when not logged in", () => {
        renderWithRouter();

        const freezersLink = screen.getByText(/freezers/i);
        expect(freezersLink).toHaveClass("disabled");
        expect(freezersLink).toHaveStyle("opacity: 0.5");
    });

    test("calls navigate with search term on submit", async () => {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("role", "user");

        renderWithRouter();

        const input = screen.getByPlaceholderText(/search for freezer/i);
        const button = screen.getByRole("button", { name: /search/i });

        fireEvent.change(input, { target: { value: "1234" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/freezers/1234");
        });
    });

    test("clears session and redirects on logout", async () => {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("role", "user");

        delete window.location;
        window.location = { href: "" };

        renderWithRouter();

        fireEvent.click(screen.getByText(/logout/i));

        await waitFor(() => {
            expect(sessionStorage.getItem("isLoggedIn")).toBeNull();
            expect(window.location.href).toContain("http://localhost:8000/logout");
        });
    });

    test("shows search input on mobile toggle", () => {
        renderWithRouter();
        fireEvent.click(screen.getByRole("button", { name: "" })); // toggler has no name

        // Should now show the mobile form (it’s hidden by default)
        expect(screen.getAllByPlaceholderText(/login to search/i).length).toBeGreaterThan(0);
    });
});
