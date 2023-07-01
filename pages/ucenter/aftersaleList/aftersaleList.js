// pages/ucenter/aftersaleList/aftersaleList.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    aftersaleList: [],
    showType: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    this.loadAftersaleList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1,
      });
      this.loadAftersaleList();
    } else {
      wx.showToast({
        title: '没有更多售后了',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  },

  handleSwitchTabTap(event) {
    this.setData({
      aftersaleList: [],
      showType: event.currentTarget.dataset.index,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    this.loadAftersaleList();
  },

  loadAftersaleList() {
    util.request(api.AftersaleList, {
        status: this.data.showType,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          aftersaleList: this.data.aftersaleList.concat(res.data.list),
          totalPages: res.data.pages,
        });
      });
  },
});
