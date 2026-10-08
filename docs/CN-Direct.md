# 国内直连 / 海外节点手选版

这是独立覆写脚本 `Script-CN-Direct.js`，原来的 `Script.js` 不作修改。

## 导入

在 Clash Party 的「覆写」中导入以下链接：

```text
https://raw.githubusercontent.com/Arthur-vx/mihomojs/main/Script-CN-Direct.js
```

jsDelivr 备用地址（可能有缓存延迟）：

```text
https://cdn.jsdelivr.net/gh/Arthur-vx/mihomojs@main/Script-CN-Direct.js
```

进入「订阅管理」→ 当前订阅「⋯」→「编辑信息」：取消绑定旧 `Script.js`，只绑定新脚本，保存并重新应用该订阅。不要把旧脚本设为全局覆写后再混用；其他会修改规则、DNS 或代理组的覆写也应取消绑定。

在代理页面找到「海外节点（手动选择）」，从订阅节点中自行选一个海外节点。脚本不会根据名称判断节点地理位置或出口国家，也不删除未知、高倍率或不在地区分组里的节点。订阅里的流量提示伪节点若存在，也可能显示在列表中，请选择实际可用节点。

首次使用默认 `REJECT`，外网在选定节点前连接失败。选择会保存；所选节点故障时仍使用它，不会自动改选其他节点或直连。空订阅、节点从订阅中消失时也以 `REJECT` 兜底。订阅中明确为 `direct` / `compatible` / `dns` 的伪节点不进入海外组，但原定义保留。

`GLOBAL` 保留原订阅的节点和代理组选项，仅移除 `DIRECT` / 等价的直接直连项，默认选择海外手选组。原有业务组定义及其内部选项不作改写。平时保持规则模式，外网由专用海外组处理；全局模式下若手动选择其他旧业务组，则使用该组原有设置。

## 客户端设置

- 使用「规则」模式，保持 TUN 开启。
- 关闭应用层的「DNS 覆写」（旧版称「控制 DNS 设置」）和「嗅探覆写」，让本脚本的 DNS/嗅探设置生效。
- 应用后检查实际配置：顶层 `ipv6` 为 true，TUN 的 `auto-route` / `strict-route` 为 true，`dns-hijack` 同时有 `any:53` 和 `tcp://any:53`。客户端可能在脚本之后覆盖这些参数，不能仅靠 JS 保证最终运行值。
- 脚本不添加公开的控制端口，不改已有节点密码、订阅地址或代理服务商。

## 分流与 DNS

规则依次为：Claude/Anthropic 指定走海外组；局域网域名与私有 IPv4/IPv6 直连；原订阅可识别的局域网规则直连；国内域名规则集直连；国内 IP 规则集直连；`MATCH` 指向海外组。

其他原有业务分流、按程序强制直连、广告拦截规则不再作为路由规则使用。原订阅的节点、代理集合和代理组定义保留，原代理组不再决定本版的业务出口。海外组不引用那些可能含有直连的旧组。

国内域名按指定白名单判断，而不是按网站公司的注册地判断。IP 规则带 `no-resolve`，仅匹配连接中已有的真实目的 IP，不会为了判定地域主动解析未知域名。白名单之外的域名默认走代理，即使其 CDN 最终可能位于国内；`claude.ai` / `anthropic.com` 在 IP 规则之前明确走代理。

DNS 使用 fake-IP，局域网名称例外。国内白名单域名与节点自身的域名使用国内 DNS；其余域名使用明确指定经海外组访问的 Cloudflare / Google DoH。无国内 DNS 回退池；禁用系统 hosts 对本脚本 DNS 的改写。DNS 的 IPv6 结果关闭，手写 IPv6 目标仍由 TUN 与分流规则处理。

本版的断网保护针对「节点故障且 Mihomo/TUN 持续运行」。退出客户端、关闭 TUN 或切换到直连模式不属于脚本能控制的状态。

## 国内规则来源与更新

- 域名：[pluwen/china-domain-allowlist](https://github.com/pluwen/china-domain-allowlist) 的 `allow-list.sorl`。SwitchyOmega 的 `*.example.com` 转为 Mihomo 的 `+.example.com`，覆盖根域及子域；精确域名保留；内网 IP 通配用私网 CIDR 规则覆盖。
- IP：[Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules) 的 `release/cncidr.txt`。

两份数据以 inline 规则集快照内置在 JS 中，导入首次启动、海外节点中断或规则网站不可达时，都不需要临时放行直连下载。来源 URL、获取日期、SHA-256 与数据均记录在脚本的 `CN_DIRECT_SNAPSHOT` 中。

这是快照，不会在客户端内自动追踪上游更新。维护者运行以下命令，检查测试通过后发布新脚本；用户更新远程覆写并重新应用订阅即可获得新规则：

```sh
node scripts/refresh-cn-direct-rules.js
node --test
```

已有 HTTP 规则集定义保留，其更新指定走海外组，不增加直连下载例外。

## 验证与恢复

发布前运行单元测试与真实 Mihomo 配置检查。设置 `MIHOMO_BIN` 后还会启动一个关闭 TUN 的隔离实例，通过本地 DNS、国内站点和代理测试端验证规则集、节点选择与故障行为，不干扰用户的现有客户端。

```sh
MIHOMO_BIN=/path/to/mihomo node --test
```

导入后的真实网络验收：访问国内站点并核对连接规则为 DIRECT；访问 `claude.ai` 并核对海外组及节点；终端使用不带显式代理的 `curl` 查询海外出口；暂时阻断选定节点，确认 Claude 连接失败而国内站点仍可访问。网站返回 403/挑战页面不等于网络连接失败，需结合连接记录判断。

恢复分流：回到该订阅「编辑信息」，取消新脚本、重新绑定旧 `Script.js`，保存并应用。若同时手动更改了客户端 TUN/DNS 设置，还需恢复这些设置；完整恢复使用改动前的本地配置备份。
