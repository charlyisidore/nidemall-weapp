// pages/auth/login/login.js
const util = require('../../../utils/util.js');
const user = require('../../../utils/user.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    canIUseGetUserProfile: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
  },

  handleLoginTap(event) {
    if (this.data.canIUseGetUserProfile) {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.doLogin(res.userInfo);
        },
        fail: () => {
          util.showErrorToast('微信登录失败');
        },
      });
    } else {
      if (undefined == event.detail.userInfo) {
        app.globalData.hasLogin = false;
        util.showErrorToast('微信登录失败');
        return;
      }
      this.doLogin(e.detail.userInfo);
    }
  },

  handleAccountLoginTap() {
    wx.navigateTo({ url: '/pages/auth/accountLogin/accountLogin' });
  },

  doLogin(userInfo) {
    user.checkLogin()
      .catch(() => {
        user.loginByWeixin(userInfo)
          .then(() => {
            app.globalData.hasLogin = true;
            wx.navigateBack({ delta: 1 });
          })
          .catch(() => {
            app.globalData.hasLogin = false;
            util.showErrorToast('微信登录失败');
          });
      });
  },
})
