const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const test = require('node:test')
const assert = require('node:assert/strict')

const script = path.join(__dirname, '..', process.env.CN_DIRECT_TEST_SCRIPT || 'Script-CN-Direct.js')
function run(input = {}) {
  const context = vm.createContext({ console })
  vm.runInContext(fs.readFileSync(script, 'utf8'), context)
  context.input = structuredClone(input)
  return JSON.parse(JSON.stringify(vm.runInContext('main(input)', context)))
}
function sample() {
  return {
    proxies: [
      { name: 'Unknown custom node / 8x', type: 'ss', server: 'node.example', port: 443, cipher: 'aes-128-gcm', password: 'fixture' },
      { name: 'Legacy direct alias', type: 'direct' },
    ],
    'proxy-groups': [{ name: 'Old mixed group', type: 'select', proxies: ['DIRECT', 'Unknown custom node / 8x'] }],
    'proxy-providers': {},
    rules: ['IP-CIDR,192.168.42.0/24,Legacy direct alias,no-resolve', 'PROCESS-NAME,curl.exe,DIRECT', 'MATCH,DIRECT'],
  }
}
function overseas(config) {
  const name = config.rules.at(-1).split(',')[1]
  return config['proxy-groups'].find(group => group.name === name)
}
function containsIPv4(cidr, address) {
  if (cidr.includes(':')) return false
  const [network, bits] = cidr.split('/')
  const value = ip => ip.split('.').reduce((n, octet) => (n * 256 + Number(octet)) >>> 0, 0)
  const mask = Number(bits) === 0 ? 0 : (0xffffffff << (32 - Number(bits))) >>> 0
  return (value(network) & mask) === (value(address) & mask)
}

test('initial import rejects foreign traffic and never links to direct or inherited groups', () => {
  const output = run(sample())
  const group = overseas(output)
  assert.equal(group.type, 'select')
  assert.equal(group.proxies[0], 'REJECT')
  assert.equal(group['default-selected'], 'REJECT')
  assert.equal(group['empty-fallback'], 'REJECT')
  assert.ok(group.proxies.includes('Unknown custom node / 8x'))
  for (const name of ['DIRECT', 'COMPATIBLE', 'Legacy direct alias', 'Old mixed group']) {
    assert.ok(!group.proxies.includes(name), name)
  }
})

test('GLOBAL can only select the fail-closed overseas group or reject', () => {
  const input = sample()
  input['proxy-groups'].push({ name: 'GLOBAL', type: 'select', proxies: ['DIRECT', 'Old mixed group'] })
  const output = run(input)
  const globals = output['proxy-groups'].filter(group => group.name === 'GLOBAL')
  assert.equal(globals.length, 1)
  assert.deepEqual(globals[0].proxies, [overseas(output).name, 'REJECT'])
  assert.equal(globals[0]['default-selected'], overseas(output).name)
  assert.equal(globals[0]['empty-fallback'], 'REJECT')
})

test('keeps unrecognized nodes, credentials, providers and existing group definitions intact', () => {
  const input = sample()
  input['proxy-providers'] = { subscription: { type: 'http', url: 'https://example.org/private-token', path: './providers/nodes.yaml' } }
  const output = run(input)
  assert.deepEqual(output.proxies, input.proxies)
  assert.deepEqual(output['proxy-providers'], input['proxy-providers'])
  assert.ok(output['proxy-groups'].some(group => JSON.stringify(group) === JSON.stringify(input['proxy-groups'][0])))
  assert.deepEqual(overseas(output).use, ['subscription'])
  assert.match(overseas(output)['exclude-type'], /Direct/i)
})

test('a subscription with no available nodes stays reject-only', () => {
  const output = run({ proxies: [] })
  assert.deepEqual(overseas(output).proxies, ['REJECT'])
  assert.equal(output.rules.at(-1), `MATCH,${overseas(output).name}`)
})

test('does not retain process-wide or blanket direct bypass rules', () => {
  const input = sample()
  input.rules.push('IP-CIDR,0.0.0.0/0,DIRECT,no-resolve', 'DOMAIN-SUFFIX,com,DIRECT')
  const output = run(input)
  assert.ok(!output.rules.some(rule => rule.startsWith('PROCESS-')))
  assert.ok(!output.rules.includes('IP-CIDR,0.0.0.0/0,DIRECT,no-resolve'))
  assert.ok(!output.rules.includes('DOMAIN-SUFFIX,com,DIRECT'))
  assert.equal(output.rules.filter(rule => rule.startsWith('MATCH,')).length, 1)
})

test('preserves existing LAN routes and their provider definitions', () => {
  const input = sample()
  input.rules.push('RULE-SET,private_domain,Legacy direct alias', 'RULE-SET,private_ip,DIRECT,no-resolve')
  input['rule-providers'] = {
    private_domain: { type: 'inline', behavior: 'domain', payload: ['+.office.lan'] },
    private_ip: { type: 'inline', behavior: 'ipcidr', payload: ['192.168.42.0/24'] },
  }
  const output = run(input)
  assert.ok(output.rules.includes('IP-CIDR,192.168.42.0/24,DIRECT,no-resolve'))
  assert.ok(output.rules.includes('RULE-SET,private_domain,DIRECT'))
  assert.ok(output.rules.includes('RULE-SET,private_ip,DIRECT,no-resolve'))
  assert.deepEqual(output['rule-providers'].private_domain, input['rule-providers'].private_domain)
})

test('CN domain and IP datasets are available without any network downloads', () => {
  const output = run(sample())
  const domainEntry = Object.entries(output['rule-providers']).find(([, p]) => p.type === 'inline' && p.behavior === 'domain' && p.payload.includes('+.qq.com'))
  const ipEntry = Object.entries(output['rule-providers']).find(([, p]) => p.type === 'inline' && p.behavior === 'ipcidr' && p.payload.some(cidr => containsIPv4(cidr, '223.5.5.5')))
  assert.ok(domainEntry, 'China domain source missing')
  assert.ok(ipEntry, 'China CIDR source missing')
  const domainRule = `RULE-SET,${domainEntry[0]},DIRECT`
  const ipRule = `RULE-SET,${ipEntry[0]},DIRECT,no-resolve`
  assert.ok(output.rules.includes(domainRule))
  assert.ok(output.rules.includes(ipRule))
  assert.ok(output.rules.indexOf(domainRule) < output.rules.indexOf(ipRule))
})

test('Claude and Anthropic are routed overseas ahead of CN IP and LAN providers', () => {
  const output = run(sample())
  const group = overseas(output)
  for (const domain of ['claude.ai', 'anthropic.com']) {
    const index = output.rules.indexOf(`DOMAIN-SUFFIX,${domain},${group.name}`)
    assert.ok(index >= 0)
    assert.ok(index < output.rules.findIndex(rule => rule.startsWith('IP-CIDR,')))
  }
})

test('foreign DNS always uses the manual overseas group and hosts cannot redirect it', () => {
  const output = run(sample())
  const group = overseas(output)
  assert.ok(output.dns.nameserver.length >= 2)
  for (const server of output.dns.nameserver) assert.ok(server.endsWith(`#${group.name}`), server)
  assert.equal(output.dns['respect-rules'], true)
  assert.equal(output.dns['prefer-h3'], false)
  assert.equal(output.dns['use-hosts'], false)
  assert.equal(output.dns['use-system-hosts'], false)
  assert.equal(output.dns['enhanced-mode'], 'fake-ip')
  assert.equal(output.dns['fake-ip-filter-mode'], 'blacklist')
  assert.ok(!output.dns['fake-ip-filter'].includes('*'))
  assert.deepEqual(output.dns.fallback, [])
  const policies = output.dns['nameserver-policy']
  assert.ok(Object.keys(policies).some(key => key.startsWith('rule-set:')))
  assert.ok(!Object.keys(policies).some(key => key.includes('gfw') || key.includes('category-ai')))
})

test('TUN captures TCP and UDP DNS and removes inherited foreign route exclusions', () => {
  const input = sample()
  input.tun = { enable: false, 'auto-route': false, 'route-exclude-address': ['1.1.1.1/32'], 'exclude-interface': ['AnyAdapter'] }
  const output = run(input)
  assert.equal(output.tun.enable, true)
  assert.equal(output.tun['auto-route'], true)
  assert.equal(output.tun['strict-route'], true)
  assert.deepEqual(output.tun['dns-hijack'], ['any:53', 'tcp://any:53'])
  assert.deepEqual(output.tun['route-exclude-address'], [])
  assert.deepEqual(output.tun['exclude-interface'], [])
})

test('an IPv6-disabled subscription cannot leave literal IPv6 traffic outside TUN', () => {
  const input = sample()
  input.ipv6 = false
  const output = run(input)
  assert.equal(output.ipv6, true)
  assert.equal(output.dns.ipv6, false)
})

test('imported group or node names cannot collide with generated routing targets', () => {
  const input = sample()
  input.proxies.push({ name: '海外节点（手动选择）', type: 'ss', server: 'localhost', port: 1, cipher: 'aes-128-gcm', password: 'test' })
  const output = run(input)
  assert.notEqual(overseas(output).name, '海外节点（手动选择）')
  assert.equal(new Set(output['proxy-groups'].map(group => group.name)).size, output['proxy-groups'].length)
})
