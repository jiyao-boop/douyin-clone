const jsonServer = require('json-server')
const app = jsonServer.create()
const middlewares = jsonServer.defaults()

// 指向你的 server/db.json
const router = jsonServer.router('./server/db.json')

app.use(middlewares)
app.use(router)
module.exports = app