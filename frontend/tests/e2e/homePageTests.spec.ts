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
        await expect(homePage.navbar.header).toBeVisible();
        await expect(homePage.navbar.searchInput).toBeVisible();
        await expect(homePage.navbar.searchButton).toBeVisible();
        await expect(homePage.navbar.freezersButton).toBeVisible();
        await expect(homePage.navbar.personalButton).toBeVisible();
        await expect(homePage.navbar.loginButton).toBeVisible();
    });

    test('login button should be visible', async () => {
        await expect(homePage.loginButton).toBeVisible();
    });

    test('footer should be visible', async () => {
        await expect(homePage.footer.contentInfo).toBeVisible();
        await expect(homePage.footer.copyrightText).toBeVisible();
    });

});