// pages/ucenter/feedback/feedback.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    array: [
      '请选择反馈类型',
      '商品相关',
      '功能异常',
      '优化建议',
      '其他',
    ],
    index: 0,
    content: '',
    contentLength: 0,
    mobile: '',
    hasPicture: false,
    picUrls: [],
    files: [],
  },

  handleChooseImageTap() {
    if (this.data.files.length >= 5) {
      util.showErrorToast('只能上传五张图片');
      return false;
    }

    // https://developers.weixin.qq.com/miniprogram/dev/api/media/video/wx.chooseMedia.html
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          files: this.data.files.concat(res.tempFilePaths),
        });
        this.upload(res);
      },
    });
  },

  handlePreviewImageTap(event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files, // 需要预览的图片http链接列表
    });
  },

  handlePickerChange(event) {
    this.setData({
      index: event.detail.value,
    });
  },

  handleMobileInput(event) {
    this.setData({
      mobile: event.detail.value,
    });
  },

  handleContentInput(event) {
    this.setData({
      contentLength: event.detail.cursor,
      content: event.detail.value,
    });
  },

  handleClearMobileTap() {
    this.setData({
      mobile: '',
    });
  },

  handleSubmitFeedbackTap() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/auth/login/login' });
    }
    if (0 == this.data.index) {
      util.showErrorToast('请选择反馈类型');
      return false;
    }
    if ('' == this.data.content) {
      util.showErrorToast('请输入反馈内容');
      return false;
    }
    if ('' == this.data.mobile) {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true,
      success: () => {},
    });

    util.request(api.FeedbackAdd, {
        mobile: this.data.mobile,
        feedType: this.data.array[this.data.index],
        content: this.data.content,
        hasPicture: this.data.hasPicture,
        picUrls: this.data.picUrls
      }, 'POST')
      .then((res) => {
        wx.hideLoading();
        if (0 !== res.errno) {
          util.showErrorToast(res.errmsg);
          return;
        }
        wx.showToast({
          title: '感谢您的反馈！',
          icon: 'success',
          duration: 2000,
          complete: () => {
            this.setData({
              index: 0,
              content: '',
              contentLength: 0,
              mobile: '',
              hasPicture: false,
              picUrls: [],
              files: [],
            });
          },
        });
      });
  },

  upload(res) {
    const uploadTask = wx.uploadFile({
      url: api.StorageUpload,
      filePath: res.tempFilePaths[0],
      name: 'file',
      success: (res) => {
        res = JSON.parse(res.data);
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          hasPicture: true,
          picUrls: this.data.picUrls.concat([res.data.url]),
        });
      },
      fail: () => {
        wx.showModal({
          title: '错误',
          content: '上传失败',
          showCancel: false,
        });
      },
    });

    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress);
      console.log('已经上传的数据长度', res.totalBytesSent);
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend);
    });
  },
})
