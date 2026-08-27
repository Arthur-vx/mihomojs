const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')
const { renderConfig } = require('../scripts/render-config')

test('renders immutable production GeoData URLs with automatic updates disabled', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'Script.js'), 'utf8')
  const config = renderConfig(source)

  assert.equal(config['geo-auto-update'], false)
  assert.deepEqual({ ...config['geox-url'] }, {
    geoip:
      'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/geoip-lite.dat',
    geosite:
      'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/geosite.dat',
    mmdb: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/country.mmdb',
    asn: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/GeoLite2-ASN.mmdb',
  })
})
