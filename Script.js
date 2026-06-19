/***
 * Clash Verge Rev / Mihomo Party 优化脚本
 * 原作者: dahaha-365 (YaNet)
 * Github：https://github.com/dahaha-365/YaNet
 */

function stringToArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val !== 'string') return []
  return val
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

// --- 1. 静态配置区域 ---

const _skipIps =
  '10.0.0.0/8;100.64.0.0/10;127.0.0.0/8;169.254.0.0/16;172.16.0.0/12;192.168.0.0/16;198.18.0.0/16;FC00::/7;FE80::/10;::1/128'

// DNS 配置
const _chinaDohDns = 'https://doh.pub/dns-query;https://dns.alidns.com/dns-query'
const _foreignDohDns =
  'https://dns.google/dns-query;https://dns.adguard-dns.com/dns-query'
const _chinaIpDns = '119.29.29.29;223.5.5.5'
const _foreignIpDns = "8.8.8.8;94.140.14.14"

const defaultArgs = {
  enable: true,
  ruleSet: 'all',
  regionSet: 'all',
  interfaceName: '',
  excludeHighPercentage: true,
  globalRatioLimit: 2,
  skipIps: _skipIps,
  defaultDNS: _chinaIpDns,
  directDNS: _chinaIpDns,
  chinaDNS: _chinaDohDns,
  foreignDNS: _foreignDohDns,
  dns: true,
  mode: 'default',
  ipv6: false,
  logLevel: 'error',
  githubProxy: '',
}

let args =
  typeof $arguments !== 'undefined'
    ? $arguments
    : defaultArgs

args = {
  ...defaultArgs,
  ...Object.fromEntries(
    Object.entries(args).filter(([_, value]) => value !== undefined)
  )
}

/**
 * 如果是直接在软件中粘贴脚本的，就手动修改下面这几个变量实现自定义配置
 */
let {
  enable = args.enable || true,
  ruleSet = args.ruleSet || 'all', // 支持 'all' 或 'openai,youtube,ads' 这种格式
  regionSet = args.regionSet || 'all', // 匹配 regionDefinitions.name 前两个字母 (严格大小写)
  interfaceName = args.interfaceName || '',
  excludeHighPercentage = !!args.excludeHighPercentage ||
    false,
  globalRatioLimit = args.globalRatioLimit || 2,
  skipIps = args.skipIps || _skipIps,
  defaultDNS = args.defaultDNS || _chinaIpDns,
  directDNS = args.directDNS || _chinaIpDns,
  chinaDNS = args.chinaDNS || _chinaDohDns,
  foreignDNS = args.foreignDNS || _foreignDohDns,
  dns = args.dns || false,
  mode = args.mode || '',
  ipv6 = args.ipv6 || false,
  logLevel = args.logLevel || 'error',
  githubProxy = args.githubProxy || 'https://ghfast.top/',
} = args

/**
 * 模式配置
 */
if (['securest', 'secure', 'default', 'fast', 'fastest'].includes(mode)) {
  switch (mode) {
    case 'securest':
      defaultDNS = _foreignIpDns
      directDNS = _foreignDohDns
      break;
    case 'secure':
      defaultDNS = _foreignIpDns
      directDNS = _chinaDohDns
      chinaDNS = _chinaDohDns
      foreignDNS = _foreignDohDns
      break;
    case 'fast':
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaIpDns
      foreignDNS = _chinaDohDns
      break;
    case 'fastest':
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaIpDns
      foreignDNS = _chinaIpDns
      break;
    default:
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaDohDns
      foreignDNS = _chinaDohDns
      break;
  }
}

skipIps = stringToArray(skipIps)
defaultDNS = stringToArray(defaultDNS)
directDNS = stringToArray(directDNS)
chinaDNS = stringToArray(chinaDNS)
foreignDNS = stringToArray(foreignDNS)

/**
 * 分流规则配置，会自动生成对应的策略组
 * 设置的时候可遵循“最小，可用”原则，把自己不需要的规则全禁用掉，提高效率
 * true = 启用
 * false = 禁用
 */
let ruleOptions = {
  apple: false,
  microsoft: false,
  broker: false,
  github: false,
  google: false,
  openai: false,
  spotify: false,
  youtube: false,
  bahamut: false,
  netflix: false,
  tiktok: false,
  disney: false,
  pixiv: false,
  hbo: false,
  mediaHMT: false,
  biliintl: false,
  tvb: false,
  hulu: false,
  primevideo: false,
  telegram: false,
  line: false,
  whatsapp: false,
  games: false,
  japan: false,
  ads: false,
}

if (ruleSet === 'all') {
  Object.keys(ruleOptions).forEach(key => ruleOptions[key] = true);
} else if (typeof ruleSet === 'string') {
  const enabledKeys = ruleSet.split(';').map(s => s.trim());
  enabledKeys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(ruleOptions, key)) {
      ruleOptions[key] = true;
    }
  });
}

// 初始规则
const rules = [
  'RULE-SET,applications,下载软件',
  'PROCESS-NAME-REGEX,(?i).*Oray.*,直连',
  'PROCESS-NAME-REGEX,(?i).*Sunlogin.*,直连',
  'PROCESS-NAME-REGEX,(?i).*AweSun.*,直连',
  'PROCESS-NAME-REGEX,(?i).*NodeBaby.*,直连',
  'PROCESS-NAME-REGEX,(?i).*Node Baby.*,直连',
  'PROCESS-NAME-REGEX,(?i).*nblink.*,直连',
  'PROCESS-NAME-REGEX,(?i).*owjdxb.*,直连',
  'PROCESS-NAME-REGEX,(?i).*vpn.*,直连',
  'PROCESS-NAME-REGEX,(?i).*vnc.*,直连',
  'PROCESS-NAME-REGEX,(?i).*tvnserver.*,直连',
  'PROCESS-NAME-REGEX,(?i).*节点小宝.*,直连',
  'PROCESS-NAME-REGEX,(?i).*AnyDesk.*,直连',
  'PROCESS-NAME-REGEX,(?i).*ToDesk.*,直连',
  'PROCESS-NAME-REGEX,(?i).*RustDesk.*,直连',
  'PROCESS-NAME-REGEX,(?i).*TeamViewer.*,直连',
  'PROCESS-NAME-REGEX,(?i).*Zerotier.*,直连',
  'PROCESS-NAME-REGEX,(?i).*Tailscaled.*,直连',
  'PROCESS-NAME-REGEX,(?i).*phddns.*,直连',
  'PROCESS-NAME-REGEX,(?i).*ngrok.*,直连',
  'PROCESS-NAME-REGEX,(?i).*frpc.*,直连',
  'PROCESS-NAME-REGEX,(?i).*frps.*,直连',
  'PROCESS-NAME-REGEX,(?i).*natapp.*,直连',
  'PROCESS-NAME-REGEX,(?i).*cloudflared.*,直连',
  'PROCESS-NAME-REGEX,(?i).*xmqtunnel.*,直连',
  'PROCESS-NAME-REGEX,(?i).*Navicat.*,直连',
  'DOMAIN-SUFFIX,iepose.com,直连',
  'DOMAIN-SUFFIX,iepose.cn,直连',
  'DOMAIN-SUFFIX,nblink.cc,直连',
  'DOMAIN-SUFFIX,ionewu.com,直连',
  'DOMAIN-SUFFIX,vicp.net,直连',
]

// 地区定义 (Icons 更新为 GitHub Raw)
const allRegionDefinitions = [
  {
    name: 'HK香港',
    regex: /港|🇭🇰|hk|hongkong|hong kong/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: 'US美国',
    regex: /(?!.*aus)(?=.*(美|🇺🇸|us(?!t)|usa|american|united states)).*/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png',
  },
  {
    name: 'JP日本',
    regex: /日本|🇯🇵|jp|japan/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png',
  },
  {
    name: 'KR韩国',
    regex: /韩|🇰🇷|kr|korea/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png',
  },
  {
    name: 'SG新加坡',
    regex: /新加坡|🇸🇬|sg|singapore/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png',
  },
  {
    name: 'CN中国大陆',
    regex: /中国|🇨🇳|cn|china/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png',
  },
  {
    name: 'TW台湾省',
    regex: /台湾|台灣|🇹🇼|tw|taiwan|tai wan/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png',
  },
  {
    name: 'GB英国',
    regex: /英|🇬🇧|uk|united kingdom|great britain/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png',
  },
  {
    name: 'DE德国',
    regex: /德国|🇩🇪|de|germany/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png',
  },
  {
    name: 'MY马来西亚',
    regex: /马来|🇲🇾|my|malaysia/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png',
  },
  {
    name: 'TK土耳其',
    regex: /土耳其|🇹🇷|tk|turkey/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png',
  },
  {
    name: 'CA加拿大',
    regex: /加拿大|🇨🇦|ca|canada/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png',
  },
  {
    name: 'AU澳大利亚',
    regex: /澳大利亚|🇦🇺|au|australia|sydney/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png',
  },
]

let regionDefinitions = []
if (regionSet === 'all') {
  regionDefinitions = allRegionDefinitions
} else {
  const enabledRegions = regionSet.split(';').map(s => s.trim())
  regionDefinitions = allRegionDefinitions.filter(r => {
    const prefix = r.name.substring(0, 2) // 获取前两个字母
    return enabledRegions.includes(prefix)
  })
}

const dnsConfig = {
  enable: !!dns,
  listen: '0.0.0.0:1053',
  ipv6: !!ipv6,
  'log-level': logLevel,
  'prefer-h3': true,
  'use-hosts': true,
  'use-system-hosts': true,
  // 'respect-rules': true,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.0/16',
  'fake-ip-filter-mode': 'whitelist',
  'fake-ip-filter': [
    'geosite:gfw',
    'geosite:jetbrains-ai',
    'geosite:category-ai-!cn',
    'geosite:category-ai-chat-!cn',
    'geosite:category-games-!cn',
    'geosite:google@!cn',
    'geosite:telegram',
    'geosite:facebook',
    'geosite:google',
    'geosite:amazon',
    'geosite:category-bank-jp',
    // 'geosite:category-bank-cn@!cn',
  ],
  nameserver: chinaDNS,
  'default-nameserver': defaultDNS,
  'direct-nameserver': directDNS,
  // fallback: foreignDNS,
  // 'fallback-filter': {
  //   geoip: true,
  //   'geoip-code': 'CN',
  // },
  'proxy-server-nameserver': chinaDNS,
  'nameserver-policy': {
    'geosite:private': 'system',
    'geosite:tld-cn,cn,steam@cn,category-games@cn,microsoft@cn,apple@cn,category-game-platforms-download@cn,category-public-tracker':
    chinaDNS,
    'geosite:gfw,jetbrains-ai,category-ai-!cn,category-ai-chat-!cn': foreignDNS,
    // 'geosite:telegram': foreignDNS,
  },
}

// 通用配置
const ruleProviderCommon = {
  type: 'http',
  format: 'yaml',
  interval: 86400,
}
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: 'https://www.gstatic.com/generate_204',
  lazy: true,
  'max-failed-times': 3,
  hidden: false,
}

// 预定义 Rule Providers
const ruleProviders = {
  applications: {
    ...ruleProviderCommon,
    behavior: 'classical',
    format: 'text',
    url: 'https://github.com/DustinWin/ruleset_geodata/raw/refs/heads/mihomo-ruleset/applications.list',
    path: './ruleset/DustinWin/applications.list',
  },
}

// 倍率正则预编译
const multiplierRegex =
  /(?<=[xX✕✖⨉倍率])([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])*/i

// --- 2. 服务规则数据结构 ---
// Icons 更新为 GitHub Raw
const serviceConfigs = [
  {
    key: 'openai',
    name: '国外AI',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/ChatGPT.png',
    url: 'https://chat.openai.com/cdn-cgi/trace',
    rules: [
      'GEOSITE,jetbrains-ai,国外AI',
      'GEOSITE,category-ai-!cn,国外AI',
      'GEOSITE,category-ai-chat-!cn,国外AI',
      'DOMAIN-SUFFIX,meta.ai,国外AI',
      'DOMAIN-SUFFIX,meta.com,国外AI',
      'PROCESS-NAME-REGEX,(?i).*Antigravity.*,国外AI',
      'PROCESS-NAME-REGEX,(?i).*language_server_.*,国外AI',
    ],
  },
  {
    key: 'broker',
    name: '券商',
    icon: 'https://www.futunn.com/favicon.ico',
    url: 'https://www.futunn.com/',
    rules: ['RULE-SET,broker,券商'],
    providers: [
      {
        key: 'broker',
        url: 'https://github.com/Arthur-vx/broker-rules/raw/refs/heads/main/rule/Clash/Broker/Broker.yaml',
        path: './ruleset/broker-rules/Broker.yaml',
        format: 'yaml',
        behavior: 'classical',
      },
    ],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png',
    url: 'https://www.youtube.com/s/desktop/494dd881/img/favicon.ico',
    rules: ['GEOSITE,youtube,YouTube'],
  },
  {
    key: 'mediaHMT',
    name: '港澳台媒体',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TVB.png',
    url: 'https://viu.tv/',
    rules: [
      'GEOSITE,tvb,港澳台媒体',
      'GEOSITE,hkt,港澳台媒体',
      'GEOSITE,hkbn,港澳台媒体',
      'GEOSITE,hkopentv,港澳台媒体',
      'GEOSITE,hkedcity,港澳台媒体',
      'GEOSITE,hkgolden,港澳台媒体',
      'GEOSITE,hketgroup,港澳台媒体',
      'RULE-SET,hk-media,港澳台媒体',
      'RULE-SET,tw-media,港澳台媒体',
    ],
    providers: [
      {
        key: 'hk-media',
        url: 'https://ruleset.skk.moe/Clash/non_ip/stream_hk.txt',
        path: './ruleset/ruleset.skk.moe/stream_hk.txt',
        format: 'text',
        behavior: 'classical',
      },
      {
        key: 'tw-media',
        url: 'https://ruleset.skk.moe/Clash/non_ip/stream_tw.txt',
        path: './ruleset/ruleset.skk.moe/stream_tw.txt',
        format: 'text',
        behavior: 'classical',
      },
    ],
  },
  {
    key: 'biliintl',
    name: '哔哩哔哩东南亚',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili_3.png',
    url: 'https://www.bilibili.tv/',
    rules: ['GEOSITE,biliintl,哔哩哔哩东南亚'],
  },
  {
    key: 'bahamut',
    name: '巴哈姆特',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bahamut.png',
    url: 'https://ani.gamer.com.tw/ajax/getdeviceid.php',
    rules: ['GEOSITE,bahamut,巴哈姆特'],
  },
  {
    key: 'disney',
    name: 'Disney+',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney+.png',
    url: 'https://disney.api.edge.bamgrid.com/devices',
    rules: ['GEOSITE,disney,Disney+'],
  },
  {
    key: 'netflix',
    name: 'NETFLIX',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png',
    url: 'https://api.fast.com/netflix/speedtest/v2?https=true',
    rules: ['GEOSITE,netflix,NETFLIX'],
  },
  {
    key: 'tiktok',
    name: 'Tiktok',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png',
    url: 'https://www.tiktok.com/',
    rules: ['GEOSITE,tiktok,Tiktok'],
  },
  {
    key: 'spotify',
    name: 'Spotify',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png',
    url: 'https://spclient.wg.spotify.com/signup/public/v1/account',
    rules: ['GEOSITE,spotify,Spotify'],
  },
  {
    key: 'pixiv',
    name: 'Pixiv',
    icon: 'https://play-lh.googleusercontent.com/8pFuLOHF62ADcN0ISUAyEueA5G8IF49mX_6Az6pQNtokNVHxIVbS1L2NM62H-k02rLM=w240-h480-rw',
    url: 'http://spclient.wg.spotify.com/signup/public/v1/account',
    rules: ['GEOSITE,pixiv,Pixiv'],
  },
  {
    key: 'hbo',
    name: 'HBO',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/HBO.png',
    url: 'https://www.hbo.com/favicon.ico',
    rules: ['GEOSITE,hbo,HBO'],
  },
  {
    key: 'primevideo',
    name: 'Prime Video',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Prime_Video.png',
    url: 'https://m.media-amazon.com/images/G/01/digital/video/web/logo-min-remaster.png',
    rules: ['GEOSITE,primevideo,Prime Video'],
  },
  {
    key: 'hulu',
    name: 'Hulu',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hulu.png',
    url: 'https://auth.hulu.com/v4/web/password/authenticate',
    rules: ['GEOSITE,hulu,Hulu'],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png',
    url: 'https://www.telegram.org/img/website_icon.svg',
    rules: ['GEOIP,telegram,Telegram'],
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    icon: 'https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png',
    url: 'https://web.whatsapp.com/data/manifest.json',
    rules: ['GEOSITE,whatsapp,WhatsApp'],
  },
  {
    key: 'line',
    name: 'Line',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Line.png',
    url: 'https://line.me/page-data/app-data.json',
    rules: ['GEOSITE,line,Line'],
  },
  {
    key: 'games',
    name: '游戏专用',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png',
    rules: [
      'GEOSITE,category-games@cn,国内网站',
      'GEOSITE,category-games,游戏专用',
    ],
  },
  {
    key: 'ads',
    name: '广告过滤',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png',
    rules: [
      'GEOSITE,category-ads-all,广告过滤',
      'RULE-SET,adblockmihomo,广告过滤',
    ],
    providers: [
      {
        key: 'adblockmihomo',
        url: 'https://github.com/217heidai/adblockfilters/raw/refs/heads/main/rules/adblockmihomo.mrs',
        path: './ruleset/adblockfilters/adblockmihomo.mrs',
        format: 'mrs',
        behavior: 'domain',
      },
    ],
    reject: true,
  },
  {
    key: 'apple',
    name: '苹果服务',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_2.png',
    url: 'https://www.apple.com/library/test/success.html',
    rules: ['GEOSITE,apple-cn,苹果服务'],
  },
  {
    key: 'google',
    name: '谷歌服务',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png',
    url: 'https://www.google.com/generate_204',
    rules: ['GEOSITE,google,谷歌服务'],
  },
  {
    key: 'github',
    name: 'Github',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/GitHub.png',
    url: 'https://github.com/robots.txt',
    rules: ['GEOSITE,github,Github'],
  },
  {
    key: 'microsoft',
    name: '微软服务',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png',
    url: 'https://www.msftconnecttest.com/connecttest.txt',
    rules: ['GEOSITE,microsoft@cn,国内网站', 'GEOSITE,microsoft,微软服务'],
  },
  {
    key: 'japan',
    name: '日本网站',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/JP.png',
    url: 'https://r.r10s.jp/com/img/home/logo/touch.png',
    rules: [
      'RULE-SET,category-bank-jp,日本网站',
      'GEOIP,jp,日本网站,no-resolve',
    ],
    providers: [
      {
        key: 'category-bank-jp',
        url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-bank-jp.mrs',
        path: './ruleset/MetaCubeX/category-bank-jp.mrs',
        format: 'mrs',
        behavior: 'domain',
      },
    ],
  },
]

// --- 3. 主入口 ---

function main(config) {
  if (!enable) return config

  const proxies = config?.proxies || []
  const proxyCount = proxies.length
  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object'
      ? Object.keys(config['proxy-providers']).length
      : 0

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理')
  }

  // 3.1 覆盖基础配置
  config['allow-lan'] = true
  config['bind-address'] = '*'
  config['mode'] = 'rule'
  config['ipv6'] = !!ipv6
  config['external-controller'] = '127.0.0.1:9090'
  config['external-controller-cors'] = {
    'allow-origins': ['*'],
    'allow-private-network': true,
  }
  config['secret'] = 'YaNet'
  config['port'] = 7890
  config['socks-port'] = 7891
  config['mixed-port'] = 7892
  config['redir-port'] = 7893
  config['tproxy-port'] = 7894
  config['external-ui'] = 'ui'
  config['external-ui-url'] =
    `${githubProxy}https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip`
  config['dns'] = dnsConfig
  config['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  }
  config['unified-delay'] = true
  config['tcp-concurrent'] = true
  config['keep-alive-interval'] = 1800
  config['find-process-mode'] = 'strict'
  config['geodata-mode'] = false
  config['geodata-loader'] = 'memconservative'
  config['geo-auto-update'] = true
  config['geo-update-interval'] = 24

  if (interfaceName.length > 0) {
    config['interface-name'] = interfaceName
  }

  config['sniffer'] = {
    enable: true,
    'force-dns-mapping': true,
    'parse-pure-ip': false,
    'override-destination': true,
    sniff: {
      TLS: {
        ports: [443, 8443],
      },
      HTTP: {
        ports: [80, '8080-8880'],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    'skip-src-address': skipIps,
    'skip-dst-address': skipIps,
    'force-domain': [
      '+.google.com',
      '+.googleapis.com',
      '+.googleusercontent.com',
      '+.youtube.com',
      '+.facebook.com',
      '+.messenger.com',
      '+.fbcdn.net',
      'fbcdn-a.akamaihd.net',
    ],
    'skip-domain': ['Mijia Cloud', '+.oray.com'],
  }

  config['ntp'] = {
    enable: true,
    'write-to-system': false,
    server: 'cn.ntp.org.cn',
  }
  config['tun'] = {
    enable: true,
    stack: 'mixed',
    device: 'utun1999',
    'auto-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'strict-route': true,
    mtu: 1500,
    gso: true,
    'gso-max-size': 65536,
    'exclude-interface': ['NodeBabyLink'],
    'route-exclude-address': skipIps.filter((ip) => ip !== '198.18.0.0/16'),
    'dns-hijack': ['any:53', 'tcp://any:53'],
  }
  config['geox-url'] = {
    geoip: `${githubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat`,
    geosite: `${githubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat`,
    mmdb: `${githubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb`,
    asn: `${githubProxy}https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb`,
  }

  config.proxies.push({
    name: '直连',
    type: 'direct',
    udp: true,
  })

  config.proxies.push({
    name: '拒绝',
    type: 'reject',
    udp: true,
  })

  // 3.2 高效代理分类 (单次遍历)
  const regionGroups = {}
  regionDefinitions.forEach(
    (r) =>
      (regionGroups[r.name] = {
        ...r,
        proxies: [],
      })
  )
  const otherProxies = []

  for (let i = 0; i < proxyCount; i++) {
    const proxy = proxies[i]
    const name = proxy.name
    let matched = false

    // 检查倍率
    if (excludeHighPercentage) {
      const match = multiplierRegex.exec(name)
      if (match && parseFloat(match[1]) > globalRatioLimit) {
        continue
      }
    }

    // 尝试匹配地区
    for (const region of regionDefinitions) {
      if (region.regex.test(name)) {
        regionGroups[region.name].proxies.push(name)
        matched = true
        break
      }
    }

    if (!matched) {
      otherProxies.push(name)
    }
  }

  const generatedRegionGroups = []
  regionDefinitions.forEach((r) => {
    const groupData = regionGroups[r.name]
    if (groupData.proxies.length > 0) {
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: r.name,
        type: 'url-test',
        tolerance: 50,
        icon: r.icon,
        proxies: groupData.proxies,
      })
    }
  })

  const regionGroupNames = generatedRegionGroups.map((g) => g.name)

  if (otherProxies.length > 0) {
    generatedRegionGroups.push({
      ...groupBaseOption,
      name: '其他节点',
      type: 'select',
      proxies: otherProxies,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png',
    })
  }

  // 3.3 构建功能策略组
  const functionalGroups = []

  functionalGroups.push({
    ...groupBaseOption,
    name: '默认节点',
    type: 'select',
    proxies: [...regionGroupNames, '其他节点', '直连'].filter(
      (n) => n !== '其他节点' || otherProxies.length > 0
    ),
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png',
  })

  serviceConfigs.forEach((svc) => {
    if (ruleOptions[svc.key]) {
      rules.push(...svc.rules)

      if (Array.isArray(svc.providers)) {
        svc.providers.forEach((p) => {
          ruleProviders[p.key] = {
            ...ruleProviderCommon,
            behavior: p.behavior,
            format: p.format,
            url: p.url,
            path: p.path,
          }
        })
      }

      let groupProxies
      if (svc.reject) {
        groupProxies = ['REJECT', '直连', '默认节点']
      } else if (svc.key === 'biliintl' || svc.key === 'bahamut') {
        groupProxies = ['默认节点', '直连', ...regionGroupNames]
      } else {
        groupProxies = ['默认节点', ...regionGroupNames, '直连']
      }

      functionalGroups.push({
        ...groupBaseOption,
        name: svc.name,
        type: 'select',
        proxies: groupProxies,
        url: svc.url,
        icon: svc.icon,
      })
    }
  })

  // 3.4 添加通用兜底策略组
  rules.push(
    'GEOSITE,private,直连',
    'GEOSITE,category-public-tracker,直连',
    'GEOSITE,category-game-platforms-download@cn,直连',
    'GEOIP,private,直连,no-resolve',
    'GEOSITE,cn,国内网站',
    'GEOIP,cn,国内网站,no-resolve',
    'MATCH,其他外网'
  )

  functionalGroups.push(
    {
      ...groupBaseOption,
      name: '下载软件',
      type: 'select',
      proxies: ['直连', 'REJECT', '默认节点', '国内网站', ...regionGroupNames],
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png',
    },
    {
      ...groupBaseOption,
      name: '其他外网',
      type: 'select',
      proxies: ['默认节点', '国内网站', ...regionGroupNames],
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Streaming!CN.png',
    },
    {
      ...groupBaseOption,
      name: '国内网站',
      type: 'select',
      proxies: ['直连', '默认节点', ...regionGroupNames],
      url: 'https://wifi.vivo.com.cn/generate_204',
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/StreamingCN.png',
    }
  )

  // 3.5 组装最终结果
  config['proxy-groups'] = [...functionalGroups, ...generatedRegionGroups]

  config['rules'] = rules
  config['rule-providers'] = ruleProviders

  return config
}
