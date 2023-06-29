// pages/help/help.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    issueList: [],
    page: 1,
    limit: 10,
    count: 0,
    showPage: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad() {
    this.loadIssue();
  },

  handleNextPageTap() {
    if (this.data.page > this.data.count / this.data.limit) {
      return true;
    }
    this.setData({
      page: this.data.page + 1,
    });
    this.loadIssue();
  },

  handlePrevPageTap() {
    if (this.data.page <= 1) {
      return false;
    }
    this.setData({
      page: this.data.page - 1,
    });
    this.loadIssue();
  },

  loadIssue() {
    this.setData({
      showPage: false,
      issueList: [],
    });

    util.request(api.IssueList, {
        page: this.data.page,
        limit: this.data.limit,
      })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          issueList: res.data.list,
          showPage: true,
          count: res.data.total,
        });
      });
  },
})
