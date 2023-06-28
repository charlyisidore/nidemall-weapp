// index.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    coupon: [],
    goodsCount: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.scene) {
      // 这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      const scene = decodeURIComponent(options.scene);
      console.log(`scene: ${scene}`);

      const [type, id] = scene.split(',');
      switch (type) {
        case 'goods':
          wx.navigateTo({ url: `../goods/goods?id=${id}` });
          break;
        case 'groupon':
          wx.navigateTo({ url: `../goods/goods?grouponId=${id}` });
          break;
        default:
          wx.navigateTo({ url: '../index/index' });
          break;
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.grouponId) {
      // 这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({ url: `../goods/goods?grouponId=${options.grouponId}` });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.goodId) {
      // 这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({ url: `../goods/goods?id=${options.goodId}` });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.orderId) {
      // 这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({ url: `../ucenter/orderDetail/orderDetail?id=${options.orderId}` });
    }

    this.loadIndexData();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.loadIndexData();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
  onShareAppMessage: function() {
    return {
      title: 'nidemall小程序商场',
      desc: '开源微信小程序商城',
      path: '/pages/index/index',
    };
  },

  loadIndexData: function() {
    util.request(api.IndexUrl)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brands: res.data.brandList,
          floorGoods: res.data.floorGoodsList,
          banner: res.data.banner,
          groupons: res.data.grouponList,
          channel: res.data.channel,
          coupon: res.data.couponList,
        });
      });

    util.request(api.GoodsCount)
      .then((res) => {
        this.setData({
          goodsCount: res.data,
        });
      });
  },

  handleCouponTap(event) {
    const couponId = event.currentTarget.dataset.index;
    util.request(api.CouponReceive, { couponId: couponId }, 'POST')
      .then((res) => {
        if (0 === res.errno) {
          wx.showToast({ title: '领取成功' });
        } else {
          util.showErrorToast(res.errmsg);
        }
      });
  },
})
