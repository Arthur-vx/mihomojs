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

test('rejects a script that does not define main', () => {
  assert.throws(() => renderConfig('const value = 1'), /Script\.js must define main\(config\)/)
})
