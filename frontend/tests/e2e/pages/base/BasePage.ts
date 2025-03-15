import { Page } from "@playwright/test";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

export class BasePage {

    readonly navbar: Navbar;
    readonly footer: Footer;

    constructor(readonly page: Page) {
        this.navbar = new Navbar(page);
        this.footer = new Footer(page);
    }

}