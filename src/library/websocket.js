const WS = require('ws')
const EventEmitter = require('events')

class WebsocketReceiver extends EventEmitter {
  constructor (client) {
    super()
    this.ws = null
    this.client = client

    this.ack = false
    this.hbInterval = null
    this.attemptingReconnect = false
    this.id = null
    this.auth = null

    this.startDate = null

    this.start()
  }

  get online () {
    return this.ws.readyState === 1
  }

  start () {
    this.ws = new WS(this.client.settings.ws.uri)
    this.handleEvents()
  }

  get uptime () {
    return new Date().getTime() - this.startDate.getTime()
  }

  handleEvents () {
    this.ws.on('error', (err) => {
      this.client.log('Unable to connect to websocket, ' + err.errno)
      if (!this.attemptingReconnect) this.attemptReconnect()
    })
    this.ws.on('open', () => {
      this.client.log('Websocket connected')
      this.startDate = new Date()
    })
    this.ws.on('close', (code, reason) => {
      if (!this.attemptingReconnect) this.handleClose(code, reason)
    })
    this.ws.on('message', (msg) => {
      this.emit('raw', msg)
      const data = JSON.parse(msg)
      this.emit(data.event, data.data)

      if (data.event === 'hello') this.handleHello(data.data)
      if (data.event === 'ack') this.handleAck()
      if (data.event === 'auth') this.auth = data.data.auth
    })
  }

  handleHello (data) {
    this.client.log(`Received hello. My id is ${data.id}, setting heartbeat interval to ${data.hb}`)
    this.id = data.id
    this.send('hello', { hello: true, auth: this.client.settings.ws.auth })
    this.setupHeartbeat(data.hb)
  }

  handleClose (code, reason) {
    this.client.log(`Websocket closed; Code: ${code}, Reason: ${reason}`)
    clearInterval(this.hbInterval)
    this.attemptReconnect()
  }

  attemptReconnect () {
    if (this.online) this.ws.close()
    this.attemptingReconnect = true
    this.start()
    setTimeout(() => {
      this.attemptingReconnect = false
      if (!this.online) this.attemptReconnect()
      else this.client.log('Successfully reconnected')
    }, 5000)
  }

  send (event, data) {
    this.ws.send(
      JSON.stringify(
        {
          event: event,
          data: data
        }
      )
    )
  }

  setupHeartbeat (time) {
    this.hbInterval = setInterval(() => {
      this.heartbeat()
      setTimeout(() => {
        if (!this.ack) {
          this.client.log('Failed heartbeat attempt. Reconnecting')
          this.attemptReconnect()
        }
      }, 5000)
    }, time)
  }

  heartbeat () {
    this.ack = false
    this.send('heartbeat', { interval: 30000 })
  }

  handleAck () {
    this.ack = true
  }
}

module.exports = client => {
  client.subWS = new WebsocketReceiver(client)
}
