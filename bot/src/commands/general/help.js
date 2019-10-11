module.exports.load = client => {
  const command = {
    name: 'Help',
    category: 'general',
    description: 'Show\'s all commands and how to use them.',
    usage: `${client.settings.bot.prefix}help`,
    requiredPermission: null,
    hasAccountCheck: false,

    run (message) {
      const cmd = message.content.split(' ').splice(1)[0]
      if (cmd) {
        const command = client.commands.find(x => x.name.toLowerCase() == cmd.toLowerCase())
        if (!command || command.category == 'dev') return client.sendError(message, `Invalid command: \`${cmd}\``)
        return message.channel.send(
          new client.discord.MessageEmbed()
            .setColor(client.settings.bot.embedColor)
            .setTitle(command.name)
            .addField('Description', command.description)
            .addField('Usage', command.usage)
            .setFooter(message.author.tag)
            .setTimestamp()
        )
      }
      const embed = new client.discord.MessageEmbed()
        .setColor(client.settings.bot.embedColor)
        .setTitle('Help')
        .setDescription(`Use \`${client.settings.bot.prefix}help {command}\` to learn more about the command.`)
        .setFooter(message.author.tag)
        .setTimestamp()

      client.commands.map(x => x.category).filter(x => x != 'dev') // remove dev
        .reduce((a, b) => { // remove dupes
          a = a || []
          if (!a.includes(b)) a.push(b)
          return a
        }, [])
        .forEach(category => {
          embed.addField((category.charAt(0).toUpperCase() + category.slice(1)), // make 1st character uppercase
            '```' + '\n' +
                    client.commands.filter(x => x.category == category).map(x => x.name.toLowerCase()).join('\n') + '\n' +
                    '```'
          )
        })
      message.channel.send(embed)
    }
  }

  client.commands.push(command)
}
