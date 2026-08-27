const fs = require('node:fs')

function readVarint(buffer, offset) {
  let value = 0
  let shift = 0

  while (offset < buffer.length) {
    const byte = buffer[offset++]
    value += (byte & 0x7f) * 2 ** shift
    if ((byte & 0x80) === 0) return [value, offset]
    shift += 7
  }

  throw new Error('Unexpected end of GeoSite protobuf data')
}

function skipField(buffer, offset, wireType) {
  if (wireType === 0) return readVarint(buffer, offset)[1]
  if (wireType === 1) return offset + 8
  if (wireType === 2) {
    const [length, nextOffset] = readVarint(buffer, offset)
    return nextOffset + length
  }
  if (wireType === 5) return offset + 4
  throw new Error(`Unsupported protobuf wire type: ${wireType}`)
}

function readTagFromEntry(buffer) {
  let offset = 0

  while (offset < buffer.length) {
    let key
    ;[key, offset] = readVarint(buffer, offset)
    const field = key >>> 3
    const wireType = key & 7

    if (field === 1 && wireType === 2) {
      let length
      ;[length, offset] = readVarint(buffer, offset)
      return buffer.subarray(offset, offset + length).toString('utf8').toLowerCase()
    }

    offset = skipField(buffer, offset, wireType)
  }

  return null
}

function parseGeoSiteTags(buffer) {
  const tags = new Set()
  let offset = 0

  while (offset < buffer.length) {
    let key
    ;[key, offset] = readVarint(buffer, offset)
    const field = key >>> 3
    const wireType = key & 7

    if (field === 1 && wireType === 2) {
      let length
      ;[length, offset] = readVarint(buffer, offset)
      const end = offset + length
      if (end > buffer.length) throw new Error('Invalid GeoSite protobuf entry length')
      const tag = readTagFromEntry(buffer.subarray(offset, end))
      if (tag) tags.add(tag)
      offset = end
    } else {
      offset = skipField(buffer, offset, wireType)
    }
  }

  return tags
}

function normalizeTag(value) {
  return value.trim().replace(/@.*$/, '').toLowerCase()
}

function collectGeoSiteReferences(source) {
  const references = new Set()

  for (const match of source.matchAll(/\bGEOSITE,([^,\s'\"]+)/gi)) {
    const tag = normalizeTag(match[1])
    if (tag) references.add(tag)
  }

  for (const match of source.matchAll(/geosite:([^'\"\s]+)/gi)) {
    for (const value of match[1].split(',')) {
      const tag = normalizeTag(value)
      if (tag) references.add(tag)
    }
  }

  return references
}

function findMissingTags(source, geositeData) {
  const available = parseGeoSiteTags(geositeData)
  return [...collectGeoSiteReferences(source)]
    .filter((tag) => !available.has(tag))
    .sort()
}

function main() {
  const [, , scriptPath, geositePath] = process.argv
  if (!scriptPath || !geositePath) {
    throw new Error('Usage: node scripts/validate-geosite.js <Script.js> <geosite.dat>')
  }

  const source = fs.readFileSync(scriptPath, 'utf8')
  const geositeData = fs.readFileSync(geositePath)
  const references = collectGeoSiteReferences(source)
  const missing = findMissingTags(source, geositeData)

  if (missing.length > 0) {
    throw new Error(`Missing GeoSite tags: ${missing.join(', ')}`)
  }

  process.stdout.write(`Validated ${references.size} GeoSite references\n`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

module.exports = {
  parseGeoSiteTags,
  collectGeoSiteReferences,
  findMissingTags,
}
