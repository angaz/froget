import puppeteer from 'puppeteer';
import { sleep } from 'bun';

(async () => {
  const browser = await puppeteer.launch({
    // For the initial login, set `headless` to `false`, do the login, and then
    // set `headless` back to "new" once the `user_dir` has been copied to the
    // server.
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

  const divSelector = ".sc-jdUcAg";
  const div = await page.waitForSelector(divSelector);

  const getButtons = async () => await div?.$$('button');
  const getElText = async element => await element?.evaluate(el => el.textContent);

  const getText = async () => {
    let text = [];
    for (const button of await getButtons()) {
      text.push(await getElText(button));
    }

    return text;
  };

  const logText = async text => console.log("[" + (new Date().toISOString()) + "] " + text);

  logText(await getText());
  setInterval(async () => logText(await getText()), 60_000);

  while (!page.isClosed()) {
    const buttons = await getButtons();

    for (const button of buttons) {
      if (!await button?.evaluate(el => el.disabled)) {
        await button.click();

        logText("Clicked " + await getElText(button));
      }
    }

    await sleep(1000);
  }

  await browser.close();
})();
