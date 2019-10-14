const Command = require('../command.js')

module.exports = class StartCommand extends Command {
  constructor (client) {
    super('start', [], 'Create a user account for the game.', {
      usage: `${client.settings.bot.prefix}start`,
      accountCheck: false,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    this.c.game.createUser(message.author.id)
      .then(() => this.c.sendSuccess(message, 'You have successfully created an account!'))
      .catch(e => this.c.sendError(message, e))
  }
}
