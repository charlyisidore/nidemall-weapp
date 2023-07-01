// pages/ucenter/aftersale/aftersale.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    orderId: 0,
    orderInfo: {},
    orderGoods: [],
    aftersale: {
      pictures: [],
    },
    columns: [
      '未收货退款',
      '不退货退款',
      '退货退款',
    ],
    contentLength: 0,
    fileList: [],
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      orderId: options.id,
    });
    this.loadOrderDetail();
  },

  handleImageDelete(event) {
    const { fileList = [] } = this.data;
    fileList.splice(event.detail.index, 1);
    this.setData({
      fileList,
    });
  },

  handleImageAfterRead(event) {
    const { file } = event.detail;
    wx.uploadFile({
      url: api.StorageUpload,
      filePath: file.path,
      name: 'file',
      success: (res) => {
        res = JSON.parse(res.data);
        if (0 !== res.errno) {
          return;
        }
        const url = res.data.url;
        this.data.aftersale.pictures.push(url);
        const { fileList = [] } = this.data;
        fileList.push({ ...file, url });
        this.setData({
          fileList,
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
  },

  handleReasonChange(event) {
    this.setData({
      'aftersale.reason': event.detail,
    });
  },

  handleShowTypePickerTap() {
    this.setData({
      showPicker: true,
    });
  },

  handleCancel() {
    this.setData({
      showPicker: false,
    });
  },

  handleConfirm(event) {
    this.setData({
      'aftersale.type': event.detail.index,
      'aftersale.typeDesc': event.detail.value,
      showPicker: false,
    });
  },

  handleSubmitClick() {
    if (undefined == this.data.aftersale.type) {
      util.showErrorToast('请选择退款类型');
      return false;
    }

    if ('' == this.data.reason) {
      util.showErrorToast('请输入退款原因');
      return false;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true,
      success: () => {},
    });

    util.request(api.AftersaleSubmit, this.data.aftersale, 'POST')
      .then((res) => {
        wx.hideLoading();
        if (0 !== res.errno) {
          util.showErrorToast(res.errmsg);
          return;
        }
        wx.showToast({
          title: '申请售后成功',
          icon: 'success',
          duration: 2000,
          complete: () => {
            wx.switchTab({ url: '/pages/ucenter/index/index' });
          },
        });
      });
  },

  loadOrderDetail() {
    wx.showLoading({ title: '加载中' });

    setTimeout(() => {
      wx.hideLoading();
    }, 2000);

    util.request(api.OrderDetail, { orderId: this.data.orderId })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            orderInfo: res.data.orderInfo,
            orderGoods: res.data.orderGoods,
            'aftersale.orderId': this.data.orderId,
            'aftersale.amount': res.data.orderInfo.actualPrice - res.data.orderInfo.freightPrice,
          });
        }
        wx.hideLoading();
      });
  },
});
