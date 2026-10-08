自用clash-verge配置覆写脚本

另有独立的 [国内直连 / 海外节点手选版](docs/CN-Direct.md)：使用 `Script-CN-Direct.js`，默认拒绝外网，手选节点后开启代理，节点故障不回落直连。原 `Script.js` 保持原有行为。

# 代理组

当前脚本会覆盖并重新生成策略组，主要分为：

- 总入口：节点选择
- 手动入口：手动选择、手动选择备用、自建节点
- AI/开发：国外AI、Github
- 平台服务：Google、微软服务、苹果服务
- 券商：券商（富途、Moomoo、长桥、老虎、Schwab 等）
- 媒体：YouTube、Netflix、Spotify、TikTok、哔哩哔哩
- 游戏：游戏专用、游戏下载、Steam、Epic ea 育碧
- 通讯与系统：Telegram、ProxyDNS、Speedtest
- 过滤与下载：Adobe（可选 REJECT）、广告过滤、下载软件
- 兜底：全局直连、漏网之鱼
- 地区组：HK香港、SG新加坡、US美国、JP日本、TW台湾省、KR韩国、GB英国、DE德国、CA加拿大、AU澳大利亚、MY马来西亚、TR土耳其

地区组会按节点名称自动生成，只有订阅里存在对应地区节点时才显示。游戏下载使用国内游戏下载规则，Steam 可走代理，用于兼顾社区网页和游戏下载。

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

# GeoData 版本与兼容性检查

生产配置关闭了 `geo-auto-update`，并固定使用不可变 Release
[`geodata-20260827-0328`](https://github.com/Arthur-vx/mihomojs/releases/tag/geodata-20260827-0328)。
这样上游 GeoSite 删除或改名标签时，不会直接导致客户端配置失效。

工作流 [`.github/workflows/validate-geodata.yml`](./.github/workflows/validate-geodata.yml)
会在推送、Pull Request、手动触发和每日定时任务中执行以下检查：

- 校验上游四个 GeoData 文件的 SHA-256；
- 确认 `Script.js` 引用的全部 GeoSite 标签仍然存在；
- 生成完整测试配置；
- 使用 Mihomo v1.19.29 执行真实配置检查。

每日任务失败时会创建或更新一个 `GeoData compatibility check failed` Issue，生产 Release 不会自动变化。

## 升级 GeoData

1. 确认 `Validate GeoData compatibility` 工作流使用上游 `latest` 数据执行成功；
2. 下载本次验证过的 `geosite.dat`、`geoip-lite.dat`、`country.mmdb` 和 `GeoLite2-ASN.mmdb`；
3. 校验上游 `.sha256sum`，创建新的 `geodata-YYYYMMDD-HHMM` Release，禁止覆盖旧 Release；
4. 只修改 `Script.js` 中的 Release 标签并重新执行全部检查；
5. 推送后，在 Clash Party 中更新远程覆写并刷新订阅。

## 回退 GeoData

如果新数据出现非预期问题，把 `Script.js` 中的 `geodata-*` 标签改回上一个已验证版本并重新推送即可。旧 Release 不删除、不覆盖，因此回退不依赖上游状态。
