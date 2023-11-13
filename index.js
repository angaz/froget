import puppeteer from 'puppeteer';
import { sleep } from 'bun';

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    headless: "new",
    executablePath: "chromium",
    userDataDir: "./user_data",
  });

  process.on("SIGINT", async () => {
    console.log("Received SIGINT");

    await browser.close();
  });

  const page = await browser.newPage();

  await page.goto("https://zupass.org/#/?folder=FrogCrypto");

  const searchResultSelector = ".sc-jdUcAg > div:nth-child(1) > button:nth-child(1)";
  const button = await page.waitForSelector(searchResultSelector);

  const getText = async () => await button?.evaluate(el => el.textContent);
  const logText = async () => console.log("[" + (new Date().toISOString()) + "] " + await getText());

  logText();
  setInterval(logText, 60_000);

  while (!page.isClosed()) {
    if (await getText() === "search SWAMP") {
      await logText();

      await page.click(searchResultSelector);

      while (await getText() === "search SWAMP") {
        await sleep(1000);
      }

      await logText();
    }

    await sleep(1000);
  }

  await browser.close();
})();
