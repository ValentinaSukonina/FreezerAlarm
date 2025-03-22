import { Locator, Page } from "@playwright/test";

export class Navbar {

    readonly navigation: Locator;
    readonly header: Locator;
    readonly searchInput: Locator;

    readonly searchButton: Locator;
    readonly freezersButton: Locator;
    readonly personalButton: Locator;
    readonly loginButton: Locator;

    constructor(readonly page: Page) {
        this.navigation = this.page.getByRole('navigation');
        this.header = this.page.getByRole('link', { name: 'Freezer Alarm Management' });
        this.searchInput = this.page.getByRole('searchbox', { name: 'Search' });

        this.searchButton = this.page.getByRole('button', { name: 'Search' });
        this.freezersButton = page.getByRole('listitem').filter({ hasText: 'Freezers' });
        this.personalButton = page.getByRole('listitem').filter({ hasText: 'Personal' });
        this.loginButton = page.getByRole('link', { name: 'Login' });
    }

}