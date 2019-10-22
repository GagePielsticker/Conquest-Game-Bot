const Command = require('../command.js')
const humanizeDuration = require('humanize-duration')

module.exports = class DebugCommand extends Command {
  constructor (client) {
    super('debug', ['d'], 'Displays debug information', {
      usage: `${client.settings.bot.prefix}debug`,
      accountCheck: false,
      requiredPermission: null,
      category: 'dev'
    })
    this.c = client
  }

  async run (message, args) {
    message.channel.send(
      '```' + '\n' +
        '=== Client ===' + '\n' +
        `Ping: ${this.c.ws.ping.toFixed(0)}` + '\n' +
        `Uptime: ${humanizeDuration(this.c.uptime)}` + '\n' +
        '=== Backend ===' + '\n' +
        `ID: ${this.c.subWS.id}` + '\n' +
        `Uptime: ${humanizeDuration(this.c.subWS.uptime)}` + '\n' +
      '```'
    )
  }
}
