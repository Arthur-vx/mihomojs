// DNS配置
const dnsConfig = {
  enable: true,
  listen: "0.0.0.0:1053",
  ipv6: false,
  "use-system-hosts": true,
  "prefer-h3": false,
  "respect-rules": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    // 本地主机/设备
    "+.lan",
    "+.local",
    // Windows网络出现小地球图标
    "dns.msftncsi.com",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    // QQ快速登录检测失败
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    // 微信快速登录检测失败
    "localhost.work.weixin.qq.com",
    "stun.+.+.+",
    "stun.+.+",
    "miwifi.com",
    "+.music.163.com",
    "*.126.net",
    "api-jooxtt.sanook.com",
    "streamoc.music.tc.qq.com",
    "mobileoc.music.tc.qq.com",
    "isure.stream.qqmusic.qq.com",
    "dl.stream.qqmusic.qq.com",
    "aqqmusic.tc.qq.com",
    "amobile.music.tc.qq.com",
    "+.xiaomi.com",
    "+.music.migu.cn",
    "music.migu.cn",
    "netis.cc",
    "+.ntp.org.cn",
    "+.openwrt.pool.ntp.org",
    "+.+.+.srv.nintendo.net",
    "+.+.stun.playstation.net",
    "speedtest.cros.wr.pvp.net",
    "+.xboxlive.com",
  ],
  "default-nameserver": ["223.5.5.5", "119.29.29.29", "1.1.1.1", "8.8.8.8"],
  nameserver: ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"], //兜底DNS
  "proxy-server-nameserver": [
    "https://223.5.5.5/dns-query",
    "https://1.1.1.1/dns-query",
  ],
  "nameserver-policy": {
    "+.zwu.edu.cn": ["10.70.50.23", "10.70.50.25"], //ZWU校园网
    "rule-set:cn-site,google@cn": [
      "https://223.5.5.5/dns-query",
      "https://doh.pub/dns-query",
      "https://dns.alidns.com/dns-query",
    ],
    "rule-set:github,netflix-site,chatgpt,tiktok,google,geolocation-!cn":
      [
        "https://1.1.1.1/dns-query",
        "https://194.242.2.2/dns-query",
        "https://public.dns.iij.jp/dns-query",
        "https://doh.opendns.com/dns-query",
      ],
  },
};

// 规则集通用配置
const ruleProviderCommon = {
  type: "http",
  format: "mrs",
  interval: 86400,
};
// 规则集配置
const ruleProviders = {
  proxydns: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "yaml",
    url: "https://github.com/Shattered217/ownrule-clash/raw/refs/heads/main/dns.yaml",
    path: "./rulesets/loyalsoldier/proxydns.yaml",
  },
  "netflix-ip": {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/netflix.mrs",
    path: "./rulesets/loyalsoldier/netflix-ip.mrs",
  },
  "netflix-site": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/netflix.mrs",
    path: "./rulesets/loyalsoldier/netflix-site.mrs",
  },
  speedtest: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/speedtest.mrs",
    path: "./rulesets/loyalsoldier/speedtest.mrs",
  },
  adobe: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/adobe.mrs",
    path: "./rulesets/loyalsoldier/adobe.mrs",
  },
  chatgpt: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/openai.mrs",
    path: "./rulesets/loyalsoldier/chatGPT.mrs",
  },
  github: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/github.mrs",
    path: "./rulesets/loyalsoldier/github.mrs",
  },
  bing: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/bing.mrs",
    path: "./rulesets/loyalsoldier/bing.mrs",
  },
  onedrive: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/onedrive.mrs",
    path: "./rulesets/loyalsoldier/onedrive.mrs",
  },
  microsoft: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/microsoft.mrs",
    path: "./rulesets/loyalsoldier/microsoft.mrs",
  },
  "google@cn": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/google@cn.mrs",
    path: "./rulesets/loyalsoldier/google@cn.mrs",
  },
  google: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/google.mrs",
    path: "./rulesets/loyalsoldier/google.mrs",
  },
  bilibili: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/bilibili.mrs",
    path: "./rulesets/loyalsoldier/bilibili.mrs",
  },
  spotify: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/spotify.mrs",
    path: "./rulesets/loyalsoldier/spotify.mrs",
  },
  tiktok: {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/tiktok.mrs",
    path: "./rulesets/loyalsoldier/tiktok.mrs",
  },
  gamedl: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://github.com/ACL4SSR/ACL4SSR/raw/master/Clash/Ruleset/GameDownload.list",
    path: "./rulesets/loyalsoldier/gamedl.list",
  },
  ubisoft: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://github.com/Shattered217/ownrule-clash/raw/main/ubisoft.list",
    path: "./rulesets/loyalsoldier/ubisoft.list",
  },
  epic: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Epic.list",
    path: "./rulesets/loyalsoldier/epic.list",
  },
  ea: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/EA/EA.list",
    path: "./rulesets/loyalsoldier/ea.list",
  },
  "steam-cn": {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://github.com/Shattered217/ownrule-clash/raw/main/steam-CN.list",
    path: "./rulesets/loyalsoldier/steam-cn.list",
  },
  steam: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "text",
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Steam.list",
    path: "./rulesets/loyalsoldier/steam.list",
  },
  "telegram-site": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/telegram.mrs",
    path: "./rulesets/loyalsoldier/telegram-site.mrs",
  },
  "telegram-ip": {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/telegram.mrs",
    path: "./rulesets/loyalsoldier/telegram-ip.mrs",
  },
  broker: {
    ...ruleProviderCommon,
    behavior: "classical",
    format: "yaml",
    url: "https://github.com/Arthur-vx/broker-rules/raw/refs/heads/main/rule/Clash/Broker/Broker.yaml",
    path: "./rulesets/broker-rules/Broker.yaml",
  },
  "geolocation-!cn": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/geolocation-!cn.mrs",
    path: "./rulesets/loyalsoldier/geolocation-!cn.mrs",
  },
  "cn-site": {
    ...ruleProviderCommon,
    behavior: "domain",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/cn.mrs",
    path: "./rulesets/loyalsoldier/cn-site.mrs",
  },
  "cn-ip": {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/cn.mrs",
    path: "./rulesets/loyalsoldier/cn-ip.mrs",
  },
  lan: {
    ...ruleProviderCommon,
    behavior: "ipcidr",
    url: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/private.mrs",
    path: "./rulesets/loyalsoldier/lan.mrs",
  },
};
// 规则
const rules = [
  // 禁用国外 QUIC
  "AND,(AND,(DST-PORT,443),(NETWORK,UDP)),(NOT,((rule-set,cn-site))),REJECT",
  "AND,(AND,(DST-PORT,443),(NETWORK,UDP)),(NOT,((rule-set,cn-ip))),REJECT",
  // 自定义规则
  "PROCESS-NAME,tailscaled.exe,DIRECT", // Tailscale
  "PROCESS-NAME,tailscale.exe,DIRECT", // Tailscale
  // Loyalsoldier 规则集
  "RULE-SET,proxydns,ProxyDNS",
  "RULE-SET,speedtest,Speedtest",
  "RULE-SET,github,Github",
  "RULE-SET,bing,微软服务",
  "RULE-SET,onedrive,微软服务",
  "RULE-SET,microsoft,微软服务",
  "RULE-SET,chatgpt,国外AI",
  "RULE-SET,adobe,Adobe",
  "RULE-SET,bilibili,哔哩哔哩",
  "RULE-SET,google@cn,DIRECT",
  "RULE-SET,google,Google",
  "RULE-SET,tiktok,TikTok",
  "RULE-SET,netflix-ip,Netflix,no-resolve",
  "RULE-SET,netflix-site,Netflix",
  "RULE-SET,telegram-ip,Telegram,no-resolve",
  "RULE-SET,telegram-site,Telegram",
  "RULE-SET,spotify,Spotify",
  "RULE-SET,broker,券商",
  "RULE-SET,gamedl,游戏下载",
  "RULE-SET,ubisoft,Epic ea 育碧",
  "RULE-SET,epic,Epic ea 育碧",
  "RULE-SET,ea,Epic ea 育碧",
  "RULE-SET,steam-cn,Steam-CN",
  "RULE-SET,steam,Steam",
  "RULE-SET,geolocation-!cn,节点选择",
  "RULE-SET,cn-site,全局直连",
  "RULE-SET,cn-ip,全局直连,no-resolve",
  "RULE-SET,lan,全局直连,no-resolve",
  // 其他规则
  "MATCH,漏网之鱼",
];
// 代理组通用配置
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: "https://www.google.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false,
};

const commonSelectProxies = [
  "节点选择",
  "全局直连",
  "手动选择",
  "手动选择备用",
  "自建节点",
];

// YaNet/global_script.js 追加配置：只新增，不移除原有配置。
const yanetSkipIps = [
  "10.0.0.0/8",
  "100.64.0.0/10",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "198.18.0.0/16",
  "FC00::/7",
  "FE80::/10",
  "::1/128",
];

const yanetGithubProxy = "https://ghfast.top/";

const yanetRegionDefinitions = [
  {
    name: "HK香港",
    regex: /港|🇭🇰|hk|hongkong|hong kong/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png",
  },
  {
    name: "SG新加坡",
    regex: /新加坡|🇸🇬|sg|singapore/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png",
  },
  {
    name: "US美国",
    regex: /(?!.*aus)(?=.*(美|🇺🇸|us(?!t)|usa|american|united states)).*/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png",
  },
  {
    name: "JP日本",
    regex: /日本|🇯🇵|jp|japan/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png",
  },
  {
    name: "TW台湾省",
    regex: /台湾|台灣|🇹🇼|tw|taiwan|tai wan/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png",
  },
  {
    name: "KR韩国",
    regex: /韩|🇰🇷|kr|korea/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png",
  },
  {
    name: "GB英国",
    regex: /英|🇬🇧|uk|united kingdom|great britain/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png",
  },
  {
    name: "DE德国",
    regex: /德国|🇩🇪|de|germany/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png",
  },
  {
    name: "CA加拿大",
    regex: /加拿大|🇨🇦|ca|canada/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png",
  },
  {
    name: "AU澳大利亚",
    regex: /澳大利亚|🇦🇺|au|australia|sydney/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png",
  },
  {
    name: "MY马来西亚",
    regex: /马来|🇲🇾|my|malaysia/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png",
  },
  {
    name: "TR土耳其",
    regex: /土耳其|🇹🇷|tr|turkey/i,
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png",
  },
];

const yanetRuleProviders = {
  applications: {
    type: "http",
    behavior: "classical",
    format: "text",
    interval: 86400,
    url: "https://github.com/DustinWin/ruleset_geodata/raw/refs/heads/mihomo-ruleset/applications.list",
    path: "./ruleset/DustinWin/applications.list",
  },
  adblockmihomo: {
    type: "http",
    behavior: "domain",
    format: "mrs",
    interval: 86400,
    url: "https://github.com/217heidai/adblockfilters/raw/refs/heads/main/rules/adblockmihomo.mrs",
    path: "./ruleset/adblockfilters/adblockmihomo.mrs",
  },
};

const yanetAdditionalRules = [
  "RULE-SET,applications,下载软件",
  "PROCESS-NAME-REGEX,(?i).*Oray.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*Sunlogin.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*AweSun.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*NodeBaby.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*Node Baby.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*nblink.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*owjdxb.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*vpn.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*vnc.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*tvnserver.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*节点小宝.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*AnyDesk.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*ToDesk.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*RustDesk.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*TeamViewer.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*Zerotier.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*Tailscaled.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*phddns.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*ngrok.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*frpc.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*frps.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*natapp.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*cloudflared.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*xmqtunnel.*,全局直连",
  "PROCESS-NAME-REGEX,(?i).*Navicat.*,全局直连",
  "DOMAIN-SUFFIX,iepose.com,全局直连",
  "DOMAIN-SUFFIX,iepose.cn,全局直连",
  "DOMAIN-SUFFIX,nblink.cc,全局直连",
  "DOMAIN-SUFFIX,ionewu.com,全局直连",
  "DOMAIN-SUFFIX,vicp.net,全局直连",
  "GEOSITE,jetbrains-ai,国外AI",
  "GEOSITE,category-ai-!cn,国外AI",
  "GEOSITE,category-ai-chat-!cn,国外AI",
  "DOMAIN-SUFFIX,meta.ai,国外AI",
  "DOMAIN-SUFFIX,meta.com,国外AI",
  "PROCESS-NAME-REGEX,(?i).*Antigravity.*,国外AI",
  "PROCESS-NAME-REGEX,(?i).*language_server_.*,国外AI",
  "GEOSITE,youtube,YouTube",
  "GEOSITE,biliintl,哔哩哔哩",
  "GEOSITE,category-games@cn,全局直连",
  "GEOSITE,category-games,游戏专用",
  "GEOSITE,category-ads-all,广告过滤",
  "RULE-SET,adblockmihomo,广告过滤",
  "GEOSITE,apple-cn,苹果服务",
  "GEOSITE,category-public-tracker,全局直连",
  "GEOSITE,category-game-platforms-download@cn,全局直连",
];

const yanetAdditionalGroups = [
  {
    ...groupBaseOption,
    name: "国外AI",
    type: "select",
    proxies: [...commonSelectProxies],
    url: "https://chat.openai.com/cdn-cgi/trace",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png",
  },
  {
    ...groupBaseOption,
    name: "YouTube",
    type: "select",
    proxies: ["Google", "节点选择", "手动选择", "手动选择备用", "自建节点"],
    url: "https://www.youtube.com/s/desktop/494dd881/img/favicon.ico",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png",
  },
  {
    ...groupBaseOption,
    name: "哔哩哔哩",
    type: "select",
    proxies: [...commonSelectProxies],
    url: "https://www.bilibili.tv/",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili_3.png",
  },
  {
    ...groupBaseOption,
    name: "游戏专用",
    type: "select",
    proxies: ["节点选择", "手动选择", "手动选择备用", "自建节点", "全局直连"],
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png",
  },
  {
    ...groupBaseOption,
    name: "广告过滤",
    type: "select",
    proxies: ["REJECT", "全局直连", "节点选择"],
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png",
  },
  {
    ...groupBaseOption,
    name: "苹果服务",
    type: "select",
    proxies: [...commonSelectProxies],
    url: "https://www.apple.com/library/test/success.html",
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_2.png",
  },
  {
    ...groupBaseOption,
    name: "下载软件",
    type: "select",
    proxies: ["全局直连", "REJECT", "节点选择", "手动选择", "手动选择备用", "自建节点"],
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png",
  },
];

// 策略组显示顺序：总入口 -> AI/开发 -> 媒体 -> 游戏 -> 通讯/系统 -> 基础网络 -> 手动/地区。
const proxyGroupDisplayOrder = [
  "节点选择",
  "国外AI",
  "Github",
  "Google",
  "微软服务",
  "券商",
  "YouTube",
  "Netflix",
  "Spotify",
  "TikTok",
  "哔哩哔哩",
  "游戏专用",
  "游戏下载",
  "Steam",
  "Steam-CN",
  "Epic ea 育碧",
  "Telegram",
  "苹果服务",
  "Adobe",
  "广告过滤",
  "下载软件",
  "ProxyDNS",
  "Speedtest",
  "手动选择",
  "手动选择备用",
  "自建节点",
  "全局直连",
  "漏网之鱼",
  "HK香港",
  "SG新加坡",
  "US美国",
  "JP日本",
  "TW台湾省",
  "KR韩国",
  "GB英国",
  "DE德国",
  "CA加拿大",
  "AU澳大利亚",
  "MY马来西亚",
  "TR土耳其",
];

function pushUnique(target, values) {
  values.forEach((value) => {
    if (!target.includes(value)) target.push(value);
  });
}

function mergeUniqueByName(target, values) {
  const existingNames = new Set(target.map((item) => item?.name));
  values.forEach((value) => {
    if (!existingNames.has(value.name)) {
      target.push(value);
      existingNames.add(value.name);
    }
  });
}

function buildRegionProxyGroups(proxies) {
  const regionGroups = yanetRegionDefinitions.map((region) => ({
    ...groupBaseOption,
    name: region.name,
    type: "select",
    icon: region.icon,
    proxies: [],
  }));

  proxies.forEach((proxy) => {
    const name = proxy?.name;
    if (!name) return;

    const regionGroup = regionGroups.find((group, index) =>
      yanetRegionDefinitions[index].regex.test(name)
    );
    if (regionGroup && !regionGroup.proxies.includes(name)) {
      regionGroup.proxies.push(name);
    }
  });

  return regionGroups.filter((group) => group.proxies.length > 0);
}

function prependUnique(target, values) {
  values
    .slice()
    .reverse()
    .forEach((value) => {
      const index = target.indexOf(value);
      if (index >= 0) target.splice(index, 1);
      target.unshift(value);
    });
}

function addRegionGroupsToSelectors(groups, regionGroupNames) {
  if (regionGroupNames.length === 0) return;

  const selectorNames = [
    "节点选择",
    "国外AI",
    "Github",
    "Google",
    "微软服务",
    "券商",
    "YouTube",
    "Netflix",
    "Spotify",
    "TikTok",
    "哔哩哔哩",
    "游戏专用",
    "游戏下载",
    "Steam",
    "Steam-CN",
    "Epic ea 育碧",
    "Telegram",
    "苹果服务",
  ];

  const appendRegionSelectorNames = [
    "国外AI",
    "Netflix",
    "哔哩哔哩",
    "苹果服务",
  ];

  groups.forEach((group) => {
    if (selectorNames.includes(group.name)) {
      if (!Array.isArray(group.proxies)) group.proxies = [];
      if (appendRegionSelectorNames.includes(group.name)) {
        pushUnique(group.proxies, regionGroupNames);
      } else {
        prependUnique(group.proxies, regionGroupNames);
      }
    }
  });
}

function sortProxyGroupsByDisplayOrder(groups) {
  const orderMap = new Map(proxyGroupDisplayOrder.map((name, index) => [name, index]));
  return [...groups].sort((a, b) => {
    const orderA = orderMap.has(a.name) ? orderMap.get(a.name) : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(b.name) ? orderMap.get(b.name) : Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

function applyYanetAdditions(config) {
  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["mode"] = "rule";
  config["external-controller"] = "127.0.0.1:9090";
  config["external-controller-cors"] = {
    "allow-origins": ["*"],
    "allow-private-network": true,
  };
  config["secret"] = "YaNet";
  config["port"] = 7890;
  config["socks-port"] = 7891;
  config["mixed-port"] = 7892;
  config["redir-port"] = 7893;
  config["tproxy-port"] = 7894;
  config["external-ui"] = "ui";
  config["external-ui-url"] = `${yanetGithubProxy}https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip`;
  config["keep-alive-interval"] = 1800;
  config["find-process-mode"] = "strict";
  config["geodata-mode"] = false;
  config["geodata-loader"] = "memconservative";
  config["geo-auto-update"] = true;
  config["geo-update-interval"] = 24;
  config["ntp"] = {
    enable: true,
    "write-to-system": false,
    server: "cn.ntp.org.cn",
  };
  config["tun"] = {
    enable: true,
    stack: "mixed",
    device: "utun1999",
    "auto-route": true,
    "auto-redirect": true,
    "auto-detect-interface": true,
    "strict-route": true,
    mtu: 1500,
    gso: true,
    "gso-max-size": 65536,
    "exclude-interface": ["NodeBabyLink"],
    "route-exclude-address": yanetSkipIps.filter((ip) => ip !== "198.18.0.0/16"),
    "dns-hijack": ["any:53", "tcp://any:53"],
  };
  config["geox-url"] = {
    geoip: `${yanetGithubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat`,
    geosite: `${yanetGithubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat`,
    mmdb: `${yanetGithubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb`,
    asn: `${yanetGithubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb`,
  };

  config.proxies = config.proxies || [];
  const regionGroups = buildRegionProxyGroups(config.proxies);
  const regionGroupNames = regionGroups.map((group) => group.name);

  mergeUniqueByName(config.proxies, [
    { name: "直连", type: "direct", udp: true },
    { name: "拒绝", type: "reject", udp: true },
  ]);

  if (config["dns"]) {
    config["dns"]["log-level"] = "error";
    config["dns"]["use-hosts"] = true;
    config["dns"]["direct-nameserver"] = ["119.29.29.29", "223.5.5.5"];
    pushUnique(config["dns"]["fake-ip-filter"], [
      "geosite:gfw",
      "geosite:jetbrains-ai",
      "geosite:category-ai-!cn",
      "geosite:category-ai-chat-!cn",
      "geosite:category-games-!cn",
      "geosite:google@!cn",
      "geosite:telegram",
      "geosite:facebook",
      "geosite:google",
      "geosite:amazon",
    ]);
    config["dns"]["nameserver-policy"] = {
      ...config["dns"]["nameserver-policy"],
      "geosite:private": "system",
      "geosite:tld-cn,cn,steam@cn,category-games@cn,microsoft@cn,apple@cn,category-game-platforms-download@cn,category-public-tracker": [
        "https://223.5.5.5/dns-query",
        "https://doh.pub/dns-query",
        "https://dns.alidns.com/dns-query",
      ],
      "geosite:gfw,jetbrains-ai,category-ai-!cn,category-ai-chat-!cn": [
        "https://dns.google/dns-query",
        "https://dns.adguard-dns.com/dns-query",
      ],
    };
    // global_script.js 使用 fake-ip-filter-mode: "whitelist"，会反转你现有 fake-ip-filter 的语义，先注释保留。
    // config["dns"]["fake-ip-filter-mode"] = "whitelist";
  }

  if (config["sniffer"]) {
    config["sniffer"]["parse-pure-ip"] = false;
    config["sniffer"]["skip-src-address"] = yanetSkipIps;
    config["sniffer"]["skip-dst-address"] = yanetSkipIps;
    config["sniffer"]["force-domain"] = [
      "+.google.com",
      "+.googleapis.com",
      "+.googleusercontent.com",
      "+.youtube.com",
      "+.facebook.com",
      "+.messenger.com",
      "+.fbcdn.net",
      "fbcdn-a.akamaihd.net",
    ];
  }

  config["rule-providers"] = {
    ...config["rule-providers"],
    ...yanetRuleProviders,
  };
  mergeUniqueByName(config["proxy-groups"], yanetAdditionalGroups);
  mergeUniqueByName(config["proxy-groups"], regionGroups);
  addRegionGroupsToSelectors(config["proxy-groups"], regionGroupNames);
  config["proxy-groups"] = sortProxyGroupsByDisplayOrder(config["proxy-groups"]);
  const matchRule = config["rules"].find((rule) => rule.startsWith("MATCH,"));
  const nonMatchRules = config["rules"].filter((rule) => !rule.startsWith("MATCH,"));
  const additionalRules = yanetAdditionalRules.filter((rule) => !nonMatchRules.includes(rule));
  config["rules"] = [...nonMatchRules, ...additionalRules, matchRule].filter(Boolean);
}

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object"
      ? Object.keys(config["proxy-providers"]).length
      : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  ((config["sniffer"] = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    sniff: {
      TLS: {
        ports: [443, 8443],
      },
      HTTP: {
        ports: [80, "8080-8880"],
        "override-destination": true,
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    "skip-domain": ["Mijia Cloud", "+.oray.com"],
  }),
    (config["unified-delay"] = true)); //统一延迟
  config["tcp-concurrent"] = true; //TCP 并发

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true,
  };

  // 覆盖原配置中DNS配置
  config["dns"] = dnsConfig;

  // 覆盖原配置中的代理组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      name: "节点选择",
      type: "select",
      proxies: [
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png",
    },
    {
      ...groupBaseOption,
      name: "手动选择",
      type: "select",
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...groupBaseOption,
      name: "手动选择备用",
      type: "select",
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...groupBaseOption,
      name: "自建节点",
      type: "select",
      "include-all": true,
      filter: "自建|Craig|hk-vmess|HY|backup|_",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
    },
    {
      ...groupBaseOption,
      name: "ProxyDNS",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Server.png",
    },
    {
      ...groupBaseOption,
      name: "Speedtest",
      type: "select",
      proxies: ["全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Speedtest.png",
    },
    {
      ...groupBaseOption,
      name: "国外AI",
      type: "select",
      proxies: [...commonSelectProxies],
      icon: "https://www.clashverge.dev/assets/icons/chatgpt.svg",
    },
    {
      ...groupBaseOption,
      name: "Github",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
        "全局直连",
      ],
      icon: "https://www.clashverge.dev/assets/icons/github.svg",
    },
    {
      ...groupBaseOption,
      name: "哔哩哔哩",
      type: "select",
      proxies: [...commonSelectProxies],
      icon: "https://fastly.jsdelivr.net/gh/Orz-3/mini@master/Color/Bili.png",
    },
    {
      ...groupBaseOption,
      name: "TikTok",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/tiktok.png",
    },
    {
      ...groupBaseOption,
      name: "Netflix",
      type: "select",
      proxies: [...commonSelectProxies],
      icon: "https://fastly.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/netflix.png",
    },
    {
      ...groupBaseOption,
      name: "Google",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg",
    },
    {
      ...groupBaseOption,
      name: "券商",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
        "全局直连",
      ],
      url: "https://www.futunn.com/",
      icon: "https://www.futunn.com/favicon.ico",
    },
    {
      ...groupBaseOption,
      name: "Spotify",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png",
    },
    {
      ...groupBaseOption,
      name: "Telegram",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg",
    },
    {
      ...groupBaseOption,
      name: "微软服务",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg",
    },
    {
      ...groupBaseOption,
      name: "Adobe",
      type: "select",
      proxies: ["全局直连", "REJECT", "节点选择"],
      icon: "https://www.adobe.com/favicon.ico",
    },
    {
      ...groupBaseOption,
      name: "游戏下载",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Download.png",
    },
    {
      ...groupBaseOption,
      name: "Epic ea 育碧",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://www.clashverge.dev/assets/icons/epic.svg",
    },
    {
      ...groupBaseOption,
      name: "Steam-CN",
      type: "select",
      proxies: [
        "全局直连",
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
      ],
      icon: "https://www.clashverge.dev/assets/icons/steam.svg",
    },
    {
      ...groupBaseOption,
      name: "Steam",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
        "全局直连",
      ],
      icon: "https://www.clashverge.dev/assets/icons/steam.svg",
    },
    {
      ...groupBaseOption,
      name: "全局直连",
      type: "select",
      proxies: [
        "DIRECT",
        "节点选择",
      ],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
    },
    {
      ...groupBaseOption,
      name: "漏网之鱼",
      type: "select",
      proxies: [
        "节点选择",
        "手动选择",
        "手动选择备用",
        "自建节点",
        "全局直连",
      ],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg",
    },
  ];

  // 覆盖原配置中的规则
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  applyYanetAdditions(config);

  // 返回修改后的配置
  return config;
}
