module.exports.load = client => {
    const command = {
      name: 'Pos',
      category: 'game',
      description: 'Quick view the user position.',
      usage: `${client.settings.bot.prefix}pos`,
      requiredPermission: null,
      hasAccountCheck: true,
  
      async run (message) {
          let entry = await client.database.collection('users').findOne({uid:message.author.id})
          message.channel.send(
            new client.discord.MessageEmbed()
              .setColor(client.settings.bot.embedColor)
              .setTitle(':map: Position')
              .setDescription(`x:\`${entry.xPos}\` y:\`${entry.yPos}\``)
              .setFooter(message.author.tag)
              .setTimestamp()
          )
      }
    }
  
    client.commands.push(command)
  }
  