// pages/search/search.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    keyword: '',
    searchStatus: false,
    goodsList: [],
    helpKeyword: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSort: 'name',
    currentSortType: 'default',
    currentSortOrder: 'desc',
    filterCategory: [],
    defaultKeyword: {},
    hotKeyword: [],
    page: 1,
    limit: 20,
    categoryId: 0,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadSearchKeyword();
  },

  handleCloseSearchTap() {
    wx.navigateBack();
  },

  handleClearKeywordTap() {
    this.setData({
      keyword: '',
      searchStatus: false,
    });
  },

  handleKeywordInput(event) {
    this.setData({
      keyword: event.detail.value,
      searchStatus: false,
    });
    if (event.detail.value) {
      this.loadHelpKeyword();
    }
  },

  handleKeywordFocus() {
    this.setData({
      searchStatus: false,
      goodsList: [],
    });
    if (this.data.keyword) {
      this.loadHelpKeyword();
    }
  },

  handleClearHistoryTap() {
    this.setData({
      historyKeyword: [],
    })
    util.request(api.SearchClearHistory, {}, 'POST')
      .then(() => {
        console.log('清除成功');
      });
  },

  handleKeywordTap(event) {
    this.loadSearchResult(event.target.dataset.keyword);
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
          currentSort: 'name',
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
    const filterCategory = this.data.filterCategory;
    let currentCategory = null;
    for (let key in filterCategory) {
      if (key == currentIndex) {
        filterCategory[key].selected = true;
        currentCategory = filterCategory[key];
      } else {
        filterCategory[key].selected = false;
      }
    }
    this.setData({
      filterCategory: filterCategory,
      categoryFilter: false,
      categoryId: currentCategory.id,
      page: 1,
      goodsList: [],
    });
    this.loadGoodsList();
  },

  handleKeywordConfirm(event) {
    this.loadSearchResult(event.detail.value);
  },

  loadSearchKeyword() {
    util.request(api.SearchIndex)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          historyKeyword: res.data.historyKeywordList,
          defaultKeyword: res.data.defaultKeyword,
          hotKeyword: res.data.hotKeywordList,
        });
      });
  },

  loadHelpKeyword() {
    util.request(api.SearchHelper, { keyword: this.data.keyword })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          helpKeyword: res.data,
        });
      });
  },

  loadGoodsList() {
    util.request(api.GoodsList, {
        keyword: this.data.keyword,
        page: this.data.page,
        limit: this.data.limit,
        sort: this.data.currentSort,
        order: this.data.currentSortOrder,
        categoryId: this.data.categoryId,
      })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            searchStatus: true,
            categoryFilter: false,
            goodsList: res.data.list,
            filterCategory: res.data.filterCategoryList,
          });
        }
        // 重新获取关键词
        this.loadSearchKeyword();
      });
  },

  loadSearchResult(keyword) {
    if ('' === keyword) {
      keyword = this.data.defaultKeyword.keyword;
    }
    this.setData({
      keyword,
      page: 1,
      categoryId: 0,
      goodsList: [],
    });
    this.loadGoodsList();
  }
});
