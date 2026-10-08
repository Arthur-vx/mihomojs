const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const vm = require('node:vm')
const http = require('node:http')
const net = require('node:net')
const dgram = require('node:dgram')
const { spawn } = require('node:child_process')
const { setTimeout: delay } = require('node:timers/promises')
const test = require('node:test')
const assert = require('node:assert/strict')

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return server.address().port
}
async function freePort() {
  const server = net.createServer()
  const port = await listen(server)
  await new Promise(resolve => server.close(resolve))
  return port
}
async function getVia(port, url) {
  return new Promise((resolve, reject) => {
    const request = http.get({ hostname: '127.0.0.1', port, path: url, headers: { Host: new URL(url).host } }, response => {
      let body = ''
      response.on('data', chunk => { body += chunk })
      response.on('end', () => resolve({ status: response.statusCode, body }))
    })
    request.setTimeout(4000, () => request.destroy(new Error('request timeout')))
    request.on('error', reject)
  })
}

test('Mihomo keeps CN traffic direct while unselected or disconnected overseas traffic fails', {
  skip: !process.env.MIHOMO_BIN && 'Set MIHOMO_BIN to run a real isolated core',
  timeout: 30000,
}, async t => {
  let core
  let logs = ''
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cn-direct-runtime-'))
  t.after(async () => {
    if (core && core.exitCode === null) {
      const exited = new Promise(resolve => core.once('exit', resolve))
      core.kill()
      await exited
    }
    fs.rmSync(dir, { recursive: true, force: true })
  })
  const directServer = http.createServer((req, res) => res.end('domestic-direct'))
  const directPort = await listen(directServer)
  t.after(() => { directServer.closeAllConnections(); return new Promise(resolve => directServer.close(resolve)) })

  const proxyServer = http.createServer()
  const proxySockets = new Set()
  proxyServer.on('connection', socket => { proxySockets.add(socket); socket.on('close', () => proxySockets.delete(socket)) })
  proxyServer.on('connect', (req, socket, head) => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    const respond = () => socket.end('HTTP/1.1 200 OK\r\nContent-Length: 14\r\nConnection: close\r\n\r\noverseas-proxy')
    if (head.length) respond()
    else socket.once('data', respond)
  })
  const proxyPort = await listen(proxyServer)
  t.after(() => { for (const socket of proxySockets) socket.destroy(); return new Promise(resolve => proxyServer.close(resolve)) })

  // Controlled DNS maps a whitelisted domestic hostname to the loopback origin.
  // Only DNS endpoints/listening ports/TUN are substituted; production rules remain intact.
  const dnsServer = dgram.createSocket('udp4')
  await new Promise(resolve => dnsServer.bind(0, '127.0.0.1', resolve))
  t.after(() => dnsServer.close())
  dnsServer.on('message', (query, peer) => {
    let end = 12
    while (query[end]) end += query[end] + 1
    end += 5
    const type = query.readUInt16BE(end - 4)
    const question = query.subarray(12, end)
    const header = Buffer.alloc(12)
    query.copy(header, 0, 0, 2)
    header.writeUInt16BE(0x8180, 2)
    header.writeUInt16BE(1, 4)
    header.writeUInt16BE(type === 1 ? 1 : 0, 6)
    const answer = Buffer.from([0xc0, 0x0c, 0, 1, 0, 1, 0, 0, 0, 30, 0, 4, 127, 0, 0, 1])
    dnsServer.send(Buffer.concat([header, question, ...(type === 1 ? [answer] : [])]), peer.port, peer.address)
  })
  const localDNS = `127.0.0.1:${dnsServer.address().port}`

  const context = vm.createContext({ console })
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'Script-CN-Direct.js'), 'utf8'), context)
  context.input = {
    proxies: [{ name: 'Test overseas', type: 'http', server: '127.0.0.1', port: proxyPort }],
    'proxy-providers': { extra: { type: 'inline', payload: [
      { name: 'Provider direct alias', type: 'direct' },
      { name: 'Provider overseas', type: 'http', server: '127.0.0.1', port: proxyPort },
    ] } },
  }
  const config = JSON.parse(JSON.stringify(vm.runInContext('main(input)', context)))
  const group = config['proxy-groups'][0].name
  const port = await freePort()
  const controllerPort = await freePort()
  config['mixed-port'] = port
  config['external-controller'] = `127.0.0.1:${controllerPort}`
  config['log-level'] = 'debug'
  config.tun.enable = false
  config.dns.listen = `127.0.0.1:${await freePort()}`
  config.dns['direct-nameserver'] = [localDNS]
  config.dns['direct-nameserver-follow-policy'] = false
  config.dns['proxy-server-nameserver'] = [localDNS]
  for (const key of Object.keys(config.dns['nameserver-policy'])) {
    if (key.startsWith('rule-set:')) config.dns['nameserver-policy'][key] = [localDNS]
  }
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(config))
  core = spawn(process.env.MIHOMO_BIN, ['-d', dir, '-f', path.join(dir, 'config.json')], { windowsHide: true })
  core.stdout.on('data', chunk => { logs += chunk })
  core.stderr.on('data', chunk => { logs += chunk })
  const api = async (endpoint, options) => {
    const response = await fetch(`http://127.0.0.1:${controllerPort}${endpoint}`, { ...options, signal: AbortSignal.timeout(2000) })
    assert.ok(response.ok, `${endpoint}: ${response.status}`)
    return response.status === 204 ? null : response.json()
  }
  let ready = false
  for (let retry = 0; retry < 100; retry++) {
    try { await api('/version'); ready = true; break } catch { await delay(50) }
  }
  assert.ok(ready, logs)
  const groupPath = `/proxies/${encodeURIComponent(group)}`
  const initial = await api(groupPath)
  assert.equal(initial.now, 'REJECT')
  const global = await api('/proxies/GLOBAL')
  assert.deepEqual(global.all, [group, 'REJECT'])
  assert.equal(global.now, group)
  assert.ok(!initial.all.includes('Provider direct alias'), JSON.stringify(initial))
  assert.ok(initial.all.includes('Provider overseas'))
  const domestic = await getVia(port, `http://www.qq.com:${directPort}/`)
  assert.equal(domestic.body, 'domestic-direct', `${JSON.stringify(domestic)}\n${logs}`)
  const blocked = await getVia(port, `http://claude.ai:${directPort}/`)
  assert.ok(blocked.status >= 400, JSON.stringify(blocked))

  await api(groupPath, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test overseas' }) })
  assert.equal((await getVia(port, `http://claude.ai:${directPort}/`)).body, 'overseas-proxy')
  assert.equal((await getVia(port, `http://unlisted-foreign.example:${directPort}/`)).body, 'overseas-proxy')
  assert.equal((await getVia(port, `http://www.qq.com:${directPort}/`)).body, 'domestic-direct')

  assert.equal((await getVia(port, `http://www.douban.com:${directPort}/`)).body, 'domestic-direct')
  assert.equal((await getVia(port, `http://[2606:4700:4700::1111]:${directPort}/`)).body, 'overseas-proxy')

  // Actually stop the selected upstream; an accidental direct fallback would reach the origin.
  for (const socket of proxySockets) socket.destroy()
  await new Promise(resolve => proxyServer.close(resolve))
  const disconnected = await getVia(port, `http://claude.ai:${directPort}/`)
  assert.ok(disconnected.status >= 400, JSON.stringify(disconnected))
  assert.equal((await getVia(port, `http://www.qq.com:${directPort}/`)).body, 'domestic-direct')
  assert.match(logs, /RuleSet\(cn-direct-domain\).*DIRECT/)
})
