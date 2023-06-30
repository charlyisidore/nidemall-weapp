// pages/ucenter/couponSelect/couponSelect.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    couponList: [],
    cartId: 0,
    couponId: 0,
    userCouponId: 0,
    grouponLinkId: 0,
    scrollTop: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    // 页面显示
    wx.showLoading({ title: '加载中...' });

    try {
      const cartId = wx.getStorageSync('cartId');
      if (!cartId) {
        cartId = 0;
      }
      const couponId = wx.getStorageSync('couponId');
      if (!couponId) {
        couponId = 0;
      }
      const userCouponId = wx.getStorageSync('userCouponId');
      if (!userCouponId) {
        userCouponId = 0;
      }
      const grouponRulesId = wx.getStorageSync('grouponRulesId');
      if (!grouponRulesId) {
        grouponRulesId = 0;
      }
      this.setData({
        cartId,
        couponId,
        userCouponId,
        grouponRulesId,
      });
    } catch (e) {
      console.log(e);
    }

    this.loadCouponList();
  },

  handleSelectCouponTap(event) {
    try {
      wx.setStorageSync('couponId', event.currentTarget.dataset.cid);
      wx.setStorageSync('userCouponId', event.currentTarget.dataset.id);
    } catch (e) {}
    wx.navigateBack();
  },

  handleUnselectCouponTap() {
    // 如果优惠券ID设置-1，则表示订单不使用优惠券
    try {
      wx.setStorageSync('couponId', -1);
      wx.setStorageSync('userCouponId', -1);
    } catch (e) {}
    wx.navigateBack();
  },

  loadCouponList() {
    this.setData({
      couponList: [],
    });

    // 页面渲染完成
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 2000,
    });

    util.request(api.CouponSelectList, {
        cartId: this.data.cartId,
        grouponRulesId: this.data.grouponRulesId,
      })
      .then((res) => {
        if (0 === res.errno) {
          const couponList = res.data.list.filter((coupon) => coupon.available);
          this.setData({
            couponList,
          });
        }
        wx.hideToast();
      });
  },
})
