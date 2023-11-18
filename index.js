import puppeteer from 'puppeteer';
import { sleep } from 'bun';

let loop = true;

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

  process.on("SIGINT", async () => {
    console.log("Received SIGINT");

    loop = false;
  });


  await page.goto("https://zupass.org/#/?folder=FrogCrypto");

  // CSS selector of the div containing the "search" buttons.
  // It's likely this CSS class name will change. If you notice the log line
  // with all the button text is missing, this is the most likely reason.
  //
  // There may also be an error saying that a timeout has been reached waiting
  // for the selector.
  const divSelector = ".sc-fyVfxW";
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
  const intervalID = setInterval(async () => logText(await getText()), 60_000);

  await saveFrogs(page);

  while (loop) {
    const buttons = await getButtons();

    for (const button of buttons) {
      if (!await button?.evaluate(el => el.disabled)) {
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
