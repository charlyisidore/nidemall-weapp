// pages/cart/cart.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const app = getApp();

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    cartGoods: [],
    cartTotal: {
      goodsCount: 0,
      goodsAmount: 0.00,
      checkedGoodsCount: 0,
      checkedGoodsAmount: 0.00,
    },
    isEditCart: false,
    checkedAllStatus: true,
    hasLogin: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    // 页面显示
    if (app.globalData.hasLogin) {
      this.loadCartList();
    }
    this.setData({
      hasLogin: app.globalData.hasLogin,
    });
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onPullDownRefresh
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); // 在标题栏中显示加载
    this.loadCartList();
    wx.hideNavigationBarLoading(); // 完成停止加载
    wx.stopPullDownRefresh(); // 停止下拉刷新
  },

  loadCartList() {
    util.request(api.CartList)
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          cartGoods: res.data.cartList,
          cartTotal: res.data.cartTotal
        });
        this.setData({
          checkedAllStatus: this.isCheckedAll(),
        });
      });
  },

  getCheckedGoodsCount() {
    let checkedGoodsCount = 0;
    this.data.cartGoods.forEach((goods) => {
      if (goods.checked) {
        checkedGoodsCount += goods.number;
      }
    });
    return checkedGoodsCount;
  },

  isCheckedAll() {
    // 判断购物车商品已全选
    return this.data.cartGoods.every((element) => element.checked);
  },

  updateCart(productId, goodsId, number, id) {
    util.request(api.CartUpdate, { productId, goodsId, number, id }, 'POST')
      .then(() => {
        this.setData({
          checkedAllStatus: this.isCheckedAll(),
        });
      });
  },

  handleLoginTap() {
    wx.navigateTo({ url: '/pages/auth/login/login' });
  },

  handleCheckItemChange(event) {
    const itemIndex = event.target.dataset.itemIndex;
    const productIds = [this.data.cartGoods[itemIndex].productId];
    if (!this.data.isEditCart) {
      util.request(api.CartChecked, {
          productIds,
          isChecked: this.data.cartGoods[itemIndex].checked ? 0 : 1,
        }, 'POST')
        .then((res) => {
          if (0 === res.errno) {
            this.setData({
              cartGoods: res.data.cartList,
              cartTotal: res.data.cartTotal,
            });
          }
          this.setData({
            checkedAllStatus: this.isCheckedAll(),
          });
        });
    } else {
      // 编辑状态
      const tmpCartData = this.data.cartGoods
        .map((element, index) => {
          if (index == itemIndex) {
            element.checked = !element.checked;
          }
          return element;
        });
      this.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: this.isCheckedAll(),
        'cartTotal.checkedGoodsCount': this.getCheckedGoodsCount(),
      });
    }
  },

  handleCheckAllChange() {
    if (!this.data.isEditCart) {
      const productIds = this.data.cartGoods.map((goods) => goods.productId);
      util.request(api.CartChecked, {
          productIds,
          isChecked: this.isCheckedAll() ? 0 : 1,
        }, 'POST')
        .then((res) => {
          if (0 === res.errno) {
            this.setData({
              cartGoods: res.data.cartList,
              cartTotal: res.data.cartTotal,
            });
          }
          this.setData({
            checkedAllStatus: this.isCheckedAll(),
          });
        });
    } else {
      // 编辑状态
      const checkedAllStatus = this.isCheckedAll();
      const tmpCartData = this.data.cartGoods
        .map((goods) => {
          goods.checked = !checkedAllStatus;
          return goods;
        });
      this.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: this.isCheckedAll(),
        'cartTotal.checkedGoodsCount': this.getCheckedGoodsCount(),
      });
    }
  },

  handleEditCartTap() {
    if (this.data.isEditCart) {
      this.loadCartList();
      this.setData({
        isEditCart: !this.data.isEditCart
      });
    } else {
      // 编辑状态
      const tmpCartList = this.data.cartGoods
        .map((goods) => {
          goods.checked = false;
          return goods;
        });
      this.setData({
        cartGoods: tmpCartList,
        isEditCart: !this.data.isEditCart,
        checkedAllStatus: this.isCheckedAll(),
        'cartTotal.checkedGoodsCount': this.getCheckedGoodsCount(),
      });
    }
  },

  handleCutNumberTap(event) {
    const itemIndex = event.target.dataset.itemIndex;
    const cartItem = this.data.cartGoods[itemIndex];
    const number = Math.max(1, cartItem.number - 1);
    cartItem.number = number;
    this.setData({
      cartGoods: this.data.cartGoods,
    });
    this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
  },

  handleAddNumberTap(event) {
    const itemIndex = event.target.dataset.itemIndex;
    const cartItem = this.data.cartGoods[itemIndex];
    const number = cartItem.number + 1;
    cartItem.number = number;
    this.setData({
      cartGoods: this.data.cartGoods,
    });
    this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
  },

  handleCheckoutTap() {
    const checkedGoods = this.data.cartGoods
      .filter((element) => element.checked);

    if (0 === checkedGoods.length) {
      return false;
    }

    // storage中设置了cartId，则是购物车购买
    try {
      wx.setStorageSync('cartId', 0);
      wx.navigateTo({ url: '/pages/checkout/checkout' })
    } catch (e) {}
  },

  handleDeleteCartTap() {
    const productIds = this.data.cartGoods
      .filter((element) => element.checked)
      .map((element) => element.productId);

    if (0 === productIds.length) {
      return false;
    }

    util.request(api.CartDelete, { productIds }, 'POST')
      .then((res) => {
        if (0 === res.errno) {
          const cartList = res.data.cartList
            .map((goods) => {
              goods.checked = false;
              return goods;
            });
          this.setData({
            cartGoods: cartList,
            cartTotal: res.data.cartTotal,
          });
        }
        this.setData({
          checkedAllStatus: this.isCheckedAll(),
        });
      });
  },
});
