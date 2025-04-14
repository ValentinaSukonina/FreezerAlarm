import { render, screen } from "@testing-library/react";
import FreezerCardUser from "../../../src/components/FreezerCardUser";

describe("FreezerCardUser", () => {
    it("renders freezer details and assigned users", () => {
        const freezer = {
            number: "1234",
            room: "Lab A",
            address: "Main Building",
            type: "-80C",
            users: [
                {
                    id: 1,
                    name: "Alice",
                    email: "alice@example.com",
                    phone_number: "123-456",
                    user_rank: "Technician"
                },
                {
                    id: 2,
                    name: "Bob",
                    email: "bob@example.com",
                    phone_number: "987-654"
                }
            ]
        };

        render(<FreezerCardUser freezer={freezer} />);

        expect(screen.getByText("Freezer: 1234")).toBeInTheDocument();
        expect(screen.getByText("Room:").closest("p")).toHaveTextContent("Room: Lab A");
        screen.getByText((content, element) =>
            element.tagName.toLowerCase() === "p" && content.includes("Alice") && content.includes("Technician")
        );
        expect(
            screen.getByText((content, element) =>
                element.tagName.toLowerCase() === "p" &&
                content.includes("Bob") &&
                content.includes("No rank")
            )
        ).toBeInTheDocument();

    });

    it("shows message if no freezer is passed", () => {
        render(<FreezerCardUser freezer={null} />);
        expect(screen.getByText("No freezer data available.")).toBeInTheDocument();
    });

    it("shows message if no users are assigned", () => {
        const freezer = {
            number: "4321",
            room: "Cold Room",
            address: "Annex",
            type: "-20C",
            users: []
        };

        render(<FreezerCardUser freezer={freezer} />);
        expect(screen.getByText("No assigned users.")).toBeInTheDocument();
    });
});
