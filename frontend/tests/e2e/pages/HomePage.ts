import { BasePage } from "./base/BasePage";
import { Locator, Page } from "@playwright/test";

export class HomePage extends BasePage {

    readonly loginButton: Locator;

    constructor(readonly page: Page) {
        super(page);

        this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    }

    async visit() {
        await this.page.goto('http://localhost:5173/');
    }

    async close() {
        await this.page.close();
    }

}