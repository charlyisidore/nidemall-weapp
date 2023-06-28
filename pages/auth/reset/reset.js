// pages/auth/reset/reset.js
const api = require('../../../config/api.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    mobile: '',
    code: '',
    password: '',
    confirmPassword: '',
  },

  handleSendCodeTap() {
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
      },
    });
  },

  handleStartResetTap() {
    if (0 == this.data.mobile.length || 0 == this.data.code.length) {
      wx.showModal({
        title: '错误信息',
        content: '手机号和验证码不能为空',
        showCancel: false,
      });
      return false;
    }

    if (this.data.password.length < 3) {
      wx.showModal({
        title: '错误信息',
        content: '用户名和密码不得少于3位',
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

    wx.request({
      url: api.AuthReset,
      data: {
        mobile: this.data.mobile,
        code: this.data.code,
        password: this.data.password,
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (0 == res.data.errno) {
          wx.navigateBack();
        } else {
          wx.showModal({
            title: '密码重置失败',
            content: res.data.errmsg,
            showCancel: false,
          });
        }
      },
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
})
