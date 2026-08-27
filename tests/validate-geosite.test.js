const test = require('node:test')
const assert = require('node:assert/strict')
const {
  parseGeoSiteTags,
  collectGeoSiteReferences,
  findMissingTags,
} = require('../scripts/validate-geosite')

function varint(value) {
  const bytes = []
  do {
    let byte = value & 0x7f
    value >>>= 7
    if (value) byte |= 0x80
    bytes.push(byte)
  } while (value)
  return Buffer.from(bytes)
}

function entry(tag) {
  const text = Buffer.from(tag)
  const message = Buffer.concat([Buffer.from([0x0a]), varint(text.length), text])
  return Buffer.concat([Buffer.from([0x0a]), varint(message.length), message])
}

const data = Buffer.concat(['tvb', 'google', 'category-games'].map(entry))

test('parses GeoSite tags and normalizes them', () => {
  assert.deepEqual([...parseGeoSiteTags(data)].sort(), ['category-games', 'google', 'tvb'])
})

test('collects routing and DNS GeoSite references', () => {
  const source = `
    'GEOSITE,tvb,媒体'
    'geosite:google@!cn'
    'geosite:category-games@cn,tvb'
  `
  assert.deepEqual([...collectGeoSiteReferences(source)].sort(), [
    'category-games',
    'google',
    'tvb',
  ])
})

test('reports every missing base tag', () => {
  assert.deepEqual(findMissingTags("'GEOSITE,hkopentv,媒体'", data), ['hkopentv'])
})
