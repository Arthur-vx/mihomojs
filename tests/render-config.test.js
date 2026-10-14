const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')
const { renderConfig } = require('../scripts/render-config')

test('renders a usable Mihomo configuration from the real script', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'Script.js'), 'utf8')
  const config = renderConfig(source)

  assert.ok(Array.isArray(config.rules) && config.rules.length > 0)
  assert.ok(Array.isArray(config['proxy-groups']) && config['proxy-groups'].length > 0)
  assert.ok(Object.keys(config['rule-providers']).length > 0)
})

test('keeps Claude traffic in its dedicated strategy group', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'Script.js'), 'utf8')
  const config = renderConfig(source)
  const group = config['proxy-groups'].find(item => item.name === 'Claude')

  assert.ok(group, 'Claude strategy group missing')
  for (const rule of [
    'DOMAIN-SUFFIX,anthropic.com,Claude',
    'DOMAIN-SUFFIX,claude.ai,Claude',
    'IP-CIDR,160.79.104.0/21,Claude,no-resolve',
  ]) {
    assert.ok(config.rules.includes(rule), rule)
  }
})

test('rejects a script that does not define main', () => {
  assert.throws(() => renderConfig('const value = 1'), /Script\.js must define main\(config\)/)
})
