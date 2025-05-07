import { render, screen } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import App from "../../../src/App";

describe("App", () => {
    beforeEach(() => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ email: "mock@example.com" }),
            })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders without crashing', () => {
        render(<App />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
});