// pages/ucenter/index/index.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    userInfo: {
      nickName: '点击登录',
      avatarUrl: '/static/images/my.png',
    },
    order: {
      unpaid: 0,
      unship: 0,
      unrecv: 0,
      uncomment: 0,
    },
    hasLogin: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    if (!app.globalData.hasLogin) {
      return;
    }

    this.setData({
      userInfo: wx.getStorageSync('userInfo'),
      hasLogin: true,
    });

    util.request(api.UserIndex)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          order: res.data.order,
        });
      });
  },

  handleLoginTap() {
    if (this.data.hasLogin) {
      return;
    }
    this.navigateToLogin();
  },

  handleOrderTap() {
    if (!this.data.hasLogin) {
      this.navigateToLogin();
      return;
    }

    try {
      wx.setStorageSync('tab', 0);
    } catch (e) {}

    wx.navigateTo({ url: '/pages/ucenter/order/order' });
  },

  handleOrderIndexTap(event) {
    if (!this.data.hasLogin) {
      this.navigateToLogin();
      return;
    }

    const tab = event.currentTarget.dataset.index;
    const route = event.currentTarget.dataset.route;

    try {
      wx.setStorageSync('tab', tab);
    } catch (e) {}

    wx.navigateTo({
      url: route,
      success: () => {},
      fail: () => {},
      complete: () => {},
    });
  },

  handleGetPhoneNumber(event) {
    if ('getPhoneNumber:ok' !== event.detail.errMsg) {
      // 拒绝授权
      return;
    }

    if (!this.data.hasLogin) {
      wx.showToast({
        title: '绑定失败：请先登录',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    util.request(api.AuthBindPhone, {
        iv: event.detail.iv,
        encryptedData: event.detail.encryptedData,
      }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        wx.showToast({
          title: '绑定手机号码成功',
          icon: 'success',
          duration: 2000,
        });
      });
  },

  handleCouponTap() {
    this.navigateToRequireLogin('/pages/ucenter/couponList/couponList');
  },

  handleGrouponTap() {
    this.navigateToRequireLogin('/pages/groupon/myGroupon/myGroupon');
  },

  handleCollectTap() {
    this.navigateToRequireLogin('/pages/ucenter/collect/collect');
  },

  handleFeedbackTap() {
    this.navigateToRequireLogin('/pages/ucenter/feedback/feedback');
  },

  handleFootprintTap() {
    this.navigateToRequireLogin('/pages/ucenter/footprint/footprint');
  },

  handleAddressTap() {
    this.navigateToRequireLogin('/pages/ucenter/address/address');
  },

  handleAftersaleTap() {
    this.navigateToRequireLogin('/pages/ucenter/aftersaleList/aftersaleList');
  },

  handleAboutUsTap() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  handleHelpTap() {
    wx.navigateTo({ url: '/pages/help/help' });
  },

  handleLogoutTap() {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        util.request(api.AuthLogout, {}, 'POST');
        app.globalData.hasLogin = false;
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  },

  navigateToRequireLogin(url) {
    if (this.data.hasLogin) {
      wx.navigateTo({ url });
    } else {
      wx.navigateToLogin();
    }
  },

  navigateToLogin() {
    wx.navigateTo({ url: '/pages/auth/login/login' });
  },
})
