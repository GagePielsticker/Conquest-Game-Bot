module.exports.load = client => {
  const command = {
    name: 'Account',
    category: 'game',
    description: 'View your account details.',
    usage: `${client.settings.bot.prefix}account`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const entry = await client.database.collection('users').findOne({ uid: message.author.id })
      const embed = new client.discord.MessageEmbed()
        .setColor(client.settings.bot.embedColor)
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

  client.commands.push(command)
}
