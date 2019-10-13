module.exports.load = client => {
  const command = {
    name: 'Settle',
    category: 'game',
    description: 'Settle the tile you\'re currently on.',
    usage: `${client.settings.bot.prefix}settle {name}`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const name = message.content.split(' ').splice(1)[0]
      if (!name) return client.sendError(message, `Name is required, \`${client.settings.bot.prefix}settle {name}\``)
      const user = await client.database.collection('users').findOne({ uid: message.author.id })
      message.channel.send(
        new client.discord.MessageEmbed()
          .setColor(client.settings.bot.embedColor)
          .setTitle('Confirm settle')
          .setDescription(`Settle Tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
          .addField('Name', name)
          .setFooter(message.author.tag)
          .setTimestamp()
      )
        .then(confirmMsg => {
          client.confirm(message, confirmMsg, {
            no: () => {
              confirmMsg.edit(
                new client.discord.MessageEmbed()
                  .setColor(client.settings.bot.embedColor)
                  .setTitle('Cancelled settle')
                  .setFooter(message.author.tag)
                  .setTimestamp()
              )
            },
            notime: () => {
              client.sendError(message, 'Did not react in time, cancelled', confirmMsg)
            },
            yes: () => {
              client.game.settleLocation(message.author.id, name)
                .then(() => {
                  confirmMsg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle(`Settled tile! Welcome ${name} to the world!`)
                      .setDescription(`You've successfully claimed tile: X: \`${user.xPos}\`, Y: \`${user.yPos}\``)
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  )
                })
                .catch(e => client.sendError(message, e, confirmMsg))
            }
          })
        })
    }
  }

  client.commands.push(command)
}
