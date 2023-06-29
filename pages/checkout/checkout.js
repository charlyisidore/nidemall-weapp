// pages/checkout/checkout.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, // 商品总价
    freightPrice: 0.00, // 快递费
    couponPrice: 0.00, // 优惠券的价格
    grouponPrice: 0.00, // 团购优惠价格
    orderTotalPrice: 0.00, // 订单总价
    actualPrice: 0.00, // 实际需要支付的总价
    cartId: 0,
    addressId: 0,
    couponId: 0,
    userCouponId: 0,
    message: '',
    grouponLinkId: 0, // 参与的团购
    grouponRulesId: 0, // 团购规则ID
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    // 页面显示
    wx.showLoading({ title: '加载中...' });

    try {
      let cartId = wx.getStorageSync('cartId');
      if ('' === cartId) {
        cartId = 0;
      }
      let addressId = wx.getStorageSync('addressId');
      if ('' === addressId) {
        addressId = 0;
      }
      let couponId = wx.getStorageSync('couponId');
      if ('' === couponId) {
        couponId = 0;
      }
      let userCouponId = wx.getStorageSync('userCouponId');
      if ('' === userCouponId) {
        userCouponId = 0;
      }
      let grouponRulesId = wx.getStorageSync('grouponRulesId');
      if ('' === grouponRulesId) {
        grouponRulesId = 0;
      }
      let grouponLinkId = wx.getStorageSync('grouponLinkId');
      if ('' === grouponLinkId) {
        grouponLinkId = 0;
      }

      this.setData({
        cartId: cartId,
        addressId: addressId,
        couponId: couponId,
        userCouponId: userCouponId,
        grouponRulesId: grouponRulesId,
        grouponLinkId: grouponLinkId,
      });
    } catch (e) {
      console.log(e);
    }

    this.loadCheckoutInfo();
  },

  handleSelectAddressTap() {
    wx.navigateTo({ url: '/pages/ucenter/address/address' });
  },

  handleSelectCouponTap() {
    wx.navigateTo({ url: '/pages/ucenter/couponSelect/couponSelect' });
  },

  handleMessageInput(event) {
    this.setData({
      message: event.detail.value,
    });
  },

  handleSubmitOrderTap() {
    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }

    util.request(api.OrderSubmit, {
        cartId: this.data.cartId,
        addressId: this.data.addressId,
        couponId: this.data.couponId,
        userCouponId: this.data.userCouponId,
        message: this.data.message,
        grouponRulesId: this.data.grouponRulesId,
        grouponLinkId: this.data.grouponLinkId,
      }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          util.showErrorToast(res.errmsg);
          return;
        }

        // 下单成功，重置couponId
        try {
          wx.setStorageSync('couponId', 0);
        } catch (error) {}

        const orderId = res.data.orderId;
        const grouponLinkId = res.data.grouponLinkId;
        const payed = res.data.payed;

        if (payed) {
          wx.redirectTo({ url: `/pages/payResult/payResult?status=1&orderId=${orderId}` });
          return;
        }

        util.request(api.OrderPrepay, { orderId }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              wx.redirectTo({ url: `/pages/payResult/payResult?status=0&orderId=${orderId}` });
              return;
            }

            const payParam = res.data;
            console.log('支付过程开始');

            wx.requestPayment({
              timeStamp: payParam.timeStamp,
              nonceStr: payParam.nonceStr,
              package: payParam.packageValue,
              signType: payParam.signType,
              paySign: payParam.paySign,
              success: () => {
                console.log('支付过程成功');
                if (!grouponLinkId) {
                  wx.redirectTo({ url: `/pages/payResult/payResult?status=1&orderId=${orderId}` });
                }
                setTimeout(() => {
                  wx.redirectTo({ url: `/pages/groupon/grouponDetail/grouponDetail?id=${grouponLinkId}` });
                }, 1000);
              },
              fail: () => {
                console.log('支付过程失败');
                wx.redirectTo({ url: `/pages/payResult/payResult?status=0&orderId=${orderId}` });
              },
              complete: () => {
                console.log('支付过程结束');
              },
            });
          });
      });
  },

  loadCheckoutInfo() {
    util.request(api.CartCheckout, {
        cartId: this.data.cartId,
        addressId: this.data.addressId,
        couponId: this.data.couponId,
        userCouponId: this.data.userCouponId,
        grouponRulesId: this.data.grouponRulesId,
      })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            checkedGoodsList: res.data.checkedGoodsList,
            checkedAddress: res.data.checkedAddress,
            availableCouponLength: res.data.availableCouponLength,
            actualPrice: res.data.actualPrice,
            couponPrice: res.data.couponPrice,
            grouponPrice: res.data.grouponPrice,
            freightPrice: res.data.freightPrice,
            goodsTotalPrice: res.data.goodsTotalPrice,
            orderTotalPrice: res.data.orderTotalPrice,
            addressId: res.data.addressId,
            couponId: res.data.couponId,
            userCouponId: res.data.userCouponId,
            grouponRulesId: res.data.grouponRulesId,
          });
        }
        wx.hideLoading();
      });
  },
})
