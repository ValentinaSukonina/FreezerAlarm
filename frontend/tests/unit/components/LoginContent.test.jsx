import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginContent from "../../../src/components/LoginContent";
import axios from "axios";
import { vi } from "vitest";

// Mock window.location.href assignment
delete window.location;
window.location = { href: "" };

// Mock axios
vi.mock("axios");

describe("LoginContent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const fillAndSubmit = async ({ name = "", email = "" }) => {
        fireEvent.change(screen.getByLabelText(/full name/i), {
            target: { value: name },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: email },
        });

        fireEvent.click(screen.getByRole("button", { name: /verify/i }));
    };

    test("renders form and help text", () => {
        render(<LoginContent />);
        expect(screen.getByText(/authorization verification/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });


    test("shows validation message if fields are empty", async () => {
        render(<LoginContent />);

        const form = document.querySelector("form"); // ← fallback to raw DOM
        fireEvent.submit(form);

        await waitFor(() => {
            expect(
                screen.getByText((text) => text.includes("Please fill in all fields"))
            ).toBeInTheDocument();
        });
    });

    test("handles successful authorization", async () => {
        axios.get.mockResolvedValueOnce({ data: true });
        axios.post.mockResolvedValueOnce({});

        render(<LoginContent />);
        await fillAndSubmit({ name: "John Doe", email: "john@example.com" });

        await waitFor(() =>
            expect(
                screen.getByText(/you are authorized/i)
            ).toBeInTheDocument()
        );

        expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });

    test("handles unauthorized access", async () => {
        axios.get.mockResolvedValueOnce({ data: false });

        render(<LoginContent />);
        await fillAndSubmit({ name: "Jane", email: "wrong@email.com" });

        await waitFor(() =>
            expect(
                screen.getByText(/do not match our records/i)
            ).toBeInTheDocument()
        );
    });

    test("handles API error", async () => {
        axios.get.mockRejectedValueOnce(new Error("Network error"));

        render(<LoginContent />);
        await fillAndSubmit({ name: "Test", email: "test@test.com" });

        await waitFor(() =>
            expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
        );
    });

    test("google login button redirects when clicked", async () => {
        delete window.location;
        window.location = { href: "" };

        axios.get.mockResolvedValueOnce({ data: true }); // ✅ mock check-user
        axios.post.mockResolvedValueOnce({}); // ✅ mock set-preauth-email

        render(<LoginContent />);

        fireEvent.change(screen.getByLabelText(/full name/i), {
            target: { value: "John Doe" },
        });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "john@example.com" },
        });

        fireEvent.click(
            screen.getByRole("button", { name: /verify authorization/i })
        );

        // Wait for the Google login button to appear
        await waitFor(() => {
            expect(screen.getByTestId("google-login-btn")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId("google-login-btn"));
        expect(window.location.href).toBe(
            "http://localhost:8000/oauth2/authorization/google"
        );
    });

});
