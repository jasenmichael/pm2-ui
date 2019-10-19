const ip = require('ip')
const express = require('express')
const consola = require('consola')
const {
  Nuxt,
  Builder
} = require('nuxt')

const app = express()
const cors = require('cors')
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

const api = require('./routes/api')

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)
  const {
    host,
    port
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(express.json())
  app.use(cors())

  // Express routes
  app.use('/api', api)

  // Listen the server
  app.listen(port, host)
  const ipAdd = (host === '0.0.0.0') ? ip.address() : 'localhost'
  consola.ready({
    message: `Server Started`,
    badge: true
  })

  consola.success(`Avaiable locally at  http://localhost:${port}`)
  if (host === '0.0.0.0') {
    consola.success(`Avaiable over lan at http://${ipAdd}:${port}`)
  }

  app.use(nuxt.render)
}
start()
