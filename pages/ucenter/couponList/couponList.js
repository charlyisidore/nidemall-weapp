// pages/ucenter/couponList/couponList.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    couponList: [],
    code: '',
    status: 0,
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

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadCouponList();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  handleExchangeInput(event) {
    this.setData({
      code: event.detail.value,
    });
  },

  handleClearExchangeTap() {
    this.setData({
      code: '',
    });
  },

  handleGoExchangeTap() {
    if (0 === this.data.code.length) {
      util.showErrorToast('请输入兑换码');
      return;
    }
    util.request(api.CouponExchange, { code: this.data.code }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          util.showErrorToast(res.errmsg);
          return;
        }
        this.loadCouponList();
        this.setData({
          code: '',
        });
        wx.showToast({
          title: '领取成功',
          duration: 2000,
        });
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

  handleSwitchTabTap(event) {
    this.setData({
      couponList: [],
      status: event.currentTarget.dataset.index,
      page: 1,
      limit: 10,
      count: 0,
      scrollTop: 0,
      showPage: false,
    });
    this.loadCouponList();
  },

  loadCouponList() {
    this.setData({
      scrollTop: 0,
      showPage: false,
      couponList: [],
    });
    util.request(api.CouponMyList, {
        status: this.data.status,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          scrollTop: 0,
          couponList: res.data.list,
          showPage: (res.data.total > this.data.limit),
          count: res.data.total,
        });
      });
  },
});
