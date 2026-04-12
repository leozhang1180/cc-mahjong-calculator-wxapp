function getDeviceEnv() {
  let info = {};

  try {
    if (typeof wx.getDeviceInfo === 'function') {
      info = wx.getDeviceInfo() || {};
    } else if (typeof wx.getSystemInfoSync === 'function') {
      info = wx.getSystemInfoSync() || {};
    }
  } catch (e) {
    console.warn('get device info failed', e);
  }

  const platform = String(info.platform || '').toLowerCase();
  const system = String(info.system || '').toLowerCase();
  const brand = String(info.brand || '').toLowerCase();

  // Use multiple signals for compatibility in case platform/system values vary.
  const isHarmonyOS =
    platform === 'harmony' ||
    platform === 'ohos' ||
    system.indexOf('harmony') >= 0 ||
    system.indexOf('openharmony') >= 0 ||
    system.indexOf('hongmeng') >= 0 ||
    brand === 'huawei';

  return {
    platform,
    system: info.system || '',
    brand: info.brand || '',
    isHarmonyOS
  };
}

App({
  onLaunch() {
    const deviceEnv = getDeviceEnv();
    this.globalData.deviceEnv = deviceEnv;
    console.log('app launch', deviceEnv);
  },
  globalData: {
    version: '1.0.0',
    deviceEnv: null
  }
});
