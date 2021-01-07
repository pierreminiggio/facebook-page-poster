import puppeteer from 'puppeteer'
import loginToFacebook from '@pierreminiggio/facebook-login'

/**
 * @typedef {Object} FacebookPagePosterConfig
 * @property {boolean} show default false
 * 
 * @param {string} login
 * @param {string} password
 * @param {string} pageName
 * @param {FacebookPagePosterConfig} config 
 * 
 * @returns {Promise}
 */
export default function (login, password, pageName, config = {}) {

    return new Promise(async (resolve, reject) => {

        setDefaultConfig(config, 'show', false)

        let browser
        try {
            browser = await puppeteer.launch({
                headless: ! config.show,
                args: [
                    '--disable-notifications',
                    '--no-sandbox'
                ]
            })
        } catch (e) {
            reject(e)
            return
        }
        
        try {
            const page = await browser.newPage()

            await loginToFacebook(page, login, password)

            await page.goto('https://www.facebook.com/' . pageName)

            

            await browser.close()
            resolve()
        } catch (e) {
            await browser.close()
            reject(e)
        }
    })
}

/**
 * @param {FacebookPagePosterConfig} config 
 * @param {string} configKey 
 * @param {*} defaultValue
 * 
 * @returns void
 */
function setDefaultConfig(config, configKey, defaultValue) {
    if (! (configKey in config)) {
        config[configKey] = defaultValue
    }
}
