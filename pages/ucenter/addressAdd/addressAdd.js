// pages/ucenter/addressAdd/addressAdd.js
const api = require('../../../config/api.js');
const area = require('../../../utils/area.js');
const util = require('../../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    address: {
      id: 0,
      areaCode: 0,
      address: '',
      name: '',
      tel: '',
      isDefault: 0,
      province: '',
      city: '',
      county: '',
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: [
      { code: 0, name: '省份' },
      { code: 0, name: '城市' },
      { code: 0, name: '区县' },
    ],
    regionType: 1,
    regionList: [],
    selectRegionDone: false,
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    if (!options.id || 0 == options.id) {
      return;
    }
    this.setData({
      addressId: options.id,
    });
    this.loadAddressDetail();
  },

  handleMobileInput(event) {
    const address = this.data.address;
    address.tel = event.detail.value;
    this.setData({
      address,
    });
  },

  handleNameInput(event) {
    const address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address,
    });
  },

  handleAddressDetailInput(event) {
    const address = this.data.address;
    address.addressDetail = event.detail.value;
    this.setData({
      address,
    });
  },

  handleIsDefaultChange() {
    const address = this.data.address;
    address.isDefault = !address.isDefault;
    this.setData({
      address,
    });
  },

  handleChooseRegionTap() {
    this.setData({
      openSelectRegion: !this.data.openSelectRegion,
    });

    // 设置区域选择数据
    const address = this.data.address;
    if (address.areaCode > 0) {
      const selectRegionList = this.data.selectRegionList;
      selectRegionList[0].code = `${address.areaCode.slice(0, 2)}0000`;
      selectRegionList[0].name = address.province;
      selectRegionList[1].code = `${address.areaCode.slice(0, 4)}00`;
      selectRegionList[1].name = address.city;
      selectRegionList[2].code = address.areaCode;
      selectRegionList[2].name = address.county;

      const regionList = area
        .getList('county', address.areaCode.slice(0, 4))
        .map((item) => {
          // 标记已选择的
          item.selected = (address.areaCode === item.code);
          return item;
        });

      this.setData({
        selectRegionList,
        regionType: 3,
        regionList,
      });
    } else {
      const selectRegionList = [
        { code: 0, name: '省份' },
        { code: 0, name: '城市' },
        { code: 0, name: '区县' },
      ];

      this.setData({
        selectRegionList,
        regionType: 1,
        regionList: area.getList('province'),
      });
    }

    this.setRegionDoneStatus();
  },

  handleSelectRegionTypeTap(event) {
    const regionTypeIndex = event.target.dataset.regionTypeIndex;
    const selectRegionList = this.data.selectRegionList;

    // 判断是否可点击
    if (regionTypeIndex + 1 == this.data.regionType ||
      (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].code <= 0)) {
      return false;
    }

    const selectRegionItem = selectRegionList[regionTypeIndex];
    const code = selectRegionItem.code;
    let regionList;

    switch (regionTypeIndex) {
      case 0:
        // 点击省级，取省级
        regionList = area.getList('province');
        break;
      case 1:
        // 点击市级，取市级
        regionList = area.getList('city', code.slice(0, 2));
        break;
      default:
        // 点击县级，取县级
        regionList = area.getList('county', code.slice(0, 4));
        break;
    }

    regionList = regionList.map((item) => {
      // 标记已选择的
      item.selected = (this.data.selectRegionList[regionTypeIndex].code == item.code);
      return item;
    });

    this.setData({
      regionList,
      regionType: regionTypeIndex + 1,
    });

    this.setRegionDoneStatus();
  },

  handleSelectRegionTap(event) {
    const regionIndex = event.target.dataset.regionIndex;
    const regionItem = this.data.regionList[regionIndex];
    const regionType = this.data.regionType;
    let selectRegionList = this.data.selectRegionList;

    selectRegionList[regionType - 1] = regionItem;

    if (3 == regionType) {
      this.setData({
        selectRegionList,
      });

      const regionList = this.data.regionList
        .map((item) => {
          // 标记已选择的
          item.selected = (this.data.selectRegionList[this.data.regionType - 1].code == item.code);
          return item;
        });

      this.setData({
        regionList,
      });

      this.setRegionDoneStatus();
      return;
    }

    // 重置下级区域为空
    selectRegionList = selectRegionList.map((item, index) => {
      if (index > regionType - 1) {
        item.code = 0;
        item.name = (1 == index) ? '城市' : '区县';
      }
      return item;
    });

    this.setData({
      selectRegionList,
      regionType: regionType + 1,
    });

    const code = regionItem.code;
    let regionList = [];
    if (1 === regionType) {
      // 点击省级，取市级
      regionList = area.getList('city', code.slice(0, 2));
    } else {
      // 点击市级，取县级
      regionList = area.getList('county', code.slice(0, 4));
    }

    this.setData({
      regionList,
    });

    this.setRegionDoneStatus();
  },

  handleDoneSelectRegionTap() {
    if (false === this.data.selectRegionDone) {
      return false;
    }

    const address = this.data.address;
    const selectRegionList = this.data.selectRegionList;
    address.province = selectRegionList[0].name;
    address.city = selectRegionList[1].name;
    address.county = selectRegionList[2].name;
    address.areaCode = selectRegionList[2].code;

    this.setData({
      address,
      openSelectRegion: false,
    });
  },

  handleCancelSelectRegionTap() {
    this.setData({
      openSelectRegion: false,
      regionType: this.data.regionDoneStatus ? 3 : 1,
    });
  },

  handleCancelAddressTap() {
    wx.navigateBack();
  },

  handleSaveAddressTap() {
    const address = this.data.address;

    if ('' == address.name) {
      util.showErrorToast('请输入姓名');
      return false;
    }

    if ('' == address.tel) {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    if (0 == address.areaCode) {
      util.showErrorToast('请输入省市区');
      return false;
    }

    if ('' == address.addressDetail) {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    util.request(api.AddressSave, {
        id: address.id,
        name: address.name,
        tel: address.tel,
        province: address.province,
        city: address.city,
        county: address.county,
        areaCode: address.areaCode,
        addressDetail: address.addressDetail,
        isDefault: address.isDefault,
      }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        // 返回之前，先取出上一页对象，并设置addressId
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if ('pages/checkout/checkout' == prevPage.route) {
          prevPage.setData({
            addressId: res.data,
          });
          try {
            wx.setStorageSync('addressId', res.data);
          } catch (e) {}
        }
        wx.navigateBack();
      });
  },

  loadAddressDetail() {
    util.request(api.AddressDetail, { id: this.data.addressId })
      .then((res) => {
        if (0 !== res.errno || !res.data) {
          return;
        }
        this.setData({
          address: res.data,
        });
      });
  },

  setRegionDoneStatus() {
    this.setData({
      selectRegionDone: this.data.selectRegionList.every((item) => (0 != item.code)),
    });
  },
});
