import { render, screen } from "@testing-library/react";
import Footer from "../../../src/components/Footer";

describe("Footer", () => {
    test("renders footer with current year and organization name", () => {
        const currentYear = new Date().getFullYear();
        render(<Footer />);

        const footerText = screen.getByText(
            new RegExp(`Copyright ⓒ ${currentYear} ITHS Gothenburg`, "i")
        );

        expect(footerText).toBeInTheDocument();
    });
});
