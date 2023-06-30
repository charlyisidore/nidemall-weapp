// pages/ucenter/order/order.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    orderList: [],
    showType: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    try {
      var tab = wx.getStorageSync('tab');
      this.setData({
        showType: tab,
      });
    } catch (e) {}
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1,
      });
      this.loadOrderList();
    } else {
      wx.showToast({
        title: '没有更多订单了',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  },

  handleSwitchTabTap(event) {
    this.setData({
      orderList: [],
      showType: event.currentTarget.dataset.index,
      page: 1,
      limit: 10,
      totalPages: 1
    });
    this.loadOrderList();
  },

  loadOrderList() {
    util.request(api.OrderList, {
        showType: this.data.showType,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          orderList: this.data.orderList.concat(res.data.list),
          totalPages: res.data.pages,
        });
      });
  },
})
