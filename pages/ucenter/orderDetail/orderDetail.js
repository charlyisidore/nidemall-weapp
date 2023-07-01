// pages/ucenter/orderDetail/orderDetail.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    expressInfo: {},
    flag: false,
    handleOption: {},
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      orderId: options.id,
    });
    this.loadOrderDetail();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadOrderDetail();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  handleExpandDetailTap() {
    this.setData({
      flag: !this.data.flag,
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
            util.redirect('/pages/ucenter/order/order');
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

  handleCancelOrderTap() {
    const orderInfo = this.data.orderInfo;
    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        util.request(api.OrderCancel, { orderId: orderInfo.id }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              util.showErrorToast(res.errmsg);
              return;
            }
            wx.showToast({ title: '取消订单成功' });
            util.redirect('/pages/ucenter/order/order');
          });
      },
    });
  },

  handleRefundOrderTap() {
    const orderInfo = this.data.orderInfo;
    wx.showModal({
      title: '',
      content: '确定要取消此订单？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        util.request(api.OrderRefund, { orderId: orderInfo.id }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              util.showErrorToast(res.errmsg);
              return;
            }
            wx.showToast({ title: '取消订单成功' });
            util.redirect('/pages/ucenter/order/order');
          });
      },
    });
  },

  handleDeleteOrderTap() {
    const orderInfo = this.data.orderInfo;
    wx.showModal({
      title: '',
      content: '确定要删除此订单？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        util.request(api.OrderDelete, { orderId: orderInfo.id }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              util.showErrorToast(res.errmsg);
              return;
            }
            wx.showToast({ title: '删除订单成功' });
            util.redirect('/pages/ucenter/order/order');
          });
      },
    });
  },

  handleConfirmOrderTap() {
    const orderInfo = this.data.orderInfo;
    wx.showModal({
      title: '',
      content: '确认收货？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        util.request(api.OrderConfirm, { orderId: orderInfo.id }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              util.showErrorToast(res.errmsg);
              return;
            }
            wx.showToast({ title: '确认收货成功！' });
            util.redirect('/pages/ucenter/order/order');
          });
      },
    });
  },

  handleAftersaleOrderTap() {
    if (0 === this.data.orderInfo.aftersaleStatus) {
      util.redirect(`/pages/ucenter/aftersale/aftersale?id=${this.data.orderId}`);
    } else {
      util.redirect(`/pages/ucenter/aftersaleDetail/aftersaleDetail?id=${this.data.orderId}`);
    }
  },

  loadOrderDetail() {
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(() => {
      wx.hideLoading();
    }, 2000);

    util.request(api.OrderDetail, { orderId: this.data.orderId })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            orderInfo: res.data.orderInfo,
            orderGoods: res.data.orderGoods,
            handleOption: res.data.orderInfo.handleOption,
            expressInfo: res.data.expressInfo,
          });
        }
        wx.hideLoading();
      });
  },
});
