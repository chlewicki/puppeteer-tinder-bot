const puppeteer = require('puppeteer');
require('dotenv').config();

const sleep = async (mil) => {
    return new Promise(resolve => setTimeout(resolve, mil));
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();

    // allow geolocation
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://tinder.com", ["geolocation"]);
    const client = await page.target().createCDPSession();
    await client.send("Network.enable");
    await client.send("Emulation.setGeolocationOverride", {
        latitude: 52.2412786,
        longitude: 21.0898869,
        accuracy: 100
    });
    await page.goto('https://tinder.com', {
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
    const like = async () => {
        try {
            const [buttonLike] = await page.$x('//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/button[3]')
            buttonLike.click()
        } catch (err) {
            console.error(err)
        }
    }
    const closePopup = async () => {
        try {
            const [buttonPopup] = await page.$x('//*[@id="modal-manager"]/div/div/div[2]/button[2]')
            buttonPopup.click()
        } catch (err) {
            console.error(err)
        }
    }
    const closeMatch = async () => {
        try {
            const [buttonMatch] = await page.$x('//*[@id="modal-manager-canvas"]/div/div/div[1]/div/div[3]/a')
            buttonMatch.click()
        } catch (err) {
            console.error(err)
        }
    }
    await sleep(3000)
    await login()

    await sleep(5000)

    let swipe = true;
    while (swipe) {
        await sleep(1000);
        try {
            await like();
        } catch (err) {
            try {
                await closePopup();
            } catch (err) {
                try {
                    await closeMatch();
                } catch (err) {
                    swipe = false
                    await browser.close();
                }
            }
        }
    }
})();
