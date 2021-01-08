import axios from 'axios'
import Vue from 'vue'
import { getChromeStorage } from './utils'
Vue.prototype.$axios = axios    //全局注册，使用方法为:this.$axios

axios.defaults.baseURL = ''
axios.defaults.timeout = 10000
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'

// 请求拦截器
axios.interceptors.request.use(
    async (config) => {
        try {
            const res = await getChromeStorage(['userInfo'])
            if (res.userInfo) {
                config.headers.Token = res.userInfo.token
            }
        } catch (error) {
            console.error(error)
        }
        return config
    },
    error => {
        return Promise.error(error)
    })

// 响应拦截器
axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    // 服务器状态码不是200的情况
    error => {
        if (error.response.status === 401) {
            return Promise.reject(error.response)
        }
    }
)

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err.data)
        })
    })
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params,headers) {
    return new Promise((resolve, reject) => {
        axios.post(url, params,headers)
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err.data)
            })
    })
}
 // 获取浏览器origin
export function origin() {
    let origin = document.location.origin
    return origin
}
