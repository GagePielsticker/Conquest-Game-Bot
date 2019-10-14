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
      } else if (setting === 'set') {
        const name = message.content.split(' ').splice(1)[1]
        if (!name) return client.sendError(message, `Missing name, do ${client.settings.bot.prefix}city set {city-name}`)
        const city = await client.database.collection('map').findOne({ 'city.owner': message.author.id, 'city.name': name })
        if (!city) return client.sendError(message, 'Invalid city')
        message.channel.send(
          new client.discord.MessageEmbed()
            .setColor(client.settings.bot.embedColor)
            .setTitle(`Settings for city: ${city.city.name}`)
            .setDescription(`City on tile: X: \`${city.xPos}\`, Y: \`${city.yPos}\`` + '\n\n' +
              'Settings: ' + '\n' +
              ':one: Name' + '\n' +
              ':two: Population' +

              '\n\n' +
              'React with the respective setting number to change those settings!'
            )
            .setFooter(message.author.tag)
            .setTimestamp()
        )
          .then(msg => {
            client.reactMenu(message, msg, [
              { // name
                emoji: '1⃣',
                fn: () => {
                  msg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle(`Set the name for ${city.city.name}`)
                      .setDescription('Send the new name for your city!')
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  ).then(async msg => {
                    let newName = await client.messageMenu(message, msg)
                    if (!newName) return
                    newName = newName.split(' ')[0]
                    client.game.setCityName(message.author.id, city.xPos, city.yPos, newName)
                      .then(() => {
                        msg.edit(
                          new client.discord.MessageEmbed()
                            .setColor(client.settings.bot.embedColor)
                            .setTitle('New city name!')
                            .setDescription(`${city.city.name} is now called ${newName}!`)
                            .setFooter(message.author.tag)
                            .setTimestamp()
                        )
                      })
                      .catch(e => client.sendError(message, e, msg))
                  })
                }
              },
              { // population
                emoji: '2⃣',
                fn: () => {
                  msg.edit(
                    new client.discord.MessageEmbed()
                      .setColor(client.settings.bot.embedColor)
                      .setTitle('Move population')
                      .setDescription('Select a population to move people from:' + '\n\n' +
                        Object.keys(city.city.population).map(x => `\`${x}\`) ${city.city.population[x]}`).join('\n') + '\n' +
                        'Send the job of which you want to take people from in this channel'
                      )
                      .setFooter(message.author.tag)
                      .setTimestamp()
                  ).then(async msg => {
                    let populationFrom = await client.messageMenu(message, msg)
                    if (!populationFrom) return
                    populationFrom = populationFrom.toLowerCase()
                    if (!Object.keys(city.city.population).includes(populationFrom)) return client.sendError(message, `Invalid population type \`${populationFrom}\``, msg)
                    msg.edit(
                      new client.discord.MessageEmbed()
                        .setColor(client.settings.bot.embedColor)
                        .setTitle('Move population')
                        .setDescription('Select a population to move people to:' + '\n\n' +
                          Object.keys(city.city.population).map(x => `\`${x}\`) ${city.city.population[x]}`).join('\n') + '\n' +
                          'Send the job of which you want to move people from in this channel'
                        )
                        .setFooter(message.author.tag)
                        .setTimestamp()
                    ).then(async msg => {
                      let populationTo = await client.messageMenu(message, msg)
                      if (!populationTo) return
                      populationTo = populationTo.toLowerCase()
                      if (!Object.keys(city.city.population).includes(populationTo)) return client.sendError(message, `Invalid population type \`${populationTo}\``, msg)
                      msg.edit(
                        new client.discord.MessageEmbed()
                          .setColor(client.settings.bot.embedColor)
                          .setTitle('Move population')
                          .setDescription('Respond with how many people you want to move')
                          .setFooter(message.author.tag)
                          .setTimestamp()
                      ).then(async msg => {
                        var amountToMove = await client.messageMenu(message, msg)
                        if (!amountToMove) return
                        if (isNaN(amountToMove)) return client.sendError(message, `Invalid number: \`${amountToMove}\``, msg)
                        amountToMove = Number(amountToMove)
                        msg.edit(
                          new client.discord.MessageEmbed()
                            .setColor(client.settings.bot.embedColor)
                            .setTitle('Move population')
                            .setDescription(`Confirm:\nMove \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
                            .setFooter(message.author.tag)
                        ).then(msg => {
                          client.confirm(message, msg, {
                            no: () => {
                              msg.edit(
                                new client.discord.MessageEmbed()
                                  .setColor(client.settings.bot.embedColor)
                                  .setTitle('Cancelled population move')
                                  .setFooter(message.author.tag)
                                  .setTimestamp()
                              )
                            },
                            notime: () => {
                              client.sendError(message, 'Ran out of time, cancelled', msg)
                            },
                            yes: () => {
                              client.game.changePopulationJob(message.author.id, city.xPos, city.yPos, populationFrom, populationTo, amountToMove)
                                .then(() => {
                                  msg.edit(
                                    new client.discord.MessageEmbed()
                                      .setColor(client.settings.bot.embedColor)
                                      .setTitle(`Moved population in ${city.city.name}`)
                                      .setDescription(`Moved \`${amountToMove}\` people from \`${populationFrom}\` to \`${populationTo}\``)
                                      .setFooter(message.author.tag)
                                      .setTimestamp()
                                  )
                                })
                                .catch(e => client.sendError(message, e, msg))
                            }
                          })
                        })
                      })
                    })
                  })
                }
              }
            ])
          })
      } else {
        client.sendError(message, `Invalid type \`${setting}\`\n\nChoose from: \`list\`, \`view\``)
      }
    }
  }

  client.commands.push(command)
}
