// pages/brandDetail/brandDetail.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    id: 0,
    brand: {},
    goodsList: [],
    page: 1,
    limit: 10,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.setData({
      id: parseInt(options.id),
    });
    this.loadBrand();
  },

  loadBrand() {
    util.request(api.BrandDetail, { id: this.data.id })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          brand: res.data,
        });
        this.loadGoodsList();
      });
  },

  loadGoodsList() {
    util.request(api.GoodsList, {
        brandId: this.data.id,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          goodsList: res.data.list,
        });
      });
  },
})
