import { expect, test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe('Home Page Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({page}) => {
        homePage = new HomePage(page);
        await homePage.visit();
    });

    test.afterEach(async () => {
        await homePage.close();
    });

    test('navbar should be visible', async () => {
        await expect(homePage.navbar.navigation).toBeVisible();
    });

    test('navbar should have a search input', async () => {
        await expect(homePage.navbar.searchInput).toBeVisible();
    });

    test('buttons should be visible', async () => {
        await homePage.verifyButtonsVisible();
    });

});