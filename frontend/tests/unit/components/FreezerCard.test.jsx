import { render, screen } from "@testing-library/react";
import FreezerCard from "../../../src/components/FreezerCard";

// Mock child components
vi.mock("../../../src/components/FreezerCardAdmin", () => ({
    default: ({ freezer }) => <div>Admin Card: {freezer.name}</div>,
}));

vi.mock("../../../src/components/FreezerCardUser", () => ({
    default: ({ freezer }) => <div>User Card: {freezer.name}</div>,
}));

describe("FreezerCard", () => {
    const mockFreezer = { name: "Freezer 1", id: 1 };

    beforeEach(() => {
        sessionStorage.clear();
    });

    test("renders FreezerCardAdmin when role is 'admin'", () => {
        sessionStorage.setItem("role", "admin");

        render(<FreezerCard freezer={mockFreezer} />);
        expect(screen.getByText(/Admin Card: Freezer 1/i)).toBeInTheDocument();
    });

    test("renders FreezerCardUser when role is not 'admin'", () => {
        sessionStorage.setItem("role", "user");

        render(<FreezerCard freezer={mockFreezer} />);
        expect(screen.getByText(/User Card: Freezer 1/i)).toBeInTheDocument();
    });

    test("renders fallback message if no freezer is passed", () => {
        render(<FreezerCard freezer={null} />);
        expect(screen.getByText(/No freezer data available/i)).toBeInTheDocument();
    });


});
