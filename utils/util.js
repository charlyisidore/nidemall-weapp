function formatTime(date) {
  const year = date.getFullYear()
    .toString();
  const month = (1 + date.getMonth())
    .toString()
    .padStart(2, '0');
  const day = date.getDate()
    .toString()
    .padStart(2, '0');
  const hours = date.getHours()
    .toString()
    .padStart(2, '0');
  const minutes = date.getMinutes()
    .toString()
    .padStart(2, '0');
  const seconds = date.getSeconds()
    .toString()
    .padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      header: {
        'Content-Type': 'application/json',
        'X-Litemall-Token': wx.getStorageSync('token'),
      },
      success: (res) => {
        if (200 == res.statusCode) {
          if (501 == res.data.errno) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {}
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login',
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

function redirect(url) {
  wx.redirectTo({ url });
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png',
  });
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
};
