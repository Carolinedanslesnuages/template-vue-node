const { defineConfig } = require('cypress')
const path = require('path')
const vite = require('vite')

const cache = {}

const smtpHost = process.env.SMTP_UI_HOST || 'localhost'
const smtpPort = process.env.SMTP_UI_PORT || 8025
const clientHost = process.env.CLIENT_HOST || 'localhost'
const clientPort = process.env.CLIENT_PORT || 8080

module.exports = defineConfig({
  viewportWidth: 1600,
  viewportHeight: 2560,
  component: {
    specPattern: 'tests/components/specs/**/*.e2e.js',
    supportFile: 'tests/components/support/index.js',
    indexHtmlFile: 'tests/components/support/component-index.html',
    screenshotsFolder: 'tests/components/screenshots',
    videosFolder: 'tests/components/videos',
    video: false,
    numTestsKeptInMemory: 1,
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      host: '127.0.0.1',
      port: '8080',
    },
  },
  e2e: {
    baseUrl: `http://${clientHost}:${clientPort}`,
    specPattern: 'tests/e2e/specs/**/*.e2e.js',
    supportFile: 'tests/e2e/support/index.js',
    screenshotsFolder: 'tests/e2e/screenshots',
    fixturesFolder: 'tests/e2e/fixtures',
    videosFolder: 'tests/e2e/videos',
    video: false,
    numTestsKeptInMemory: 1,
    setupNodeEvents (on, config) {
      on('file:preprocessor', async (file) => {
        const { filePath, outputPath, shouldWatch } = file
        if (cache[filePath]) {
          return cache[filePath]
        }
        const filename = path.basename(outputPath)
        const filenameWithoutExtension = path.basename(
          outputPath,
          path.extname(outputPath),
        )
        const viteConfig = {
          logLevel: 'error',
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
            },
          },
          build: {
            emptyOutDir: false,
            minify: false,
            outDir: path.dirname(outputPath),
            sourcemap: true,
            write: true,
          },
        }
        if (filename.endsWith('.html')) {
          viteConfig.build.rollupOptions = {
            input: {
              [filenameWithoutExtension]: filePath,
            },
          }
        } else {
          viteConfig.build.lib = {
            entry: filePath,
            fileName: () => filename,
            formats: ['es', 'cjs'],
            name: filenameWithoutExtension,
          }
        }
        if (shouldWatch) {
          viteConfig.build.watch = true
        }
        const watcher = await vite.build(viteConfig)
        if (shouldWatch) {
          watcher.on('event', (event) => {
            if (event.code === 'END') {
              file.emit('rerun')
            }
          })
          file.on('close', () => {
            delete cache[filePath]
            watcher.close()
          })
        }
        cache[filePath] = outputPath
        return outputPath
      })

      on('before:browser:launch', (browser = {}, launchOptions) => {
        const width = 1600
        const height = 2560
        console.log(` Setting the ${browser.name} browser window size to ${width} x ${height}`)
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push(`--window-size=${width},${height}`)
          launchOptions.args.push('--force-device-scale-factor=1') // force screen to be non-retina and just use our given resolution
        }
        if (browser.name === 'electron' && browser.isHeadless) {
          launchOptions.preferences.width = width
          launchOptions.preferences.height = height
          launchOptions.preferences.resizable = false
        }
        if (browser.name === 'firefox' && browser.isHeadless) {
          launchOptions.args.push(`--width=${width}`)
          launchOptions.args.push(`--height=${height}`)
        }
        return launchOptions
      })

      // Used for logging in `npm run test:ci`. e.g: cy.task('log', variableToLog)
      on('task', {
        log (message) {
          console.log(message)
          return null
        },
      })

      return Object.assign({}, config, {
        mailHogUrl: config.env.mailHogUrl || `http://${smtpHost}:${smtpPort}`,
      })
    },
  },
})
