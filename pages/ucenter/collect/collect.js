// pages/ucenter/collect/collect.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    type: 0,
    collectList: [],
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadCollectList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1,
      });
      this.loadCollectList();
    } else {
      wx.showToast({
        title: '没有更多用户收藏了',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  },

  handleSwitchTabTap(event) {
    this.setData({
      collectList: [],
      type: event.currentTarget.dataset.index,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    this.loadCollectList();
  },

  handleOpenCollectTap(event) {
    const index = event.currentTarget.dataset.index;
    const valueId = this.data.collectList[index].valueId;
    // 触摸时间距离页面打开的毫秒数
    const touchTime = this.data.touchEnd - this.data.touchStart;
    // 如果按下时间大于350为长按
    if (touchTime > 350) {
      wx.showModal({
        title: '',
        content: '确定删除吗？',
        success: (res) => {
          if (res.confirm) {
            util.request(api.CollectAddOrDelete, {
                type: this.data.type,
                valueId,
              }, 'POST')
              .then((res) => {
                if (0 !== res.errno) {
                  return;
                }
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000,
                });
                this.data.collectList.splice(index, 1);
                this.setData({
                  collectList: this.data.collectList,
                });
              });
          }
        },
      });
    } else {
      switch (this.data.type) {
        case 1:
          wx.navigateTo({ url: `/pages/topicDetail/topicDetail?id=${valueId}` });
          break;
        default:
          wx.navigateTo({ url: `/pages/goods/goods?id=${valueId}` });
          break;
      }
    }
  },

  handleTouchStart(event) {
    this.setData({
      touchStart: event.timeStamp,
    });
  },

  handleTouchEnd(event) {
    this.setData({
      touchEnd: event.timeStamp,
    });
  },

  loadCollectList() {
    wx.showLoading({ title: '加载中...' });
    util.request(api.CollectList, {
        type: this.data.type,
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          collectList: this.data.collectList.concat(res.data.list),
          totalPages: res.data.pages,
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },
});
