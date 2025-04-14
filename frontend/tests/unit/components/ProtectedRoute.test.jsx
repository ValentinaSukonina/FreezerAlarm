import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock the hook using ESM dynamic import
vi.mock("../../../src/services/useSyncSession.js", async () => {
    return {
        useSyncSession: () => false // Simulate session already loaded
    };
});

import ProtectedRoute from "../../../src/components/ProtectedRoute.jsx";

describe("ProtectedRoute", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test("redirects to unauthorized when not logged in", () => {
        sessionStorage.setItem("isLoggedIn", "false");

        render(
            <MemoryRouter>
                <ProtectedRoute requiredRole="admin">
                    <div>Secret content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    });

    test("shows child when logged in and has correct role", () => {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("role", "admin");

        render(
            <MemoryRouter>
                <ProtectedRoute requiredRole="admin">
                    <div>Secret content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText("Secret content")).toBeInTheDocument();
    });
});

