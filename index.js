const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const context = browser.defaultBrowserContext();
    //        URL                  An array of permissions
    context.overridePermissions("https://tinder.com", ["geolocation", "notifications"]);
    const page = await browser.newPage();
    await page.goto('https://tinder.com/', {
        waitUntil: 'networkidle2'
    });
    const login = async () => {
        try {
            const pageTarget = page.target();
            const [buttonFacebook] = await page.$x('//*[@id="modal-manager"]/div/div/div/div/div[3]/div[2]/button')
            buttonFacebook.click()

            const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
            const newPage = await newTarget.page();
            await newPage.waitForSelector("body");
            await newPage.type('input[name="email"]', process.env.USER_NAME)
            await newPage.type('input[name="pass"]', process.env.PASSWORD)
            const [buttonConfirm] = await newPage.$x('//*[@id="u_0_0"]')
            buttonConfirm.click()
        } catch (err) {
            console.error(err)
        }
    }
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 3000)
    })
    await login()
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, 5000)
    })
    console.log('login finish')
    // const [buttonAllow1] = await page.$x('//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1]')
    // buttonAllow1.click()

    // const [buttonAllow2] = await page.$x('//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1]')
    // buttonAllow2.click()

    // await browser.close();

})();
