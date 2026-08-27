const fs = require('node:fs')
const vm = require('node:vm')

function renderConfig(source) {
  const sandbox = {}
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: 'Script.js', timeout: 1000 })
  const main = vm.runInContext('typeof main === "function" ? main : null', sandbox)

  if (typeof main !== 'function') {
    throw new Error('Script.js must define main(config)')
  }

  const config = main({
    proxies: [
      {
        name: '测试节点',
        type: 'ss',
        server: '127.0.0.1',
        port: 12345,
        cipher: 'aes-128-gcm',
        password: 'test',
      },
    ],
  })

  if (!Array.isArray(config?.rules) || config.rules.length === 0) {
    throw new Error('Generated configuration must contain rules')
  }
  if (!Array.isArray(config?.['proxy-groups']) || config['proxy-groups'].length === 0) {
    throw new Error('Generated configuration must contain proxy-groups')
  }
  if (!config?.['rule-providers'] || Object.keys(config['rule-providers']).length === 0) {
    throw new Error('Generated configuration must contain rule-providers')
  }

  return config
}

function main() {
  const [, , scriptPath, outputPath] = process.argv
  if (!scriptPath || !outputPath) {
    throw new Error('Usage: node scripts/render-config.js <Script.js> <output.json>')
  }

  const source = fs.readFileSync(scriptPath, 'utf8')
  const config = renderConfig(source)
  fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`)
  process.stdout.write(`Rendered ${config.rules.length} rules to ${outputPath}\n`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}

module.exports = { renderConfig }
