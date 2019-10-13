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
      } else if (setting === 'view') {
        const name = message.content.split(' ').splice(1)[1]
        const mapEntry = await client.game.getCityByName(message.author.id, name)
        message.channel.send(
          new client.discord.MessageEmbed()
            .setColor(client.settings.bot.embedColor)
            .setTitle(`City (${mapEntry.city.name})`)
            .setDescription('Here you can view statistics of your city!')
            .addField('Position', `X: \`${mapEntry.city.xPos}\` Y: \`${mapEntry.city.yPos}\``, true)
            .addField('Level', `\`${mapEntry.city.level}\``, true)
            .addField('Has Stasis', `\`${mapEntry.city.inStasis ? 'Yes' : 'No'}\``, true)
            .addField('Resources',
              'Stone:' + `\`${mapEntry.city.resources.stone}\` / \`${mapEntry.city.resources.maxStone}\`` + '\n' +
              'Metal:' + `\`${mapEntry.city.resources.metal}\` / \`${mapEntry.city.resources.maxMetal}\`` + '\n' +
              'Wood:' + `\`${mapEntry.city.resources.wood}\` / \`${mapEntry.city.resources.maxWood}\`` + '\n' +
              'Food:' + `\`${mapEntry.city.resources.food}\` / \`${mapEntry.city.resources.maxFood}\`` + '\n'
              , true)
            .addField('Population', `${Object.keys(mapEntry.city.population).map(x => `${x.charAt(0).toUpperCase() + x.slice(1)}: \`${mapEntry.city.population[x]}\``).join('\n')}`, true)
            .setFooter(message.author.tag)
            .setTimestamp()
        )
      } else {
        client.sendError(message, `Invalid type \`${setting}\`\n\nChoose from: \`list\`, \`view\``)
      }
    }
  }

  client.commands.push(command)
}
