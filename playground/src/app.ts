import './app.json'
import './app.scss'
import './project.private.config.json'
import './project.config.json'

import { test } from './test'
test()
// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    const nobj = {
      name: 'whb',
    }

    const list = [1, 2, 3, 4, 5]
    const c = list.find((i) => i === 1)

    class Circle {}
    const cir = new Circle()
    console.log('cir =>', cir)
    new Promise((res, rej) => {
      console.log('res =>', res)
    })
    // 登录
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
  globalData: {
    userInfo: null,
  },
})
