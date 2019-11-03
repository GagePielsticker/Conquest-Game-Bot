const Command = require('../command.js')

module.exports = class BuyCommand extends Command {
  constructor (client) {
    super('buy', ['b'], 'Buy\'s a product', {
      usage: `${client.settings.bot.prefix}buy [product]`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    this.c.game.buy(message.author.id, args[0])
      .then(res => {
        this.c.sendSuccess(message, `Bought \`${args[0]}\` for \`${res.price.toLocaleString()}\``)
      })
      .catch(err => this.c.sendError(message, err))
  }
}
