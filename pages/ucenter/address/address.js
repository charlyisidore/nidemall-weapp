// pages/ucenter/address/address.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    addressList: [],
    total: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    this.loadAddressList();
  },

  handleAddressAddOrUpdateTap(event) {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    const addressId = event.currentTarget.dataset.addressId;

    if ('pages/checkout/checkout' == prevPage.route) {
      try {
        wx.setStorageSync('addressId', addressId);
      } catch (e) {}

      if (addressId) {
        wx.navigateBack();
      } else {
        wx.navigateTo({ url: `/pages/ucenter/addressAdd/addressAdd?id=${addressId}` });
      }
    } else {
      wx.navigateTo({ url: `/pages/ucenter/addressAdd/addressAdd?id=${addressId}` });
    }
  },

  handleDeleteAddressTap(event) {
    wx.showModal({
      title: '',
      content: '确定要删除地址？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        const addressId = event.target.dataset.addressId;
        util.request(api.AddressDelete, { id: addressId }, 'POST')
          .then((res) => {
            if (0 !== res.errno) {
              return;
            }
            this.loadAddressList();
            wx.removeStorage({
              key: 'addressId',
              success: () => {},
            });
          });
        console.log('用户点击确定');
      },
    });
    return false;
  },

  loadAddressList() {
    util.request(api.AddressList)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          addressList: res.data.list,
          total: res.data.total,
        });
      });
  },
})
