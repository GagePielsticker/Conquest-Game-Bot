const Command = require('../command.js')

module.exports = class ReloadCommand extends Command {
  constructor (client) {
    super('reload', ['r'], 'Reloads a certain part of bottum', {
      usage: `${client.settings.bot.prefix}reload {piece}`,
      accountCheck: false,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    if (!this.c.settings.bot.developers.includes(message.author.id)) return
    const piece = args[0]
    if (piece === 'lib') {
      delete require.cache[require.resolve('../../library/game.js')]
      require('../../library/game.js')(this.c)
      this.c.sendSuccess(message, 'Reloaded library')
    } else if (piece === 'cmd') {
      this.c.reloadCommands()
        .then(() => {
          this.c.sendSuccess(message, 'Reloaded commands')
        })
        .catch(e => this.c.sendError(message, e))
    } else {
      this.c.sendError(message, 'Invalid piece, `cmd, lib`')
    }
  }
}
