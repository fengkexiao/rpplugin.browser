import api from './../api'
import { get, post } from './../http'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let key = Object.keys(request)
    switch (key[0]) {
        case 'login':
            login(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'dosageSearch':
            dosageSearch(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'logout':
            logout(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'pddCheck':
            pddCheck(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'pddFlushInfo':
            pddFlushInfo(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'meituanCheck':
            meituanCheck(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'meituanFlushInfo':
            meituanFlushInfo(JSON.parse(request[key[0]]), sendResponse)
            break;
        case 'medicineList':
            medicineList(JSON.parse(request[key[0]]), sendResponse)
            break;
    }
    return true;
});


/**
 * 登录
 * @param {}} params 
 * @param {*} sendResponse 
 */
function login (params, sendResponse) {
    let headers = {
        pluginCode: params.originStatus === 1 ? "rp_pdd_plugin" : "rp_meituan_plugin",
        version: "v1.3" //接口版本号控制
    }
    delete params.originStatus
    post(api.API_RPPLUGIN_POST_LOGIN, params, {headers:headers}).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 根据药品规格查询用法用量
 * @param {*} params 
 * @param {*} sendResponse 
 */
function dosageSearch (params, sendResponse) {
    get(api.API_AUTOREVIEW_GET_DOSAGESEARCH, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 退出登录
 * @param {*} params 
 * @param {*} sendResponse 
 */
function logout (params, sendResponse) {
    post(api.API_RPPLUGIN_POST_LOGOUT, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 合理用药监测-拼多多
 * @param {*} params 
 * @param {*} sendResponse 
 */
function pddCheck (params, sendResponse) {
    post(api.API_AUTOREVIEW_POST_PDDCHECK, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 药品规程-拼多多
 * @param {*} params 
 * @param {*} sendResponse 
 */
function pddFlushInfo (params, sendResponse) {
    post(api.API_AUTOREVIEW_POST_PDDFLUSHINFO, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 合理用药监测--美团
 * @param {*} params 
 * @param {*} sendResponse 
 */
function meituanCheck (params, sendResponse) {
    post(api.API_AUTOREVIEW_POST_MEITUANCHECK, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}

/**
 * 药品规程-美团
 * @param {*} params 
 * @param {*} sendResponse 
 */
function meituanFlushInfo (params, sendResponse) {
    post(api.API_AUTOREVIEW_POST_MEITUANFLUSHINFO, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}
/**
 * 药品说明书列表
 * @param {*} params 
 * @param {*} sendResponse 
 */
function medicineList (params, sendResponse) {
    get(api.API_AUTOREVIEW_GET_LIST, params).then((res) => {
        sendResponse(JSON.stringify(res));
    }).catch(res => {
        sendResponse(JSON.stringify(res));
    })
}