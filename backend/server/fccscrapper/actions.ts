import puppeteer, { Browser } from "puppeteer";
const randomUA = require("modern-random-ua");

const pausedRequests: any[] = [];
const paused = false;
const browserMap = new Map();

export default class Actions {
  public static openBrowser = async () => {
    if (!Actions.browser) {
      Actions.browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    return Actions.browser;
  };

  public static openNewPage = async (url: string | null): Promise<puppeteer.Page> => {
    if (url === null) {
      return null;
    }

    if (!Actions.browser) {
      Actions.browser = await Actions.openBrowser();
    }

    const page = await Actions.browser.newPage();
    const userAgent = randomUA.generate();
    await page.setUserAgent(userAgent);
    await page.goto(url);
    return page;
  };

  public static closeBrowser = async () => {
    if (Actions.browser) {
      await Actions.browser.close();
    }
    Actions.browser = null;
  };

  private static browser: Browser | null;
}
