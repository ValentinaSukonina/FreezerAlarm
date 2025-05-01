import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        axios.get.mockResolvedValue({ data: true });
        axios.post.mockResolvedValue({});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    const fillAndSubmit = async ({ name = "", email = "" }) => {
        await userEvent.type(screen.getByLabelText(/full name/i), name);
        await userEvent.type(screen.getByLabelText(/email/i),email);
        await userEvent.click(screen.getByRole("button", { name: /verify/i }));
    };

    test("renders form and help text", () => {
        render(<LoginContent />);
        expect(screen.getByText(/authorization verification/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    test("shows validation message if fields are empty", async () => {
        render(<LoginContent />);
        const form = document.querySelector("form");
        fireEvent.submit(form);

        expect(await screen.findByRole('alert')).toHaveTextContent(/please fill in all fields/i);
    });

    test("handles successful authorization", async () => {
        axios.get.mockResolvedValueOnce({ data: true });
        axios.post.mockResolvedValueOnce({});

        render(<LoginContent />);
        await fillAndSubmit({ name: "John Doe", email: "john@example.com" });

        expect(await screen.findByText(/you are authorized/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });

    test("handles unauthorized access", async () => {
        axios.get.mockResolvedValueOnce({ data: false });

        render(<LoginContent />);
        await fillAndSubmit({ name: "Jane", email: "wrong@email.com" });

        expect(await screen.findByText(/do not match our records/i)).toBeInTheDocument();
    });

    test("handles API error", async () => {
        axios.get.mockRejectedValueOnce(new Error("Network error"));

        render(<LoginContent />);
        await fillAndSubmit({ name: "Test", email: "test@test.com" });

        expect(await screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });

    test("google login button redirects when clicked", async () => {
        delete window.location;
        window.location = { href: "" };

        axios.get.mockResolvedValueOnce({ data: true });
        axios.post.mockResolvedValueOnce({});

        render(<LoginContent />);

        await userEvent.type(screen.getByLabelText(/full name/i), "John Doe");
        await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
        await userEvent.click(screen.getByRole("button", { name: /verify/i }));

        expect(await screen.findByTestId("google-login-btn")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("google-login-btn"));

        expect(window.location.href).toBe(
            "http://localhost:8000/oauth2/authorization/google"
        );
    });

});
