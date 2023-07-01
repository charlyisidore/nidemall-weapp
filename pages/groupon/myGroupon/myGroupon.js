// pages/groupon/myGroupon/myGroupon.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    orderList: [],
    showType: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    this.loadOrderList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadOrderList();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  handleSwitchTabTap(event) {
    this.setData({
      showType: event.currentTarget.dataset.index,
    });
    this.loadOrderList();
  },

  loadOrderList() {
    util.request(api.GroupOnMy, { showType: this.data.showType })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          orderList: res.data.list,
        });
      });
  },
});
