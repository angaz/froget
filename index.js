import puppeteer from 'puppeteer';
import { sleep } from 'bun';

let loop = true;

process.on("SIGINT", async () => {
  console.log("Received SIGINT");

  loop = false;
});

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

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.goto("https://zupass.org/#/?folder=FrogCrypto");

  const getButtons = async () => await page?.$x("//button[contains(., 'search')]")
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
  const intervalID = setInterval(async () => logText(await getText()), 60_000);

  await saveFrogs(page);

  while (loop) {
    const buttons = await getButtons();

    for (const button of buttons) {
      if (!await button?.evaluate(el => el.disabled)) {
        // There is a very simple "anti-automation" check where if the button
        // is not in the viewport, it will not do anything on click.
        // This seems to fix it.
        await button.scrollIntoView();
        await button.click();

        logText("Clicked " + await getElText(button));
      }
    }

    await sleep(1000);
  }

  clearInterval(intervalID);

  await saveFrogs(page);
  await browser.close();
})();

async function saveFrogs(page) {
  const localStorageData = await page.evaluate(() =>
    localStorage.getItem("pcd_collection"));

  await Bun.write("localStorage", localStorageData)
}
