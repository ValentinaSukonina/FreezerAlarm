import { Locator, Page } from "@playwright/test";

export class Footer {

    readonly contentInfo: Locator;
    readonly copyrightText: Locator;

    constructor(readonly page: Page) {
        this.contentInfo = this.page.getByRole('contentinfo');
        this.copyrightText = this.page.getByText('Copyright ⓒ 2025 ITHS');
    }

}