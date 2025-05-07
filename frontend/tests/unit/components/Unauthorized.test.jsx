import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Unauthorized from "../../../src/components/Unauthorized";

describe('Unauthorized', () => {
    test('displays access denied message', () => {
        render(<Unauthorized />);

        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
        expect(screen.getByText(/You do not have permission to view this page/i)).toBeInTheDocument();
    });
});
