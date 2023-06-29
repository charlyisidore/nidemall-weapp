// pages/comment/comment.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    comments: [],
    allCommentList: [],
    picCommentList: [],
    type: 0,
    valueId: 0,
    showType: 0,
    allCount: 0,
    hasPicCount: 0,
    allPage: 1,
    picPage: 1,
    limit: 20,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      type: options.type,
      valueId: options.valueId,
    });
    this.loadCommentCount();
    this.loadCommentList();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    this.setData({
      allCommentList: [],
      allPage: 1,
      picCommentList: [],
      picPage: 1,
      comments: [],
    });
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadCommentCount();
    this.loadCommentList();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onReachBottom
  onReachBottom() {
    if (0 == this.data.showType) {
      if (this.data.allCount / this.data.limit < this.data.allPage) {
        return false;
      }
      this.setData({
        allPage: this.data.allPage + 1,
      });
    } else {
      if (this.data.hasPicCount / this.data.limit < this.data.picPage) {
        return false;
      }
      this.setData({
        picPage: this.data.picPage + 1,
      });
    }
    this.loadCommentList();
  },

  handleSwitchTabTap() {
    if (0 == this.data.showType) {
      this.setData({
        allCommentList: [],
        allPage: 1,
        comments: [],
        showType: 1,
      });
    } else {
      this.setData({
        picCommentList: [],
        picPage: 1,
        comments: [],
        showType: 0,
      });
    }
    this.loadCommentList();
  },

  loadCommentCount() {
    util.request(api.CommentCount, {
        valueId: this.data.valueId,
        type: this.data.type,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          allCount: res.data.allCount,
          hasPicCount: res.data.hasPicCount,
        });
      });
  },

  loadCommentList() {
    util.request(api.CommentList, {
        valueId: this.data.valueId,
        type: this.data.type,
        limit: this.data.limit,
        page: (0 == this.data.showType) ? this.data.allPage : this.data.picPage,
        showType: this.data.showType,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        if (0 == this.data.showType) {
          this.setData({
            allCommentList: this.data.allCommentList.concat(res.data.list),
            allPage: res.data.page,
            comments: this.data.allCommentList.concat(res.data.list),
          });
        } else {
          this.setData({
            picCommentList: this.data.picCommentList.concat(res.data.list),
            picPage: res.data.page,
            comments: this.data.picCommentList.concat(res.data.list),
          });
        }
      });
  },
})
