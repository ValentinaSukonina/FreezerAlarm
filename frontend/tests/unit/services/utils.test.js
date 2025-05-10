import { sanitizeInput, sanitizeInputSec } from "../../../src/services/utils";
describe("sanitizeInput", () => {
    test("removes <script> tags and trims input", () => {
        const dirty = "<script>alert('hi')</script> Hello <b>world</b>";
        expect(sanitizeInput(dirty)).toBe("Hello world");
    });

    test("removes angle brackets", () => {
        const input = "some <unsafe> content";
        expect(sanitizeInput(input)).toBe("some  content");
    });
});

describe("sanitizeInputSec", () => {
    test("removes special characters from names", () => {
        expect(sanitizeInputSec("John!@#$ Doe123", "name")).toBe("John Doe");
    });

    test("trims email but does not alter it", () => {
        expect(sanitizeInputSec(" user@example.com ", "email")).toBe("user@example.com");
    });

    test("removes non-numeric characters from phone_number", () => {
        expect(sanitizeInputSec("(123)-456 7890", "phone_number")).toBe("1234567890");
    });

    test("removes non-numeric characters from rank", () => {
        expect(sanitizeInputSec("Rank: 5!", "rank")).toBe("5");
    });

    test("returns original value for unknown type", () => {
        expect(sanitizeInputSec("<anything>", "unknown")).toBe("<anything>");
    });
});