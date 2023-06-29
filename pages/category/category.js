// pages/category/category.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    limit: 10,
    pages: 1, // 总页数
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    if (options.id) {
      this.setData({
        id: parseInt(options.id),
      });
    }

    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          scrollHeight: res.windowHeight,
        });
      },
    });

    this.loadCategoryInfo();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    const pagenum = this.data.page + 1; // 获取当前页数并+1
    if (pagenum <= this.data.pages) {
      this.setData({
        page: pagenum, // 更新当前页数
      });
      this.loadGoodsList(); // 重新调用请求获取下一页数据
    } else {
      util.showErrorToast('已经是最后一页了');
    }
  },

  loadCategoryInfo() {
    util.request(api.GoodsCategory, { id: this.data.id })
      .then((res) => {
        if (0 != res.errno) {
          return;
        }

        this.setData({
          navList: res.data.brotherCategory,
          currentCategory: res.data.currentCategory,
        });

        wx.setNavigationBarTitle({ title: res.data.parentCategory.name });

        // 当id是L1分类id时，这里需要重新设置成L1分类的一个子分类的id
        if (res.data.parentCategory.id == this.data.id) {
          this.setData({
            id: res.data.currentCategory.id,
          });
        }

        // nav位置
        let currentIndex = 0;
        const navListCount = this.data.navList.length;
        for (let i = 0; i < navListCount; i++) {
          currentIndex += 1;
          if (this.data.navList[i].id == this.data.id) {
            break;
          }
        }

        if (currentIndex > navListCount / 2 && navListCount > 5) {
          this.setData({
            scrollLeft: currentIndex * 60,
          });
        }

        this.loadGoodsList();
      });
  },

  loadGoodsList() {
    util.request(api.GoodsList, {
        categoryId: this.data.id,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        this.setData({
          goodsList: this.data.goodsList.concat(res.data.list),
          pages: res.data.pages, // 得到总页数
        });
      });
  },

  handleCategoryTap(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }

    const clientX = event.detail.x;
    const currentTarget = event.currentTarget;

    if (clientX < 60) {
      this.setData({
        scrollLeft: currentTarget.offsetLeft - 60,
      });
    } else if (clientX > 330) {
      this.setData({
        scrollLeft: currentTarget.offsetLeft,
      });
    }

    this.setData({
      id: event.currentTarget.dataset.id,
      page: 1, // 从第一页开始查
      goodsList: [],
    });

    this.loadCategoryInfo();
  },
})
