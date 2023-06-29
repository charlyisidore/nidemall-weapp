// https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/unit-test.html
// https://github.com/wechat-miniprogram/miniprogram-simulate/blob/master/docs/tutorial.md

/** @type {import('jest').Config} */
const config = {
  bail: 1,
  verbose: true,
  testEnvironment: 'jsdom',
};

module.exports = config;
