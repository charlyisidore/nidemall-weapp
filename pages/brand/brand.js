// pages/brand/brand.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    brandList: [],
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadBrandList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1,
      });
    } else {
      return false;
    }
    this.loadBrandList();
  },

  loadBrandList() {
    wx.showLoading({
      title: '加载中...',
    });

    util.request(api.BrandList, {
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            brandList: this.data.brandList.concat(res.data.list),
            totalPages: res.data.pages,
          });
        }
        wx.hideLoading();
      });
  },
});
