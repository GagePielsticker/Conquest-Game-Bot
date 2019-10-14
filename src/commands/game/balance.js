const Command = require('../command.js')

module.exports = class BalanceCommand extends Command {
  constructor (client) {
    super('balance', ['bal'], 'Quick view the users balance.', {
      usage: `${client.settings.bot.prefix}balance`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const entry = await this.c.database.collection('users').findOne({ uid: message.author.id })
    message.channel.send(
      new this.c.discord.MessageEmbed()
        .setColor(this.c.settings.bot.embedColor)
        .setTitle(':moneybag: Balance')
        .setDescription(`\`${entry.gold.toLocaleString()}\` gold`)
        .setFooter(message.author.tag)
        .setTimestamp()
    )
  }
}
