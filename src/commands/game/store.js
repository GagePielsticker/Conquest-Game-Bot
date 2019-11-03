const Command = require('../command.js')

module.exports = class StoreCommand extends Command {
  constructor (client) {
    super('store', [], 'Shows list of things to buy', {
      usage: `${client.settings.bot.prefix}store`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    this.c.game.shop()
      .then(products => {
        message.channel.send(
          this.c.em(message)
            .setTitle('Shop')
            .setDescription(`Products: ${products.map(x => `\`${x}\``).join(', ')}\n\nDo \`${this.c.settings.bot.prefix}buy [product]\` to buy!`)
        )
      })
      .catch(err => this.c.sendError(message, err))
  }
}
