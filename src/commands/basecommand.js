const Command = require('../command.js')

module.exports = class Command extends Command {
  constructor (client) {
    super('', [], 'desc', {
      usage: `${client.settings.bot.prefix}`,
      accountCheck: false,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {

  }
}