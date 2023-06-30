// pages/ucenter/footprint/footprint.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    footprintList: [],
    page: 1,
    limit: 10,
    totalPages: 1,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadFootprintList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1,
      });
      this.loadFootprintList();
    } else {
      wx.showToast({
        title: '没有更多用户足迹了',
        icon: 'none',
        duration: 2000,
      });
      return false;
    }
  },

  handleDeleteItemTap(event) {
    const index = event.currentTarget.dataset.index;
    const iindex = event.currentTarget.dataset.iindex;
    const footprintId = this.data.footprintList[index][iindex].id;
    const goodsId = this.data.footprintList[index][iindex].goodsId;
    const touchTime = this.data.touchEnd - this.data.touchStart;
    // 如果按下时间大于350为长按  
    if (touchTime > 350) {
      wx.showModal({
        title: '',
        content: '要删除所选足迹？',
        success: (res) => {
          if (!res.confirm) {
            return;
          }
          util.request(api.FootprintDelete, { id: footprintId }, 'POST')
            .then((res) => {
              if (0 !== res.errno) {
                return;
              }
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000,
              });
              this.data.footprintList[index].splice(iindex, 1);
              if (0 == this.data.footprintList[index].length) {
                this.data.footprintList.splice(index, 1);
              }
              this.setData({
                footprintList: this.data.footprintList,
              });
            });
        }
      });
    } else {
      wx.navigateTo({ url: `/pages/goods/goods?id=${goodsId}` });
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

  loadFootprintList() {
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.FootprintList, {
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 === res.errno) {
          let f1 = this.data.footprintList;
          let f2 = res.data.list;
          for (let i = 0; i < f2.length; i++) {
            f2[i].addDate = f2[i].addTime.substring(0, 10);
            let last = f1.length - 1;
            if (last >= 0 && f1[last][0].addDate === f2[i].addDate) {
              f1[last].push(f2[i]);
            } else {
              let tmp = [];
              tmp.push(f2[i])
              f1.push(tmp);
            }
          }
          this.setData({
            footprintList: f1,
            totalPages: res.data.pages,
          });
        }
        wx.hideLoading();
      });
  },
})
