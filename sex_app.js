const puppeteer = require('puppeteer');
require('dotenv').config();

class Tinder {
    constructor(page, browser) {
        this.page = page;
        this.browser = browser;
    }

    async sleep(mil) {
        return new Promise(resolve => setTimeout(resolve, mil));
    }

    async login() {
        try {
            await this.sleep(3000);
            const pageTarget = this.page.target();
            const [buttonFacebook] = await this.page.$x('//*[@id="modal-manager"]/div/div/div/div/div[3]/div[2]/button')
            buttonFacebook.click()

            const newTarget = await this.browser.waitForTarget(target => target.opener() === pageTarget);
            const newPage = await newTarget.page();
            await newPage.waitForSelector("body");
            await newPage.type('input[name="email"]', process.env.USER_NAME)
            await newPage.type('input[name="pass"]', process.env.PASSWORD)
            const [buttonConfirm] = await newPage.$x('//*[@id="u_0_0"]')
            buttonConfirm.click()
            await this.sleep(5000)
        } catch (err) {
            console.error(err)
        }
    }

    async like() {
        try {
            const [buttonLike] = await this.page.$x('//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/button[3]')
            buttonLike.click()
        } catch (err) {
            console.error(err)
        }
    }

    async closePopup() {
        try {
            const [buttonPopup] = await this.page.$x('//*[@id="modal-manager"]/div/div/div[2]/button[2]')
            buttonPopup.click()
        } catch (err) {
            console.error(err)
        }
    }

    async closeMatch() {
        try {
            const [buttonMatch] = await this.page.$x('//*[@id="modal-manager-canvas"]/div/div/div[1]/div/div[3]/a')
            buttonMatch.click()
        } catch (err) {
            console.error(err)
        }
    }

    async findDate() {
        let swipe = true;
        while (swipe) {
            await this.sleep(1000);
            try {
                await this.like();
            } catch (err) {
                try {
                    await this.closeMatch();
                } catch (err) {
                    try {
                        await this.closePopup();
                    } catch (err) {
                        swipe = false
                        await this.browser.close();
                    }
                }
            }
        }
    }
}


(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    // allow geolocation
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://tinder.com", ["geolocation"]);
    const client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Emulation.setGeolocationOverride", {
        latitude: parseFloat(process.env.LATITUDE),
        longitude: parseFloat(process.env.LONGITUDE),
        accuracy: 100
    });

    await page.goto('https://tinder.com', {
        waitUntil: 'networkidle2'
    });

    const bot = new Tinder(page, browser);

    await bot.login()
    await bot.findDate()
})();
