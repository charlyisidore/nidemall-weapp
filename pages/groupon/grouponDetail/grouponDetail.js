// pages/groupon/grouponDetail/grouponDetail.js
const api = require('../../../config/api.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    id: 0,
    groupon: {},
    joiners: [],
    orderInfo: {},
    orderGoods: [],
    rules: {},
    active: 0,
    steps: [],
    activeIcon: '',
    activeColor: '',
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    this.setData({
      id: options.id,
    });
    this.loadOrderDetail();
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
  onShareAppMessage() {
    return {
      title: '邀请团购',
      desc: '唯爱与美食不可辜负',
      path: `/pages/index/index?grouponId=${this.data.id}`,
    };
  },

  loadOrderDetail() {
    util.request(api.GroupOnDetail, { grouponId: this.data.id })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        let steps = [
          { text: '已开团' },
          { text: '开团中' },
          { text: '开团成功' },
        ];
        let active = res.data.groupon.status;
        let activeIcon = 'success';
        let activeColor = '#07c160';
        if (3 === res.data.groupon.status) {
          steps = [
            { text: '已开团' },
            { text: '开团中' },
            { text: '开团失败' },
          ];
          active = 2;
          activeIcon = 'fail';
          activeColor = '#ee0a24';
        }
        this.setData({
          joiners: res.data.joiners,
          groupon: res.data.groupon,
          orderInfo: res.data.orderInfo,
          orderGoods: res.data.orderGoods,
          rules: res.data.rules,
          active,
          steps,
          activeIcon,
          activeColor,
        });
      });
  },
})
