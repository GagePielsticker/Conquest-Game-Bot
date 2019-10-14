const Command = require('../command.js')

module.exports = class AccountCommand extends Command {
  constructor (client) {
    super('account', ['acc'], 'View your account details.', {
      usage: `${client.settings.bot.prefix}account`,
      accountCheck: true,
      requiredPermission: null,
      category: 'game'
    })
    this.c = client
  }

  async run (message, args) {
    const entry = await this.c.database.collection('users').findOne({ uid: message.author.id })
    const embed = new this.c.discord.MessageEmbed()
      .setColor(this.c.settings.bot.embedColor)
      .setTitle(':spy: Account')
      .setDescription('Here you can view your user data.')
      .setFooter(message.author.tag)
      .setTimestamp()
    embed.addField(':map: Position', `x:\`${entry.xPos}\` y:\`${entry.yPos}\``, true)
    embed.addField(':moneybag: Gold', `\`${entry.gold.toLocaleString()}\` gold`, true)
    if (entry.empireName != null) embed.addField(':european_castle: Empire', `\`${entry.empireName}\``, true)
    else embed.addField(':european_castle: Empire', '`Unnamed`', true)
    if (entry.flagURL != null) embed.setThumbnail(entry.flagURL)
    embed.addField(':steam_locomotive: Has Settler', `\`${entry.hasSettler}\``, true)
    embed.addField(':homes: City Count', `\`${entry.cities.length}\``, true)
    embed.addField(':telescope: Scouted Tiles', `\`${entry.scoutedTiles.length}\``, true)
    message.channel.send(embed)
  }
}
