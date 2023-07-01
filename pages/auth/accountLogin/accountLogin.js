// pages/auth/accountLogin/accountLogin.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    username: '',
    password: '',
    loginErrorCount: 0,
  },

  handleAccountLoginTap() {
    if (0 === this.data.password.length || 0 === this.data.username.length) {
      wx.showModal({
        title: '错误信息',
        content: '请输入用户名和密码',
        showCancel: false,
      });
      return false;
    }

    wx.request({
      url: api.AuthLoginByAccount,
      data: {
        username: this.data.username,
        password: this.data.password,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (0 == res.data.errno) {
          this.setData({
            loginErrorCount: 0,
          });
          app.globalData.hasLogin = true;
          wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.setStorage({
            key: 'token',
            data: res.data.data.token,
            success: () => {
              wx.switchTab({ url: '/pages/ucenter/index/index' });
            },
          });
        } else {
          this.setData({
            loginErrorCount: this.data.loginErrorCount + 1,
          });
          app.globalData.hasLogin = false;
          util.showErrorToast('账户登录失败');
        }
      },
    });
  },

  handleUsernameInput(event) {
    this.setData({
      username: event.detail.value,
    });
  },

  handlePasswordInput(event) {
    this.setData({
      password: event.detail.value,
    });
  },

  handleClearInputTap(event) {
    switch (event.currentTarget.id) {
      case 'clear-username':
        this.setData({
          username: '',
        });
        break;
      case 'clear-password':
        this.setData({
          password: '',
        });
        break;
      default:
        break;
    }
  },
});
