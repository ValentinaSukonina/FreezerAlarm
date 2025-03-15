import { Locator, Page } from "@playwright/test";

export class Footer {

    readonly contentInfo: Locator;

    constructor(readonly page: Page) {
        this.contentInfo = this.page.getByRole('contentinfo');
    }

}