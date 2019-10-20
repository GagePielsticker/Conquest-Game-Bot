const Command = require('../command.js')

module.exports = class BalanceCommand extends Command {
  constructor (client) {
    super('balance', ['bal'], 'Quick view the users balance.', {
      usage: `${client.settings.bot.prefix}balance`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game',
      allowDuringMove: true
    })
    this.c = client
  }

  async run (message, args) {
    const entry = await this.c.database.collection('users').findOne({ uid: message.author.id })
    message.channel.send(
      this.c.em(message)
        .setTitle(':moneybag: Balance')
        .setDescription(`\`${entry.gold.toLocaleString()}\` gold`)
    )
  }
}
