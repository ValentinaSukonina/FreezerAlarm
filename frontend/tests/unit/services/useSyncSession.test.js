import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import useSyncSession from "../../../src/services/useSyncSession";
import axios from "axios";

describe("useSyncSession", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
    });

    vi.mock("axios");

    test("stores session data in sessionStorage on success", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                isLoggedIn: "true",
                username: "testuser",
                email: "user@example.com",
                role: "admin",
            },
        });

        const { result } = renderHook(() => useSyncSession());

        await waitFor(() => {
            expect(result.current).toBe(false); // loading is false
        });

        expect(sessionStorage.getItem("email")).toBe("user@example.com");
    });

    test("stores empty strings in sessionStorage when user fields are missing", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                isLoggedIn: "true", 
            },
        });

        const { result } = renderHook(() => useSyncSession());

        await waitFor(() => {
            expect(result.current).toBe(false);
        });

        expect(sessionStorage.getItem("username")).toBe("");
        expect(sessionStorage.getItem("email")).toBe("");
        expect(sessionStorage.getItem("role")).toBe("");
    });

    test("clears sessionStorage on fetch failure", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        axios.get.mockRejectedValueOnce(new Error("fail"));

        const { result } = renderHook(() => useSyncSession());

        await waitFor(() => {
            expect(result.current).toBe(false);
        });

        expect(sessionStorage.getItem("email")).toBeNull();

        errorSpy.mockRestore();
    });

    test("clears sessionStorage when user is not logged in", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                isLoggedIn: "false",
            },
        });

        sessionStorage.setItem("role", "admin");

        const { result } = renderHook(() => useSyncSession());

        await waitFor(() => {
            expect(result.current).toBe(false);
        });

        expect(sessionStorage.getItem("role")).toBeNull();
    });
});