# Versioned GeoData Supply Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pin Mihomo clients to an immutable, verified GeoData release and continuously test upstream `latest` data without promoting it automatically.

**Architecture:** Repository-owned Node.js utilities parse GeoSite protobuf data, render a synthetic configuration from `Script.js`, and support an actual `mihomo -t` smoke test. Production URLs point to a timestamped release in `Arthur-vx/mihomojs`; a daily GitHub Actions workflow tests the mutable upstream candidate and creates one deduplicated Issue on scheduled failures.

**Tech Stack:** JavaScript on Node.js built-ins, Node test runner, GitHub Actions, GitHub CLI, Mihomo v1.19.29, MetaCubeX GeoData release assets.

**Spec:** `docs/superpowers/specs/2026-08-27-geodata-supply-chain-design.md`

## Global Constraints

- Production GeoData release tag is `geodata-20260827-0328` and must never be replaced after publication.
- Production `geo-auto-update` is `false`.
- Production assets are `geosite.dat`, `geoip-lite.dat`, `country.mmdb`, `GeoLite2-ASN.mmdb`, and `SHA256SUMS`.
- CI tests upstream `latest` but never changes production URLs automatically.
- CI uses Mihomo `v1.19.29` and dependency-free Node.js scripts.
- No routing or proxy-group behavior outside GeoData configuration changes.

---

### Task 1: GeoSite compatibility validator

**Files:**
- Create: `scripts/validate-geosite.js`
- Create: `tests/validate-geosite.test.js`

**Interfaces:**
- Produces: `parseGeoSiteTags(buffer: Buffer): Set<string>`
- Produces: `collectGeoSiteReferences(source: string): Set<string>`
- Produces: `findMissingTags(source: string, geositeData: Buffer): string[]`
- Produces: CLI `node scripts/validate-geosite.js <Script.js> <geosite.dat>` with exit code `0` on compatibility and `1` with missing tags on incompatibility.

- [ ] **Step 1: Write the failing parser and reference tests**

Create a Node test that builds a minimal protobuf wire buffer containing `tvb`, `google`, and `category-games`, then asserts parsing, rule-reference extraction, DNS selector extraction, attribute stripping, and missing-tag reporting:

```js
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
  assert.deepEqual([...collectGeoSiteReferences(source)].sort(), ['category-games', 'google', 'tvb'])
})

test('reports every missing base tag', () => {
  assert.deepEqual(findMissingTags("'GEOSITE,hkopentv,媒体'", data), ['hkopentv'])
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/validate-geosite.test.js`

Expected: FAIL because `scripts/validate-geosite.js` does not exist.

- [ ] **Step 3: Implement the dependency-free validator**

Implement protobuf varint reading and field skipping for wire types `0`, `1`, `2`, and `5`. Parse top-level field `1` messages and their inner field `1` tag. Extract both uppercase `GEOSITE,tag,` rules and lowercase `geosite:` DNS selectors, split comma-separated DNS tags, remove `@...` attributes, lowercase, sort missing tags, and expose the three functions through `module.exports`. The CLI reads both paths, prints the checked reference count, and throws a concise error listing missing tags.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test tests/validate-geosite.test.js`

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Verify against the current real files**

Run: `node scripts/validate-geosite.js Script.js <path-to-current-geosite.dat>`

Expected: exit `0` and output confirming every referenced tag exists.

### Task 2: Script rendering smoke runner

**Files:**
- Create: `scripts/render-config.js`
- Create: `tests/render-config.test.js`

**Interfaces:**
- Produces: `renderConfig(source: string): object`
- Produces: CLI `node scripts/render-config.js <Script.js> <output.json>`.

- [ ] **Step 1: Write the failing smoke-runner tests**

Create tests that load the real `Script.js`, call `renderConfig`, and assert that `rules`, `proxy-groups`, and `rule-providers` are non-empty and that an invalid script without `main` throws `Script.js must define main(config)`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/render-config.test.js`

Expected: FAIL because `scripts/render-config.js` does not exist.

- [ ] **Step 3: Implement the VM-based renderer**

Evaluate the source with `node:vm` in a fresh context, require a callable `main`, pass one synthetic Shadowsocks proxy, validate the three generated collections, and export `renderConfig`. The CLI writes pretty-printed JSON.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test tests/render-config.test.js`

Expected: 2 tests pass, 0 fail.

### Task 3: Pin production GeoData configuration

**Files:**
- Modify: `Script.js:643-706`
- Create: `tests/script-geodata.test.js`

**Interfaces:**
- Consumes: `renderConfig(source)` from Task 2.
- Produces: generated configuration with `geo-auto-update === false` and four URLs under release tag `geodata-20260827-0328`.

- [ ] **Step 1: Write the failing production-pin test**

Render the real script and assert:

```js
assert.equal(config['geo-auto-update'], false)
assert.deepEqual(config['geox-url'], {
  geoip: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/geoip-lite.dat',
  geosite: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/geosite.dat',
  mmdb: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/country.mmdb',
  asn: 'https://github.com/Arthur-vx/mihomojs/releases/download/geodata-20260827-0328/GeoLite2-ASN.mmdb',
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/script-geodata.test.js`

Expected: FAIL because auto-update is `true` and URLs reference MetaCubeX `latest`.

- [ ] **Step 3: Apply the minimal production change**

Set `geo-auto-update` to `false`, remove the now-irrelevant update interval, and replace the four `geox-url` entries with the exact immutable release URLs above. Correct the existing `mmdb` source from `geoip.metadb` to `country.mmdb`.

- [ ] **Step 4: Run the complete Node suite**

Run: `node --test "tests/*.test.js"`

Expected: all tests pass with 0 failures.

### Task 4: Daily upstream validation workflow

**Files:**
- Create: `.github/workflows/validate-geodata.yml`

**Interfaces:**
- Consumes: both Task 1 and Task 2 CLIs.
- Produces: push, pull-request, manual, and daily validation; scheduled failure Issue titled `GeoData compatibility check failed` with label `geodata-compatibility`.

- [ ] **Step 1: Create the workflow configuration**

Use `ubuntu-latest` and `actions/checkout@v4`. Download each candidate asset and its `.sha256sum` file from `MetaCubeX/meta-rules-dat/releases/download/latest`, then run `sha256sum -c`. Download `mihomo-linux-amd64-v1.19.29.gz`, decompress it, copy candidate files to `runtime/GeoSite.dat`, `runtime/GeoIP.dat`, `runtime/country.mmdb`, and `runtime/ASN.mmdb`, render `smoke.json`, and run `./mihomo -t -f smoke.json -d runtime`.

On scheduled failure, create or update the `geodata-compatibility` label, search open Issues by exact title, create one only when absent, and otherwise comment with the new run URL.

- [ ] **Step 2: Validate the workflow with actionlint v1.7.12**

Download `actionlint_1.7.12_windows_amd64.zip` and its published checksum from `rhysd/actionlint`, verify the archive hash, extract it to a temporary directory, and run `actionlint.exe .github/workflows/validate-geodata.yml`.

Expected: exit `0` with no diagnostics.

- [ ] **Step 3: Run the full Node suite**

Run: `node --test "tests/*.test.js"`

Expected: all tests pass with 0 failures.

### Task 5: Publish the verified immutable assets

**Files:**
- Temporary only: `.tmp/geodata-20260827-0328/*` (never commit)

**Interfaces:**
- Produces: GitHub Release `geodata-20260827-0328` with five assets.

- [ ] **Step 1: Download and verify exact upstream assets**

Download the four data files and four `.sha256sum` files, run `sha256sum -c` or `Get-FileHash` comparisons, and create `SHA256SUMS` containing the verified hashes for the four retained files.

- [ ] **Step 2: Run local compatibility and Mihomo checks against the release candidates**

Run the validator, renderer, and the local Mihomo v1.19.29 `-t` command with the candidate files in an isolated runtime directory.

Expected: all commands exit `0` and Mihomo reports that the configuration test is successful.

- [ ] **Step 3: Publish the release before changing client URLs remotely**

Run:

```powershell
gh release create geodata-20260827-0328 <five-asset-paths> `
  --repo Arthur-vx/mihomojs `
  --title 'GeoData 2026-08-27 03:28 UTC' `
  --notes 'Verified MetaCubeX GeoData snapshot for Script.js production use.' `
  --target main
```

- [ ] **Step 4: Verify the public release and all assets**

Use `gh release view geodata-20260827-0328 --json tagName,assets,url` and unauthenticated HTTP HEAD requests for every download URL. Expected: five uniquely named assets and HTTP `200` responses.

### Task 6: Document operation and rollback

**Files:**
- Modify: `README.md`

**Interfaces:**
- Produces: maintainer instructions for daily monitoring, promotion, rollback, and client refresh.

- [ ] **Step 1: Add the maintenance documentation**

Document that clients use the immutable release, the workflow checks upstream daily, failed scheduled runs create/update one Issue, promotion requires a successful workflow plus a new immutable tag, rollback is a one-line release-tag revert, and Clash Party users must refresh the remote override and subscription after script changes.

- [ ] **Step 2: Verify documentation matches executable values**

Run `rg -n "geodata-20260827-0328|validate-geodata|geo-auto-update|回退|刷新" README.md Script.js .github/workflows/validate-geodata.yml`.

Expected: tag, workflow, disabled auto-update, rollback, and refresh guidance are present without references to `geoip.metadb`.

### Task 7: Final verification, commits, push, and remote run

**Files:**
- Verify all changed repository files.

- [ ] **Step 1: Run the complete fresh verification suite**

Run:

```powershell
node --check Script.js
node --test "tests/*.test.js"
node scripts/validate-geosite.js Script.js <candidate-geosite.dat>
node scripts/render-config.js Script.js smoke.json
& 'D:\app\Clash Party\resources\sidecar\mihomo.exe' -t -f smoke.json -d <candidate-runtime-dir>
git diff --check
```

Expected: every command exits `0`, all tests pass, every GeoSite tag exists, Mihomo reports configuration success, and Git reports no whitespace errors.

- [ ] **Step 2: Review scope**

Run `git diff --stat origin/main...HEAD` and `git diff origin/main...HEAD` and confirm only the approved design, plan, validator, renderer, tests, workflow, Script GeoData settings, and README changed.

- [ ] **Step 3: Commit implementation and push main**

Create focused commits for test utilities/config pinning, CI/documentation, and any pending design/plan changes, then push `main` to `origin`.

- [ ] **Step 4: Verify remote state and trigger workflow**

Confirm GitHub `main` matches local HEAD, run `gh workflow run validate-geodata.yml`, and wait for the dispatched run to finish. Inspect the final conclusion and logs; completion requires `success`.

- [ ] **Step 5: Purge and verify jsDelivr**

Purge `https://purge.jsdelivr.net/gh/Arthur-vx/mihomojs@main/Script.js`, then fetch the user's exact jsDelivr URL and assert it contains `geo-auto-update = false`, the versioned release tag, and no `hkopentv` or MetaCubeX `releases/download/latest` production GeoData URL.
