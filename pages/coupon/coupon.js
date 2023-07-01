// pages/coupon/coupon.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    couponList: [],
    page: 1,
    limit: 10,
    count: 0,
    scrollTop: 0,
    showPage: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadCouponList();
  },

  handleGetCouponTap(event) {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/auth/login/login' });
      return;
    }

    const couponId = event.currentTarget.dataset.index;
    util.request(api.CouponReceive, { couponId }, 'POST')
      .then((res) => {
        if (0 === res.errno) {
          wx.showToast({ title: '领取成功' });
        } else {
          util.showErrorToast(res.errmsg);
        }
      });
  },

  handleNextPageTap() {
    if (this.data.page > this.data.count / this.data.limit) {
      return true;
    }
    this.setData({
      page: this.data.page + 1,
    });
    this.loadCouponList();
  },

  handlePrevPageTap() {
    if (this.data.page <= 1) {
      return false;
    }
    this.setData({
      page: this.data.page - 1,
    });
    this.loadCouponList();
  },

  loadCouponList() {
    this.setData({
      scrollTop: 0,
      showPage: false,
      couponList: [],
    });

    // 页面渲染完成
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 2000,
    });

    util.request(api.CouponList, {
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            scrollTop: 0,
            couponList: res.data.list,
            showPage: true,
            count: res.data.total,
          });
        }
        wx.hideToast();
      });
  },
});
