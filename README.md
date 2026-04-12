# 🀄 长春麻将算分器 - 微信小程序版

## 📦 文件结构

```
miniprogram/
├── app.js                          # 小程序入口
├── app.json                        # 全局配置
├── app.wxss                        # 全局样式
├── project.config.json             # 项目配置
├── sitemap.json                    # 站点地图
└── pages/
    └── index/
        ├── index.js                # 页面逻辑（计算器+规则+设置）
        ├── index.json              # 页面配置
        ├── index.wxml              # 页面模板
        └── index.wxss              # 页面样式
```

## 🚀 部署步骤

### 第一步：注册小程序账号
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击「立即注册」→ 选择「小程序」
3. 按提示完成注册，获取 **AppID**

### 第二步：安装开发工具
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 安装并用微信扫码登录

### 第三步：创建项目
1. 打开微信开发者工具
2. 点击「+」创建项目
3. 填写：
   - **项目名称**：长春麻将算分器
   - **目录**：选择本 `miniprogram` 文件夹
   - **AppID**：填入你的小程序 AppID（或选择测试号）
   - **不使用云服务**
4. 点击「确定」

### 第四步：预览和调试
1. 项目打开后，左侧模拟器即可看到效果
2. 点击「预览」→ 用手机微信扫码在真机测试
3. 使用「真机调试」可在手机上调试

### 第五步：发布上线
1. 点击工具栏的「上传」按钮
2. 填写版本号和描述
3. 登录 [微信公众平台](https://mp.weixin.qq.com/) → 管理 → 版本管理
4. 提交审核 → 等待审核通过 → 发布

## 🔧 自定义配置

### 修改 AppID
编辑 `project.config.json`，将 `appid` 改为你的真实 AppID：
```json
"appid": "你的真实AppID"
```

### 修改默认设置
编辑 `pages/index/index.js` 中 `data` 部分的默认值：
```javascript
baseScore: 1,        // 底分
capFan: 7,           // 封顶翻数（5=32, 6=64, 7=128, 8=256, 99=不封顶）
qingyiseFan: 4,      // 清一色翻数
qiduiFan: 4,         // 七对翻数
haohuaQiduiFan: 6,   // 豪华七对翻数
mingGangPrice: 2,    // 明杠价格
anGangPrice: 4,      // 暗杠价格
```

## 📱 功能特色

- **🧮 算分页**：一键快速计算，支持所有番型组合
- **📖 规则页**：完整长春麻将规则参考（可折叠）
- **⚙️ 设置页**：所有约定项可配置，保存到本地

## ⚠️ 注意事项

1. 小程序审核时，需要确保不涉及赌博引导（建议在描述中注明"仅供娱乐参考"）
2. 如果使用测试号，只能自己扫码体验，不能分享给他人
3. 正式发布需要完成小程序认证（个人号免费）
4. 设置数据保存在用户手机本地（wx.setStorageSync）
