// pages/groupon/grouponList/grouponList.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    grouponList: [],
    page: 1,
    limit: 10,
    count: 0,
    scrollTop: 0,
    showPage: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadGrouponList();
  },

  loadGrouponList() {
    this.setData({
      scrollTop: 0,
      showPage: false,
      grouponList: [],
    });

    // 页面渲染完成
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 2000,
    });

    util.request(api.GroupOnList, {
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            scrollTop: 0,
            grouponList: res.data.list,
            showPage: true,
            count: res.data.total,
          });
        }
        wx.hideToast();
      });
  },

  handleNextPageTap() {
    if (this.data.page > this.data.count / this.data.limit) {
      return true;
    }
    this.setData({
      page: this.data.page + 1,
    });
    this.loadGrouponList();
  },

  handlePrevPageTap() {
    if (this.data.page <= 1) {
      return false;
    }
    this.setData({
      page: this.data.page - 1,
    });
    this.loadGrouponList();
  },
});
