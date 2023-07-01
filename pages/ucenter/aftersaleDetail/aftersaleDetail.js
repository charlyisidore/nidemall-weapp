// pages/ucenter/aftersaleDetail/aftersaleDetail.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    orderId: 0,
    order: {},
    orderGoods: [],
    aftersale: {},
    statusColumns: [
      '未申请',
      '已申请，待审核',
      '审核通过，待退款',
      '退款成功',
      '审核不通过，已拒绝',
    ],
    typeColumns: [
      '未收货退款',
      '不退货退款',
      '退货退款',
    ],
    fileList: [],
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      orderId: options.id,
    });
    this.loadAftersaleDetail();
  },

  loadAftersaleDetail() {
    wx.showLoading({ title: '加载中' });

    setTimeout(() => {
      wx.hideLoading();
    }, 2000);

    util.request(api.AftersaleDetail, { orderId: this.data.orderId })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            order: res.data.order,
            orderGoods: res.data.orderGoods,
            aftersale: res.data.aftersale,
            fileList: res.data.aftersale.pictures.map((url) => ({ url })),
          });
        }
        wx.hideLoading();
      });
  },
});
