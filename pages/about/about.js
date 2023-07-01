// pages/about/about.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    name: 'nidemall',
    address: 'https://github.com/charlyisidore/nidemall-weapp',
    latitude: '31.201900',
    longitude: '121.587839',
    phone: '021-xxxx-xxxx',
    qq: '705144434',
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    util.request(api.AboutUrl)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
          qq: res.data.qq,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
        });
      });
  },

  handleShowLocationTap() {
    wx.openLocation({
      latitude: parseFloat(this.data.latitude),
      longitude: parseFloat(this.data.longitude),
      name: this.data.name,
      address: this.data.address,
    });
  },

  handleCallPhoneTap() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
    });
  },
});
