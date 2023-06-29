// pages/payResult/payResult.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    status: false,
    orderId: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      orderId: options.orderId,
      status: ('1' === options.status),
    });
  },

  handlePayOrderTap() {
    util.request(api.OrderPrepay, { orderId: this.data.orderId }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        const payParam = res.data;
        console.log('支付过程开始');
        wx.requestPayment({
          timeStamp: payParam.timeStamp,
          nonceStr: payParam.nonceStr,
          package: payParam.packageValue,
          signType: payParam.signType,
          paySign: payParam.paySign,
          success: () => {
            console.log('支付过程成功');
            this.setData({
              status: true,
            });
          },
          fail: () => {
            console.log('支付过程失败');
            util.showErrorToast('支付失败');
          },
          complete: () => {
            console.log('支付过程结束');
          },
        });
      });
  },
})
