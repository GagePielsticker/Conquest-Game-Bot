module.exports.load = client => {
  const command = {
    name: 'City',
    category: 'game',
    description: 'City information',
    usage: `${client.settings.bot.prefix}city`,
    requiredPermission: null,
    hasAccountCheck: true,

    async run (message) {
      const setting = message.content.split(' ').splice(1)[0]
      if (setting === 'list') {
        const page = message.content.split(' ').splice(1)[1] || 1
        client.game.getUserCityNames(message.author.id, page)
          .then(response => {
            const { cities, totalPages } = response
            message.channel.send(
              new client.discord.MessageEmbed()
                .setColor(client.settings.bot.embedColor)
                .setTitle('Your cities')
                .setDescription(`You are viewing page \`${page}\` / \`${totalPages}\`` + '\n' +
                  '```' + '\n' +
                    `${cities.length < 1 ? 'none'
                    : cities.map(x => `${x.index}.) ${x.name}`).join('\n')
                  }` + '\n' +
                  '```' + '\n\n' +
                  `${cities.length > 1 ? `${client.settings.bot.prefix}city list ${page + 1}\` to view next page` : ''}`
                )
                .setFooter(message.author.tag)
                .setTimestamp()
            )
          })
          .catch(e => client.sendError(message, e))
      } else {
        client.sendError(message, `Invalid type \`${setting}\`\n\nChoose from: \`list\`, \`view\``)
      }
    }
  }

  client.commands.push(command)
}