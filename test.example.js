// Copy this file to test.js
// You can then test using npm test

import post from './index.js'

(async () => {
    console.log(await post(
        'Facebook login or email',
        'Facebook password',
        'Page name',
        {show: true}
    ))
})()
