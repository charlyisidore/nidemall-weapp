// pages/catalog/catalog.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    categoryList: [],
    currentCategory: {},
    currentSubCategoryList: {},
    goodsCount: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad: function() {
    this.loadCatalog();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadCatalog();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  loadCatalog: function() {
    wx.showLoading({ title: '加载中...' });

    util.request(api.CatalogList)
      .then((res) => {
        this.setData({
          categoryList: res.data.categoryList,
          currentCategory: res.data.currentCategory,
          currentSubCategoryList: res.data.currentSubCategory,
        });
        wx.hideLoading();
      });

    util.request(api.GoodsCount)
      .then((res) => {
        this.setData({
          goodsCount: res.data,
        });
      });
  },

  loadCurrentCategory: function(id) {
    util.request(api.CatalogCurrent, { id })
      .then((res) => {
        this.setData({
          currentCategory: res.data.currentCategory,
          currentSubCategoryList: res.data.currentSubCategory,
        });
      });
  },

  handleCategoryTap: function(event) {
    const categoryId = event.currentTarget.dataset.id;
    if (this.data.currentCategory.id == categoryId) {
      return false;
    }
    this.loadCurrentCategory(categoryId);
  },
})
