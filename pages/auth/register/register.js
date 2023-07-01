// pages/auth/register/register.js
const api = require('../../../config/api.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    code: '',
  },

  handleSendCodeTap() {
    if (0 == this.data.mobile.length) {
      wx.showModal({
        title: '错误信息',
        content: '手机号不能为空',
        showCancel: false,
      });
      return false;
    }

    wx.request({
      url: api.AuthRegisterCaptcha,
      data: {
        mobile: this.data.mobile,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (0 == res.data.errno) {
          wx.showModal({
            title: '发送成功',
            content: '验证码已发送',
            showCancel: false,
          });
        } else {
          wx.showModal({
            title: '错误信息',
            content: res.data.errmsg,
            showCancel: false,
          });
        }
      }
    });
  },

  handleStartRegisterTap() {
    if (this.data.password.length < 6 || this.data.username.length < 6) {
      wx.showModal({
        title: '错误信息',
        content: '用户名和密码不得少于6位',
        showCancel: false,
      });
      return false;
    }

    if (this.data.password != this.data.confirmPassword) {
      wx.showModal({
        title: '错误信息',
        content: '确认密码不一致',
        showCancel: false,
      });
      return false;
    }

    if (0 == this.data.mobile.length || 0 == this.data.code.length) {
      wx.showModal({
        title: '错误信息',
        content: '手机号和验证码不能为空',
        showCancel: false,
      });
      return false;
    }

    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.showModal({
            title: '错误信息',
            content: '注册失败',
            showCancel: false,
          });
        }
        this.requestRegister(res.code);
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

  handleConfirmPasswordInput(event) {
    this.setData({
      confirmPassword: event.detail.value,
    });
  },

  handleMobileInput(event) {
    this.setData({
      mobile: event.detail.value,
    });
  },

  handleCodeInput(event) {
    this.setData({
      code: event.detail.value,
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
      case 'clear-confirm-password':
        this.setData({
          confirmPassword: '',
        });
        break;
      case 'clear-mobile':
        this.setData({
          mobile: '',
        });
        break;
      case 'clear-code':
        this.setData({
          code: '',
        });
        break;
    }
  },

  requestRegister(wxCode) {
    wx.request({
      url: api.AuthRegister,
      data: {
        username: this.data.username,
        password: this.data.password,
        mobile: this.data.mobile,
        code: this.data.code,
        wxCode,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (0 == res.data.errno) {
          app.globalData.hasLogin = true;
          wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.setStorage({
            key: "token",
            data: res.data.data.token,
            success: () => {
              wx.switchTab({ url: '/pages/ucenter/index/index' });
            },
          });
        } else {
          wx.showModal({
            title: '错误信息',
            content: res.data.errmsg,
            showCancel: false,
          });
        }
      }
    });
  },
});
