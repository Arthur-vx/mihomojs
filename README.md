自用clash-verge配置覆写脚本

# 代理组

- Speedtest
- Github
- Adobe(选择REJECT可防止盗版软件联网弹窗)
- bilibili(港澳台或修改ip属地)
- Tiktok
- Netflix
- Spotify(国内听歌可直连)
- Telegram
- Bing(防止rewards乱跳)
- Onedrive
- 微软服务
- ChatGPT
- 券商（富途、Moomoo、长桥、老虎、Schwab 等）
- 游戏下载
- Epic ea 育碧
- Steam-CN
- Steam
  (Steam-CN直连，Steam走代理，即可实现代理社区等网页的同时直连下载游戏)

# DNS配置

- ✅关闭IPv6
- ✅使用系统hosts文件
- ✅关闭h3
- ✅DNS代理规则
- ✅国内外分流

# 其它配置

- ✅域名嗅探
- ✅TCP 并发
- ✅统一延迟
- ✅禁用 QUIC

# 预览图

![image](https://github.com/user-attachments/assets/983e3600-fb4c-425e-9069-63f64a23189c)
![image](https://github.com/user-attachments/assets/77c89597-1c70-45ee-b113-cafafbea353c)

# Clash Verge 全局拓展脚本

- 脚本文件：[Script.js](./Script.js)
- 券商分流规则引用：[Arthur-vx/broker-rules](https://github.com/Arthur-vx/broker-rules/blob/main/rule/Clash/Broker/Broker.yaml)
- 券商策略组支持选择香港、新加坡、日本、台湾、美国等地区节点；地区组会按节点名称自动生成。
- 如果使用 Clash Party / Clash Verge 的远程覆写，更新脚本后需要刷新订阅或重新应用覆写，运行配置才会重新生成并显示新增策略组。

# Clash Verge 端建议配置

- 打开虚拟网卡模式（点击设置）
- 打开自动设置全局路由
- 打开严格路由
  <img width="2291" height="1132" alt="image" src="https://github.com/user-attachments/assets/243a805f-d433-460e-8519-5a127e22a5bc" />
