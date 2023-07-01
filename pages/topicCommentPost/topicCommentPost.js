// pages/topicCommentPost/topicCommentPost.js
const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#data
  data: {
    valueId: 0,
    topic: {},
    content: '',
    stars: [0, 1, 2, 3, 4],
    star: 5,
    starText: '十分满意',
    hasPicture: false,
    picUrls: [],
    files: [],
  },

  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/Page.html#onLoad-Object-query
  onLoad(options) {
    if (1 !== parseInt(options.type)) {
      return;
    }
    this.setData({
      valueId: options.valueId,
    });
    this.loadTopic();
  },

  handleChooseImageTap() {
    if (this.data.files.length >= 5) {
      util.showErrorToast('只能上传五张图片');
      return false;
    }

    // https://developers.weixin.qq.com/miniprogram/dev/api/media/video/wx.chooseMedia.html
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          files: this.data.files.concat(res.tempFilePaths),
        });
        this.upload(res);
      },
    });
  },

  handlePreviewImageTap(event) {
    wx.previewImage({
      current: event.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files, // 需要预览的图片http链接列表
    });
  },

  handleSelectRaterTap(event) {
    const star = event.currentTarget.dataset.star + 1;
    let starText;
    switch (star) {
      case 1:
        starText = '很差';
        break;
      case 2:
        starText = '不太满意';
        break;
      case 3:
        starText = '满意';
        break;
      case 4:
        starText = '比较满意';
        break;
      default:
        starText = '十分满意';
        break;
    }
    this.setData({
      star,
      starText,
    });
  },

  handleCloseTap() {
    wx.navigateBack();
  },

  handlePostTap() {
    if (!this.data.content) {
      util.showErrorToast('请填写评论');
      return false;
    }

    util.request(api.CommentPost, {
        type: 1,
        valueId: this.data.valueId,
        content: this.data.content,
        star: this.data.star,
        hasPicture: this.data.hasPicture,
        picUrls: this.data.picUrls,
      }, 'POST')
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        wx.showToast({
          title: '评论成功',
          complete: () => {
            wx.navigateBack();
          },
        });
      });
  },

  handleContentInput(event) {
    const content = event.detail.value;
    // 判断是否超过140个字符
    if (content && content.length > 140) {
      return false;
    }
    this.setData({
      content,
    });
  },

  loadTopic() {
    util.request(api.TopicDetail, { id: this.data.valueId })
      .then((res) => {
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          topic: res.data.topic,
        });
      });
  },

  upload(res) {
    const uploadTask = wx.uploadFile({
      url: api.StorageUpload,
      filePath: res.tempFilePaths[0],
      name: 'file',
      success: (res) => {
        res = JSON.parse(res.data);
        if (0 !== res.errno) {
          return;
        }
        this.setData({
          hasPicture: true,
          picUrls: this.data.picUrls.concat([res.data.url]),
        });
      },
      fail: () => {
        wx.showModal({
          title: '错误',
          content: '上传失败',
          showCancel: false,
        });
      },
    });

    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress);
      console.log('已经上传的数据长度', res.totalBytesSent);
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend);
    });
  },
});
