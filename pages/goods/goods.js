// pages/goods/goods.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const WxParse = require('../../lib/wxParse/wxParse.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    canShare: false,
    id: 0,
    goods: {},
    groupon: [], // 该商品支持的团购规格
    grouponLink: {}, // 参与的团购
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    tmpPicUrl: '',
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    openAttr: false,
    openShare: false,
    collect: false,
    shareImage: '',
    isGroupon: false, // 标识是否是一个参团购买
    soldout: false,
    canWrite: false, // 用户是否获取了保存相册的权限
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id) {
      this.setData({
        id: parseInt(options.id),
      });
      this.getGoodsInfo();
    }

    if (options.grouponId) {
      this.setData({
        isGroupon: true,
      });
      this.getGrouponInfo(options.grouponId);
    }

    wx.getSetting({
      success: (res) => {
        console.log(res);
        // 不存在相册授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.setData({
                canWrite: true,
              });
            },
            fail: () => {
              this.setData({
                canWrite: false,
              });
            },
          })
        } else {
          this.setData({
            canWrite: true,
          });
        }
      }
    });
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShow
  onShow() {
    util.request(api.CartGoodsCount)
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            cartGoodsCount: res.data,
          });
        }
      });
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onShareAppMessage-Object-object
  onShareAppMessage() {
    return {
      title: this.data.goods.name,
      desc: '唯爱与美食不可辜负',
      path: `/pages/index/index?goodId=${this.data.id}`,
    };
  },

  shareFriendOrCircle() {
    if (false === this.data.openShare) {
      this.setData({
        openShare: !this.data.openShare,
      });
    } else {
      return false;
    }
  },

  handleSetting(event) {
    if (!event.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '不授权无法保存',
        showCancel: false,
      });
      this.setData({
        canWrite: false,
      });
    } else {
      wx.showToast({ title: '保存成功' });
      this.setData({
        canWrite: true,
      });
    }
  },

  // 保存分享图
  saveShare() {
    wx.downloadFile({
      url: this.data.shareImage,
      success: (res) => {
        console.log(res);
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showModal({
              title: '生成海报成功',
              content: '海报已成功保存到相册，可以分享到朋友圈了',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#a78845',
              success: (res) => {
                if (res.confirm) {
                  console.log('用户点击确定');
                }
              },
            });
          },
          fail: () => {
            console.log('fail');
          },
        });
      },
      fail: () => {
        console.log('fail');
      },
    });
  },

  // 从分享的团购进入
  getGrouponInfo(grouponId) {
    util.request(api.GroupOnJoin, { grouponId })
      .then((res) => {
        if (res.errno === 0) {
          this.setData({
            grouponLink: res.data.groupon,
            id: res.data.goods.id,
          });
          // 获取商品详情
          this.getGoodsInfo();
        }
      });
  },

  // 获取商品信息
  getGoodsInfo() {
    util.request(api.GoodsDetail, { id: this.data.id })
      .then((res) => {
        if (0 === res.errno) {
          let _specificationList = res.data.specificationList;
          let _tmpPicUrl = res.data.productList[0].url;
          // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
          if (_specificationList.length == 1) {
            if (_specificationList[0].valueList.length == 1) {
              _specificationList[0].valueList[0].checked = true
              // 如果仅仅存在一种货品，那么商品价格应该和货品价格一致
              // 这里检测一下
              let _productPrice = res.data.productList[0].price;
              let _goodsPrice = res.data.info.retailPrice;
              if (_productPrice != _goodsPrice) {
                console.error('商品数量价格和货品不一致');
              }
              this.setData({
                checkedSpecText: _specificationList[0].valueList[0].value,
                tmpSpecText: '已选择：' + _specificationList[0].valueList[0].value,
              });
            }
          }
          res.data.info.path = `pages/goods/goods?id=${this.data.id}`;

          this.setData({
            goods: res.data.info,
            attribute: res.data.attribute,
            issueList: res.data.issue,
            comment: res.data.comment,
            brand: res.data.brand,
            specificationList: res.data.specificationList,
            productList: res.data.productList,
            userHasCollect: res.data.userHasCollect,
            shareImage: res.data.shareImage,
            checkedSpecPrice: res.data.info.retailPrice,
            groupon: res.data.groupon,
            canShare: res.data.share,
            // 选择规格时，默认展示第一张图片
            tmpPicUrl: _tmpPicUrl,
          });

          // 如果是通过分享的团购参加团购，则团购项目应该与分享的一致并且不可更改
          if (this.data.isGroupon) {
            let groupons = this.data.groupon;
            for (let i = 0; i < groupons.length; i++) {
              if (groupons[i].id != this.data.grouponLink.rulesId) {
                groupons.splice(i, 1);
              }
            }
            groupons[0].checked = true;
            // 重设团购规格
            this.setData({
              groupon: groupons,
            });
          }

          this.setData({
            collect: (1 == res.data.userHasCollect),
          });

          WxParse.wxParse('goodsDetail', 'html', res.data.info.detail, this);

          // 获取推荐商品
          this.getGoodsRelated();
        }
      });
  },

  // 获取推荐商品
  getGoodsRelated() {
    util.request(api.GoodsRelated, { id: this.data.id })
      .then((res) => {
        if (0 === res.errno) {
          this.setData({
            relatedGoods: res.data.list,
          });
        }
      });
  },

  // 团购选择
  clickGroupon(event) {
    // 参与团购，不可更改选择
    if (this.data.isGroupon) {
      return;
    }

    let specValueId = event.currentTarget.dataset.valueId;
    let _grouponList = this.data.groupon;

    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].id == specValueId) {
        if (_grouponList[i].checked) {
          _grouponList[i].checked = false;
        } else {
          _grouponList[i].checked = true;
        }
      } else {
        _grouponList[i].checked = false;
      }
    }

    this.setData({
      groupon: _grouponList,
    });
  },

  // 规格选择
  clickSkuValue(event) {
    let specName = event.currentTarget.dataset.name;
    let specValueId = event.currentTarget.dataset.valueId;

    // 判断是否可以点击
    // TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].name === specName) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            // 如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      specificationList: _specificationList,
    });
    // 重新计算spec改变后的信息
    this.changeSpecInfo();
    // 重新计算哪些值不可以点击
  },

  // 获取选中的团购信息
  getCheckedGrouponValue() {
    let checkedValues = {};
    let _grouponList = this.data.groupon;
    for (let i = 0; i < _grouponList.length; i++) {
      if (_grouponList[i].checked) {
        checkedValues = _grouponList[i];
      }
    }
    return checkedValues;
  },

  // 获取选中的规格信息
  getCheckedSpecValue() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        name: _specificationList[i].name,
        valueId: 0,
        valueText: '',
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }
    return checkedValues;
  },

  // 判断规格是否选择完整
  isCheckedAllSpec() {
    return !this.getCheckedSpecValue()
      .some((v) => (0 == v.valueId));
  },

  getCheckedSpecKey() {
    return this.getCheckedSpecValue()
      .map((v) => v.valueText);
  },

  // 规格改变时，重新计算价格及显示信息
  changeSpecInfo() {
    let checkedNameValue = this.getCheckedSpecValue();

    // 设置选择的信息
    let checkedValue = checkedNameValue.filter((v) => (0 != v.valueId))
      .map((v) => v.valueText);
    if (checkedValue.length > 0) {
      this.setData({
        tmpSpecText: checkedValue.join('　'),
      });
    } else {
      this.setData({
        tmpSpecText: '请选择规格数量',
      });
    }

    if (this.isCheckedAllSpec()) {
      this.setData({
        checkedSpecText: this.data.tmpSpecText,
      });

      // 规格所对应的货品选择以后
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        this.setData({
          soldout: true,
        });
        console.error('规格所对应货品不存在');
        return;
      }

      let checkedProduct = checkedProductArray[0];
      if (checkedProduct.number > 0) {
        this.setData({
          checkedSpecPrice: checkedProduct.price,
          tmpPicUrl: checkedProduct.url,
          soldout: false,
        });
      } else {
        this.setData({
          checkedSpecPrice: this.data.goods.retailPrice,
          soldout: true,
        });
      }
    } else {
      this.setData({
        checkedSpecText: '规格数量选择',
        checkedSpecPrice: this.data.goods.retailPrice,
        soldout: false,
      });
    }
  },

  // 获取选中的产品（根据规格）
  getCheckedProductItem(key) {
    return this.data.productList.filter((v) => (v.specifications.toString() == key.toString()));
  },

  // 添加或是取消收藏
  addCollectOrNot() {
    util.request(api.CollectAddOrDelete, {
        type: 0,
        valueId: this.data.id,
      }, "POST")
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

  // 立即购买（先自动加入购物车）
  addFast() {
    if (false == this.data.openAttr) {
      // 打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr,
      });
    } else {
      // 提示选择完整规格
      if (!this.isCheckedAllSpec()) {
        util.showErrorToast('请选择完整规格');
        return false;
      }

      // 根据选中的规格，判断是否有对应的sku信息
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        // 找不到对应的product信息，提示没有库存
        util.showErrorToast('没有库存');
        return false;
      }

      let checkedProduct = checkedProductArray[0];
      // 验证库存
      if (checkedProduct.number <= 0) {
        util.showErrorToast('没有库存');
        return false;
      }
      // 验证团购是否有效
      let checkedGroupon = this.getCheckedGrouponValue();
      // 立即购买
      util.request(api.CartFastAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: checkedProduct.id,
        }, "POST")
        .then((res) => {
          if (0 == res.errno) {
            // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
            try {
              wx.setStorageSync('cartId', res.data);
              wx.setStorageSync('grouponRulesId', checkedGroupon.id);
              wx.setStorageSync('grouponLinkId', this.data.grouponLink.id);
              wx.navigateTo({ url: '/pages/checkout/checkout' })
            } catch (e) {}
          } else {
            util.showErrorToast(res.errmsg);
          }
        });
    }
  },

  // 添加到购物车
  addToCart() {
    if (false == this.data.openAttr) {
      // 打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr,
      });
    } else {
      // 提示选择完整规格
      if (!this.isCheckedAllSpec()) {
        util.showErrorToast('请选择完整规格');
        return false;
      }

      // 根据选中的规格，判断是否有对应的sku信息
      let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
      if (!checkedProductArray || checkedProductArray.length <= 0) {
        // 找不到对应的product信息，提示没有库存
        util.showErrorToast('没有库存');
        return false;
      }

      let checkedProduct = checkedProductArray[0];
      // 验证库存
      if (checkedProduct.number <= 0) {
        util.showErrorToast('没有库存');
        return false;
      }

      // 添加到购物车
      util.request(api.CartAdd, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: checkedProduct.id,
        }, "POST")
        .then((res) => {
          let _res = res;
          if (0 == _res.errno) {
            wx.showToast({ title: '添加成功' });
            this.setData({
              openAttr: !this.data.openAttr,
              cartGoodsCount: _res.data,
            });
            if (this.data.userHasCollect == 1) {
              this.setData({
                collect: true,
              });
            } else {
              this.setData({
                collect: false,
              });
            }
          } else {
            util.showErrorToast(_res.errmsg);
          }
        });
    }
  },

  cutNumber() {
    this.setData({
      number: Math.max(1, this.data.number - 1),
    });
  },

  addNumber() {
    this.setData({
      number: this.data.number + 1,
    });
  },

  switchAttrPop() {
    if (false == this.data.openAttr) {
      this.setData({
        openAttr: !this.data.openAttr,
      });
    }
  },

  closeAttr() {
    this.setData({
      openAttr: false,
    });
  },

  closeShare() {
    this.setData({
      openShare: false,
    });
  },

  openCartPage() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },
})
