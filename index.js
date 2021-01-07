import loginToFacebook from '@pierreminiggio/facebook-login'
import scroll from '@pierreminiggio/puppeteer-page-scroller'
import puppeteer from 'puppeteer'

/**
 * @typedef {Object} FacebookPagePosterConfig
 * @property {boolean} show default false
 * 
 * @param {string} login
 * @param {string} password
 * @param {string} pageName
 * @param {string} content
 * @param {FacebookPagePosterConfig} config 
 * 
 * @returns {Promise<string>}
 */
export default function (login, password, pageName, content, config = {}) {

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

            const pageLink = 'https://www.facebook.com/' + pageName
            await page.goto(pageLink)
            const newPostSelector = '[aria-label="Créer une publication"]'
            await page.waitForSelector(newPostSelector)
            await page.click(newPostSelector)
            await page.waitForTimeout(3000)

            const postInputSelector = '[role="dialog"] [contenteditable="true"]'
            await page.waitForSelector(postInputSelector)
            await page.type(postInputSelector, content)

            await page.waitForTimeout(3000)

            const postButtonSelector = '[aria-label="Publier"]'
            await page.click(postButtonSelector)

            await page.waitForTimeout(5000)

            await page.goto(pageLink)

            await scroll(page, 3000)

            const emptyLinkSelector = 'a[href="#"][role="link"]'
            await page.waitForSelector(emptyLinkSelector)

            const emptyLink = await page.$(emptyLinkSelector)
            const emptyLinkBoundingBox = await emptyLink.boundingBox()
            await page.mouse.move(emptyLinkBoundingBox.x, emptyLinkBoundingBox.y)

            const startOfNewPostLink = pageLink + '/posts/'
            const newPostLinkSelector = 'a[href^="' + startOfNewPostLink + '"]'

            const postId = await page.evaluate((startOfNewPostLink, newPostLinkSelector) => {
                const postLinkElement = document.querySelector(newPostLinkSelector)
                return postLinkElement ? postLinkElement.href.split('?')[0].replace(
                    startOfNewPostLink,
                    ''
                ) : null
            }, startOfNewPostLink, newPostLinkSelector)

            await browser.close()
            resolve(postId)
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
 * @returns {void}
 */
function setDefaultConfig(config, configKey, defaultValue) {
    if (! (configKey in config)) {
        config[configKey] = defaultValue
    }
}
