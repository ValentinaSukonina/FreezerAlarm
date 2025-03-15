import { Locator, Page } from "@playwright/test";

export class Navbar {

    readonly navigation: Locator;
    readonly searchInput: Locator;

    constructor(readonly page: Page) {
        this.navigation = this.page.getByRole('navigation');
        this.searchInput = this.page.getByRole('searchbox', { name: 'Search' });
    }

}