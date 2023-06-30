// pages/topicDetail/topicDetail.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    id: 0,
    topic: {},
    topicList: [],
    commentCount: 0,
    commentList: [],
    topicGoods: [],
    collect: false,
    userHasCollect: 0,
    topicDetail: '',
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      id: options.id,
    });

    util.request(api.TopicDetail, { id: this.data.id })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          topic: res.data.topic,
          topicGoods: res.data.goods,
          userHasCollect: res.data.userHasCollect,
          collect: (1 == res.data.userHasCollect),
          topicDetail: res.data.topic.content,
        });
      });

    util.request(api.TopicRelated, { id: this.data.id })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          topicList: res.data.list,
        });
      });
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    this.loadCommentList();
  },

  // 添加或是取消收藏
  handleAddCollectOrNotTap() {
    util.request(api.CollectAddOrDelete, {
        type: 1,
        valueId: this.data.id,
      }, 'POST')
      .then(() => {
        if (1 == this.data.userHasCollect) {
          this.setData({
            collect: false,
            userHasCollect: 0,
          });
        } else {
          this.setData({
            collect: true,
            userHasCollect: 1,
          });
        }
      });
  },

  handlePostCommentTap() {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({ url: '/pages/auth/login/login' });
    } else {
      wx.navigateTo({ url: `/pages/topicCommentPost/topicCommentPost?valueId=${this.data.id}&type=1` });
    }
  },

  loadCommentList() {
    util.request(api.CommentList, {
        valueId: this.data.id,
        type: 1,
        showType: 0,
        page: 1,
        limit: 5,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          commentList: res.data.list,
          commentCount: res.data.total,
        });
      });
  },
})
