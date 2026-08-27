# Versioned GeoData Supply Chain Design

## Context

`Script.js` currently enables Mihomo GeoData auto-updates and points every client at MetaCubeX's mutable `latest` release. A change in that upstream dataset can therefore invalidate a `GEOSITE` reference and prevent every client using the script from loading its configuration.

## Goal

Keep production clients on a known-good, immutable GeoData snapshot while continuously testing the newest upstream snapshot and reporting incompatibilities before they are promoted.

## Scope

- Publish the currently verified GeoData files as a versioned GitHub Release in `Arthur-vx/mihomojs`.
- Disable automatic GeoData updates in `Script.js` and point all GeoData URLs at that versioned release.
- Add repository-owned validation scripts that check JavaScript syntax, GeoSite tag compatibility, generated configuration shape, and real Mihomo configuration loading.
- Run validation for pushes, pull requests, manual dispatches, and once per day against MetaCubeX's current `latest` data.
- Open one deduplicated GitHub Issue when a scheduled upstream check fails.
- Document the controlled promotion and rollback process.

## Non-goals

- Do not automatically replace production GeoData when upstream validation succeeds.
- Do not automatically remove or rewrite missing `GEOSITE` rules.
- Do not maintain a fork of MetaCubeX's rule-generation source.
- Do not change proxy groups or routing behavior unrelated to GeoData versioning.

## Production Data Model

The initial immutable release tag will include the upstream publication timestamp, for example `geodata-20260827-0328`. Once published, that tag and its assets must never be replaced.

The release contains:

- `geosite.dat`
- `geoip-lite.dat`
- `country.mmdb`
- `GeoLite2-ASN.mmdb`
- `SHA256SUMS`

`Script.js` sets `geo-auto-update` to `false` and changes `geox-url` to the assets under that exact release tag. Existing installations keep working with the snapshot already downloaded, and new installations download the same known-good snapshot.

## Validation Components

### GeoSite tag validator

A dependency-free Node.js script parses the protobuf wire format used by `geosite.dat`, extracts all available country codes/tags, and compares them with every GeoSite reference in `Script.js`.

References include:

- `GEOSITE,<tag>,<policy>` routing rules
- `geosite:<tag>` DNS fake-IP filters
- comma-separated `geosite:<tag1>,<tag2>` DNS policy selectors
- attribute suffixes such as `@cn` and `@!cn`, which are removed before checking the base tag

The validator exits nonzero and lists all missing base tags when incompatibilities exist.

### Script smoke runner

A dependency-free Node.js script evaluates `Script.js` in an isolated VM with one synthetic Shadowsocks proxy and writes the generated configuration as JSON. It checks that `main` returns a configuration with non-empty `rules`, `proxy-groups`, and `rule-providers` collections.

### Mihomo configuration test

CI downloads `MetaCubeX/mihomo` version `v1.19.29` for Linux amd64, places the candidate upstream GeoData files in an isolated home directory, generates the smoke configuration, and runs `mihomo -t`. This validates actual Mihomo parsing and GeoData loading rather than relying only on text matching.

## Continuous Integration

One workflow runs on:

- pushes to `main`
- pull requests
- `workflow_dispatch`
- a daily UTC schedule

The job performs these operations in order:

1. Check out the repository.
2. Check `Script.js` with `node --check`.
3. Download the four current upstream `latest` GeoData assets.
4. Download and verify the four matching upstream `.sha256sum` files; a missing checksum is a failure.
5. Run the GeoSite tag validator against the candidate `geosite.dat`.
6. Generate a synthetic configuration.
7. Run the fixed Mihomo binary with `mihomo -t` and the candidate GeoData.

The workflow uses least-privilege permissions: read-only repository contents and write access to Issues. On a scheduled failure, a final step uses the GitHub CLI to search for an existing open issue with the label/title used by this monitor. If none exists, it creates one containing the failed run URL. Push, pull-request, and manual failures remain ordinary CI failures and do not create Issues.

## Promotion Process

Upstream data is promoted deliberately:

1. Trigger or observe a successful validation run against upstream `latest`.
2. Download the exact validated assets and record their SHA-256 hashes.
3. Publish them under a new timestamped, immutable `geodata-*` release tag.
4. Update only the release tag used by `Script.js`.
5. Run the complete validation suite again.
6. Commit and push the tag change.

No scheduled job mutates production automatically.

## Failure and Rollback

- If upstream validation fails, production remains pinned and clients continue using the previous snapshot.
- The automatically created Issue records the workflow run for investigation.
- If a promoted snapshot causes an unexpected problem, revert the single `Script.js` release-tag commit. Previous release assets remain available because versioned releases are never overwritten.
- A missing release asset or checksum mismatch is a hard validation failure.

## Security and Maintenance

- GitHub Actions use no third-party package dependencies beyond the official checkout action.
- The Mihomo binary version is fixed in the workflow and upgraded intentionally.
- Release assets are accompanied by `SHA256SUMS`.
- Repository scripts use only built-in Node.js modules so validation remains reproducible.

## Acceptance Criteria

- `Script.js` no longer references MetaCubeX `releases/download/latest` for production GeoData.
- `geo-auto-update` is `false`.
- The versioned release contains all four required assets plus checksums.
- A valid current candidate passes tag validation and `mihomo -t`.
- A fixture containing a missing GeoSite tag makes validation fail with that tag in the error output.
- Scheduled failures create at most one open compatibility Issue.
- The README documents routine promotion and rollback.
