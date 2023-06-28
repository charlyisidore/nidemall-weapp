// app.js
App({
  // https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html#onLaunch-Object-object
  onLaunch() {
    // https://developers.weixin.qq.com/miniprogram/dev/api/base/update/UpdateManager.html
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });
  }
})
