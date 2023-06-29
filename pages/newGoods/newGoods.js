// pages/newGoods/newGoods.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    bannerInfo: {
      imgUrl: '/static/images/new.png',
      name: '大家都在买的',
    },
    categoryFilter: false,
    filterCategory: [],
    goodsList: [],
    categoryId: 0,
    currentSortType: 'default',
    currentSort: 'add_time',
    currentSortOrder: 'desc',
    page: 1,
    limit: 10,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadGoodsList();
  },

  handleOpenSortFilterTap(event) {
    const currentId = event.currentTarget.id;
    switch (currentId) {
      case 'categoryFilter':
        this.setData({
          categoryFilter: !this.data.categoryFilter,
          currentSortType: 'category',
          currentSort: 'add_time',
          currentSortOrder: 'desc',
        });
        break;
      case 'priceSort':
        this.setData({
          currentSortType: 'price',
          currentSort: 'retail_price',
          currentSortOrder: ('asc' == this.data.currentSortOrder) ? 'desc' : 'asc',
          categoryFilter: false,
        });
        this.loadGoodsList();
        break;
      default:
        // 综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'add_time',
          currentSortOrder: 'desc',
          categoryFilter: false,
          categoryId: 0,
        });
        this.loadGoodsList();
        break;
    }
  },

  handleSelectCategoryTap(event) {
    const currentIndex = event.target.dataset.categoryIndex;
    this.setData({
      categoryFilter: false,
      categoryId: this.data.filterCategory[currentIndex].id,
    });
    this.loadGoodsList();
  },

  loadGoodsList() {
    util.request(api.GoodsList, {
        isNew: true,
        page: this.data.page,
        limit: this.data.limit,
        order: this.data.currentSortOrder,
        sort: this.data.currentSort,
        categoryId: this.data.categoryId,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          goodsList: res.data.list,
          filterCategory: res.data.filterCategoryList,
        });
      });
  },
})
