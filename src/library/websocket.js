const WS = require('ws')
const EventEmitter = require('events')

class WebsocketReceiver extends EventEmitter {
  constructor (client) {
    super()
    this.ws = null
    this.client = client
    this.online = false

    this.ack = false
    this.hbInterval = null
    this.attemptingReconnect = false

    this.start()
  }

  start () {
    this.ws = new WS('ws://localhost:1000')
    this.handleEvents()
  }

  handleEvents () {
    this.ws.on('error', (err) => {
      this.client.log('Unable to connect to websocket, ' + err.errno)
      if (!this.attemptingReconnect) this.attemptReconnect()
    })
    this.ws.on('open', () => {
      this.client.log('Websocket connected')
      this.online = true
      this.setupHeartbeat()
    })
    this.ws.on('close', (code, reason) => {
      if (!this.attemptingReconnect) this.handleClose(code, reason)
      this.online = false
    })
    this.ws.on('message', (msg) => {
      this.emit('raw', msg)
      const data = JSON.parse(msg)
      this.emit(data.event, data.data)

      if (data.event === 'ack') this.handleAck()
    })
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

  setupHeartbeat () {
    this.hbInterval = setInterval(() => {
      this.heartbeat()
      setTimeout(() => {
        if (!this.ack) {
          this.client.log('Failed heartbeat attempt. Reconnecting')
          this.attemptReconnect()
        }
      }, 5000)
    }, 30000)
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
