// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad() {

    const nobj = {
      name:'whb'
    }
    const a = nobj?.age
    const b = nobj.age ?? 'bhw'
    console.log('a,b =>' , a,b );
    const list = [1,2,3,4,5]
    const c = list.find(i => i === 1)
    class Circle {}
    const cir = new Circle()
    console.log('cir =>' , cir );

    new Promise((res, rej) => {
      console.log('res =>' , res );
    })

    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      })
    })
  }
})
