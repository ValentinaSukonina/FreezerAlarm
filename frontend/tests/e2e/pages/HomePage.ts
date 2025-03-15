import { BasePage } from "./base/BasePage";
import { expect, Locator, Page } from "@playwright/test";

export class HomePage extends BasePage {

    readonly searchButton: Locator;
    readonly createAccountButton: Locator;

    constructor(readonly page: Page) {
        super(page);

        this.searchButton = this.page.getByRole('button', { name: 'Search' });
        this.createAccountButton = this.page.getByRole('button', { name: 'Create Account' });
    }

    async visit() {
        await this.page.goto('http://localhost:5173/');
    }

    async close() {
        await this.page.close();
    }

    async verifyButtonsVisible() {
        await expect(this.searchButton).toBeVisible();
        await expect(this.createAccountButton).toBeVisible();
    }

}