import api from './api.js'

let loginUrl = ''
let apiUrl = ''

// 环境
const nodeEnv = 2
if (nodeEnv === 0) {
    loginUrl = 'http://10.0.0.212:6108'
    apiUrl = 'http://10.0.0.212:6114'

    // loginUrl = 'http://10.0.0.140:6108'
    // apiUrl = 'http://10.0.0.36:6114'
} else if (nodeEnv === 1) {
    loginUrl = 'https://peachlogin-cs.jk.100cbc.com'
    apiUrl = 'https://rpplugin-cs.jk.100cbc.com'
} else if (nodeEnv === 2) {
    loginUrl = 'https://peachlogin.jk.100cbc.com'
    apiUrl = 'https://rpplugin.jk.100cbc.com'
}

const subList = [
    {
        name: "api/peachLogin",
        url: loginUrl
    },
    {
        name: "api/autoreview",
        url: apiUrl
    }
];

let keys = Object.keys(api)
for (let i = 0; i < keys.length; i++) {
    let url = api[keys[i]]
    let obj = subList.find(item => {
        return url.indexOf([item.name]) > -1
    })
    api[keys[i]] = `${obj.url}/${url}`
}

export default api